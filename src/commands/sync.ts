import type { AgentType, OptimizeModel } from '../agent/index.ts'
import type { ProjectState } from '../core/skills.ts'
import type { GitSkillSource } from '../sources/git-skills.ts'
import type { ResolveAttempt } from '../sources/index.ts'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import * as p from '@clack/prompts'
import { defineCommand } from 'citty'
import { join, relative, resolve } from 'pathe'
import {
  agents,
  computeSkillDirName,
  detectImportedPackages,
  generateSkillMd,
  getModelLabel,
  linkSkillToAgents,
  sanitizeName,
} from '../agent/index.ts'
import {
  ensureCacheDir,
  getCacheDir,
  getPkgKeyFiles,
  getVersionKey,
  hasShippedDocs,
  isCached,
  linkPkgNamed,
  resolvePkgDir,
} from '../cache/index.ts'
import { getInstalledGenerators, introLine, isInteractive, promptForAgent, resolveAgent, sharedArgs } from '../cli-helpers.ts'
import { defaultFeatures, hasCompletedWizard, readConfig, registerProject } from '../core/config.ts'
import { timedSpinner } from '../core/formatting.ts'
import { parsePackages, readLock, writeLock } from '../core/lockfile.ts'
import { getSharedSkillsDir, SHARED_SKILLS_DIR } from '../core/shared.ts'
import { getProjectState } from '../core/skills.ts'
import { shutdownWorker } from '../retriv/pool.ts'
import { parseGitSkillInput } from '../sources/git-skills.ts'
import {
  fetchPkgDist,
  isPrerelease,
  parsePackageSpec,
  readLocalDependencies,
  resolvePackageDocsWithAttempts,
  searchNpmPackages,
} from '../sources/index.ts'
import { syncGitSkills } from './sync-git.ts'
import { syncPackagesParallel } from './sync-parallel.ts'
import {
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
} from './sync-shared.ts'
import { runWizard } from './wizard.ts'

// Re-export for external consumers
export { DEFAULT_SECTIONS, enhanceSkillWithLLM, ensureAgentInstructions, ensureGitignore, selectLlmConfig, selectModel, selectSkillSections, SKILLD_MARKER_END, SKILLD_MARKER_START } from './sync-shared.ts'
export type { EnhanceOptions, LlmConfig } from './sync-shared.ts'

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
  force?: boolean
  debug?: boolean
  mode?: 'add' | 'update'
  /** Eject mode: copy references as real files instead of symlinking */
  eject?: boolean | string
  /** Override the computed skill directory name */
  name?: string
  /** Lower-bound date for release/issue/discussion collection (ISO date, e.g. "2025-07-01") */
  from?: string
}

