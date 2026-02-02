import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import logUpdate from 'log-update'
import pLimit from 'p-limit'
import * as p from '@clack/prompts'
import {
  CACHE_DIR,
  ensureCacheDir,
  getCacheDir,
  getPackageDbPath,
  getVersionKey,
  isCached,
  linkDist,
  linkReferences,
  listReferenceFiles,
  writeToCache,
} from '../cache'
import {
  type AgentType,
  type OptimizeModel,
  type StreamProgress,
  agents,
  optimizeDocs,
  sanitizeName,
} from '../agent'
import {
  downloadLlmsDocs,
  fetchGitDocs,
  fetchLlmsTxt,
  fetchNpmPackage,
  fetchReadmeContent,
  normalizeLlmsLinks,
  parseGitHubUrl,
  parseMarkdownLinks,
  readLocalDependencies,
  resolveLocalPackageDocs,
  resolvePackageDocs,
} from '../doc-resolver'
import { createIndex } from '../retriv'
import { registerProject } from '../core/config'
import { writeLock } from '../core/lockfile'

type PackageStatus = 'pending' | 'resolving' | 'downloading' | 'embedding' | 'thinking' | 'generating' | 'done' | 'error'

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
  thinking: '\x1B[35m', // Magenta for thinking
  generating: '\x1B[33m',
  done: '\x1B[32m',
  error: '\x1B[31m',
}

export interface ParallelSyncConfig {
  packages: string[]
  global: boolean
  agent: AgentType
  model: OptimizeModel
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
    if (version) state.version = version
    render()
  }

  function updatePreview(pkg: string, preview: string) {
    const state = states.get(pkg)!
    // Truncate and clean preview for display (last ~30 chars, single line)
    const cleaned = preview.replace(/\s+/g, ' ').trim()
    const truncated = cleaned.length > 30 ? `...${cleaned.slice(-30)}` : cleaned
    state.streamPreview = truncated
    render()
  }

  ensureCacheDir()
  render()

  const limit = pLimit(concurrency)

  const results = await Promise.allSettled(
    packages.map(pkg =>
      limit(() => syncSinglePackageWithProgress(pkg, config, cwd, update, updatePreview)),
    ),
  )

  // Persist final output
  logUpdate.done()

  // Collect errors with package names
  const errors: Array<{ pkg: string, reason: string }> = []
  for (let i = 0; i < results.length; i++) {
    const r = results[i]!
    if (r.status === 'rejected') {
      const reason = r.reason instanceof Error ? r.reason.message : String(r.reason)
      errors.push({ pkg: packages[i]!, reason })
    }
  }

  // Summary
  const succeeded = results.filter(r => r.status === 'fulfilled').length

  if (errors.length > 0) {
    p.log.warn(`Completed with ${errors.length} error(s)`)
    for (const { pkg, reason } of errors) {
      p.log.error(`  ${pkg}: ${reason}`)
    }
  }

  p.outro(`Synced ${succeeded}/${packages.length} packages`)
}

type UpdateFn = (pkg: string, status: PackageStatus, message: string, version?: string) => void
type UpdatePreviewFn = (pkg: string, preview: string) => void

