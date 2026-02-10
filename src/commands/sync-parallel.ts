import type { AgentType, CustomPrompt, OptimizeModel, SkillSection } from '../agent'
import type { ResolvedPackage } from '../sources'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import * as p from '@clack/prompts'
import logUpdate from 'log-update'
import pLimit from 'p-limit'
import { join } from 'pathe'
import {
  agents,
  computeSkillDirName,

  generateSkillMd,
  getModelLabel,
  linkSkillToAgents,
  optimizeDocs,

} from '../agent'
import {
  ensureCacheDir,
  getPkgKeyFiles,
  getVersionKey,
  hasShippedDocs,
  isCached,
  linkPkgNamed,
  listReferenceFiles,
  resolvePkgDir,
} from '../cache'
import { defaultFeatures, readConfig, registerProject } from '../core/config'
import { formatDuration } from '../core/formatting'
import { parsePackages, readLock, writeLock } from '../core/lockfile'
import { getSharedSkillsDir, SHARED_SKILLS_DIR } from '../core/shared'
import {
  fetchPkgDist,
  readLocalDependencies,
  resolvePackageDocsWithAttempts,
  searchNpmPackages,
} from '../sources'

import { ensureGitignore, selectLlmConfig } from './sync'
import {
  detectChangelog,
  fetchAndCacheResources,
  findRelatedSkills,
  forceClearCache,
  handleShippedSkills,
  indexResources,
  linkAllReferences,
  RESOLVE_STEP_LABELS,
  resolveBaseDir,
  resolveLocalDep,
} from './sync-shared'

type PackageStatus = 'pending' | 'resolving' | 'downloading' | 'embedding' | 'exploring' | 'thinking' | 'generating' | 'done' | 'error'

interface PackageState {
  name: string
  status: PackageStatus
  message: string
  version?: string
  streamPreview?: string
  startedAt?: number
  completedAt?: number
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
  debug?: boolean
  concurrency?: number
}

/** Data passed from phase 1 (base skill) to phase 2 (LLM enhancement) */
interface BaseSkillData {
  resolved: ResolvedPackage
  version: string
  skillDirName: string
  docsType: 'llms.txt' | 'readme' | 'docs'
  hasIssues: boolean
  hasDiscussions: boolean
  hasReleases: boolean
  hasChangelog: string | false
  shippedDocs: boolean
  pkgFiles: string[]
  relatedSkills: string[]
  packages?: Array<{ name: string }>
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
      const elapsed = (s.status === 'done' || s.status === 'error') && s.startedAt && s.completedAt
        ? ` ${dim}(${formatDuration(s.completedAt - s.startedAt)})${reset}`
        : ''
      const preview = s.streamPreview ? ` ${dim}${s.streamPreview}${reset}` : ''
      return `  ${color}${icon}${reset} ${name} ${version}${s.message}${elapsed}${preview}`
    })

    const doneCount = [...states.values()].filter(s => s.status === 'done').length
    const errorCount = [...states.values()].filter(s => s.status === 'error').length
    const header = `\x1B[1mSyncing ${packages.length} packages\x1B[0m (${doneCount} done${errorCount > 0 ? `, ${errorCount} failed` : ''})\n`

    logUpdate(header + lines.join('\n'))
  }

  function update(pkg: string, status: PackageStatus, message: string, version?: string) {
    const state = states.get(pkg)!
    if (!state.startedAt && status !== 'pending')
      state.startedAt = performance.now()
    if ((status === 'done' || status === 'error') && !state.completedAt)
      state.completedAt = performance.now()
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
  const skillData = new Map<string, BaseSkillData>()
  const baseResults = await Promise.allSettled(
    packages.map(pkg =>
      limit(() => syncBaseSkill(pkg, config, cwd, update)),
    ),
  )

  logUpdate.done()

  // Collect successful packages for LLM phase (exclude shipped — they need no LLM)
  const successfulPkgs: string[] = []
  const shippedPkgs: string[] = []
  const errors: Array<{ pkg: string, reason: string }> = []
  for (let i = 0; i < baseResults.length; i++) {
    const r = baseResults[i]!
    if (r.status === 'fulfilled' && r.value !== 'shipped') {
      successfulPkgs.push(packages[i]!)
      skillData.set(packages[i]!, r.value)
    }
    else if (r.status === 'fulfilled' && r.value === 'shipped') {
      shippedPkgs.push(packages[i]!)
    }
    else if (r.status === 'rejected') {
      const err = r.reason
      const reason = err instanceof Error ? `${err.message}\n${err.stack}` : String(err)
      errors.push({ pkg: packages[i]!, reason })
    }
  }

  const skillMsg = `Created ${successfulPkgs.length} base skills${shippedPkgs.length > 1 ? ` (Skipping ${shippedPkgs.length})` : ''}`
  p.log.success(skillMsg)

  if (errors.length > 0) {
    for (const { pkg, reason } of errors) {
      p.log.error(`  ${pkg}: ${reason}`)
    }
  }

  // Phase 2: Ask about LLM enhancement (skip if -y without model, or skipLlm config)
  const globalConfig = readConfig()
  if (successfulPkgs.length > 0 && !globalConfig.skipLlm && !(config.yes && !config.model)) {
    const llmConfig = await selectLlmConfig(config.model)

    if (llmConfig) {
      p.log.step(getModelLabel(llmConfig.model))
      // Reset states for LLM phase
      for (const pkg of successfulPkgs) {
        states.set(pkg, { name: pkg, status: 'pending', message: 'Waiting...' })
      }
      render()

      const llmResults = await Promise.allSettled(
        successfulPkgs.map(pkg =>
          limit(() => enhanceWithLLM(pkg, skillData.get(pkg)!, { ...config, model: llmConfig.model }, cwd, update, llmConfig.sections, llmConfig.customPrompt)),
        ),
      )

      logUpdate.done()

      const llmSucceeded = llmResults.filter(r => r.status === 'fulfilled').length
      p.log.success(`Enhanced ${llmSucceeded}/${successfulPkgs.length} skills with LLM`)
    }
  }

  const parallelShared = getSharedSkillsDir(cwd)
  await ensureGitignore(parallelShared ? SHARED_SKILLS_DIR : agent.skillsDir, cwd, config.global)

  const { shutdownWorker } = await import('../retriv/pool')
  await shutdownWorker()

  p.outro(`Synced ${successfulPkgs.length}/${packages.length} packages`)
}

