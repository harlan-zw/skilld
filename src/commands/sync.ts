import type { AgentType, OptimizeModel, SkillSection } from '../agent/index.ts'
import type { ProjectState } from '../core/skills.ts'
import type { GitSkillSource } from '../sources/git-skills.ts'
import type { ResolveAttempt } from '../sources/index.ts'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import * as p from '@clack/prompts'
import { defineCommand } from 'citty'
import { join, relative, resolve } from 'pathe'
import {
  agents,
  buildAllSectionPrompts,
  computeSkillDirName,
  detectImportedPackages,
  generateSkillMd,
  getAvailableModels,
  getModelLabel,
  linkSkillToAgents,
  portabilizePrompt,
  sanitizeName,
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
import { getInstalledGenerators, introLine, isInteractive, promptForAgent, resolveAgent, sharedArgs, suggestPrepareHook } from '../cli-helpers.ts'
import { defaultFeatures, hasCompletedWizard, readConfig, registerProject } from '../core/config.ts'
import { timedSpinner, todayIsoDate } from '../core/formatting.ts'
import { parsePackages, readLock, removeLockEntry, writeLock } from '../core/lockfile.ts'
import { parseFrontmatter } from '../core/markdown.ts'
import { parseSkillInput, resolveSkillName, toStoragePackageName } from '../core/prefix.ts'
import { getSharedSkillsDir, SHARED_SKILLS_DIR } from '../core/shared.ts'
import { getProjectState } from '../core/skills.ts'
import { shutdownWorker } from '../retriv/pool.ts'
import {
  fetchPkgDist,
  isPrerelease,
  parsePackageSpec,
  readLocalDependencies,
  resolveCrateDocsWithAttempts,
  resolvePackageDocsWithAttempts,
  searchNpmPackages,
} from '../sources/index.ts'
import { syncGitSkills } from './sync-git.ts'
import { syncPackagesParallel } from './sync-parallel.ts'
import {
  DEFAULT_SECTIONS,
  detectChangelog,
  ejectReferences,
  enhanceSkillWithLLM,
  ensureAgentInstructions,
  ensureGitignore,
  fetchAndCacheResources,
  findRelatedSkills,
  forceClearCache,
  handleShippedSkills,
  indexResources,
  linkAllReferences,
  RESOLVE_STEP_LABELS,
  resolveBaseDir,
  resolveLocalDep,
  selectLlmConfig,
  writePromptFiles,
} from './sync-shared.ts'
import { runWizard } from './wizard.ts'

// Re-export for external consumers
export { DEFAULT_SECTIONS, enhanceSkillWithLLM, ensureAgentInstructions, ensureGitignore, selectLlmConfig, selectModel, selectSkillSections, SKILLD_MARKER_END, SKILLD_MARKER_START, writePromptFiles } from './sync-shared.ts'
export type { EnhanceOptions, LlmConfig, UpdateContext } from './sync-shared.ts'

const RESOLVE_SOURCE_LABELS: Record<string, string> = {
  'npm': 'npm registry',
  'github-docs': 'GitHub versioned docs',
  'github-meta': 'GitHub metadata',
  'github-search': 'GitHub search',
  'readme': 'README fallback',
  'llms.txt': 'llms.txt convention',
  'crawl': 'website crawl',
  'local': 'local node_modules',
}

function showResolveAttempts(attempts: ResolveAttempt[]): void {
  if (attempts.length === 0)
    return

  p.log.message('\x1B[90mDoc resolution:\x1B[0m')
  for (const attempt of attempts) {
    const icon = attempt.status === 'success' ? '\x1B[32m✓\x1B[0m' : '\x1B[90m✗\x1B[0m'
    const label = RESOLVE_SOURCE_LABELS[attempt.source] ?? attempt.source
    const source = `\x1B[90m${label}\x1B[0m`
    const msg = attempt.message ? ` \x1B[90m— ${attempt.message}\x1B[0m` : ''
    p.log.message(`  ${icon} ${source}${msg}`)
  }
}

export function isCrateSpec(spec: string): boolean {
  return spec.startsWith('crate:')
}

function toCrateIdentity(crateName: string): string {
  return `crate:${crateName}`
}

export interface SyncOptions {
  packages?: string[]
  global: boolean
  agent: AgentType
  model?: OptimizeModel
  yes: boolean
  force?: boolean
  debug?: boolean
  mode?: 'add' | 'update'
  /** Eject mode: copy references as real files instead of symlinking */
  eject?: boolean | string
  /** Override the computed skill directory name */
  name?: string
  /** Lower-bound date for release/issue/discussion collection (ISO date, e.g. "2025-07-01") */
  from?: string
  /** Skip search index / embeddings generation */
  noSearch?: boolean
}

export async function syncCommand(state: ProjectState, opts: SyncOptions): Promise<void> {
  // If packages specified, sync those
  if (opts.packages && opts.packages.length > 0) {
    const crateSpecs = opts.packages.filter(isCrateSpec)
    const npmSpecs = opts.packages.filter(p => !isCrateSpec(p))

    // npm packages: parallel if >1, serial if 1
    if (npmSpecs.length > 1) {
      await syncPackagesParallel({
        packages: npmSpecs,
        global: opts.global,
        agent: opts.agent,
        model: opts.model,
        yes: opts.yes,
        force: opts.force,
        debug: opts.debug,
        mode: opts.mode,
      })
    }
    else if (npmSpecs.length === 1) {
      await syncSinglePackage(npmSpecs[0]!, opts)
    }

    // Crates: serialize (respect crates.io rate limits)
    for (const spec of crateSpecs)
      await syncSinglePackage(spec, opts)

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
    return syncPackagesParallel({
      packages,
      global: opts.global,
      agent: opts.agent,
      model: opts.model,
      yes: opts.yes,
      force: opts.force,
      debug: opts.debug,
      mode: opts.mode,
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
    return pickFromList(Array.from(declaredMap.entries(), ([name, version]) => ({
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

interface SyncConfig {
  global: boolean
  agent: AgentType
  model?: OptimizeModel
  yes: boolean
  force?: boolean
  debug?: boolean
  mode?: 'add' | 'update'
  eject?: boolean | string
  name?: string
  from?: string
  noSearch?: boolean
}

async function syncSinglePackage(packageSpec: string, config: SyncConfig): Promise<void> {
  const isCrate = isCrateSpec(packageSpec)
  const normalizedSpec = isCrate ? packageSpec.slice('crate:'.length).trim() : packageSpec
  if (isCrate && !normalizedSpec) {
    p.log.error('Invalid crate spec. Use format: crate:<name>')
    return
  }

  // Parse dist-tag/version from spec: "vue@beta" → name="vue", tag="beta"
  const { name: parsedName, tag: requestedTag } = parsePackageSpec(normalizedSpec)
  const packageName = isCrate ? parsedName.toLowerCase() : parsedName
  const identityPackageName = isCrate ? toCrateIdentity(packageName) : packageName
  const storagePackageName = toStoragePackageName(identityPackageName)

  const spin = timedSpinner()
  spin.start(`Resolving ${packageSpec}`)

  const cwd = process.cwd()
  const localDeps = isCrate ? [] : await readLocalDependencies(cwd).catch(() => [])
  const localVersion = isCrate ? undefined : localDeps.find(d => d.name === packageName)?.version

  const resolveResult = isCrate
    ? await resolveCrateDocsWithAttempts(packageName, {
        version: requestedTag,
        onProgress: step => spin.message(`${identityPackageName}: ${step}`),
      })
    : await resolvePackageDocsWithAttempts(requestedTag ? normalizedSpec : packageName, {
        version: localVersion,
        cwd,
        onProgress: step => spin.message(`${packageName}: ${RESOLVE_STEP_LABELS[step]}`),
      })
  let resolved = resolveResult.package

  // If npm fails, check if it's a link: dep and try local resolution (skip for crates)
  if (!resolved && !isCrate) {
    spin.message(`Resolving local package: ${packageName}`)
    resolved = await resolveLocalDep(packageName, cwd)
  }

  if (!resolved) {
    if (!isCrate) {
      // Even without docs, the package may ship its own skills (skills-npm convention)
      const shippedVersion = localVersion || resolveResult.registryVersion || 'latest'
      const earlyShipped = handleShippedSkills(packageName, shippedVersion, cwd, config.agent, config.global)
      if (earlyShipped) {
        const shared = !config.global && getSharedSkillsDir(cwd)
        for (const shipped of earlyShipped.shipped) {
          if (shared)
            linkSkillToAgents(shipped.skillName, shared, cwd, config.agent)
          p.log.success(`Using published SKILL.md: ${shipped.skillName} → ${relative(cwd, shipped.skillDir)}`)
        }
        spin.stop(`Using published SKILL.md(s) from ${packageName}`)
        return
      }

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
    }

    spin.stop(`Could not find docs for: ${identityPackageName}`)
    showResolveAttempts(resolveResult.attempts)
    return
  }

  const version = isCrate
    ? (resolved.version || requestedTag || 'latest')
    : (localVersion || resolved.version || 'latest')
  const versionKey = getVersionKey(version)

  // Force: nuke cached references + search index so all existsSync guards re-fetch
  if (config.force) {
    forceClearCache(storagePackageName, version)
  }

  const useCache = isCached(storagePackageName, version)

  // Download npm dist if not in node_modules (crates don't have a dist)
  if (!isCrate && !existsSync(join(cwd, 'node_modules', packageName))) {
    spin.message(`Downloading ${packageName}@${version} dist`)
    await fetchPkgDist(packageName, version)
  }

  // Shipped skills: symlink directly, skip all doc fetching/caching/LLM (crates don't ship skills)
  const shippedResult = isCrate ? null : handleShippedSkills(packageName, version, cwd, config.agent, config.global)
  if (shippedResult) {
    const shared = !config.global && getSharedSkillsDir(cwd)
    for (const shipped of shippedResult.shipped) {
      if (shared)
        linkSkillToAgents(shipped.skillName, shared, cwd, config.agent)
      p.log.success(`Using published SKILL.md: ${shipped.skillName} → ${relative(cwd, shipped.skillDir)}`)
    }
    spin.stop(`Using published SKILL.md(s) from ${packageName}`)
    return
  }

  spin.stop(`Resolved ${identityPackageName}@${useCache ? versionKey : version}${config.force ? ' (force)' : useCache ? ' (cached)' : ''}`)

  // Warn when no local dep and resolved to stable latest — prerelease releases won't be fetched
  if (!isCrate && !localVersion && !requestedTag && !isPrerelease(version)) {
    const nextTag = resolved.distTags?.next ?? resolved.distTags?.beta ?? resolved.distTags?.alpha
    if (nextTag && (!resolved.releasedAt || !nextTag.releasedAt || nextTag.releasedAt > resolved.releasedAt)) {
      p.log.warn(`\x1B[33mNo local dependency found — using latest stable (${version}). Prerelease ${nextTag.version} available: skilld add ${packageName}@beta\x1B[0m`)
    }
  }

  ensureCacheDir()

  const baseDir = resolveBaseDir(cwd, config.agent, config.global)
  // In update mode, find the existing skill dir name for this package (may differ from computed name)
  let skillDirName = config.name ? sanitizeName(config.name) : computeSkillDirName(storagePackageName)
  if (config.mode === 'update' && !config.name) {
    const lock = readLock(baseDir)
    if (lock) {
      for (const [name, info] of Object.entries(lock.skills)) {
        if (info.packageName === identityPackageName || parsePackages(info.packages).some(p => p.name === identityPackageName)) {
          skillDirName = name
          break
        }
      }
    }
  }
  // Eject path override: default to ./skills/<name>, or use specified directory
  const skillDir = config.eject
    ? typeof config.eject === 'string'
      ? join(resolve(cwd, config.eject), skillDirName)
      : join(cwd, 'skills', skillDirName)
    : join(baseDir, skillDirName)
  mkdirSync(skillDir, { recursive: true })

  // ── Merge mode: skill dir already exists with a different primary package (skip in eject) ──
  const existingLock = config.eject ? undefined : readLock(baseDir)?.skills[skillDirName]
  const isMerge = existingLock && existingLock.packageName && existingLock.packageName !== identityPackageName

  // Capture update context before lockfile gets overwritten
  const updateCtx = config.mode === 'update' && existingLock
    ? {
        oldVersion: existingLock.version,
        newVersion: version,
        syncedAt: existingLock.syncedAt,
        wasEnhanced: (() => {
          const skillMdPath = join(skillDir, 'SKILL.md')
          if (!existsSync(skillMdPath))
            return false
          const fm = parseFrontmatter(readFileSync(skillMdPath, 'utf-8'))
          return !!fm.generated_by
        })(),
      }
    : undefined

  if (isMerge) {
    spin.stop(`Merging ${identityPackageName} into ${skillDirName}`)

    // Create named symlink for this package
    linkPkgNamed(skillDir, storagePackageName, cwd, version)

    // Merge into lockfile
    const repoSlug = resolved.repoUrl?.match(/github\.com\/([^/]+\/[^/]+?)(?:\.git)?(?:[/#]|$)/)?.[1]
    writeLock(baseDir, skillDirName, {
      packageName: identityPackageName,
      version,
      repo: repoSlug,
      source: existingLock.source,
      syncedAt: todayIsoDate(),
      generator: 'skilld',
    })

    // Regenerate SKILL.md with all packages listed
    const updatedLock = readLock(baseDir)?.skills[skillDirName]
    const allPackages = parsePackages(updatedLock?.packages).map(p => ({ name: p.name }))
    const relatedSkills = await findRelatedSkills(storagePackageName, baseDir)
    const existingStorageName = toStoragePackageName(existingLock.packageName!)
    const pkgFiles = getPkgKeyFiles(existingStorageName, cwd, existingLock.version)
    const shippedDocs = hasShippedDocs(existingStorageName, cwd, existingLock.version)

    const mergeFeatures = readConfig().features ?? defaultFeatures
    const skillMd = generateSkillMd({
      name: existingLock.packageName!,
      version: existingLock.version,
      relatedSkills,
      hasIssues: mergeFeatures.issues && existsSync(join(skillDir, '.skilld', 'issues')),
      hasDiscussions: mergeFeatures.discussions && existsSync(join(skillDir, '.skilld', 'discussions')),
      hasReleases: mergeFeatures.releases && existsSync(join(skillDir, '.skilld', 'releases')),
      docsType: (existingLock.source?.includes('llms.txt') ? 'llms.txt' : 'docs') as 'llms.txt' | 'readme' | 'docs',
      hasShippedDocs: shippedDocs,
      pkgFiles,
      dirName: skillDirName,
      packages: allPackages,
      features: mergeFeatures,
    })
    writeFileSync(join(skillDir, 'SKILL.md'), skillMd)

    const mergeShared = !config.global && getSharedSkillsDir(cwd)
    if (mergeShared)
      linkSkillToAgents(skillDirName, mergeShared, cwd, config.agent)

    if (!config.global)
      registerProject(cwd)

    p.outro(`Merged ${identityPackageName} into ${skillDirName}`)
    return
  }

  const features = { ...(readConfig().features ?? defaultFeatures) }
  if (config.noSearch)
    features.search = false

  // ── Phase 1: Fetch & cache all resources ──
  const resSpin = timedSpinner()
  resSpin.start('Finding resources')
  const resources = await fetchAndCacheResources({
    packageName: storagePackageName,
    resolved,
    version,
    useCache,
    features,
    from: config.from,
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
  resSpin.stop(resources.usedCache
    ? `Loaded ${resParts.length > 0 ? resParts.join(', ') : 'resources'} (cached)`
    : `Fetched ${resParts.length > 0 ? resParts.join(', ') : 'resources'}`,
  )
  for (const w of resources.warnings)
    p.log.warn(`\x1B[33m${w}\x1B[0m`)

  // Create symlinks (LLM needs .skilld/ to read docs, even in eject mode)
  linkAllReferences(skillDir, storagePackageName, cwd, version, resources.docsType, undefined, features, resources.repoInfo)

  // ── Phase 2: Search index (generated even in eject mode so LLM can use it) ──
  if (features.search) {
    const idxSpin = timedSpinner()
    idxSpin.start('Creating search index')
    await indexResources({
      packageName: storagePackageName,
      version,
      cwd,
      docsToIndex: resources.docsToIndex,
      features,
      onProgress: msg => idxSpin.message(msg),
    })
    idxSpin.stop('Search index ready')
  }

  const pkgDir = resolvePkgDir(storagePackageName, cwd, version)
  const hasChangelog = detectChangelog(pkgDir, getCacheDir(storagePackageName, version))
  const relatedSkills = await findRelatedSkills(storagePackageName, baseDir)
  const shippedDocs = hasShippedDocs(storagePackageName, cwd, version)
  const pkgFiles = getPkgKeyFiles(storagePackageName, cwd, version)

  // Write base SKILL.md (no LLM needed)
  const repoSlug = resolved.repoUrl?.match(/github\.com\/([^/]+\/[^/]+?)(?:\.git)?(?:[/#]|$)/)?.[1]

  // Also create named symlink for this package (skip in eject mode)
  if (!config.eject)
    linkPkgNamed(skillDir, storagePackageName, cwd, version)

  // Skip lockfile in eject mode — no agent skills dir to write to
  if (!config.eject) {
    writeLock(baseDir, skillDirName, {
      packageName: identityPackageName,
      version,
      repo: repoSlug,
      source: resources.docSource,
      syncedAt: todayIsoDate(),
      generator: 'skilld',
    })

    // Clean up duplicate lockfile entries for the same package (e.g. renamed skill dirs)
    const lock = readLock(baseDir)
    if (lock) {
      for (const [name, info] of Object.entries(lock.skills)) {
        if (name === skillDirName)
          continue
        if (info.packageName === identityPackageName || parsePackages(info.packages).some(p => p.name === identityPackageName)) {
          removeLockEntry(baseDir, name)
          const staleDir = join(baseDir, name)
          if (existsSync(staleDir))
            rmSync(staleDir, { recursive: true })
        }
      }
    }
  }

  // Read back merged packages from lockfile for SKILL.md generation
  const updatedLock = config.eject ? undefined : readLock(baseDir)?.skills[skillDirName]
  const allPackages = parsePackages(updatedLock?.packages).map(p => ({ name: p.name }))

  const isEject = !!config.eject
  const baseSkillMd = generateSkillMd({
    name: identityPackageName,
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
    eject: isEject,
  })
  writeFileSync(join(skillDir, 'SKILL.md'), baseSkillMd)
  const overheadLines = baseSkillMd.split('\n').length

  p.log.success(config.mode === 'update' ? `Updated skill: ${relative(cwd, skillDir)}` : `Created base skill: ${relative(cwd, skillDir)}`)

  // Check if all default sections are already cached (skip prompt entirely if so)
  const allSectionsCached = !config.force && DEFAULT_SECTIONS.every((s) => {
    const outputFile = SECTION_OUTPUT_FILES[s]
    return readCachedSection(storagePackageName, version, outputFile) !== null
  })

  if (allSectionsCached) {
    // Silently apply cached LLM content without prompting
    const cachedParts: string[] = []
    for (const s of SECTION_MERGE_ORDER) {
      if (!DEFAULT_SECTIONS.includes(s))
        continue
      const outputFile = SECTION_OUTPUT_FILES[s]
      const content = readCachedSection(storagePackageName, version, outputFile)
      if (content)
        cachedParts.push(wrapSection(s, content))
    }
    const cachedBody = cachedParts.join('\n\n')

    const skillMd = generateSkillMd({
      name: identityPackageName,
      version,
      releasedAt: resolved.releasedAt,
      description: resolved.description,

      distTags: resolved.distTags,
      body: cachedBody,
      relatedSkills,
      hasIssues: resources.hasIssues,
      hasDiscussions: resources.hasDiscussions,
      hasReleases: resources.hasReleases,
      hasChangelog,
      docsType: resources.docsType,
      hasShippedDocs: shippedDocs,
      pkgFiles,
      generatedBy: 'cached',
      dirName: skillDirName,
      packages: allPackages.length > 1 ? allPackages : undefined,
      repoUrl: resolved.repoUrl,
      features,
      eject: isEject,
    })
    writeFileSync(join(skillDir, 'SKILL.md'), skillMd)
    p.log.success('Applied cached SKILL.md sections')
  }

  // Ask about LLM optimization (skip if skipLlm config, sections cached)
  // When -y without -m: auto-resolve model from config or available models
  const globalConfig = readConfig()
  let resolvedModel = config.model || (config.yes && !globalConfig.skipLlm ? globalConfig.model as OptimizeModel | undefined : undefined)
  // Auto-resolve when -y, not skipping LLM, but no explicit model (e.g. user picked "Auto" in wizard)
  if (!resolvedModel && config.yes && !globalConfig.skipLlm) {
    const available = await getAvailableModels()
    const auto = available.find(m => m.recommended)?.id ?? available[0]?.id
    if (auto)
      resolvedModel = auto as OptimizeModel
  }
  if (!allSectionsCached && !globalConfig.skipLlm && !(config.yes && !resolvedModel)) {
    const llmConfig = await selectLlmConfig(resolvedModel, undefined, updateCtx)
    if (llmConfig?.promptOnly) {
      writePromptFiles({
        packageName: storagePackageName,
        skillDir,
        version,
        hasIssues: resources.hasIssues,
        hasDiscussions: resources.hasDiscussions,
        hasReleases: resources.hasReleases,
        hasChangelog,
        docsType: resources.docsType,
        hasShippedDocs: shippedDocs,
        pkgFiles,
        sections: llmConfig.sections,
        customPrompt: llmConfig.customPrompt,
        features,
        overheadLines,
      })
    }
    else if (llmConfig) {
      p.log.step(getModelLabel(llmConfig.model))
      await enhanceSkillWithLLM({
        packageName: identityPackageName,
        cachePackageName: storagePackageName,
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
        features,
        eject: isEject,
        overheadLines,
      })
    }
  }

  // Eject: clean up transient .skilld/ symlinks → copy as real files
  if (isEject) {
    const skilldDir = join(skillDir, '.skilld')
    if (existsSync(skilldDir) && !config.debug)
      rmSync(skilldDir, { recursive: true, force: true })
    ejectReferences(skillDir, storagePackageName, cwd, version, resources.docsType, features, resources.repoInfo)
  }

  // Skip agent integration in eject mode (no symlinks, no gitignore, no instructions)
  if (!isEject) {
    // Link shared dir to per-agent dirs
    const shared = !config.global && getSharedSkillsDir(cwd)
    if (shared)
      linkSkillToAgents(skillDirName, shared, cwd, config.agent)

    // Register project in global config (for uninstall tracking)
    if (!config.global) {
      registerProject(cwd)
    }

    await ensureGitignore(shared ? SHARED_SKILLS_DIR : agents[config.agent].skillsDir, cwd, config.global)
    await ensureAgentInstructions(config.agent, cwd, config.global)
  }

  await shutdownWorker()

  const ejectMsg = isEject ? ' (ejected)' : ''
  const relDir = relative(cwd, skillDir)
  p.outro(config.mode === 'update' ? `Updated ${identityPackageName}${ejectMsg}` : `Synced ${identityPackageName} → ${relDir}${ejectMsg}`)

  try {
    await suggestPrepareHook(cwd)
  }
  catch (err) {
    p.log.warn(`Failed to suggest prepare hook: ${err instanceof Error ? err.message : String(err)}`)
  }
}

// ── Citty command definitions (lazy-loaded by cli.ts) ──

export const addCommandDef = defineCommand({
  meta: { name: 'add', description: 'Install skills (npm:<pkg>, crate:<name>, gh:<owner/repo>, @<curator>)' },
  args: {
    package: {
      type: 'positional',
      description: 'Package(s) to sync (space/comma-separated; npm:<pkg>, crate:<name>, or owner/repo)',
      required: true,
    },
    skill: {
      type: 'string',
      alias: 's',
      description: 'Select specific skills from a git repo (comma-separated)',
      valueHint: 'name',
    },
    ...sharedArgs,
  },
  async run({ args }) {
    const cwd = process.cwd()
    let agent: AgentType | 'none' | null = resolveAgent(args.agent)
    if (!agent) {
      agent = await promptForAgent()
      if (!agent)
        return
    }

    // Collect raw inputs (don't split URLs on slashes/spaces yet)
    const rawInputs = [...new Set(
      [args.package, ...((args as any)._ || [])]
        .map((s: string) => s.trim())
        .filter(Boolean),
    )]

    // No-agent mode: export portable prompts
    if (agent === 'none') {
      const packages = [...new Set(rawInputs.flatMap(s => s.split(/[,\s]+/)).map(s => s.trim()).filter(Boolean))]
      for (const pkg of packages)
        await exportPortablePrompts(pkg, { force: args.force, agent: 'none' })
      return
    }

    // First-time setup — configure features + LLM model
    if (!hasCompletedWizard())
      await runWizard({ agent })

    // Classify inputs via prefix parser
    const parsedSources = rawInputs.map(parseSkillInput)
    const gitSources: GitSkillSource[] = []
    const npmEntries: Array<{ name: string, spec: string }> = []
    const crateSpecs: string[] = []
    const unsupported: string[] = []

    for (const source of parsedSources) {
      switch (source.type) {
        case 'git':
          gitSources.push(source.source)
          break
        case 'npm':
          npmEntries.push({ name: source.package, spec: source.tag ? `${source.package}@${source.tag}` : source.package })
          break
        case 'crate':
          crateSpecs.push(source.version ? `crate:${source.package}@${source.version}` : `crate:${source.package}`)
          break
        case 'bare':
          p.log.warn(`Bare names are deprecated. Use \x1B[36mnpm:${source.package}\x1B[0m instead.`)
          npmEntries.push({ name: source.package, spec: source.tag ? `${source.package}@${source.tag}` : source.package })
          break
        case 'curator':
          unsupported.push(`@${source.handle} (curator)`)
          break
        case 'collection':
          unsupported.push(`@${source.handle}/${source.name} (collection)`)
          break
        default: {
          const _exhaustive: never = source
          throw new Error(`Unhandled SkillSource type: ${JSON.stringify(_exhaustive)}`)
        }
      }
    }

    if (unsupported.length > 0) {
      p.log.error(`Curator and collection installs are not yet available:\n  ${unsupported.join('\n  ')}\n\nFollow https://skilld.dev for launch updates.`)
      process.exitCode = 1
      if (gitSources.length === 0 && npmEntries.length === 0 && crateSpecs.length === 0)
        return
    }

    // Handle git sources
    if (gitSources.length > 0) {
      for (const source of gitSources) {
        const skillFilter = args.skill ? args.skill.split(/[,\s]+/).map((s: string) => s.trim()).filter(Boolean) : undefined
        await syncGitSkills({ source, global: args.global, agent, yes: args.yes, model: args.model as OptimizeModel | undefined, force: args.force, debug: args.debug, skillFilter })
      }
    }

    // Handle npm packages: registry first, then fallback to doc generation
    if (npmEntries.length > 0) {
      const { syncRegistrySkill } = await import('./sync-registry.ts')
      const seen = new Set<string>()
      const dedupedEntries = npmEntries.filter((e) => {
        if (seen.has(e.name))
          return false
        seen.add(e.name)
        return true
      })

      // Try registry for each package, collect misses for fallback
      const fallbackPackages: string[] = []
      for (const entry of dedupedEntries) {
        const result = await syncRegistrySkill({ packageName: entry.name, agent, cwd })
        if (result) {
          p.log.success(`Installed \x1B[36m${result.name}\x1B[0m from registry`)
        }
        else {
          fallbackPackages.push(entry.spec)
        }
      }

      // Fallback: generate from docs for packages not in registry
      if (fallbackPackages.length > 0) {
        const state = await getProjectState(cwd)
        p.intro(introLine({ state, agentId: agent || undefined }))
        await syncCommand(state, {
          packages: [...fallbackPackages, ...crateSpecs],
          global: args.global,
          agent,
          model: args.model as OptimizeModel | undefined,
          yes: args.yes,
          force: args.force,
          debug: args.debug,
        })
        return
      }
    }

    // Crates without any npm packages: route straight to syncCommand
    if (crateSpecs.length > 0) {
      const state = await getProjectState(cwd)
      p.intro(introLine({ state, agentId: agent || undefined }))
      await syncCommand(state, {
        packages: crateSpecs,
        global: args.global,
        agent,
        model: args.model as OptimizeModel | undefined,
        yes: args.yes,
        force: args.force,
        debug: args.debug,
      })
    }
  },
})

export const ejectCommandDef = defineCommand({
  meta: { name: 'eject', description: 'Eject skill with references as real files (portable, no symlinks)' },
  args: {
    package: {
      type: 'positional',
      description: 'Package to eject',
      required: true,
    },
    name: {
      type: 'string',
      alias: 'n',
      description: 'Custom skill directory name (default: derived from package)',
    },
    out: {
      type: 'string',
      alias: 'o',
      description: 'Output directory path override',
    },
    from: {
      type: 'string',
      description: 'Collect releases/issues/discussions from this date onward (YYYY-MM-DD)',
    },
    search: {
      type: 'boolean',
      description: 'Build search index / embeddings (use --no-search to skip)',
      default: true,
    },
    ...sharedArgs,
  },
  async run({ args }) {
    const cwd = process.cwd()
    // Eject skips agent detection — output goes to ./skills/<name> by default
    const resolved = resolveAgent(args.agent)
    const agent: AgentType = resolved && resolved !== 'none' ? resolved : 'claude-code'

    if (!hasCompletedWizard())
      await runWizard({ agent })

    const state = await getProjectState(cwd)
    p.intro(introLine({ state, agentId: agent || undefined }))
    return syncCommand(state, {
      packages: [args.package],
      global: args.global,
      agent,
      model: args.model as OptimizeModel | undefined,
      yes: args.yes,
      force: args.force,
      debug: args.debug,
      eject: args.out || true,
      name: args.name,
      from: args.from,
      noSearch: !args.search,
    })
  },
})

export const updateCommandDef = defineCommand({
  meta: { name: 'update', description: 'Update outdated skills' },
  args: {
    package: {
      type: 'positional',
      description: 'Package(s) to update (space or comma-separated). Without args, syncs all outdated.',
      required: false,
    },
    background: {
      type: 'boolean',
      alias: 'b',
      description: 'Run in background (detached process, non-interactive)',
      default: false,
    },
    ...sharedArgs,
  },
  async run({ args }) {
    const cwd = process.cwd()

    // Background mode: spawn detached `skilld update` and exit immediately
    if (args.background) {
      const { spawn } = await import('node:child_process')
      const updateArgs = ['update', ...(args.package ? [args.package] : []), ...(args.agent ? ['--agent', args.agent] : []), ...(args.model ? ['--model', args.model as string] : [])]
      const child = spawn(process.execPath, [process.argv[1]!, ...updateArgs], {
        cwd,
        detached: true,
        stdio: 'ignore',
      }) as import('node:child_process').ChildProcess
      child.unref()
      return
    }

    const silent = !isInteractive()

    let agent = resolveAgent(args.agent)
    if (!agent) {
      agent = await promptForAgent()
      if (!agent)
        return
    }

    // No-agent mode: re-export portable prompts for outdated packages
    if (agent === 'none') {
      const state = await getProjectState(cwd)
      const packages = args.package
        ? Array.from(
            new Set([args.package, ...((args as any)._ || [])].flatMap(s => s.split(/[,\s]+/)).map(s => s.trim()).filter(Boolean)),
            s => resolveSkillName(s),
          ).filter((s): s is string => s !== null)
        : state.outdated.map(s => s.packageName || s.name)
      if (packages.length === 0) {
        if (!silent)
          p.log.success('All skills up to date')
        return
      }
      for (const pkg of packages)
        await exportPortablePrompts(pkg, { force: args.force, agent: 'none' })
      return
    }

    const config = readConfig()
    const state = await getProjectState(cwd)

    if (!silent) {
      const generators = getInstalledGenerators()
      p.intro(introLine({ state, generators, modelId: config.model, agentId: config.agent || agent || undefined }))
    }

    // Specific packages (strip npm:/gh: prefixes)
    if (args.package) {
      const raw = [...new Set([args.package, ...((args as any)._ || [])].flatMap(s => s.split(/[,\s]+/)).map(s => s.trim()).filter(Boolean))]
      const packages: string[] = []
      for (const r of raw) {
        const name = resolveSkillName(r)
        if (!name) {
          p.log.warn(`Cannot update \x1B[36m${r}\x1B[0m: curator/collection inputs are not addressable here.`)
          continue
        }
        packages.push(name)
      }
      if (packages.length === 0)
        return
      return syncCommand(state, {
        packages,
        global: args.global,
        agent,
        model: (args.model as OptimizeModel | undefined) || (silent ? config.model : undefined),
        yes: args.yes || silent,
        force: args.force,
        debug: args.debug,
        mode: 'update',
      })
    }

    // No args: sync all outdated + all crate skills.
    // Crates have no package.json entry to pin against, so state.outdated never
    // includes them. Bulk update re-resolves each against crates.io; if the version
    // hasn't changed the cache short-circuits fetching.
    const crateSpecs = state.skills
      .map(s => s.info?.packageName)
      .filter((name): name is string => !!name && name.startsWith('crate:'))
    if (state.outdated.length === 0 && crateSpecs.length === 0) {
      p.log.success('All skills up to date')
      return
    }

    const packages = [
      ...state.outdated.map(s => s.packageName || s.name),
      ...crateSpecs,
    ]
    return syncCommand(state, {
      packages,
      global: args.global,
      agent,
      model: (args.model as OptimizeModel | undefined) || (silent ? config.model : undefined),
      yes: args.yes || silent,
      force: args.force,
      debug: args.debug,
      mode: 'update',
    })
  },
})

// ── Portable prompt export (no-agent mode) ─────────────────────

export async function exportPortablePrompts(packageSpec: string, opts: {
  out?: string
  sections?: SkillSection[]
  force?: boolean
  agent?: AgentType | 'none'
}): Promise<void> {
  const { name: packageName } = parsePackageSpec(packageSpec)
  const sections = opts.sections ?? DEFAULT_SECTIONS

  const spin = timedSpinner()
  spin.start(`Resolving ${packageSpec}`)

  const cwd = process.cwd()
  const localDeps = await readLocalDependencies(cwd).catch(() => [])
  const localVersion = localDeps.find(d => d.name === packageName)?.version

  const resolveResult = await resolvePackageDocsWithAttempts(packageName, {
    version: localVersion,
    cwd,
    onProgress: step => spin.message(`${packageName}: ${RESOLVE_STEP_LABELS[step]}`),
  })
  let resolved = resolveResult.package

  if (!resolved) {
    spin.message(`Resolving local package: ${packageName}`)
    resolved = await resolveLocalDep(packageName, cwd)
  }

  if (!resolved) {
    spin.stop(`Could not find docs for: ${packageName}`)
    return
  }

  const version = localVersion || resolved.version || 'latest'
  const versionKey = getVersionKey(version)
  const useCache = !opts.force && isCached(packageName, version)

  // Download npm dist if not in node_modules
  if (!existsSync(join(cwd, 'node_modules', packageName))) {
    spin.message(`Downloading ${packageName}@${version} dist`)
    await fetchPkgDist(packageName, version)
  }

  spin.stop(`Resolved ${packageName}@${useCache ? versionKey : version}`)
  ensureCacheDir()

  const skillDirName = computeSkillDirName(packageName)
  const features = readConfig().features ?? defaultFeatures

  // Resolve skill dir — detect agent unless explicitly 'none'
  const agent: AgentType | null = opts.agent === 'none'
    ? null
    : opts.agent ?? (await import('../agent/detect.ts').then(m => m.detectTargetAgent()))
  const baseDir = agent
    ? resolveBaseDir(cwd, agent, false)
    : join(cwd, '.claude', 'skills') // fallback when no agent detected
  const skillDir = opts.out ? resolve(cwd, opts.out) : join(baseDir, skillDirName)

  // Warn if output files already exist (user may have pending work)
  if (existsSync(skillDir) && !opts.force) {
    const existing = Object.values(SECTION_OUTPUT_FILES).filter(f => existsSync(join(skillDir, f)))
    if (existing.length > 0)
      p.log.warn(`Overwriting existing output files in ${relative(cwd, skillDir)}: ${existing.join(', ')}`)
  }
  mkdirSync(skillDir, { recursive: true })

  // Fetch & cache resources
  const resSpin = timedSpinner()
  resSpin.start('Fetching resources')
  const resources = await fetchAndCacheResources({
    packageName,
    resolved,
    version,
    useCache,
    features,
    onProgress: msg => resSpin.message(msg),
  })
  resSpin.stop('Resources ready')
  for (const w of resources.warnings)
    p.log.warn(`\x1B[33m${w}\x1B[0m`)

  // Link references for prompt building
  linkAllReferences(skillDir, packageName, cwd, version, resources.docsType, undefined, features, resources.repoInfo)

  const pkgDir = resolvePkgDir(packageName, cwd, version)
  const hasChangelog = detectChangelog(pkgDir, getCacheDir(packageName, version))
  const shippedDocs = hasShippedDocs(packageName, cwd, version)
  const pkgFiles = getPkgKeyFiles(packageName, cwd, version)
  const docFiles = listReferenceFiles(skillDir)

  // Build prompts
  const prompts = buildAllSectionPrompts({
    packageName,
    skillDir,
    version,
    hasIssues: resources.hasIssues,
    hasDiscussions: resources.hasDiscussions,
    hasReleases: resources.hasReleases,
    hasChangelog,
    docFiles,
    docsType: resources.docsType,
    hasShippedDocs: shippedDocs,
    pkgFiles,
    features,
    sections,
  })

  // Eject references as real files, then remove .skilld/ symlinks
  ejectReferences(skillDir, packageName, cwd, version, resources.docsType, features, resources.repoInfo)
  const skilldDir = join(skillDir, '.skilld')
  if (existsSync(skilldDir))
    rmSync(skilldDir, { recursive: true, force: true })

  // Write portable prompts
  for (const [section, prompt] of prompts) {
    const portable = portabilizePrompt(prompt, section)
    writeFileSync(join(skillDir, `PROMPT_${section}.md`), portable)
  }

  // Generate SKILL.md (ejected — uses ./references/ paths)
  const relatedSkills = await findRelatedSkills(packageName, join(skillDir, '..'))
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
    repoUrl: resolved.repoUrl,
    features,
    eject: true,
  })
  writeFileSync(join(skillDir, 'SKILL.md'), skillMd)

  // Write lockfile so skilld list/update/assemble can discover this skill
  const repoSlug = resolved.repoUrl?.match(/github\.com\/([^/]+\/[^/]+?)(?:\.git)?(?:[/#]|$)/)?.[1]
  writeLock(baseDir, skillDirName, {
    packageName,
    version,
    repo: repoSlug,
    source: resources.docSource,
    syncedAt: todayIsoDate(),
    generator: 'skilld',
  })

  // Link to agent dirs + setup gitignore/instructions
  if (agent) {
    const shared = getSharedSkillsDir(cwd)
    if (shared)
      linkSkillToAgents(skillDirName, shared, cwd, agent)
    await ensureGitignore(shared ? SHARED_SKILLS_DIR : agents[agent].skillsDir, cwd, false)
    await ensureAgentInstructions(agent, cwd, false)
    registerProject(cwd)
  }
  else {
    // No agent — ensure gitignore for .claude/skills/ fallback dir
    await ensureGitignore('.claude/skills', cwd, false)
  }

  const relDir = relative(cwd, skillDir)
  const sectionList = [...prompts.keys()]
  p.log.success(`Skill installed to ${relDir}`)

  // Show agent prompt the user can copy-paste
  const promptFiles = sectionList.map(s => `PROMPT_${s}.md`).join(', ')
  const outputFileList = sectionList.map(s => SECTION_OUTPUT_FILES[s]).join(', ')
  p.log.info(`Have your agent enhance the skill. Give it this prompt:\n\x1B[2m\x1B[3m  Read each prompt file (${promptFiles}) in ${relDir}/, read the\n  referenced files, then write your output to the matching file (${outputFileList}).\n  When done, run: skilld assemble\x1B[0m`)
}
