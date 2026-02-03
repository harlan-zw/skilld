import type { AgentType, OptimizeModel } from '../agent'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import * as p from '@clack/prompts'
import logUpdate from 'log-update'
import pLimit from 'p-limit'
import {
  agents,

  generateSkillMd,
  optimizeDocs,

  sanitizeName,

} from '../agent'
import {
  CACHE_DIR,
  ensureCacheDir,
  getCacheDir,
  getPackageDbPath,
  getShippedSkills,
  getVersionKey,
  hasShippedDocs,
  isCached,
  linkIssues,
  linkPkg,
  linkReferences,
  linkReleases,
  linkShippedSkill,
  listReferenceFiles,
  writeToCache,
} from '../cache'
import { registerProject } from '../core/config'
import { writeLock } from '../core/lockfile'
import {
  downloadLlmsDocs,
  fetchGitDocs,
  fetchLlmsTxt,
  fetchNpmPackage,
  fetchReadmeContent,
  fetchReleaseNotes,
  normalizeLlmsLinks,
  parseGitHubUrl,
  parseMarkdownLinks,
  readLocalDependencies,
  resolveLocalPackageDocs,
  resolvePackageDocs,
} from '../doc-resolver'
import { createIndex } from '../retriv'

import { selectModel } from './sync'

type PackageStatus = 'pending' | 'resolving' | 'downloading' | 'embedding' | 'exploring' | 'thinking' | 'generating' | 'done' | 'error'

interface PackageState {
  name: string
  status: PackageStatus
  message: string
  version?: string
  streamPreview?: string
}

const STATUS_ICONS: Record<PackageStatus, string> = {
  pending: '○',
  resolving: '◐',
  downloading: '◒',
  embedding: '◓',
  exploring: '◔',
  thinking: '◔',
  generating: '◑',
  done: '✓',
  error: '✗',
}

const STATUS_COLORS: Record<PackageStatus, string> = {
  pending: '\x1B[90m',
  resolving: '\x1B[36m',
  downloading: '\x1B[36m',
  embedding: '\x1B[36m',
  exploring: '\x1B[34m', // Blue for exploring
  thinking: '\x1B[35m', // Magenta for thinking
  generating: '\x1B[33m',
  done: '\x1B[32m',
  error: '\x1B[31m',
}

export interface ParallelSyncConfig {
  packages: string[]
  global: boolean
  agent: AgentType
  model?: OptimizeModel
  yes?: boolean
  concurrency?: number
}

