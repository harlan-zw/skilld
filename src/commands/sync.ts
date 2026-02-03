import type { AgentType, OptimizeModel } from '../agent'
import type { ProjectState } from '../core/skills'
import type { ResolveAttempt } from '../doc-resolver'
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import * as p from '@clack/prompts'
import {
  agents,

  detectImportedPackages,
  generateSkillMd,
  getAvailableModels,
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
import { readConfig, registerProject, updateConfig } from '../core/config'
import { writeLock } from '../core/lockfile'
import {
  downloadLlmsDocs,
  fetchGitDocs,
  fetchGitHubIssues,
  fetchLlmsTxt,
  fetchNpmPackage,
  fetchReadmeContent,
  fetchReleaseNotes,
  formatIssuesAsMarkdown,
  isGhAvailable,
  normalizeLlmsLinks,
  parseGitHubUrl,
  readLocalDependencies,

  resolveLocalPackageDocs,
  resolvePackageDocsWithAttempts,
} from '../doc-resolver'
import { createIndex } from '../retriv'

function showResolveAttempts(attempts: ResolveAttempt[]): void {
  if (attempts.length === 0)
    return

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
    // Use parallel sync for multiple packages
    if (opts.packages.length > 1) {
      const { syncPackagesParallel } = await import('./sync-parallel')
      return syncPackagesParallel({
        packages: opts.packages,
        global: opts.global,
        agent: opts.agent,
        model: opts.model,
        yes: opts.yes,
      })
    }

    // Single package - use original flow for cleaner output
    await syncSinglePackage(opts.packages[0]!, opts)
    return
  }

  // Otherwise show picker, pre-selecting missing/outdated
  const packages = await interactivePicker(state)
  if (!packages || packages.length === 0) {
    p.outro('No packages selected')
    return
  }

  // Use parallel sync for multiple packages
  if (packages.length > 1) {
    const { syncPackagesParallel } = await import('./sync-parallel')
    return syncPackagesParallel({
      packages,
      global: opts.global,
      agent: opts.agent,
      model: opts.model,
      yes: opts.yes,
    })
  }

  // Single package - use original flow
  await syncSinglePackage(packages[0]!, opts)
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
  if (!version)
    return undefined
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
  model?: OptimizeModel
  yes: boolean
}

