import type { AgentType, CustomPrompt, OptimizeModel, SkillSection } from '../agent/index.ts'
import type { FeaturesConfig } from '../core/config.ts'
import type { ResolvedPackage } from '../sources/index.ts'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
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
  SECTION_MERGE_ORDER,
  SECTION_OUTPUT_FILES,
  wrapSection,

} from '../agent/index.ts'
import {
  ensureCacheDir,
  getCacheDir,
  getPkgKeyFiles,
  getVersionKey,
  hasShippedDocs,
  isCached,
  linkPkgNamed,
  listReferenceFiles,
  readCachedSection,
  resolvePkgDir,
} from '../cache/index.ts'
import { defaultFeatures, readConfig, registerProject } from '../core/config.ts'
import { formatDuration } from '../core/formatting.ts'
import { parsePackages, readLock, writeLock } from '../core/lockfile.ts'
import { parseFrontmatter } from '../core/markdown.ts'
import { getSharedSkillsDir, semverDiff, SHARED_SKILLS_DIR } from '../core/shared.ts'
import { shutdownWorker } from '../retriv/pool.ts'
import {
  fetchPkgDist,
  parsePackageSpec,
  readLocalDependencies,
  resolvePackageDocsWithAttempts,
  searchNpmPackages,
} from '../sources/index.ts'

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
} from './sync-shared.ts'
import { DEFAULT_SECTIONS, ensureAgentInstructions, ensureGitignore, selectLlmConfig, writePromptFiles } from './sync.ts'

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
  mode?: 'add' | 'update'
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
  warnings: string[]
  features?: FeaturesConfig
  /** Pre-update version (only set in update mode) */
  oldVersion?: string
  /** Pre-update syncedAt date (only set in update mode) */
  oldSyncedAt?: string
  /** Whether the existing SKILL.md had LLM-generated content */
  wasEnhanced?: boolean
  usedCache: boolean
  /** Lines consumed by SKILL.md overhead */
  overheadLines?: number
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
    const lines = Array.from(states.values(), (s) => {
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
    const verb = config.mode === 'update' ? 'Updating' : 'Syncing'
    const header = `\x1B[1m${verb} ${packages.length} packages\x1B[0m (${doneCount} done${errorCount > 0 ? `, ${errorCount} failed` : ''})\n`

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

  const pastVerb = config.mode === 'update' ? 'Updated' : 'Created'
  const skillMsg = `${pastVerb} ${successfulPkgs.length} base skills${shippedPkgs.length > 1 ? ` (Skipping ${shippedPkgs.length})` : ''}`
  p.log.success(skillMsg)

  for (const [, data] of skillData) {
    for (const w of data.warnings)
      p.log.warn(`\x1B[33m${w}\x1B[0m`)
  }

  if (errors.length > 0) {
    for (const { pkg, reason } of errors) {
      p.log.error(`  ${pkg}: ${reason}`)
    }
  }

  // Apply cached LLM sections for packages that have all sections cached
  const cachedPkgs: string[] = []
  if (!config.force) {
    for (const pkg of successfulPkgs) {
      const data = skillData.get(pkg)!
      const resolvedName = data.resolved.name
      const allCached = DEFAULT_SECTIONS.every((s) => {
        const outputFile = SECTION_OUTPUT_FILES[s]
        return readCachedSection(resolvedName, data.version, outputFile) !== null
      })
      if (allCached) {
        const baseDir = resolveBaseDir(cwd, config.agent, config.global)
        const skillDir = join(baseDir, data.skillDirName)
        const cachedParts: string[] = []
        for (const s of SECTION_MERGE_ORDER) {
          if (!DEFAULT_SECTIONS.includes(s))
            continue
          const outputFile = SECTION_OUTPUT_FILES[s]
          const content = readCachedSection(resolvedName, data.version, outputFile)
          if (content)
            cachedParts.push(wrapSection(s, content))
        }
        const cachedBody = cachedParts.join('\n\n')

        const skillMd = generateSkillMd({
          name: resolvedName,
          version: data.version,
          releasedAt: data.resolved.releasedAt,

          distTags: data.resolved.distTags,
          body: cachedBody,
          relatedSkills: data.relatedSkills,
          hasIssues: data.hasIssues,
          hasDiscussions: data.hasDiscussions,
          hasReleases: data.hasReleases,
          hasChangelog: data.hasChangelog,
          docsType: data.docsType,
          hasShippedDocs: data.shippedDocs,
          pkgFiles: data.pkgFiles,
          generatedBy: 'cached',
          dirName: data.skillDirName,
          packages: data.packages,
          repoUrl: data.resolved.repoUrl,
          features: data.features,
        })
        writeFileSync(join(skillDir, 'SKILL.md'), skillMd)
        cachedPkgs.push(pkg)
      }
    }
  }

  const uncachedPkgs = successfulPkgs.filter(pkg => !cachedPkgs.includes(pkg))
  if (cachedPkgs.length > 0)
    p.log.success(`Applied cached SKILL.md sections for ${cachedPkgs.join(', ')}`)

  // Phase 2: Ask about LLM enhancement (skip if skipLlm config)
  // When -y without -m: auto-resolve model from config or available models
  const globalConfig = readConfig()
  let resolvedModel = config.model || (config.yes && !globalConfig.skipLlm ? globalConfig.model as import('../agent/index.ts').OptimizeModel | undefined : undefined)
  // Auto-resolve when -y, not skipping LLM, but no explicit model (e.g. user picked "Auto" in wizard)
  if (!resolvedModel && config.yes && !globalConfig.skipLlm) {
    const { getAvailableModels } = await import('../agent/index.ts')
    const available = await getAvailableModels()
    const auto = available.find(m => m.recommended)?.id ?? available[0]?.id
    if (auto)
      resolvedModel = auto as import('../agent/index.ts').OptimizeModel
  }
  if (uncachedPkgs.length > 0 && !globalConfig.skipLlm && !(config.yes && !resolvedModel)) {
    // Build combined update context from all successful packages
    const DIFF_RANK: Record<string, number> = { major: 5, premajor: 4, minor: 3, preminor: 2, patch: 1, prepatch: 1, prerelease: 0 }
    let parallelUpdateCtx: import('./sync-shared.ts').UpdateContext | undefined
    if (config.mode === 'update') {
      let maxDiff = ''
      let allEnhanced = true
      let anySyncedAt: string | undefined
      for (const pkg of successfulPkgs) {
        const data = skillData.get(pkg)!
        if (!data.wasEnhanced)
          allEnhanced = false
        if (data.oldSyncedAt && (!anySyncedAt || data.oldSyncedAt < anySyncedAt))
          anySyncedAt = data.oldSyncedAt
        if (data.oldVersion) {
          const diff = semverDiff(data.oldVersion, data.version)
          if (diff && (DIFF_RANK[diff] ?? 0) > (DIFF_RANK[maxDiff] ?? -1))
            maxDiff = diff
        }
      }
      // Use first package's versions for display when single, otherwise omit specific versions
      const first = skillData.get(successfulPkgs[0]!)!
      parallelUpdateCtx = {
        oldVersion: successfulPkgs.length === 1 ? first.oldVersion : undefined,
        newVersion: successfulPkgs.length === 1 ? first.version : undefined,
        syncedAt: anySyncedAt,
        wasEnhanced: allEnhanced,
        bumpType: maxDiff || undefined,
      }
    }
    const llmConfig = await selectLlmConfig(resolvedModel, undefined, parallelUpdateCtx)

    if (llmConfig?.promptOnly) {
      for (const pkg of uncachedPkgs) {
        const data = skillData.get(pkg)!
        const baseDir = resolveBaseDir(cwd, config.agent, config.global)
        const skillDir = join(baseDir, data.skillDirName)
        writePromptFiles({
          packageName: pkg,
          skillDir,
          version: data.version,
          hasIssues: data.hasIssues,
          hasDiscussions: data.hasDiscussions,
          hasReleases: data.hasReleases,
          hasChangelog: data.hasChangelog,
          docsType: data.docsType,
          hasShippedDocs: data.shippedDocs,
          pkgFiles: data.pkgFiles,
          sections: llmConfig.sections,
          customPrompt: llmConfig.customPrompt,
          features: data.features,
          overheadLines: data.overheadLines,
        })
      }
    }
    else if (llmConfig) {
      p.log.step(getModelLabel(llmConfig.model))
      // Reset states for LLM phase
      for (const pkg of uncachedPkgs) {
        states.set(pkg, { name: pkg, status: 'pending', message: 'Waiting...' })
      }
      render()

      const llmResults = await Promise.allSettled(
        uncachedPkgs.map(pkg =>
          limit(() => enhanceWithLLM(pkg, skillData.get(pkg)!, { ...config, model: llmConfig.model }, cwd, update, llmConfig.sections, llmConfig.customPrompt)),
        ),
      )

      logUpdate.done()

      const llmSucceeded = llmResults.filter(r => r.status === 'fulfilled').length
      p.log.success(`Enhanced ${llmSucceeded}/${uncachedPkgs.length} skills with LLM`)
    }
  }

  const parallelShared = getSharedSkillsDir(cwd)
  await ensureGitignore(parallelShared ? SHARED_SKILLS_DIR : agent.skillsDir, cwd, config.global)
  await ensureAgentInstructions(config.agent, cwd, config.global)

  await shutdownWorker()

  p.outro(`${pastVerb} ${successfulPkgs.length}/${packages.length} packages`)

  const { suggestPrepareHook } = await import('../cli-helpers.ts')
  suggestPrepareHook(cwd)
}

type UpdateFn = (pkg: string, status: PackageStatus, message: string, version?: string) => void

/** Phase 1: Generate base skill (no LLM). Returns 'shipped' if shipped skill was linked, or BaseSkillData. */
async function syncBaseSkill(
  packageSpec: string,
  config: ParallelSyncConfig,
  cwd: string,
  update: UpdateFn,
): Promise<'shipped' | BaseSkillData> {
  // Parse dist-tag from spec: "vue@beta" → name="vue", tag="beta"
  const { name: packageName, tag: requestedTag } = parsePackageSpec(packageSpec)

  const localDeps = await readLocalDependencies(cwd).catch(() => [])
  const localVersion = localDeps.find(d => d.name === packageName)?.version

  const { package: resolvedPkg, attempts, registryVersion } = await resolvePackageDocsWithAttempts(requestedTag ? packageSpec : packageName, {
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
    // Even without docs, the package may ship its own skills (skills-npm convention)
    const shippedVersion = localVersion || registryVersion || 'latest'
    const earlyShipped = handleShippedSkills(packageName, shippedVersion, cwd, config.agent, config.global)
    if (earlyShipped) {
      const shared = !config.global && getSharedSkillsDir(cwd)
      if (shared) {
        for (const shipped of earlyShipped.shipped)
          linkSkillToAgents(shipped.skillName, shared, cwd, config.agent)
      }
      update(packageName, 'done', 'Published SKILL.md', getVersionKey(shippedVersion))
      return 'shipped'
    }

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
        linkSkillToAgents(shipped.skillName, shared, cwd, config.agent)
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
  // In update mode, find the existing skill dir name for this package (may differ from computed name)
  let skillDirName = computeSkillDirName(packageName)
  if (config.mode === 'update') {
    const lock = readLock(baseDir)
    if (lock) {
      for (const [name, info] of Object.entries(lock.skills)) {
        if (info.packageName === packageName || parsePackages(info.packages).some(p => p.name === packageName)) {
          skillDirName = name
          break
        }
      }
    }
  }
  const skillDir = join(baseDir, skillDirName)
  mkdirSync(skillDir, { recursive: true })

  // Capture pre-update info before lockfile gets overwritten
  const preLock = config.mode === 'update' ? readLock(baseDir)?.skills[skillDirName] : undefined
  const preEnhanced = (() => {
    if (!preLock)
      return false
    const skillMdPath = join(skillDir, 'SKILL.md')
    if (!existsSync(skillMdPath))
      return false
    const fm = parseFrontmatter(readFileSync(skillMdPath, 'utf-8'))
    return !!fm.generated_by
  })()

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
  linkAllReferences(skillDir, packageName, cwd, version, resources.docsType, undefined, features, resources.repoInfo)

  // Index all resources (single batch)
  if (features.search) {
    update(packageName, 'embedding', 'Indexing docs', versionKey)
    await indexResources({
      packageName,
      version,
      cwd,
      docsToIndex: resources.docsToIndex,
      features,
      onProgress: msg => update(packageName, 'embedding', msg, versionKey),
    })
  }

  const pkgDir = resolvePkgDir(packageName, cwd, version)
  const hasChangelog = detectChangelog(pkgDir, getCacheDir(packageName, version))
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
    features,
  })
  writeFileSync(join(skillDir, 'SKILL.md'), skillMd)
  const overheadLines = skillMd.split('\n').length

  // Link shared dir to per-agent dirs
  const shared = !config.global && getSharedSkillsDir(cwd)
  if (shared)
    linkSkillToAgents(skillDirName, shared, cwd, config.agent)

  if (!config.global) {
    registerProject(cwd)
  }

  update(packageName, 'done', config.mode === 'update' ? 'Skill updated' : 'Base skill created', versionKey)

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
    warnings: resources.warnings,
    features,
    usedCache: resources.usedCache,
    oldVersion: preLock?.version,
    oldSyncedAt: preLock?.syncedAt,
    wasEnhanced: preEnhanced,
    overheadLines,
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
    features: data.features,
    pkgFiles: data.pkgFiles,
    overheadLines: data.overheadLines,
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
      features: data.features,
    })
    writeFileSync(join(skillDir, 'SKILL.md'), skillMd)
  }

  update(packageName, 'done', 'Skill optimized', versionKey)
}