export async function syncPackagesParallel(config: ParallelSyncConfig): Promise<void> {
  const { packages, concurrency = 5 } = config
  const states = new Map<string, PackageState>()
  const cwd = process.cwd()

  // Initialize all packages as pending
  for (const pkg of packages) {
    states.set(pkg, { name: pkg, status: 'pending', message: 'Waiting...' })
  }

  // Render function
  function render() {
    const maxNameLen = Math.max(...packages.map(p => p.length), 20)
    const lines = [...states.values()].map((s) => {
      const icon = STATUS_ICONS[s.status]
      const color = STATUS_COLORS[s.status]
      const reset = '\x1B[0m'
      const dim = '\x1B[90m'
      const name = s.name.padEnd(maxNameLen)
      const version = s.version ? `${dim}${s.version}${reset} ` : ''
      const preview = s.streamPreview ? ` ${dim}${s.streamPreview}${reset}` : ''
      return `  ${color}${icon}${reset} ${name} ${version}${s.message}${preview}`
    })

    const doneCount = [...states.values()].filter(s => s.status === 'done').length
    const errorCount = [...states.values()].filter(s => s.status === 'error').length
    const header = `\x1B[1mSyncing ${packages.length} packages\x1B[0m (${doneCount} done${errorCount > 0 ? `, ${errorCount} failed` : ''})\n`

    logUpdate(header + lines.join('\n'))
  }

  function update(pkg: string, status: PackageStatus, message: string, version?: string) {
    const state = states.get(pkg)!
    state.status = status
    state.message = message
    state.streamPreview = undefined // Clear preview on status change
    if (version)
      state.version = version
    render()
  }

  function updatePreview(pkg: string, content: string, isReasoning = false) {
    const state = states.get(pkg)!
    const words = content.split(/\s+/).filter(Boolean).length
    state.streamPreview = isReasoning ? `${words}w thought` : `${words}w`
    render()
  }

  ensureCacheDir()
  render()

  const limit = pLimit(concurrency)

  // Phase 1: Generate base skills (no LLM)
  const baseResults = await Promise.allSettled(
    packages.map(pkg =>
      limit(() => syncBaseSkill(pkg, config, cwd, update)),
    ),
  )

  logUpdate.done()

  // Collect successful packages for LLM phase (exclude shipped — they need no LLM)
  const successfulPkgs: string[] = []
  const errors: Array<{ pkg: string, reason: string }> = []
  for (let i = 0; i < baseResults.length; i++) {
    const r = baseResults[i]!
    if (r.status === 'fulfilled' && r.value !== 'shipped') {
      successfulPkgs.push(packages[i]!)
    }
    else if (r.status === 'rejected') {
      const reason = r.reason instanceof Error ? r.reason.message : String(r.reason)
      errors.push({ pkg: packages[i]!, reason })
    }
  }

  p.log.success(`Created ${successfulPkgs.length} base skills`)

  if (errors.length > 0) {
    for (const { pkg, reason } of errors) {
      p.log.error(`  ${pkg}: ${reason}`)
    }
  }

  // Phase 2: Ask about LLM enhancement (skip if -y without model)
  if (successfulPkgs.length > 0 && !(config.yes && !config.model)) {
    const wantOptimize = config.model || await p.confirm({
      message: 'Generate best practices with LLM?',
      initialValue: true,
    })

    if (wantOptimize && !p.isCancel(wantOptimize)) {
      const model = config.model ?? await selectModel(false)

      if (model) {
        // Reset states for LLM phase
        for (const pkg of successfulPkgs) {
          states.set(pkg, { name: pkg, status: 'pending', message: 'Waiting...' })
        }
        render()

        const llmResults = await Promise.allSettled(
          successfulPkgs.map(pkg =>
            limit(() => enhanceWithLLM(pkg, { ...config, model }, cwd, update, updatePreview)),
          ),
        )

        logUpdate.done()

        const llmSucceeded = llmResults.filter(r => r.status === 'fulfilled').length
        p.log.success(`Enhanced ${llmSucceeded}/${successfulPkgs.length} skills with LLM`)
      }
    }
  }

  p.outro(`Synced ${successfulPkgs.length}/${packages.length} packages`)
}

type UpdateFn = (pkg: string, status: PackageStatus, message: string, version?: string) => void
type UpdatePreviewFn = (pkg: string, content: string, isReasoning?: boolean) => void

