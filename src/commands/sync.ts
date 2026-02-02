import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
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
  agents,
  detectImportedPackages,
  getAvailableModels,
  optimizeDocs,
  sanitizeName,
} from '../agent'
import {
  type ResolveAttempt,
  downloadLlmsDocs,
  fetchGitDocs,
  fetchLlmsTxt,
  fetchNpmPackage,
  fetchReadmeContent,
  normalizeLlmsLinks,
  parseGitHubUrl,
  parseMarkdownLinks,
  parseVersionSpecifier,
  readLocalDependencies,
  resolveLocalPackageDocs,
  resolvePackageDocsWithAttempts,
} from '../doc-resolver'
import { createIndex } from '../retriv'
import { readConfig, registerProject, updateConfig } from '../core/config'
import { writeLock } from '../core/lockfile'
import type { ProjectState } from '../core/skills'

function showResolveAttempts(attempts: ResolveAttempt[]): void {
  if (attempts.length === 0) return

  p.log.message('\x1B[90mResolution attempts:\x1B[0m')
  for (const attempt of attempts) {
    const icon = attempt.status === 'success' ? '\x1B[32m✓\x1B[0m' : '\x1B[90m✗\x1B[0m'
    const source = `\x1B[90m${attempt.source}\x1B[0m`
    const msg = attempt.message ? ` - ${attempt.message}` : ''
    p.log.message(`  ${icon} ${source}${msg}`)
  }
}

export interface SyncOptions {
  packages?: string[]
  global: boolean
  agent: AgentType
  model?: OptimizeModel
  yes: boolean
}

export async function syncCommand(state: ProjectState, opts: SyncOptions): Promise<void> {
  // If packages specified, sync those
  if (opts.packages && opts.packages.length > 0) {
    const model = opts.model ?? await selectModel(opts.yes)
    if (!model) return

    // Use parallel sync for multiple packages
    if (opts.packages.length > 1) {
      const { syncPackagesParallel } = await import('./sync-parallel')
      return syncPackagesParallel({
        packages: opts.packages,
        global: opts.global,
        agent: opts.agent,
        model,
      })
    }

    // Single package - use original flow for cleaner output
    await syncSinglePackage(opts.packages[0]!, { ...opts, model })
    return
  }

  // Otherwise show picker, pre-selecting missing/outdated
  const packages = await interactivePicker(state)
  if (!packages || packages.length === 0) {
    p.outro('No packages selected')
    return
  }

  const model = await selectModel(opts.yes)
  if (!model) return

  // Use parallel sync for multiple packages
  if (packages.length > 1) {
    const { syncPackagesParallel } = await import('./sync-parallel')
    return syncPackagesParallel({
      packages,
      global: opts.global,
      agent: opts.agent,
      model,
    })
  }

  // Single package - use original flow
  await syncSinglePackage(packages[0]!, { ...opts, model })
}

async function interactivePicker(state: ProjectState): Promise<string[] | null> {
  const spin = p.spinner()
  spin.start('Detecting imports...')

  const cwd = process.cwd()
  const { packages: detected, error } = await detectImportedPackages(cwd)
  const declaredMap = state.deps

  if (error || detected.length === 0) {
    spin.stop(error ? `Detection failed: ${error}` : 'No imports detected')
    if (declaredMap.size === 0) {
      p.log.warn('No dependencies found')
      return null
    }
    // Fallback to package.json
    return pickFromList([...declaredMap.entries()].map(([name, version]) => ({
      name,
      version: maskPatch(version),
      count: 0,
      inPkgJson: true,
    })), state)
  }

  spin.stop(`Loaded ${detected.length} project skills`)

  const packages = detected.map(pkg => ({
    name: pkg.name,
    version: declaredMap.get(pkg.name),
    count: pkg.count,
    inPkgJson: declaredMap.has(pkg.name),
  }))

  return pickFromList(packages, state)
}

function maskPatch(version: string | undefined): string | undefined {
  if (!version) return undefined
  const parts = version.split('.')
  if (parts.length >= 3) {
    parts[2] = 'x'
    return parts.slice(0, 3).join('.')
  }
  return version
}

