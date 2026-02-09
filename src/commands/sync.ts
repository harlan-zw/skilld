import type { AgentType, CustomPrompt, OptimizeModel, SkillSection } from '../agent'
import type { ProjectState } from '../core/skills'
import type { ResolveAttempt } from '../sources'
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import * as p from '@clack/prompts'
import { join, relative } from 'pathe'
import {
  agents,
  computeSkillDirName,

  detectImportedPackages,
  generateSkillMd,
  getAvailableModels,
  getModelLabel,
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
import { defaultFeatures, readConfig, registerProject, updateConfig } from '../core/config'
import { timedSpinner } from '../core/formatting'
import { parsePackages, readLock, writeLock } from '../core/lockfile'
import {
  fetchPkgDist,
  readLocalDependencies,
  resolvePackageDocsWithAttempts,
  searchNpmPackages,
} from '../sources'
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

/**
 * Check if .gitignore has `.skilld` entry.
 * If missing, prompt to add it. Skipped for global installs.
 */
export async function ensureGitignore(skillsDir: string, cwd: string, isGlobal: boolean): Promise<void> {
  if (isGlobal)
    return

  const gitignorePath = join(cwd, '.gitignore')
  const pattern = '.skilld'

  // Check if already ignored
  if (existsSync(gitignorePath)) {
    const content = readFileSync(gitignorePath, 'utf-8')
    if (content.split('\n').some(line => line.trim() === pattern))
      return
  }

  // Show guidance
  p.log.info(
    `\x1B[1mGit guidance:\x1B[0m\n`
    + `  \x1B[32m✓\x1B[0m Commit: \x1B[36m${skillsDir}/*/SKILL.md\x1B[0m\n`
    + `  \x1B[32m✓\x1B[0m Commit: \x1B[36m${skillsDir}/skilld-lock.yaml\x1B[0m\n`
    + `  \x1B[31m✗\x1B[0m Ignore: \x1B[36m${pattern}\x1B[0m \x1B[90m(recreated by \`skilld install\`)\x1B[0m`,
  )

  const add = await p.confirm({
    message: `Add \`${pattern}\` to .gitignore?`,
    initialValue: true,
  })

  if (p.isCancel(add) || !add)
    return

  const entry = `\n# Skilld references (recreated by \`skilld install\`)\n${pattern}\n`
  if (existsSync(gitignorePath)) {
    const existing = readFileSync(gitignorePath, 'utf-8')
    const separator = existing.endsWith('\n') ? '' : '\n'
    appendFileSync(gitignorePath, `${separator}${entry}`)
  }
  else {
    writeFileSync(gitignorePath, entry)
  }

  p.log.success('Updated .gitignore')
}

export interface SyncOptions {
  packages?: string[]
  global: boolean
  agent: AgentType
  model?: OptimizeModel
  yes: boolean
  force?: boolean
  debug?: boolean
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
        force: opts.force,
        debug: opts.debug,
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
      force: opts.force,
      debug: opts.debug,
    })
  }

  // Single package - use original flow
  await syncSinglePackage(packages[0]!, opts)
}