type UpdateFn = (pkg: string, status: PackageStatus, message: string, version?: string) => void

/** Phase 1: Generate base skill (no LLM). Returns 'shipped' if shipped skill was linked, or BaseSkillData. */
async function syncBaseSkill(
  packageName: string,
  config: ParallelSyncConfig,
  cwd: string,
  update: UpdateFn,
): Promise<'shipped' | BaseSkillData> {
  const localDeps = await readLocalDependencies(cwd).catch(() => [])
  const localVersion = localDeps.find(d => d.name === packageName)?.version

  const { package: resolvedPkg, attempts } = await resolvePackageDocsWithAttempts(packageName, {
    version: localVersion,
    cwd,
    onProgress: step => update(packageName, 'resolving', RESOLVE_STEP_LABELS[step]),
  })
  let resolved = resolvedPkg

  if (!resolved) {
    update(packageName, 'resolving', 'Local package...')
    resolved = await resolveLocalDep(packageName, cwd)
  }

  if (!resolved) {
    const npmAttempt = attempts.find(a => a.source === 'npm')
    let reason: string
    if (npmAttempt?.status === 'not-found') {
      const suggestions = await searchNpmPackages(packageName, 3)
      const hint = suggestions.length > 0
        ? ` (try: ${suggestions.map(s => s.name).join(', ')})`
        : ''
      reason = (npmAttempt.message || 'Not on npm') + hint
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
  const shippedResult = handleShippedSkills(packageName, version, cwd, config.agent, config.global)
  if (shippedResult) {
    const shared = !config.global && getSharedSkillsDir(cwd)
    if (shared) {
      for (const shipped of shippedResult.shipped)
        linkSkillToAgents(shipped.skillName, shared, cwd)
    }
    update(packageName, 'done', 'Published SKILL.md', versionKey)
    return 'shipped'
  }

  // Force: nuke cached references + search index so all existsSync guards re-fetch
  if (config.force) {
    forceClearCache(packageName, version)
  }

  const useCache = isCached(packageName, version)
  if (useCache) {
    update(packageName, 'downloading', 'Using cache', versionKey)
  }
  else {
    update(packageName, 'downloading', config.force ? 'Re-fetching docs...' : 'Fetching docs...', versionKey)
  }

  const baseDir = resolveBaseDir(cwd, config.agent, config.global)
  const skillDirName = computeSkillDirName(packageName, resolved.repoUrl)
  const skillDir = join(baseDir, skillDirName)
  mkdirSync(skillDir, { recursive: true })

  const features = readConfig().features ?? defaultFeatures

  // Fetch & cache all resources (docs cascade + issues + discussions + releases)
  const resources = await fetchAndCacheResources({
    packageName,
    resolved,
    version,
    useCache,
    features,
    onProgress: msg => update(packageName, 'downloading', msg, versionKey),
  })

  // Create symlinks
  update(packageName, 'downloading', 'Linking references...', versionKey)
  linkAllReferences(skillDir, packageName, cwd, version, resources.docsType)

  // Index all resources (single batch)
  update(packageName, 'embedding', 'Indexing docs', versionKey)
  await indexResources({
    packageName,
    version,
    cwd,
    docsToIndex: resources.docsToIndex,
    features,
    onProgress: msg => update(packageName, 'embedding', msg, versionKey),
  })

  const pkgDir = resolvePkgDir(packageName, cwd, version)
  const hasChangelog = detectChangelog(pkgDir)
  const relatedSkills = await findRelatedSkills(packageName, baseDir)
  const shippedDocs = hasShippedDocs(packageName, cwd, version)
  const pkgFiles = getPkgKeyFiles(packageName, cwd, version)

  // Write base SKILL.md
  const repoSlug = resolved.repoUrl?.match(/github\.com\/([^/]+\/[^/]+?)(?:\.git)?(?:[/#]|$)/)?.[1]

  // Create named symlink for this package
  linkPkgNamed(skillDir, packageName, cwd, version)

  writeLock(baseDir, skillDirName, {
    packageName,
    version,
    repo: repoSlug,
    source: resources.docSource,
    syncedAt: new Date().toISOString().split('T')[0],
    generator: 'skilld',
  })

  // Read back merged packages from lockfile
  const updatedLock = readLock(baseDir)?.skills[skillDirName]
  const allPackages = parsePackages(updatedLock?.packages).map(p => ({ name: p.name }))

  const skillMd = generateSkillMd({
    name: packageName,
    version,
    releasedAt: resolved.releasedAt,
    description: resolved.description,
    dependencies: resolved.dependencies,
    distTags: resolved.distTags,
    relatedSkills,
    hasIssues: resources.hasIssues,
    hasDiscussions: resources.hasDiscussions,
    hasReleases: resources.hasReleases,
    hasChangelog,
    docsType: resources.docsType,
    hasShippedDocs: shippedDocs,
    pkgFiles,
    dirName: skillDirName,
    packages: allPackages.length > 1 ? allPackages : undefined,
    repoUrl: resolved.repoUrl,
  })
  writeFileSync(join(skillDir, 'SKILL.md'), skillMd)

  // Link shared dir to per-agent dirs
  const shared = !config.global && getSharedSkillsDir(cwd)
  if (shared)
    linkSkillToAgents(skillDirName, shared, cwd)

  if (!config.global) {
    registerProject(cwd)
  }

  update(packageName, 'done', 'Base skill created', versionKey)

  return {
    resolved,
    version,
    skillDirName,
    docsType: resources.docsType,
    hasIssues: resources.hasIssues,
    hasDiscussions: resources.hasDiscussions,
    hasReleases: resources.hasReleases,
    hasChangelog,
    shippedDocs,
    pkgFiles,
    relatedSkills,
    packages: allPackages.length > 1 ? allPackages : undefined,
  }
}

/** Phase 2: Enhance skill with LLM */
async function enhanceWithLLM(
  packageName: string,
  data: BaseSkillData,
  config: ParallelSyncConfig & { model: OptimizeModel },
  cwd: string,
  update: UpdateFn,
  sections?: SkillSection[],
  customPrompt?: CustomPrompt,
): Promise<void> {
  const versionKey = getVersionKey(data.version)
  const baseDir = resolveBaseDir(cwd, config.agent, config.global)
  const skillDir = join(baseDir, data.skillDirName)

  const hasGithub = data.hasIssues || data.hasDiscussions
  const docFiles = listReferenceFiles(skillDir)

  update(packageName, 'generating', config.model, versionKey)
  const { optimized, wasOptimized, error } = await optimizeDocs({
    packageName,
    skillDir,
    model: config.model,
    version: data.version,
    hasGithub,
    hasReleases: data.hasReleases,
    hasChangelog: data.hasChangelog,
    docFiles,
    docsType: data.docsType,
    hasShippedDocs: data.shippedDocs,
    noCache: config.force,
    debug: config.debug,
    sections,
    customPrompt,
    onProgress: (progress) => {
      const isReasoning = progress.type === 'reasoning'
      const status = isReasoning ? 'exploring' : 'generating'
      const sectionPrefix = progress.section ? `[${progress.section}] ` : ''
      const label = progress.chunk.startsWith('[') ? `${sectionPrefix}${progress.chunk}` : `${sectionPrefix}${config.model}`
      update(packageName, status, label, versionKey)
    },
  })

  if (error) {
    update(packageName, 'error', error, versionKey)
    throw new Error(error)
  }

  if (wasOptimized) {
    const skillMd = generateSkillMd({
      name: packageName,
      version: data.version,
      releasedAt: data.resolved.releasedAt,
      dependencies: data.resolved.dependencies,
      distTags: data.resolved.distTags,
      body: optimized,
      relatedSkills: data.relatedSkills,
      hasIssues: data.hasIssues,
      hasDiscussions: data.hasDiscussions,
      hasReleases: data.hasReleases,
      hasChangelog: data.hasChangelog,
      docsType: data.docsType,
      hasShippedDocs: data.shippedDocs,
      pkgFiles: data.pkgFiles,
      dirName: data.skillDirName,
      packages: data.packages,
      repoUrl: data.resolved.repoUrl,
    })
    writeFileSync(join(skillDir, 'SKILL.md'), skillMd)
  }

  update(packageName, 'done', 'Skill optimized', versionKey)
}