async function pickFromList(
  packages: Array<{ name: string, version?: string, count: number, inPkgJson: boolean }>,
  state: ProjectState,
): Promise<string[] | null> {
  // Pre-select missing and outdated
  const missingSet = new Set(state.missing)
  const outdatedSet = new Set(state.outdated.map(s => s.name))

  const options = packages.map(pkg => ({
    label: pkg.inPkgJson ? `${pkg.name} ★` : pkg.name,
    value: pkg.name,
    hint: [
      maskPatch(pkg.version),
      pkg.count > 0 ? `${pkg.count} imports` : null,
    ].filter(Boolean).join(' · ') || undefined,
  }))

  const initialValues = packages
    .filter(pkg => missingSet.has(pkg.name) || outdatedSet.has(pkg.name))
    .map(pkg => pkg.name)

  const selected = await p.multiselect({
    message: 'Select packages to sync',
    options,
    required: false,
    initialValues,
  })

  if (p.isCancel(selected)) {
    p.cancel('Cancelled')
    return null
  }

  return selected as string[]
}

export async function selectModel(skipPrompt: boolean): Promise<OptimizeModel | null> {
  const config = readConfig()
  const available = await getAvailableModels()

  if (available.length === 0) {
    p.log.warn('No LLM CLIs found (claude, gemini, codex)')
    return null
  }

  // Use config model if set and available
  if (config.model && available.some(m => m.id === config.model)) {
    return config.model
  }

  if (skipPrompt)
    return available.find(m => m.recommended)?.id ?? available[0]!.id

  const modelChoice = await p.select({
    message: 'Select LLM for SKILL.md generation',
    options: available.map(m => ({
      label: m.recommended ? `${m.name} (Recommended)` : m.name,
      value: m.id,
      hint: m.hint,
    })),
    initialValue: available.find(m => m.recommended)?.id ?? available[0]!.id,
  })

  if (p.isCancel(modelChoice)) {
    p.cancel('Cancelled')
    return null
  }

  // Remember choice for next time
  updateConfig({ model: modelChoice as OptimizeModel })

  return modelChoice as OptimizeModel
}

interface SyncConfig {
  global: boolean
  agent: AgentType
  model: OptimizeModel
}