async function syncSinglePackage(packageName: string, config: SyncConfig): Promise<void> {
  const spin = p.spinner()
  spin.start(`Resolving ${packageName}`)

  const cwd = process.cwd()
  const localDeps = await readLocalDependencies(cwd).catch(() => [])
  const localVersion = localDeps.find(d => d.name === packageName)?.version

  // Try npm first
  const resolveResult = await resolvePackageDocsWithAttempts(packageName, { version: localVersion })
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
      p.log.success(`Linked shipped skill: ${shipped.skillName} → ${shipped.skillDir}`)
    }
    if (!config.global)
      registerProject(cwd)
    spin.stop(`Shipped ${shippedSkills.length} skill(s) from ${packageName}`)
    return
  }

  const useCache = isCached(packageName, version)
  spin.stop(`Resolved ${packageName}@${useCache ? versionKey : version}${useCache ? ' (cached)' : ''}`)

  ensureCacheDir()

  const agent = agents[config.agent]
  const baseDir = config.global
    ? join(CACHE_DIR, 'skills')
    : join(cwd, agent.skillsDir)

  const skillDir = join(baseDir, sanitizeName(packageName))
  mkdirSync(skillDir, { recursive: true })

  let docSource: string = resolved.readmeUrl || 'readme'
  let docsType: 'llms.txt' | 'readme' | 'docs' = 'readme'

  // Collect all fetched resources for indexing phase
  const fetchedDocs: Array<{ id: string, content: string, metadata: Record<string, any> }> = []
  const fetchedIssues: Array<{ id: string, content: string, metadata: Record<string, any> }> = []
  const fetchedReleases: Array<{ id: string, content: string, metadata: Record<string, any> }> = []

  // ── Phase 1: Finding resources ──
  // Build task list dynamically based on what needs fetching
  interface TaskItem { title: string, task: (message: (msg: string) => void) => Promise<string> }
  const resourceTasks: TaskItem[] = []

  if (!useCache) {
    resourceTasks.push({
      title: 'Fetching documentation',
      task: async (message) => {
        const cachedDocs: Array<{ path: string, content: string }> = []

        // Try versioned git docs first
        if (resolved.gitDocsUrl && resolved.repoUrl) {
          const gh = parseGitHubUrl(resolved.repoUrl)
          if (gh) {
            const gitDocs = await fetchGitDocs(gh.owner, gh.repo, version, packageName)
            if (gitDocs && gitDocs.files.length > 0) {
              message(`Downloading ${gitDocs.files.length} docs from ${gitDocs.ref}`)

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
                  fetchedDocs.push({
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
                writeToCache(packageName, version, cachedDocs)
                return `Downloaded ${downloaded} git docs`
              }
            }
          }
        }

        // Try llms.txt
        if (resolved.llmsUrl && cachedDocs.length === 0) {
          message('Fetching llms.txt')
          const llmsContent = await fetchLlmsTxt(resolved.llmsUrl)
          if (llmsContent) {
            docSource = resolved.llmsUrl!
            docsType = 'llms.txt'
            const baseUrl = resolved.docsUrl || new URL(resolved.llmsUrl).origin
            cachedDocs.push({ path: 'llms.txt', content: normalizeLlmsLinks(llmsContent.raw, baseUrl) })

            if (llmsContent.links.length > 0) {
              message(`Downloading ${llmsContent.links.length} linked docs`)
              const docs = await downloadLlmsDocs(llmsContent, baseUrl)

              for (const doc of docs) {
                const localPath = doc.url.startsWith('/') ? doc.url.slice(1) : doc.url
                const cachePath = `docs/${localPath}`
                cachedDocs.push({ path: cachePath, content: doc.content })
                fetchedDocs.push({
                  id: doc.url,
                  content: doc.content,
                  metadata: { package: packageName, source: cachePath, type: 'doc' },
                })
              }

              writeToCache(packageName, version, cachedDocs)
              return `Saved ${docs.length + 1} docs from llms.txt`
            }

            writeToCache(packageName, version, cachedDocs)
            return 'Saved llms.txt'
          }
        }

        // Fallback to README
        if (resolved.readmeUrl && cachedDocs.length === 0) {
          message('Fetching README')
          const content = await fetchReadmeContent(resolved.readmeUrl)
          if (content) {
            cachedDocs.push({ path: 'docs/README.md', content })
            fetchedDocs.push({
              id: 'README.md',
              content,
              metadata: { package: packageName, source: 'docs/README.md', type: 'doc' },
            })
            writeToCache(packageName, version, cachedDocs)
            return 'Saved README.md'
          }
        }

        return 'No docs found'
      },
    })
  }

  // Issues task (runs for both fresh and cached if issues don't exist yet)
  const issuesPath = join(getCacheDir(packageName, version), 'issues', 'ISSUES.md')
  if (resolved.repoUrl && isGhAvailable() && !existsSync(issuesPath)) {
    const gh = parseGitHubUrl(resolved.repoUrl)
    if (gh) {
      resourceTasks.push({
        title: 'Fetching GitHub issues',
        task: async () => {
          const issues = await fetchGitHubIssues(gh.owner, gh.repo, 20)
          if (issues.length > 0) {
            const issuesMd = formatIssuesAsMarkdown(issues)
            writeToCache(packageName, version, [{ path: 'issues/ISSUES.md', content: issuesMd }])
            for (const issue of issues) {
              fetchedIssues.push({
                id: `issue-${issue.number}`,
                content: `#${issue.number}: ${issue.title}\n\n${issue.body || ''}`,
                metadata: { package: packageName, source: 'issues/ISSUES.md', type: 'issue', number: issue.number },
              })
            }
            return `Cached ${issues.length} issues`
          }
          return 'No issues found'
        },
      })
    }
  }

  // Releases task
  const releasesPath = join(getCacheDir(packageName, version), 'releases')
  if (resolved.repoUrl && !existsSync(releasesPath)) {
    const gh = parseGitHubUrl(resolved.repoUrl)
    if (gh) {
      resourceTasks.push({
        title: 'Fetching release notes',
        task: async () => {
          const releaseDocs = await fetchReleaseNotes(gh.owner, gh.repo, version, resolved.gitRef)
          if (releaseDocs.length > 0) {
            writeToCache(packageName, version, releaseDocs)
            for (const doc of releaseDocs) {
              fetchedReleases.push({
                id: doc.path,
                content: doc.content,
                metadata: { package: packageName, source: doc.path, type: 'release' },
              })
            }
            return `Cached ${releaseDocs.length} release note(s)`
          }
          return 'No releases found'
        },
      })
    }
  }

  // Run resource tasks
  if (resourceTasks.length > 0) {
    p.log.step('Finding resources')
    await p.tasks(resourceTasks)
  }

  // Create symlinks
  try {
    linkPkg(skillDir, packageName, cwd)
    if (!hasShippedDocs(packageName, cwd) && docsType !== 'readme') {
      linkReferences(skillDir, packageName, version)
    }
    linkIssues(skillDir, packageName, version)
    linkReleases(skillDir, packageName, version)
  }
  catch {
    // Symlink may fail on some systems
  }

  // ── Phase 2: Creating search index ──
  const dbPath = getPackageDbPath(packageName, version)
  const indexTasks: TaskItem[] = []

  if (!existsSync(dbPath)) {
    // Fresh index needed — use fetched data or read from cache
    if (fetchedDocs.length > 0 || fetchedIssues.length > 0 || fetchedReleases.length > 0) {
      // We have freshly fetched data
      if (fetchedDocs.length > 0) {
        indexTasks.push({
          title: `Indexing ${fetchedDocs.length} docs`,
          task: async () => {
            await createIndex(fetchedDocs, { dbPath })
            return `Indexed ${fetchedDocs.length} docs`
          },
        })
      }
      if (fetchedIssues.length > 0) {
        indexTasks.push({
          title: `Indexing ${fetchedIssues.length} issues`,
          task: async () => {
            await createIndex(fetchedIssues, { dbPath })
            return `Indexed ${fetchedIssues.length} issues`
          },
        })
      }
      if (fetchedReleases.length > 0) {
        indexTasks.push({
          title: `Indexing ${fetchedReleases.length} releases`,
          task: async () => {
            await createIndex(fetchedReleases, { dbPath })
            return `Indexed ${fetchedReleases.length} releases`
          },
        })
      }
    }
    else {
      // Cached data — read from disk and index
      indexTasks.push({
        title: 'Indexing cached docs',
        task: async () => {
          const { readCachedDocs } = await import('../cache/storage')
          const cachedDocs = readCachedDocs(packageName, version)
          if (cachedDocs.length === 0)
            return 'No docs to index'

          const docsToIndex: Array<{ id: string, content: string, metadata: Record<string, any> }> = cachedDocs
            .filter(doc => !doc.path.startsWith('issues/'))
            .map(doc => ({
              id: doc.path,
              content: doc.content,
              metadata: { package: packageName, source: doc.path, type: 'doc' },
            }))

          // Parse issues individually
          const issuesDoc = cachedDocs.find(doc => doc.path === 'issues/ISSUES.md')
          if (issuesDoc) {
            const issueBlocks = issuesDoc.content.split(/\n---\n/).filter(Boolean)
            for (const block of issueBlocks) {
              const match = block.match(/## #(\d+): (.+)/)
              if (match) {
                docsToIndex.push({
                  id: `issue-${match[1]}`,
                  content: block,
                  metadata: { package: packageName, source: 'issues/ISSUES.md', type: 'issue', number: Number(match[1]) },
                })
              }
            }
          }

          await createIndex(docsToIndex, { dbPath })
          return `Indexed ${docsToIndex.length} docs`
        },
      })
    }
  }

  if (indexTasks.length > 0) {
    p.log.step('Creating search index')
    await p.tasks(indexTasks)
  }

  // Detect docs type from cache
  const cacheDir = getCacheDir(packageName, version)
  if (useCache) {
    if (existsSync(join(cacheDir, 'docs', 'index.md')) || existsSync(join(cacheDir, 'docs', 'guide'))) {
      docSource = resolved.repoUrl ? `${resolved.repoUrl}/tree/v${version}/docs` : 'git'
      docsType = 'docs'
    }
    else if (existsSync(join(cacheDir, 'llms.txt'))) {
      docSource = resolved.llmsUrl || 'llms.txt'
      docsType = 'llms.txt'
    }
    else if (existsSync(join(cacheDir, 'docs', 'README.md'))) {
      docsType = 'readme'
    }
  }

  const hasIssues = existsSync(issuesPath)
  const hasReleases = existsSync(releasesPath)
  const hasChangelog = existsSync(join(cwd, 'node_modules', packageName, 'CHANGELOG.md'))

  const relatedSkills = await findRelatedSkills(packageName, baseDir)
  const shippedDocs = hasShippedDocs(packageName, cwd)

  // Write base SKILL.md (no LLM needed)
  const baseSkillMd = generateSkillMd({
    name: packageName,
    version,
    releasedAt: resolved.releasedAt,
    description: resolved.description,
    relatedSkills,
    hasIssues,
    hasReleases,
    hasChangelog,
    docsType,
    hasShippedDocs: shippedDocs,
  })
  writeFileSync(join(skillDir, 'SKILL.md'), baseSkillMd)

  writeLock(baseDir, sanitizeName(packageName), {
    packageName,
    version,
    source: docSource,
    syncedAt: new Date().toISOString().split('T')[0],
    generator: 'skilld',
  })

  p.log.success(`Created base skill: ${skillDir}`)

  // Ask about LLM optimization (skip if -y flag or model already specified)
  if (!config.yes || config.model) {
    const wantOptimize = config.model || await p.confirm({
      message: 'Generate best practices with LLM?',
      initialValue: true,
    })

    if (wantOptimize && !p.isCancel(wantOptimize)) {
      const model = config.model ?? await selectModel(false)
      if (model) {
        await enhanceSkillWithLLM({
          packageName,
          version,
          skillDir,
          dbPath,
          model,
          resolved,
          relatedSkills,
          hasIssues,
          hasReleases,
          hasChangelog,
          docsType,
          hasShippedDocs: shippedDocs,
        })
      }
    }
  }

  // Register project in global config (for uninstall tracking)
  if (!config.global) {
    registerProject(cwd)
  }

  p.outro(`Synced ${packageName} to ${skillDir}`)
}

interface EnhanceOptions {
  packageName: string
  version: string
  skillDir: string
  dbPath: string
  model: OptimizeModel
  resolved: { repoUrl?: string, llmsUrl?: string, releasedAt?: string }
  relatedSkills: string[]
  hasIssues: boolean
  hasReleases: boolean
  hasChangelog: boolean
  docsType: 'llms.txt' | 'readme' | 'docs'
  hasShippedDocs: boolean
}

async function enhanceSkillWithLLM(opts: EnhanceOptions): Promise<void> {
  const { packageName, version, skillDir, dbPath, model, resolved, relatedSkills, hasIssues, hasReleases, hasChangelog, docsType, hasShippedDocs: shippedDocs } = opts

  const llmSpin = p.spinner()
  llmSpin.start(`Agent exploring ${packageName}`)
  const docFiles = listReferenceFiles(skillDir)
  const { optimized, wasOptimized } = await optimizeDocs({
    packageName,
    skillDir,
    dbPath,
    model,
    version,
    hasIssues,
    hasReleases,
    hasChangelog,
    docFiles,
    onProgress: ({ type, chunk }) => {
      if (type === 'reasoning' && chunk.startsWith('[')) {
        llmSpin.message(chunk)
      }
      else if (type === 'text') {
        llmSpin.message(`Writing...`)
      }
    },
  })

  if (wasOptimized) {
    llmSpin.stop('Generated best practices')
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
  else {
    llmSpin.stop('LLM optimization failed')
  }
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