export async function syncCommand(state: ProjectState, opts: SyncOptions): Promise<void> {
  // If packages specified, sync those
  if (opts.packages && opts.packages.length > 0) {
    // Use parallel sync for multiple packages
    if (opts.packages.length > 1) {
      return syncPackagesParallel({
        packages: opts.packages,
        global: opts.global,
        agent: opts.agent,
        model: opts.model,
        yes: opts.yes,
        force: opts.force,
        debug: opts.debug,
        mode: opts.mode,
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
}

async function syncSinglePackage(packageSpec: string, config: SyncConfig): Promise<void> {
  // Parse dist-tag from spec: "vue@beta" → name="vue", tag="beta"
  const { name: packageName, tag: requestedTag } = parsePackageSpec(packageSpec)

  const spin = timedSpinner()
  spin.start(`Resolving ${packageSpec}`)

  const cwd = process.cwd()
  const localDeps = await readLocalDependencies(cwd).catch(() => [])
  const localVersion = localDeps.find(d => d.name === packageName)?.version

  // Try npm first — use full spec for npm resolution (unpkg supports dist-tags)
  const resolveResult = await resolvePackageDocsWithAttempts(requestedTag ? packageSpec : packageName, {
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

  // Force: nuke cached references + search index so all existsSync guards re-fetch
  if (config.force) {
    forceClearCache(packageName, version)
  }

  const useCache = isCached(packageName, version)

  // Download npm dist if not in node_modules (for standalone/learning use)
  if (!existsSync(join(cwd, 'node_modules', packageName))) {
    spin.message(`Downloading ${packageName}@${version} dist`)
    await fetchPkgDist(packageName, version)
  }

  // Shipped skills: symlink directly, skip all doc fetching/caching/LLM
  const shippedResult = handleShippedSkills(packageName, version, cwd, config.agent, config.global)
  if (shippedResult) {
    const shared = !config.global && getSharedSkillsDir(cwd)
    for (const shipped of shippedResult.shipped) {
      if (shared)
        linkSkillToAgents(shipped.skillName, shared, cwd)
      p.log.success(`Using published SKILL.md: ${shipped.skillName} → ${relative(cwd, shipped.skillDir)}`)
    }
    spin.stop(`Using published SKILL.md(s) from ${packageName}`)
    return
  }

  spin.stop(`Resolved ${packageName}@${useCache ? versionKey : version}${config.force ? ' (force)' : useCache ? ' (cached)' : ''}`)

  // Warn when no local dep and resolved to stable latest — prerelease releases won't be fetched
  if (!localVersion && !requestedTag && !isPrerelease(version)) {
    const nextTag = resolved.distTags?.next ?? resolved.distTags?.beta ?? resolved.distTags?.alpha
    if (nextTag) {
      p.log.warn(`\x1B[33mNo local dependency found — using latest stable (${version}). Prerelease ${nextTag.version} available: skilld add ${packageName}@beta\x1B[0m`)
    }
  }

  ensureCacheDir()

  const baseDir = resolveBaseDir(cwd, config.agent, config.global)
  const skillDirName = config.name ? sanitizeName(config.name) : computeSkillDirName(packageName)
  // Eject path override: default to ./skills/<name>, or use specified directory
  const skillDir = config.eject
    ? typeof config.eject === 'string'
      ? join(resolve(cwd, config.eject), skillDirName)
      : join(cwd, 'skills', skillDirName)
    : join(baseDir, skillDirName)
  mkdirSync(skillDir, { recursive: true })

  // ── Merge mode: skill dir already exists with a different primary package (skip in eject) ──
  const existingLock = config.eject ? undefined : readLock(baseDir)?.skills[skillDirName]
  const isMerge = existingLock && existingLock.packageName && existingLock.packageName !== packageName

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
      linkSkillToAgents(skillDirName, mergeShared, cwd)

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
  linkAllReferences(skillDir, packageName, cwd, version, resources.docsType, undefined, features, resources.repoInfo)

  // ── Phase 2: Search index (generated even in eject mode so LLM can use it) ──
  if (features.search) {
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
  }

  const pkgDir = resolvePkgDir(packageName, cwd, version)
  const hasChangelog = detectChangelog(pkgDir, getCacheDir(packageName, version))
  const relatedSkills = await findRelatedSkills(packageName, baseDir)
  const shippedDocs = hasShippedDocs(packageName, cwd, version)
  const pkgFiles = getPkgKeyFiles(packageName, cwd, version)

  // Write base SKILL.md (no LLM needed)
  const repoSlug = resolved.repoUrl?.match(/github\.com\/([^/]+\/[^/]+?)(?:\.git)?(?:[/#]|$)/)?.[1]

  // Also create named symlink for this package (skip in eject mode)
  if (!config.eject)
    linkPkgNamed(skillDir, packageName, cwd, version)

  // Skip lockfile in eject mode — no agent skills dir to write to
  if (!config.eject) {
    writeLock(baseDir, skillDirName, {
      packageName,
      version,
      repo: repoSlug,
      source: resources.docSource,
      syncedAt: new Date().toISOString().split('T')[0],
      generator: 'skilld',
    })
  }

  // Read back merged packages from lockfile for SKILL.md generation
  const updatedLock = config.eject ? undefined : readLock(baseDir)?.skills[skillDirName]
  const allPackages = parsePackages(updatedLock?.packages).map(p => ({ name: p.name }))

  const isEject = !!config.eject
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
    features,
    eject: isEject,
  })
  writeFileSync(join(skillDir, 'SKILL.md'), baseSkillMd)

  p.log.success(config.mode === 'update' ? `Updated skill: ${relative(cwd, skillDir)}` : `Created base skill: ${relative(cwd, skillDir)}`)

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
        features,
        eject: isEject,
      })
    }
  }

  // Eject: clean up transient .skilld/ symlinks → copy as real files
  if (isEject) {
    const skilldDir = join(skillDir, '.skilld')
    if (existsSync(skilldDir) && !config.debug)
      rmSync(skilldDir, { recursive: true, force: true })
    ejectReferences(skillDir, packageName, cwd, version, resources.docsType, features, resources.repoInfo)
  }

  // Skip agent integration in eject mode (no symlinks, no gitignore, no instructions)
  if (!isEject) {
    // Link shared dir to per-agent dirs
    const shared = !config.global && getSharedSkillsDir(cwd)
    if (shared)
      linkSkillToAgents(skillDirName, shared, cwd)

    // Register project in global config (for uninstall tracking)
    if (!config.global) {
      registerProject(cwd)
    }

    await ensureGitignore(shared ? SHARED_SKILLS_DIR : agents[config.agent].skillsDir, cwd, config.global)
    await ensureAgentInstructions(config.agent, cwd, config.global)
  }

  await shutdownWorker()

  const ejectMsg = isEject ? ' (ejected)' : ''
  p.outro(config.mode === 'update' ? `Updated ${packageName}${ejectMsg}` : `Synced ${packageName} to ${relative(cwd, skillDir)}${ejectMsg}`)
}

// ── Citty command definitions (lazy-loaded by cli.ts) ──

export const addCommandDef = defineCommand({
  meta: { name: 'add', description: 'Add skills for package(s)' },
  args: {
    package: {
      type: 'positional',
      description: 'Package(s) to sync (space or comma-separated, e.g., vue nuxt pinia)',
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
    let agent = resolveAgent(args.agent)
    if (!agent) {
      agent = await promptForAgent()
      if (!agent)
        return
    }

    // First-time setup — configure features + LLM model
    if (!hasCompletedWizard())
      await runWizard()

    // Collect raw inputs (don't split URLs on slashes/spaces yet)
    const rawInputs = [...new Set(
      [args.package, ...((args as any)._ || [])]
        .map((s: string) => s.trim())
        .filter(Boolean),
    )]

    // Partition: git sources vs npm packages
    const gitSources: GitSkillSource[] = []
    const npmTokens: string[] = []

    for (const input of rawInputs) {
      const git = parseGitSkillInput(input)
      if (git)
        gitSources.push(git)
      else
        npmTokens.push(input)
    }

    // Handle git sources
    if (gitSources.length > 0) {
      for (const source of gitSources) {
        const skillFilter = args.skill ? args.skill.split(/[,\s]+/).map((s: string) => s.trim()).filter(Boolean) : undefined
        await syncGitSkills({ source, global: args.global, agent, yes: args.yes, model: args.model as OptimizeModel | undefined, force: args.force, debug: args.debug, skillFilter })
      }
    }

    // Handle npm packages via existing flow
    if (npmTokens.length > 0) {
      const packages = [...new Set(npmTokens.flatMap(s => s.split(/[,\s]+/)).map(s => s.trim()).filter(Boolean))]
      const state = await getProjectState(cwd)
      p.intro(introLine({ state }))
      return syncCommand(state, {
        packages,
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
    ...sharedArgs,
  },
  async run({ args }) {
    const cwd = process.cwd()
    // Eject skips agent detection — output goes to ./skills/<name> by default
    const agent = resolveAgent(args.agent) || 'claude-code'

    if (!hasCompletedWizard())
      await runWizard()

    const state = await getProjectState(cwd)
    p.intro(introLine({ state }))
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
      const child = spawn(process.execPath, [process.argv[1], ...updateArgs], {
        cwd,
        detached: true,
        stdio: 'ignore',
      })
      child.unref()
      return
    }

    const silent = !isInteractive()

    let agent = resolveAgent(args.agent)
    if (!agent) {
      if (silent)
        return
      agent = await promptForAgent()
      if (!agent)
        return
    }

    const config = readConfig()
    const state = await getProjectState(cwd)

    if (!silent) {
      const generators = getInstalledGenerators()
      p.intro(introLine({ state, generators, modelId: config.model }))
    }

    // Specific packages
    if (args.package) {
      const packages = [...new Set([args.package, ...((args as any)._ || [])].flatMap(s => s.split(/[,\s]+/)).map(s => s.trim()).filter(Boolean))]
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

    // No args: sync all outdated
    if (state.outdated.length === 0) {
      p.log.success('All skills up to date')
      return
    }

    const packages = state.outdated.map(s => s.packageName || s.name)
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