async function syncSinglePackage(packageName: string, config: SyncConfig): Promise<void> {
  const spin = p.spinner()
  spin.start(`Resolving ${packageName}`)

  const cwd = process.cwd()
  const localDeps = await readLocalDependencies(cwd).catch(() => [])
  const localVersion = localDeps.find(d => d.name === packageName)?.version

  // Try npm first
  let resolveResult = await resolvePackageDocsWithAttempts(packageName, { version: localVersion })
  let resolved = resolveResult.package

  // If npm fails, check if it's a link: dep and try local resolution
  if (!resolved) {
    const { readFileSync, existsSync } = await import('node:fs')
    const { join, resolve } = await import('node:path')
    const pkgPath = join(cwd, 'package.json')

    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      const deps = { ...pkg.dependencies, ...pkg.devDependencies }
      const depVersion = deps[packageName]

      if (depVersion?.startsWith('link:')) {
        spin.message(`Resolving local package: ${packageName}`)
        const localPath = resolve(cwd, depVersion.slice(5))
        resolved = await resolveLocalPackageDocs(localPath)
      }
    }
  }

  if (!resolved) {
    spin.stop(`Could not find docs for: ${packageName}`)
    showResolveAttempts(resolveResult.attempts)
    return
  }

  const version = localVersion || resolved.version || 'latest'
  const versionKey = getVersionKey(version)

  const useCache = isCached(packageName, version)
  if (useCache) {
    spin.stop(`Using cached ${packageName}@${versionKey}`)
  }
  else {
    spin.stop(`Resolved ${packageName}@${version}`)
  }

  ensureCacheDir()

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
          spin.start(`Downloading ${gitDocs.files.length} git docs @ ${gitDocs.ref}`)

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
          spin.stop(`Downloaded ${downloaded}/${gitDocs.files.length} git docs`)
          if (downloaded > 0) docSource = `${resolved.repoUrl}/tree/${gitDocs.ref}/docs`
        }
      }
    }

    if (resolved.llmsUrl && cachedDocs.length === 0) {
      spin.start('Fetching llms.txt')
      const llmsContent = await fetchLlmsTxt(resolved.llmsUrl)
      if (llmsContent) {
        llmsRaw = llmsContent.raw
        docSource = resolved.llmsUrl!
        cachedDocs.push({ path: 'llms.txt', content: normalizeLlmsLinks(llmsContent.raw) })

        if (llmsContent.links.length > 0) {
          spin.stop(`Saved llms.txt from ${resolved.llmsUrl}`)

          const progress = p.progress({
            max: llmsContent.links.length,
            style: 'heavy',
          })
          progress.start(`Downloading ${llmsContent.links.length} doc files`)

          const baseUrl = resolved.docsUrl || new URL(resolved.llmsUrl).origin
          const docs = await downloadLlmsDocs(llmsContent, baseUrl, (_url, index) => {
            progress.advance(1, `${index + 1}/${llmsContent.links.length}`)
          })

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

          progress.stop(`Downloaded ${docs.length}/${llmsContent.links.length} docs`)
        }
      }
      else {
        spin.stop('No llms.txt found')
      }
    }

    // Fallback to README
    if (resolved.readmeUrl && cachedDocs.length === 0) {
      spin.start('Fetching README')
      const content = await fetchReadmeContent(resolved.readmeUrl)
      if (content) {
        cachedDocs.push({ path: 'docs/README.md', content })
        docsToIndex.push({
          id: 'README.md',
          content,
          metadata: { package: packageName, source: 'docs/README.md' },
        })
        spin.stop('Saved README.md')
      }
      else {
        spin.stop('No README found')
      }
    }

    // Write to global cache
    if (cachedDocs.length > 0) {
      writeToCache(packageName, version, cachedDocs)

      // Index into per-package search.db
      if (docsToIndex.length > 0) {
        spin.start('Creating vector embeddings')
        const dbPath = getPackageDbPath(packageName, version)
        await createIndex(docsToIndex, { dbPath })
        spin.stop(`Embedded ${docsToIndex.length} docs`)
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
    const cacheDir = getCacheDir(packageName, version)
    const { readCachedDocs } = await import('../cache/storage')
    const cachedDocs = readCachedDocs(packageName, version)

    if (cachedDocs.length > 0) {
      spin.start('Creating vector embeddings')
      const docsToIndex = cachedDocs.map(doc => ({
        id: doc.path,
        content: doc.content,
        metadata: { package: packageName, source: doc.path },
      }))
      await createIndex(docsToIndex, { dbPath })
      spin.stop(`Embedded ${docsToIndex.length} docs`)
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

  // Priority 1: Git docs (versioned, preferred)
  const guideDir = join(cacheDir, 'docs', 'guide')
  const docsDir = join(cacheDir, 'docs')
  if (existsSync(guideDir) || existsSync(join(docsDir, 'index.md'))) {
    const sections: string[] = []

    // Read index.md first
    const indexPath = join(docsDir, 'index.md')
    if (existsSync(indexPath)) {
      sections.push(readFileSync(indexPath, 'utf-8'))
    }

    // Read guide files (prioritize key docs)
    if (existsSync(guideDir)) {
      const priorityFiles = ['index.md', 'features.md', 'migration.md', 'why.md']
      const guideFiles = readdirSync(guideDir, { withFileTypes: true })
        .filter(f => f.isFile() && f.name.endsWith('.md'))
        .map(f => f.name)
        .sort((a, b) => {
          const aIdx = priorityFiles.indexOf(a)
          const bIdx = priorityFiles.indexOf(b)
          if (aIdx >= 0 && bIdx >= 0) return aIdx - bIdx
          if (aIdx >= 0) return -1
          if (bIdx >= 0) return 1
          return a.localeCompare(b)
        })

      for (const file of guideFiles.slice(0, 10)) {
        const content = readFileSync(join(guideDir, file), 'utf-8')
        sections.push(`# guide/${file}\n\n${content}`)
      }
    }

    if (sections.length > 0) {
      docsContent = sections.join('\n\n---\n\n')
    }
  }

  // Priority 2: llms.txt with best practices extraction
  if (!docsContent) {
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
  }

  // Priority 3: README fallback
  if (!docsContent) {
    const readmePath = join(cacheDir, 'docs', 'README.md')
    if (existsSync(readmePath)) {
      docsContent = readFileSync(readmePath, 'utf-8')
    }
  }

  if (docsContent) {
    p.log.step(`Calling ${config.model} to generate SKILL.md...`)
    const referenceFiles = listReferenceFiles(skillDir)
    const { optimized, wasOptimized } = await optimizeDocs({
      content: docsContent,
      packageName,
      model: config.model,
      referenceFiles,
    })

    const relatedSkills = await findRelatedSkills(packageName, baseDir)

    if (wasOptimized) {
      const body = cleanSkillMd(optimized)
      let skillMd = generateFrontmatter(packageName) + generateImportantBlock(packageName) + body
      skillMd += generateFooter(relatedSkills)

      writeFileSync(join(skillDir, 'SKILL.md'), skillMd)
      p.log.success('Generated SKILL.md')
    }
    else {
      p.log.warn('LLM unavailable, creating minimal SKILL.md')
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

  p.outro(`Synced ${packageName} to ${skillDir}`)
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
  // We always add our own frontmatter
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

function generateFrontmatter(name: string, _description?: string): string {
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
