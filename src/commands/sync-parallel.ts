import type { AgentType, OptimizeModel, SkillSection } from '../agent'
import type { ResolveStep } from '../sources'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import * as p from '@clack/prompts'
import logUpdate from 'log-update'
import pLimit from 'p-limit'
import {
  agents,

  generateSkillMd,
  getModelLabel,
  optimizeDocs,

  sanitizeName,

} from '../agent'
import {
  CACHE_DIR,
  clearCache,
  ensureCacheDir,
  getCacheDir,
  getPackageDbPath,
  getPkgKeyFiles,
  getShippedSkills,
  getVersionKey,
  hasShippedDocs,
  isCached,
  linkGithub,
  linkPkg,
  linkReferences,
  linkReleases,
  linkShippedSkill,
  listReferenceFiles,
  readCachedDocs,
  resolvePkgDir,
  writeToCache,
} from '../cache'
import { defaultFeatures, readConfig, registerProject } from '../core/config'
import { writeLock } from '../core/lockfile'
import { createIndex } from '../retriv'
import {
  downloadLlmsDocs,
  fetchGitDocs,
  fetchLlmsTxt,
  fetchNpmPackage,
  fetchPkgDist,
  fetchReadmeContent,
  fetchReleaseNotes,
  normalizeLlmsLinks,
  parseGitHubUrl,
  parseMarkdownLinks,
  readLocalDependencies,
  resolveEntryFiles,
  resolveLocalPackageDocs,
  resolvePackageDocs,
  resolvePackageDocsWithAttempts,
} from '../sources'

import { ensureGitignore, selectModel, selectSkillSections } from './sync'

type PackageStatus = 'pending' | 'resolving' | 'downloading' | 'embedding' | 'exploring' | 'thinking' | 'generating' | 'done' | 'error'

const RESOLVE_STEP_LABELS: Record<ResolveStep, string> = {
  'npm': 'npm registry',
  'github-docs': 'GitHub docs',
  'github-meta': 'GitHub meta',
  'github-search': 'GitHub search',
  'readme': 'README',
  'llms.txt': 'llms.txt',
  'local': 'node_modules',
}

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
  force?: boolean
  concurrency?: number
}

export async function syncPackagesParallel(config: ParallelSyncConfig): Promise<void> {
  const { packages, concurrency = 5 } = config
  const agent = agents[config.agent]
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
      const err = r.reason
      const reason = err instanceof Error ? `${err.message}\n${err.stack}` : String(err)
      errors.push({ pkg: packages[i]!, reason })
    }
  }

  p.log.success(`Created ${successfulPkgs.length} base skills`)

  if (errors.length > 0) {
    for (const { pkg, reason } of errors) {
      p.log.error(`  ${pkg}: ${reason}`)
    }
  }

  // Phase 2: Ask about LLM enhancement (skip if -y without model, or skipLlm config)
  const globalConfig = readConfig()
  if (successfulPkgs.length > 0 && !globalConfig.skipLlm && !(config.yes && !config.model)) {
    const { sections, customPrompt, cancelled } = config.model
      ? { sections: ['best-practices', 'api'] as SkillSection[], customPrompt: undefined, cancelled: false }
      : await selectSkillSections()

    if (!cancelled && sections.length > 0) {
      const model = config.model ?? await selectModel(false)

      if (model) {
        p.log.step(getModelLabel(model))
        // Reset states for LLM phase
        for (const pkg of successfulPkgs) {
          states.set(pkg, { name: pkg, status: 'pending', message: 'Waiting...' })
        }
        render()

        const llmResults = await Promise.allSettled(
          successfulPkgs.map(pkg =>
            limit(() => enhanceWithLLM(pkg, { ...config, model }, cwd, update, sections, customPrompt)),
          ),
        )

        logUpdate.done()

        const llmSucceeded = llmResults.filter(r => r.status === 'fulfilled').length
        p.log.success(`Enhanced ${llmSucceeded}/${successfulPkgs.length} skills with LLM`)
      }
    }
  }

  await ensureGitignore(agent.skillsDir, cwd, config.global)

  p.outro(`Synced ${successfulPkgs.length}/${packages.length} packages`)
}

type UpdateFn = (pkg: string, status: PackageStatus, message: string, version?: string) => void