async function interactivePicker(state: ProjectState): Promise<string[] | null> {
  const spin = timedSpinner()
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

/** Select LLM model for SKILL.md generation (independent of target agent) */
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
    message: 'Model for SKILL.md generation',
    options: available.map(m => ({
      label: m.recommended ? `${m.name} (Recommended)` : m.name,
      value: m.id,
      hint: `${m.agentName} · ${m.hint}`,
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

/** Default sections when model is pre-set (non-interactive) */
export const DEFAULT_SECTIONS: SkillSection[] = ['best-practices', 'llm-gaps']

export async function selectSkillSections(message = 'Generate SKILL.md with LLM'): Promise<{ sections: SkillSection[], customPrompt?: CustomPrompt, cancelled: boolean }> {
  const selected = await p.multiselect({
    message,
    options: [
      { label: 'LLM gaps', value: 'llm-gaps' as SkillSection, hint: 'deprecated APIs, silent failures, changed defaults' },
      { label: 'Best practices', value: 'best-practices' as SkillSection, hint: 'gotchas, pitfalls, patterns' },
      { label: 'Doc map', value: 'api' as SkillSection, hint: 'compact index of exports linked to source files' },
      { label: 'Custom section', value: 'custom' as SkillSection, hint: 'add your own section' },
    ],
    initialValues: DEFAULT_SECTIONS,
    required: false,
  })

  if (p.isCancel(selected))
    return { sections: [], cancelled: true }

  const sections = selected as SkillSection[]
  if (sections.length === 0)
    return { sections: [], cancelled: false }

  let customPrompt: CustomPrompt | undefined
  if (sections.includes('custom')) {
    const heading = await p.text({
      message: 'Section heading',
      placeholder: 'e.g. "Migration from v2" or "SSR Patterns"',
    })
    if (p.isCancel(heading))
      return { sections: [], cancelled: true }

    const body = await p.text({
      message: 'Instructions for this section',
      placeholder: 'e.g. "Document breaking changes and migration steps from v2 to v3"',
    })
    if (p.isCancel(body))
      return { sections: [], cancelled: true }

    customPrompt = { heading: heading as string, body: body as string }
  }

  return { sections, customPrompt, cancelled: false }
}

export interface LlmConfig {
  model: OptimizeModel
  sections: SkillSection[]
  customPrompt?: CustomPrompt
}

/**
 * Resolve sections + model for LLM enhancement.
 * If presetModel is provided, uses DEFAULT_SECTIONS without prompting.
 * Returns null if cancelled or no sections/model selected.
 */
export async function selectLlmConfig(presetModel?: OptimizeModel, message?: string): Promise<LlmConfig | null> {
  const { sections, customPrompt, cancelled } = presetModel
    ? { sections: DEFAULT_SECTIONS, customPrompt: undefined, cancelled: false }
    : await selectSkillSections(message)

  if (cancelled || sections.length === 0)
    return null

  const model = presetModel ?? await selectModel(false)
  if (!model)
    return null

  return { model, sections, customPrompt }
}

interface SyncConfig {
  global: boolean
  agent: AgentType
  model?: OptimizeModel
  yes: boolean
  force?: boolean
  debug?: boolean
}

async function syncSinglePackage(packageName: string, config: SyncConfig): Promise<void> {
  const spin = timedSpinner()
  spin.start(`Resolving ${packageName}`)

  const cwd = process.cwd()
  const localDeps = await readLocalDependencies(cwd).catch(() => [])
  const localVersion = localDeps.find(d => d.name === packageName)?.version

  // Try npm first
  const resolveResult = await resolvePackageDocsWithAttempts(packageName, {
    version: localVersion,
    cwd,
    onProgress: step => spin.message(`${packageName}: ${RESOLVE_STEP_LABELS[step]}`),
  })
  let resolved = resolveResult.package

  // If npm fails, check if it's a link: dep and try local resolution
  if (!resolved) {
    spin.message(`Resolving local package: ${packageName}`)
    resolved = await resolveLocalDep(packageName, cwd)
  }

  if (!resolved) {
    // Search npm for alternatives before giving up
    spin.message(`Searching npm for "${packageName}"...`)
    const suggestions = await searchNpmPackages(packageName)

    if (suggestions.length > 0) {
      spin.stop(`Package "${packageName}" not found on npm`)
      showResolveAttempts(resolveResult.attempts)

      const selected = await p.select({
        message: 'Did you mean one of these?',
        options: [
          ...suggestions.map(s => ({
            label: s.name,
            value: s.name,
            hint: s.description,
          })),
          { label: 'None of these', value: '_none_' as const },
        ],
      })

      if (!p.isCancel(selected) && selected !== '_none_')
        return syncSinglePackage(selected as string, config)

      return
    }

    spin.stop(`Could not find docs for: ${packageName}`)
    showResolveAttempts(resolveResult.attempts)
    return
  }

  const version = localVersion || resolved.version || 'latest'
  const versionKey = getVersionKey(version)

  // Download npm dist if not in node_modules (for standalone/learning use)
  if (!existsSync(join(cwd, 'node_modules', packageName))) {
    spin.message(`Downloading ${packageName}@${version} dist`)
    await fetchPkgDist(packageName, version)
  }

  // Shipped skills: symlink directly, skip all doc fetching/caching/LLM
  const shippedResult = handleShippedSkills(packageName, version, cwd, config.agent, config.global)
  if (shippedResult) {
    for (const shipped of shippedResult.shipped) {
      p.log.success(`Using published SKILL.md: ${shipped.skillName} → ${relative(cwd, shipped.skillDir)}`)
    }
    spin.stop(`Using published SKILL.md(s) from ${packageName}`)
    return
  }

  // Force: nuke cached references + search index so all existsSync guards re-fetch
  if (config.force) {
    forceClearCache(packageName, version)
  }

  const useCache = isCached(packageName, version)
  spin.stop(`Resolved ${packageName}@${useCache ? versionKey : version}${config.force ? ' (force)' : useCache ? ' (cached)' : ''}`)

  ensureCacheDir()

  const baseDir = resolveBaseDir(cwd, config.agent, config.global)
  const skillDirName = computeSkillDirName(packageName, resolved.repoUrl)
  const skillDir = join(baseDir, skillDirName)
  mkdirSync(skillDir, { recursive: true })

  // ── Merge mode: skill dir already exists with a different primary package ──
  const existingLock = readLock(baseDir)?.skills[skillDirName]
  const isMerge = existingLock && existingLock.packageName !== packageName

  if (isMerge) {
    spin.stop(`Merging ${packageName} into ${skillDirName}`)

    // Create named symlink for this package
    linkPkgNamed(skillDir, packageName, cwd, version)

    // Merge into lockfile
    const repoSlug = resolved.repoUrl?.match(/github\.com\/([^/]+\/[^/]+?)(?:\.git)?(?:[/#]|$)/)?.[1]
    writeLock(baseDir, skillDirName, {
      packageName,
      version,
      repo: repoSlug,
      source: existingLock.source,
      syncedAt: new Date().toISOString().split('T')[0],
      generator: 'skilld',
    })

    // Regenerate SKILL.md with all packages listed
    const updatedLock = readLock(baseDir)?.skills[skillDirName]
    const allPackages = parsePackages(updatedLock?.packages).map(p => ({ name: p.name }))
    const relatedSkills = await findRelatedSkills(packageName, baseDir)
    const pkgFiles = getPkgKeyFiles(existingLock.packageName!, cwd, existingLock.version)
    const shippedDocs = hasShippedDocs(existingLock.packageName!, cwd, existingLock.version)

    const skillMd = generateSkillMd({
      name: existingLock.packageName!,
      version: existingLock.version,
      relatedSkills,
      hasIssues: existsSync(join(skillDir, '.skilld', 'issues')),
      hasDiscussions: existsSync(join(skillDir, '.skilld', 'discussions')),
      hasReleases: existsSync(join(skillDir, '.skilld', 'releases')),
      docsType: (existingLock.source?.includes('llms.txt') ? 'llms.txt' : 'docs') as 'llms.txt' | 'readme' | 'docs',
      hasShippedDocs: shippedDocs,
      pkgFiles,
      dirName: skillDirName,
      packages: allPackages,
    })
    writeFileSync(join(skillDir, 'SKILL.md'), skillMd)

    if (!config.global)
      registerProject(cwd)

    p.outro(`Merged ${packageName} into ${skillDirName}`)
    return
  }

  const features = readConfig().features ?? defaultFeatures

  // ── Phase 1: Fetch & cache all resources ──
  const resSpin = timedSpinner()
  resSpin.start('Finding resources')
  const resources = await fetchAndCacheResources({
    packageName,
    resolved,
    version,
    useCache,
    features,
    onProgress: msg => resSpin.message(msg),
  })
  const resParts: string[] = []
  if (resources.docsToIndex.length > 0) {
    const docCount = resources.docsToIndex.filter(d => d.metadata?.type === 'doc').length
    if (docCount > 0)
      resParts.push(`${docCount} docs`)
  }
  if (resources.hasIssues)
    resParts.push('issues')
  if (resources.hasDiscussions)
    resParts.push('discussions')
  if (resources.hasReleases)
    resParts.push('releases')
  resSpin.stop(`Fetched ${resParts.length > 0 ? resParts.join(', ') : 'resources'}`)

  // Create symlinks
  linkAllReferences(skillDir, packageName, cwd, version, resources.docsType)

  // ── Phase 2: Search index ──
  const idxSpin = timedSpinner()
  idxSpin.start('Creating search index')
  await indexResources({
    packageName,
    version,
    cwd,
    docsToIndex: resources.docsToIndex,
    features,
    onProgress: msg => idxSpin.message(msg),
  })
  idxSpin.stop('Search index ready')

  const pkgDir = resolvePkgDir(packageName, cwd, version)
  const hasChangelog = detectChangelog(pkgDir)
  const relatedSkills = await findRelatedSkills(packageName, baseDir)
  const shippedDocs = hasShippedDocs(packageName, cwd, version)
  const pkgFiles = getPkgKeyFiles(packageName, cwd, version)

  // Write base SKILL.md (no LLM needed)
  const repoSlug = resolved.repoUrl?.match(/github\.com\/([^/]+\/[^/]+?)(?:\.git)?(?:[/#]|$)/)?.[1]

  // Also create named symlink for this package
  linkPkgNamed(skillDir, packageName, cwd, version)

  writeLock(baseDir, skillDirName, {
    packageName,
    version,
    repo: repoSlug,
    source: resources.docSource,
    syncedAt: new Date().toISOString().split('T')[0],
    generator: 'skilld',
  })

  // Read back merged packages from lockfile for SKILL.md generation
  const updatedLock = readLock(baseDir)?.skills[skillDirName]
  const allPackages = parsePackages(updatedLock?.packages).map(p => ({ name: p.name }))

  const baseSkillMd = generateSkillMd({
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
  writeFileSync(join(skillDir, 'SKILL.md'), baseSkillMd)

  p.log.success(`Created base skill: ${relative(cwd, skillDir)}`)

  // Ask about LLM optimization (skip if -y flag, skipLlm config, or model already specified)
  const globalConfig = readConfig()
  if (!globalConfig.skipLlm && (!config.yes || config.model)) {
    const llmConfig = await selectLlmConfig(config.model)
    if (llmConfig) {
      p.log.step(getModelLabel(llmConfig.model))
      await enhanceSkillWithLLM({
        packageName,
        version,
        skillDir,
        dirName: skillDirName,
        model: llmConfig.model,
        resolved,
        relatedSkills,
        hasIssues: resources.hasIssues,
        hasDiscussions: resources.hasDiscussions,
        hasReleases: resources.hasReleases,
        hasChangelog,
        docsType: resources.docsType,
        hasShippedDocs: shippedDocs,
        pkgFiles,
        force: config.force,
        debug: config.debug,
        sections: llmConfig.sections,
        customPrompt: llmConfig.customPrompt,
        packages: allPackages.length > 1 ? allPackages : undefined,
      })
    }
  }

  // Register project in global config (for uninstall tracking)
  if (!config.global) {
    registerProject(cwd)
  }

  await ensureGitignore(agents[config.agent].skillsDir, cwd, config.global)

  const { shutdownWorker } = await import('../retriv/pool')
  await shutdownWorker()

  p.outro(`Synced ${packageName} to ${relative(cwd, skillDir)}`)
}

interface EnhanceOptions {
  packageName: string
  version: string
  skillDir: string
  dirName?: string
  model: OptimizeModel
  resolved: { repoUrl?: string, llmsUrl?: string, releasedAt?: string, docsUrl?: string, gitRef?: string, dependencies?: Record<string, string>, distTags?: Record<string, { version: string, releasedAt?: string }> }
  relatedSkills: string[]
  hasIssues: boolean
  hasDiscussions: boolean
  hasReleases: boolean
  hasChangelog: string | false
  docsType: 'llms.txt' | 'readme' | 'docs'
  hasShippedDocs: boolean
  pkgFiles: string[]
  force?: boolean
  debug?: boolean
  sections?: SkillSection[]
  customPrompt?: CustomPrompt
  packages?: Array<{ name: string }>
}

async function enhanceSkillWithLLM(opts: EnhanceOptions): Promise<void> {
  const { packageName, version, skillDir, dirName, model, resolved, relatedSkills, hasIssues, hasDiscussions, hasReleases, hasChangelog, docsType, hasShippedDocs: shippedDocs, pkgFiles, force, debug, sections, customPrompt, packages } = opts

  const llmSpin = timedSpinner()
  llmSpin.start(`Agent exploring ${packageName}`)
  const docFiles = listReferenceFiles(skillDir)
  const hasGithub = hasIssues || hasDiscussions
  const { optimized, wasOptimized, usage, cost, warnings, debugLogsDir } = await optimizeDocs({
    packageName,
    skillDir,
    model,
    version,
    hasGithub,
    hasReleases,
    hasChangelog,
    docFiles,
    docsType,
    hasShippedDocs: shippedDocs,
    noCache: force,
    debug,
    sections,
    customPrompt,
    onProgress: ({ type, chunk, section }) => {
      const prefix = section ? `[${section}] ` : ''
      if (type === 'reasoning' && chunk.startsWith('[')) {
        llmSpin.message(`${prefix}${chunk}`)
      }
      else if (type === 'text') {
        llmSpin.message(`${prefix}Writing...`)
      }
    },
  })

  if (wasOptimized) {
    const costParts: string[] = []
    if (usage) {
      const totalK = Math.round(usage.totalTokens / 1000)
      costParts.push(`${totalK}k tokens`)
    }
    if (cost)
      costParts.push(`$${cost.toFixed(2)}`)
    const costSuffix = costParts.length > 0 ? ` (${costParts.join(', ')})` : ''
    llmSpin.stop(`Generated best practices${costSuffix}`)
    if (debugLogsDir)
      p.log.info(`Debug logs: ${debugLogsDir}`)
    if (warnings?.length) {
      for (const w of warnings)
        p.log.warn(`\x1B[33m${w}\x1B[0m`)
    }
    const skillMd = generateSkillMd({
      name: packageName,
      version,
      releasedAt: resolved.releasedAt,
      dependencies: resolved.dependencies,
      distTags: resolved.distTags,
      body: optimized,
      relatedSkills,
      hasIssues,
      hasDiscussions,
      hasReleases,
      hasChangelog,
      docsType,
      hasShippedDocs: shippedDocs,
      pkgFiles,
      generatedBy: getModelLabel(model),
      dirName,
      packages,
      repoUrl: resolved.repoUrl,
    })
    writeFileSync(join(skillDir, 'SKILL.md'), skillMd)
  }
  else {
    llmSpin.stop('LLM optimization failed')
  }
}