async function syncSinglePackageWithProgress(
  packageName: string,
  config: ParallelSyncConfig,
  cwd: string,
  update: UpdateFn,
  updatePreview: UpdatePreviewFn,
): Promise<void> {
  update(packageName, 'resolving', 'Looking up...')

  const localDeps = await readLocalDependencies(cwd).catch(() => [])
  const localVersion = localDeps.find(d => d.name === packageName)?.version

  // Try npm first
  let resolved = await resolvePackageDocs(packageName, { version: localVersion })

  // If npm fails, check if it's a link: dep and try local resolution
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

  let llmsRaw: string | null = null
  let docSource: string = resolved.readmeUrl || 'readme'
  const docsToIndex: Array<{ id: string, content: string, metadata: Record<string, any> }> = []

  if (!useCache) {
    const cachedDocs: Array<{ path: string, content: string }> = []

    // Try versioned git docs first
    if (resolved.gitDocsUrl && resolved.repoUrl) {
      const gh = parseGitHubUrl(resolved.repoUrl)
      if (gh) {
        const gitDocs = await fetchGitDocs(gh.owner, gh.repo, version)
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
                if (!res?.ok) return null
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
                metadata: { package: packageName, source: r.file },
              })
            }
          }

          const downloaded = results.filter(Boolean).length
          if (downloaded > 0) docSource = `${resolved.repoUrl}/tree/${gitDocs.ref}/docs`
        }
      }
    }

    if (resolved.llmsUrl && cachedDocs.length === 0) {
      update(packageName, 'downloading', 'llms.txt...', versionKey)
      const llmsContent = await fetchLlmsTxt(resolved.llmsUrl)
      if (llmsContent) {
        llmsRaw = llmsContent.raw
        docSource = resolved.llmsUrl!
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
              metadata: { package: packageName, source: cachePath },
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
          metadata: { package: packageName, source: 'docs/README.md' },
        })
      }
    }

    // Write to global cache
    if (cachedDocs.length > 0) {
      writeToCache(packageName, version, cachedDocs)

      // Index into per-package search.db
      if (docsToIndex.length > 0) {
        update(packageName, 'embedding', `Vectorizing ${docsToIndex.length} docs`, versionKey)
        const dbPath = getPackageDbPath(packageName, version)
        await createIndex(docsToIndex, { dbPath })
      }
    }
  }

  // Create symlinks to cached references and dist
  try {
    linkReferences(skillDir, packageName, version)
    linkDist(skillDir, packageName, cwd)
  }
  catch {
    // Symlink may fail on some systems
  }

  // Index from cache if per-package DB doesn't exist
  const dbPath = getPackageDbPath(packageName, version)
  if (!existsSync(dbPath)) {
    const { readCachedDocs } = await import('../cache/storage')
    const cachedDocs = readCachedDocs(packageName, version)

    if (cachedDocs.length > 0) {
      update(packageName, 'embedding', `Vectorizing ${cachedDocs.length} cached docs`, versionKey)
      const docsToIndex = cachedDocs.map(doc => ({
        id: doc.path,
        content: doc.content,
        metadata: { package: packageName, source: doc.path },
      }))
      await createIndex(docsToIndex, { dbPath })
    }
  }

  // Generate SKILL.md
  let docsContent: string | null = null
  const cacheDir = getCacheDir(packageName, version)

  // Detect source from cache if we didn't fetch
  if (useCache) {
    if (existsSync(join(cacheDir, 'docs', 'index.md')) || existsSync(join(cacheDir, 'docs', 'guide'))) {
      docSource = resolved.repoUrl ? `${resolved.repoUrl}/tree/v${version}/docs` : 'git'
    }
    else if (existsSync(join(cacheDir, 'llms.txt'))) {
      docSource = resolved.llmsUrl || 'llms.txt'
    }
  }

  // Read llms.txt from cache if we didn't fetch it
  if (!llmsRaw && existsSync(join(cacheDir, 'llms.txt'))) {
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
  else {
    const readmePath = join(cacheDir, 'docs', 'README.md')
    if (existsSync(readmePath)) {
      docsContent = readFileSync(readmePath, 'utf-8')
    }
  }

  if (docsContent) {
    update(packageName, 'generating', `Calling ${config.model}...`, versionKey)
    const referenceFiles = listReferenceFiles(skillDir)
    const { optimized, wasOptimized, error } = await optimizeDocs({
      content: docsContent,
      packageName,
      model: config.model,
      referenceFiles,
      onProgress: (progress) => {
        // Update status based on whether we're reasoning or generating
        const status = progress.type === 'reasoning' ? 'thinking' : 'generating'
        const preview = progress.chunk.replace(/\s+/g, ' ').trim()
        update(packageName, status, config.model, versionKey)
        if (preview) updatePreview(packageName, preview)
      },
    })

    if (error) {
      update(packageName, 'error', error, versionKey)
      throw new Error(error)
    }

    const relatedSkills = await findRelatedSkills(packageName, baseDir)

    if (wasOptimized) {
      let skillMd = cleanSkillMd(optimized)

      // Ensure frontmatter + IMPORTANT block
      if (!skillMd.startsWith('---')) {
        skillMd = generateFrontmatter(packageName) + generateImportantBlock(packageName) + skillMd
      }
      else {
        // Insert IMPORTANT block after frontmatter
        const endFm = skillMd.indexOf('---', 3)
        if (endFm > 0) {
          const afterFm = skillMd.slice(endFm + 3).replace(/^\n+/, '\n\n')
          skillMd = skillMd.slice(0, endFm + 3) + '\n\n' + generateImportantBlock(packageName) + afterFm.trim()
        }
      }

      skillMd += generateFooter(relatedSkills)

      writeFileSync(join(skillDir, 'SKILL.md'), skillMd)
    }
    else {
      const skillMd = generateMinimalSkill(packageName, resolved.description, relatedSkills)
      writeFileSync(join(skillDir, 'SKILL.md'), skillMd)
    }

    writeLock(baseDir, sanitizeName(packageName), {
      packageName,
      version,
      source: docSource,
      syncedAt: new Date().toISOString().split('T')[0],
      generator: 'skilld',
    })
  }

  // Register project in global config (for uninstall tracking)
  if (!config.global) {
    registerProject(cwd)
  }

  update(packageName, 'done', 'Synced', versionKey)
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

function generateFrontmatter(name: string): string {
  return `---
name: ${sanitizeName(name)}
description: Load skill when using anything from the package "${name}".
---

`
}

function generateImportantBlock(packageName: string): string {
  return `> **IMPORTANT:** Search docs with \`skilld -q "pkg:${packageName} <query>"\`
> Read docs at \`./references/docs/\`, source at \`./references/dist/\`

`
}

function generateFooter(relatedSkills: string[]): string {
  if (relatedSkills.length === 0) return ''
  return `\nRelated: ${relatedSkills.join(', ')}\n`
}

function generateMinimalSkill(
  name: string,
  description: string | undefined,
  relatedSkills: string[],
): string {
  return `---
name: ${sanitizeName(name)}
description: Load skill when using anything from the package "${name}".
---

${generateImportantBlock(name)}# ${name}

${description || ''}
${generateFooter(relatedSkills)}`
}