/** Phase 1: Generate base skill (no LLM). Returns 'shipped' if shipped skill was linked. */
async function syncBaseSkill(
  packageName: string,
  config: ParallelSyncConfig,
  cwd: string,
  update: UpdateFn,
): Promise<'shipped' | 'synced'> {
  update(packageName, 'resolving', 'Looking up...')

  const localDeps = await readLocalDependencies(cwd).catch(() => [])
  const localVersion = localDeps.find(d => d.name === packageName)?.version

  let resolved = await resolvePackageDocs(packageName, { version: localVersion })

  if (!resolved) {
    const pkgPath = join(cwd, 'package.json')
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      const deps = { ...pkg.dependencies, ...pkg.devDependencies }
      const depVersion = deps[packageName]

      if (depVersion?.startsWith('link:')) {
        update(packageName, 'resolving', 'Local package...')
        const { resolve } = await import('node:path')
        const localPath = resolve(cwd, depVersion.slice(5))
        resolved = await resolveLocalPackageDocs(localPath)
      }
    }
  }

  if (!resolved) {
    update(packageName, 'error', 'Not found')
    throw new Error(`Could not find docs for: ${packageName}`)
  }

  const version = localVersion || resolved.version || 'latest'
  const versionKey = getVersionKey(version)

  // Shipped skills: symlink directly, skip all doc fetching/caching/LLM
  const shippedSkills = getShippedSkills(packageName, cwd)
  if (shippedSkills.length > 0) {
    const agent = agents[config.agent]
    const baseDir = config.global
      ? join(CACHE_DIR, 'skills')
      : join(cwd, agent.skillsDir)
    mkdirSync(baseDir, { recursive: true })

    for (const shipped of shippedSkills) {
      linkShippedSkill(baseDir, shipped.skillName, shipped.skillDir)
      writeLock(baseDir, shipped.skillName, {
        packageName,
        version,
        source: 'shipped',
        syncedAt: new Date().toISOString().split('T')[0],
        generator: 'skilld',
      })
    }
    if (!config.global)
      registerProject(cwd)
    update(packageName, 'done', 'Shipped', versionKey)
    return 'shipped'
  }

  const useCache = isCached(packageName, version)
  if (useCache) {
    update(packageName, 'downloading', 'Using cache', versionKey)
  }
  else {
    update(packageName, 'downloading', 'Fetching docs...', versionKey)
  }

  const agent = agents[config.agent]
  const baseDir = config.global
    ? join(CACHE_DIR, 'skills')
    : join(cwd, agent.skillsDir)

  const skillDir = join(baseDir, sanitizeName(packageName))
  mkdirSync(skillDir, { recursive: true })

  let docSource: string = resolved.readmeUrl || 'readme'
  let docsType: 'llms.txt' | 'readme' | 'docs' = 'readme'
  const docsToIndex: Array<{ id: string, content: string, metadata: Record<string, any> }> = []

  if (!useCache) {
    const cachedDocs: Array<{ path: string, content: string }> = []

    // Try versioned git docs first
    if (resolved.gitDocsUrl && resolved.repoUrl) {
      const gh = parseGitHubUrl(resolved.repoUrl)
      if (gh) {
        const gitDocs = await fetchGitDocs(gh.owner, gh.repo, version, packageName)
        if (gitDocs && gitDocs.files.length > 0) {
          update(packageName, 'downloading', `${gitDocs.files.length} docs @ ${gitDocs.ref}`, versionKey)

          const BATCH_SIZE = 20
          const results: Array<{ file: string, content: string } | null> = []

          for (let i = 0; i < gitDocs.files.length; i += BATCH_SIZE) {
            const batch = gitDocs.files.slice(i, i + BATCH_SIZE)
            const batchResults = await Promise.all(
              batch.map(async (file) => {
                const url = `${gitDocs.baseUrl}/${file}`
                const res = await fetch(url, { headers: { 'User-Agent': 'skilld/1.0' } }).catch(() => null)
                if (!res?.ok)
                  return null
                const content = await res.text()
                return { file, content }
              }),
            )
            results.push(...batchResults)
          }

          for (const r of results) {
            if (r) {
              cachedDocs.push({ path: r.file, content: r.content })
              docsToIndex.push({
                id: r.file,
                content: r.content,
                metadata: { package: packageName, source: r.file, type: 'doc' },
              })
            }
          }

          const downloaded = results.filter(Boolean).length
          if (downloaded > 0) {
            docSource = `${resolved.repoUrl}/tree/${gitDocs.ref}/docs`
            docsType = 'docs'
          }
        }
      }
    }

    if (resolved.llmsUrl && cachedDocs.length === 0) {
      update(packageName, 'downloading', 'llms.txt...', versionKey)
      const llmsContent = await fetchLlmsTxt(resolved.llmsUrl)
      if (llmsContent) {
        docSource = resolved.llmsUrl!
        docsType = 'llms.txt'
        cachedDocs.push({ path: 'llms.txt', content: normalizeLlmsLinks(llmsContent.raw) })

        if (llmsContent.links.length > 0) {
          update(packageName, 'downloading', `${llmsContent.links.length} linked docs...`, versionKey)
          const baseUrl = resolved.docsUrl || new URL(resolved.llmsUrl).origin
          const docs = await downloadLlmsDocs(llmsContent, baseUrl)

          for (const doc of docs) {
            const localPath = doc.url.startsWith('/') ? doc.url.slice(1) : doc.url
            const cachePath = `docs/${localPath}`
            cachedDocs.push({ path: cachePath, content: doc.content })

            docsToIndex.push({
              id: doc.url,
              content: doc.content,
              metadata: { package: packageName, source: cachePath, type: 'doc' },
            })
          }
        }
      }
    }

    // Fallback to README
    if (resolved.readmeUrl && cachedDocs.length === 0) {
      update(packageName, 'downloading', 'README...', versionKey)
      const content = await fetchReadmeContent(resolved.readmeUrl)
      if (content) {
        cachedDocs.push({ path: 'docs/README.md', content })
        docsToIndex.push({
          id: 'README.md',
          content,
          metadata: { package: packageName, source: 'docs/README.md', type: 'doc' },
        })
      }
    }

    // Write to global cache
    if (cachedDocs.length > 0) {
      writeToCache(packageName, version, cachedDocs)

      if (docsToIndex.length > 0) {
        const dbPath = getPackageDbPath(packageName, version)
        await createIndex(docsToIndex, {
          dbPath,
          onProgress: (current, total) => {
            update(packageName, 'embedding', `Indexing ${Math.round((current / total) * 100)}%`, versionKey)
          },
        })
      }
    }
  }
  else {
    // Detect docs type from cache
    const cacheDir = getCacheDir(packageName, version)
    if (existsSync(join(cacheDir, 'docs', 'index.md')) || existsSync(join(cacheDir, 'docs', 'guide'))) {
      docsType = 'docs'
    }
    else if (existsSync(join(cacheDir, 'llms.txt'))) {
      docsType = 'llms.txt'
    }
  }

  // Fetch release notes
  const releasesPath = join(getCacheDir(packageName, version), 'releases')
  if (resolved.repoUrl && !existsSync(releasesPath)) {
    const gh = parseGitHubUrl(resolved.repoUrl)
    if (gh) {
      update(packageName, 'downloading', 'Release notes...', versionKey)
      const releaseDocs = await fetchReleaseNotes(gh.owner, gh.repo, version, resolved.gitRef)
      if (releaseDocs.length > 0) {
        writeToCache(packageName, version, releaseDocs)
        const dbPath = getPackageDbPath(packageName, version)
        const releaseDocsIndex = releaseDocs.map(doc => ({
          id: doc.path,
          content: doc.content,
          metadata: { package: packageName, source: doc.path, type: 'release' },
        }))
        await createIndex(releaseDocsIndex, { dbPath })
      }
    }
  }

  // Create symlinks: pkg always, docs only if fetched externally and not just README
  try {
    linkPkg(skillDir, packageName, cwd)
    if (!hasShippedDocs(packageName, cwd) && docsType !== 'readme') {
      linkReferences(skillDir, packageName, version)
    }
    linkIssues(skillDir, packageName, version)
    linkReleases(skillDir, packageName, version)
  }
  catch {}

  // Index from cache if needed
  const dbPath = getPackageDbPath(packageName, version)
  if (!existsSync(dbPath)) {
    const { readCachedDocs } = await import('../cache/storage')
    const cachedDocs = readCachedDocs(packageName, version)

    if (cachedDocs.length > 0) {
      const docsToIndex = cachedDocs.map(doc => ({
        id: doc.path,
        content: doc.content,
        metadata: { package: packageName, source: doc.path, type: 'doc' },
      }))
      await createIndex(docsToIndex, {
        dbPath,
        onProgress: (current, total) => {
          update(packageName, 'embedding', `Indexing ${current}/${total}`, versionKey)
        },
      })
    }
  }

  const hasReleases = existsSync(releasesPath)
  const hasChangelog = existsSync(join(cwd, 'node_modules', packageName, 'CHANGELOG.md'))

  const relatedSkills = await findRelatedSkills(packageName, baseDir)
  const shippedDocs = hasShippedDocs(packageName, cwd)

  // Write base SKILL.md
  const skillMd = generateSkillMd({
    name: packageName,
    version,
    releasedAt: resolved.releasedAt,
    description: resolved.description,
    relatedSkills,
    hasIssues: false,
    hasReleases,
    hasChangelog,
    docsType,
    hasShippedDocs: shippedDocs,
  })
  writeFileSync(join(skillDir, 'SKILL.md'), skillMd)

  writeLock(baseDir, sanitizeName(packageName), {
    packageName,
    version,
    source: docSource,
    syncedAt: new Date().toISOString().split('T')[0],
    generator: 'skilld',
  })

  if (!config.global) {
    registerProject(cwd)
  }

  update(packageName, 'done', 'Base skill', versionKey)
  return 'synced'
}