/** Phase 1: Generate base skill (no LLM). Returns 'shipped' if shipped skill was linked. */
async function syncBaseSkill(
  packageName: string,
  config: ParallelSyncConfig,
  cwd: string,
  update: UpdateFn,
): Promise<'shipped' | 'synced'> {
  const localDeps = await readLocalDependencies(cwd).catch(() => [])
  const localVersion = localDeps.find(d => d.name === packageName)?.version

  const { package: resolvedPkg, attempts } = await resolvePackageDocsWithAttempts(packageName, {
    version: localVersion,
    cwd,
    onProgress: step => update(packageName, 'resolving', RESOLVE_STEP_LABELS[step]),
  })
  let resolved = resolvedPkg

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
    const npmAttempt = attempts.find(a => a.source === 'npm')
    let reason: string
    if (npmAttempt?.status === 'not-found') {
      reason = npmAttempt.message || 'Not on npm'
    }
    else {
      const failed = attempts.filter(a => a.status !== 'success')
      const messages = failed.map(a => a.message || a.source).join('; ')
      reason = messages || 'No docs found'
    }
    update(packageName, 'error', reason)
    throw new Error(`Could not find docs for: ${packageName}`)
  }

  const version = localVersion || resolved.version || 'latest'
  const versionKey = getVersionKey(version)

  // Download npm dist if not in node_modules
  if (!existsSync(join(cwd, 'node_modules', packageName))) {
    update(packageName, 'downloading', 'Downloading dist...', versionKey)
    await fetchPkgDist(packageName, version)
  }

  // Shipped skills: symlink directly, skip all doc fetching/caching/LLM
  const shippedSkills = getShippedSkills(packageName, cwd, version)
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

  // Force: nuke cached references + search index so all existsSync guards re-fetch
  if (config.force) {
    clearCache(packageName, version)
    const forcedDbPath = getPackageDbPath(packageName, version)
    if (existsSync(forcedDbPath))
      rmSync(forcedDbPath, { recursive: true, force: true })
  }

  const useCache = isCached(packageName, version)
  if (useCache) {
    update(packageName, 'downloading', 'Using cache', versionKey)
  }
  else {
    update(packageName, 'downloading', config.force ? 'Re-fetching docs...' : 'Fetching docs...', versionKey)
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
        update(packageName, 'downloading', 'Git docs...', versionKey)
        const gitDocs = await fetchGitDocs(gh.owner, gh.repo, version, packageName)
        if (gitDocs && gitDocs.files.length > 0) {
          update(packageName, 'downloading', `0/${gitDocs.files.length} docs @ ${gitDocs.ref}`, versionKey)

          const BATCH_SIZE = 20
          const results: Array<{ file: string, content: string } | null> = []
          let downloaded = 0

          for (let i = 0; i < gitDocs.files.length; i += BATCH_SIZE) {
            const batch = gitDocs.files.slice(i, i + BATCH_SIZE)
            const batchResults = await Promise.all(
              batch.map(async (file) => {
                const url = `${gitDocs.baseUrl}/${file}`
                const res = await fetch(url, { headers: { 'User-Agent': 'skilld/1.0' } }).catch(() => null)
                if (!res?.ok)
                  return null
                const content = await res.text()
                downloaded++
                update(packageName, 'downloading', `${downloaded}/${gitDocs.files.length} docs @ ${gitDocs.ref}`, versionKey)
                return { file, content }
              }),
            )
            results.push(...batchResults)
          }

          for (const r of results) {
            if (r) {
              const cachePath = gitDocs.docsPrefix ? r.file.replace(gitDocs.docsPrefix, '') : r.file
              cachedDocs.push({ path: cachePath, content: r.content })
              docsToIndex.push({
                id: cachePath,
                content: r.content,
                metadata: { package: packageName, source: cachePath, type: 'doc' },
              })
            }
          }

          const downloadedCount = results.filter(Boolean).length
          if (downloadedCount > 0) {
            docSource = `${resolved.repoUrl}/tree/${gitDocs.ref}/docs`
            docsType = 'docs'
          }
        }
      }
    }

    if (resolved.llmsUrl && cachedDocs.length === 0) {
      update(packageName, 'downloading', 'Fetching llms.txt...', versionKey)
      const llmsContent = await fetchLlmsTxt(resolved.llmsUrl)
      if (llmsContent) {
        docSource = resolved.llmsUrl!
        docsType = 'llms.txt'
        cachedDocs.push({ path: 'llms.txt', content: normalizeLlmsLinks(llmsContent.raw) })

        if (llmsContent.links.length > 0) {
          update(packageName, 'downloading', `0/${llmsContent.links.length} linked docs...`, versionKey)
          const baseUrl = resolved.docsUrl || new URL(resolved.llmsUrl).origin
          const docs = await downloadLlmsDocs(llmsContent, baseUrl)

          for (const doc of docs) {
            const localPath = doc.url.startsWith('/') ? doc.url.slice(1) : doc.url
            const cachePath = join('docs', ...localPath.split('/'))
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
      update(packageName, 'downloading', 'Fetching README...', versionKey)
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

    // Load cached docs for indexing if db doesn't exist yet
    const dbPath = getPackageDbPath(packageName, version)
    if (!existsSync(dbPath)) {
      const cached = readCachedDocs(packageName, version)
      for (const doc of cached) {
        docsToIndex.push({
          id: doc.path,
          content: doc.content,
          metadata: { package: packageName, source: doc.path, type: 'doc' },
        })
      }
    }
  }

  const features = readConfig().features ?? defaultFeatures

  // Fetch release notes
  const releasesPath = join(getCacheDir(packageName, version), 'releases')
  if (features.releases && resolved.repoUrl && !existsSync(releasesPath)) {
    const gh = parseGitHubUrl(resolved.repoUrl)
    if (gh) {
      update(packageName, 'downloading', 'Fetching releases...', versionKey)
      const releaseDocs = await fetchReleaseNotes(gh.owner, gh.repo, version, resolved.gitRef, packageName)
      if (releaseDocs.length > 0) {
        writeToCache(packageName, version, releaseDocs)
        for (const doc of releaseDocs) {
          docsToIndex.push({
            id: doc.path,
            content: doc.content,
            metadata: { package: packageName, source: doc.path, type: 'release' },
          })
        }
      }
    }
  }

  // Create symlinks
  update(packageName, 'downloading', 'Linking references...', versionKey)
  try {
    linkPkg(skillDir, packageName, cwd, version)
    if (!hasShippedDocs(packageName, cwd, version) && docsType !== 'readme') {
      linkReferences(skillDir, packageName, version)
    }
    linkGithub(skillDir, packageName, version)
    linkReleases(skillDir, packageName, version)
  }
  catch {}

  // Collect entry files for indexing
  update(packageName, 'embedding', 'Scanning exports...', versionKey)
  const pkgDir = resolvePkgDir(packageName, cwd, version)
  const entryFiles = features.search && pkgDir ? await resolveEntryFiles(pkgDir) : []
  if (entryFiles.length > 0) {
    for (const e of entryFiles) {
      docsToIndex.push({
        id: e.path,
        content: e.content,
        metadata: { package: packageName, source: `pkg/${e.path}`, type: e.type },
      })
    }
  }

  // Single batch index — one model init, one write
  const dbPath = getPackageDbPath(packageName, version)
  if (docsToIndex.length > 0) {
    update(packageName, 'embedding', `Indexing ${docsToIndex.length} documents...`, versionKey)
    await createIndex(docsToIndex, {
      dbPath,
      onProgress: ({ phase, current, total }) => {
        if (phase === 'storing') {
          const d = docsToIndex[current - 1]
          const type = d?.metadata?.type === 'source' || d?.metadata?.type === 'types' ? 'code' : 'doc'
          const file = d?.id.split('/').pop() ?? ''
          update(packageName, 'embedding', `Indexing ${type} ${file}... ${current}/${total}`, versionKey)
        }
        else if (phase === 'embedding') {
          update(packageName, 'embedding', `Embedding ${current}/${total}`, versionKey)
        }
      },
    })
  }

  const hasReleases = existsSync(releasesPath)
  const hasChangelog = pkgDir ? (['CHANGELOG.md', 'changelog.md'].find(f => existsSync(join(pkgDir, f))) || false) : false

  const relatedSkills = await findRelatedSkills(packageName, baseDir)
  const shippedDocs = hasShippedDocs(packageName, cwd, version)
  const pkgFiles = getPkgKeyFiles(packageName, cwd, version)

  // Write base SKILL.md
  const skillMd = generateSkillMd({
    name: packageName,
    version,
    releasedAt: resolved.releasedAt,
    description: resolved.description,
    dependencies: resolved.dependencies,
    distTags: resolved.distTags,
    relatedSkills,
    hasGithub: false,
    hasReleases,
    hasChangelog,
    docsType,
    hasShippedDocs: shippedDocs,
    pkgFiles,
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

  update(packageName, 'done', 'Skill ready', versionKey)
  return 'synced'
}

/** Phase 2: Enhance skill with LLM */
async function enhanceWithLLM(
  packageName: string,
  config: ParallelSyncConfig & { model: OptimizeModel },
  cwd: string,
  update: UpdateFn,
  sections?: SkillSection[],
  customPrompt?: string,
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

  const githubPath = join(cacheDir, 'github')
  const hasGithub = existsSync(githubPath)
  const hasReleases = existsSync(join(cacheDir, 'releases'))
  const hasChangelog = ['CHANGELOG.md', 'changelog.md'].find(f => existsSync(join(cwd, 'node_modules', packageName, f))) || false

  const docFiles = listReferenceFiles(skillDir)
  update(packageName, 'generating', config.model, versionKey)
  const { optimized, wasOptimized, error } = await optimizeDocs({
    packageName,
    skillDir,
    model: config.model,
    version,
    hasGithub,
    hasReleases,
    hasChangelog,
    docFiles,
    noCache: config.force,
    sections,
    customPrompt,
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
    const shippedDocs = hasShippedDocs(packageName, cwd, version)
    const pkgFiles = getPkgKeyFiles(packageName, cwd, version)
    const body = cleanSkillMd(optimized)
    const skillMd = generateSkillMd({
      name: packageName,
      version,
      releasedAt: resolved.releasedAt,
      dependencies: resolved.dependencies,
      distTags: resolved.distTags,
      body,
      relatedSkills,
      hasGithub,
      hasReleases,
      hasChangelog,
      docsType,
      hasShippedDocs: shippedDocs,
      pkgFiles,
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