/** Phase 2: Enhance skill with LLM */
async function enhanceWithLLM(
  packageName: string,
  config: ParallelSyncConfig & { model: OptimizeModel },
  cwd: string,
  update: UpdateFn,
  updatePreview: UpdatePreviewFn,
): Promise<void> {
  const localDeps = await readLocalDependencies(cwd).catch(() => [])
  const localVersion = localDeps.find(d => d.name === packageName)?.version
  const resolved = await resolvePackageDocs(packageName, { version: localVersion })
  if (!resolved)
    throw new Error('Package not found')

  const version = localVersion || resolved.version || 'latest'
  const versionKey = getVersionKey(version)

  const agent = agents[config.agent]
  const baseDir = config.global
    ? join(CACHE_DIR, 'skills')
    : join(cwd, agent.skillsDir)

  const skillDir = join(baseDir, sanitizeName(packageName))
  const cacheDir = getCacheDir(packageName, version)
  const dbPath = getPackageDbPath(packageName, version)

  // Load docs content
  let docsContent: string | null = null
  let llmsRaw: string | null = null
  let docsType: 'llms.txt' | 'readme' | 'docs' = 'readme'

  // Detect docs type
  if (existsSync(join(cacheDir, 'docs', 'index.md')) || existsSync(join(cacheDir, 'docs', 'guide'))) {
    docsType = 'docs'
  }
  else if (existsSync(join(cacheDir, 'llms.txt'))) {
    docsType = 'llms.txt'
  }

  // Priority 1: Git docs
  const guideDir = join(cacheDir, 'docs', 'guide')
  const docsDir = join(cacheDir, 'docs')
  if (existsSync(guideDir) || existsSync(join(docsDir, 'index.md'))) {
    const sections: string[] = []
    const indexPath = join(docsDir, 'index.md')
    if (existsSync(indexPath)) {
      sections.push(readFileSync(indexPath, 'utf-8'))
    }
    if (existsSync(guideDir)) {
      const priorityFiles = ['index.md', 'features.md', 'migration.md', 'why.md']
      const guideFiles = readdirSync(guideDir, { withFileTypes: true })
        .filter(f => f.isFile() && f.name.endsWith('.md'))
        .map(f => f.name)
        .sort((a, b) => {
          const aIdx = priorityFiles.indexOf(a)
          const bIdx = priorityFiles.indexOf(b)
          if (aIdx >= 0 && bIdx >= 0)
            return aIdx - bIdx
          if (aIdx >= 0)
            return -1
          if (bIdx >= 0)
            return 1
          return a.localeCompare(b)
        })
      for (const file of guideFiles.slice(0, 10)) {
        const content = readFileSync(join(guideDir, file), 'utf-8')
        sections.push(`# guide/${file}\n\n${content}`)
      }
    }
    if (sections.length > 0)
      docsContent = sections.join('\n\n---\n\n')
  }

  // Priority 2: llms.txt
  if (!docsContent) {
    if (existsSync(join(cacheDir, 'llms.txt'))) {
      llmsRaw = readFileSync(join(cacheDir, 'llms.txt'), 'utf-8')
    }
    if (llmsRaw) {
      const bestPracticesPaths = parseMarkdownLinks(llmsRaw)
        .map(l => l.url)
        .filter(lp => lp.includes('/style-guide/') || lp.includes('/best-practices/') || lp.includes('/typescript/'))
      const sections: string[] = []
      for (const mdPath of bestPracticesPaths) {
        const localPath = mdPath.startsWith('/') ? mdPath.slice(1) : mdPath
        const filePath = join(cacheDir, 'docs', localPath)
        if (existsSync(filePath)) {
          const content = readFileSync(filePath, 'utf-8')
          sections.push(`# ${mdPath}\n\n${content}`)
        }
      }
      docsContent = sections.length > 0 ? sections.join('\n\n---\n\n') : llmsRaw
    }
  }

  // Priority 3: README
  if (!docsContent) {
    const readmePath = join(cacheDir, 'docs', 'README.md')
    if (existsSync(readmePath)) {
      docsContent = readFileSync(readmePath, 'utf-8')
    }
  }

  const issuesPath = join(cacheDir, 'issues')
  const hasIssues = existsSync(issuesPath)
  const hasReleases = existsSync(join(cacheDir, 'releases'))
  const hasChangelog = existsSync(join(cwd, 'node_modules', packageName, 'CHANGELOG.md'))

  const docFiles = listReferenceFiles(skillDir)
  update(packageName, 'generating', config.model, versionKey)
  const { optimized, wasOptimized, error } = await optimizeDocs({
    packageName,
    skillDir,
    dbPath,
    model: config.model,
    version,
    hasIssues,
    hasReleases,
    hasChangelog,
    docFiles,
    onProgress: (progress) => {
      const isReasoning = progress.type === 'reasoning'
      const status = isReasoning ? 'exploring' : 'generating'
      const label = progress.chunk.startsWith('[') ? progress.chunk : config.model
      update(packageName, status, label, versionKey)
    },
  })

  if (error) {
    update(packageName, 'error', error, versionKey)
    throw new Error(error)
  }

  if (wasOptimized) {
    const relatedSkills = await findRelatedSkills(packageName, baseDir)
    const shippedDocs = hasShippedDocs(packageName, cwd)
    const body = cleanSkillMd(optimized)
    const skillMd = generateSkillMd({
      name: packageName,
      version,
      releasedAt: resolved.releasedAt,
      body,
      relatedSkills,
      hasIssues,
      hasReleases,
      hasChangelog,
      docsType,
      hasShippedDocs: shippedDocs,
    })
    writeFileSync(join(skillDir, 'SKILL.md'), skillMd)
  }

  update(packageName, 'done', 'Enhanced', versionKey)
}

async function findRelatedSkills(packageName: string, skillsDir: string): Promise<string[]> {
  const related: string[] = []

  const npmInfo = await fetchNpmPackage(packageName)
  if (!npmInfo?.dependencies)
    return related

  const deps = Object.keys(npmInfo.dependencies)

  if (!existsSync(skillsDir))
    return related

  const installedSkills = readdirSync(skillsDir)

  for (const skill of installedSkills) {
    if (deps.some(d => sanitizeName(d) === skill)) {
      related.push(skill)
    }
  }

  return related.slice(0, 5)
}

function cleanSkillMd(content: string): string {
  let cleaned = content
    .replace(/^```markdown\n?/m, '')
    .replace(/\n?```$/m, '')
    .trim()

  // Strip any accidental frontmatter or leading horizontal rules
  // Match 3+ dashes (handles ---, ------, etc)
  const fmMatch = cleaned.match(/^-{3,}\n/)
  if (fmMatch) {
    const afterOpen = fmMatch[0].length
    const closeMatch = cleaned.slice(afterOpen).match(/\n-{3,}/)
    if (closeMatch) {
      // Has closing dashes (frontmatter), strip entire block
      cleaned = cleaned.slice(afterOpen + closeMatch.index! + closeMatch[0].length).trim()
    }
    else {
      // Just leading dashes, strip them
      cleaned = cleaned.slice(afterOpen).trim()
    }
  }

  return cleaned
}
