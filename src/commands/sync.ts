import type { AgentType, OptimizeModel, SkillSection } from '../agent/index.ts'
import type { ProjectState } from '../core/skills.ts'
import type { GitSkillSource } from '../sources/git-skills.ts'
import type { ResolveAttempt } from '../sources/index.ts'
import type { RunBaseConfig } from './sync-runner.ts'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import * as p from '@clack/prompts'
import { defineCommand } from 'citty'
import { join, relative, resolve } from 'pathe'
import {
  buildAllSectionPrompts,
  computeSkillDirName,
  detectImportedPackages,
  portabilizePrompt,
  SECTION_OUTPUT_FILES,
  writeGeneratedSkillMd,
} from '../agent/index.ts'
import { ensureGitignore, ensureProjectFiles, installSkill, resolveBaseDir } from '../agent/skill-installer.ts'
import {
  createReferenceCache,
  listReferenceFiles,
} from '../cache/index.ts'
import { getInstalledGenerators, introLine, isInteractive, promptForAgent, resolveAgent, sharedArgs, suggestPrepareHook } from '../cli-helpers.ts'
import { getActiveFeatures, hasCompletedWizard, readConfig } from '../core/config.ts'
import { timedSpinner, todayIsoDate } from '../core/formatting.ts'
import { writeLock } from '../core/lockfile.ts'
import { isCrateSpec, parseSkillInput, resolveSkillName } from '../core/prefix.ts'
import { getProjectState } from '../core/skills.ts'
import { shutdownWorker } from '../retriv/pool.ts'
import {
  fetchPkgDist,
  parseGitHubRepoSlug,
  resolvePackageOrCrate,
  searchNpmPackages,
} from '../sources/index.ts'
import { DEFAULT_SECTIONS, resolveAutoModel, selectLlmConfig } from './llm-prompts.ts'
import { syncGitSkills } from './sync-git.ts'
import { handleMerge } from './sync-merge.ts'
import { syncPackagesParallel } from './sync-parallel.ts'
import {
  fetchAndCacheResources,
  prepareSkillReferences,
} from './sync-pipeline.ts'
import { npmResolver } from './sync-resolvers.ts'
import { runBaseSync, runEnhancePhase } from './sync-runner.ts'
import { createClackUi } from './sync-ui-clack.ts'
import { runWizard } from './wizard.ts'

// Re-export for external consumers
export { enhanceSkillWithLLM, writePromptFiles } from '../agent/skill-builder.ts'
export type { EnhanceRunOptions, PromptRunOptions, SkillContext } from '../agent/skill-builder.ts'
export { ensureAgentInstructions, ensureGitignore, SKILLD_MARKER_END, SKILLD_MARKER_START } from '../agent/skill-installer.ts'
export { isCrateSpec } from '../core/prefix.ts'
export { DEFAULT_SECTIONS, selectLlmConfig, selectModel, selectSkillSections } from './llm-prompts.ts'

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

export type { LlmConfig, UpdateContext } from './llm-prompts.ts'

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

/**
 * Sequential sync via the unified runner. Handles npm/crate, add/update mode,
 * eject mode, merge, shipped skills, and "did-you-mean" suggestions.
 */
async function runSimpleSync(packageSpec: string, config: SyncConfig): Promise<void> {
  const cwd = process.cwd()
  const ui = createClackUi({ cwd })
  const isEject = !!config.eject

  const baseConfig: RunBaseConfig = {
    agent: config.agent,
    global: config.global,
    mode: config.mode,
    force: config.force,
    noSearch: config.noSearch,
    name: config.name,
    from: config.from,
    eject: config.eject,
  }

  const result = await runBaseSync(packageSpec, baseConfig, ui, npmResolver, cwd, DEFAULT_SECTIONS)

  if (result.kind === 'shipped') {
    p.outro(`Synced ${packageSpec}`)
    return
  }

  if (result.kind === 'unresolved') {
    const { unresolved } = result
    // Suggestion picker: only meaningful for npm specs (not crates).
    if (!isCrateSpec(packageSpec)) {
      const suggestions = await searchNpmPackages(unresolved.identityName)
      if (suggestions.length > 0) {
        showResolveAttempts(unresolved.attempts)
        const selected = await p.select({
          message: 'Did you mean one of these?',
          options: [
            ...suggestions.map(s => ({ label: s.name, value: s.name, hint: s.description })),
            { label: 'None of these', value: '_none_' as const },
          ],
        })
        if (!p.isCancel(selected) && selected !== '_none_')
          return syncSinglePackage(selected as string, config)
        return
      }
    }
    showResolveAttempts(unresolved.attempts)
    return
  }

  if (result.kind === 'merge-needed') {
    await handleMerge(result.state, { agent: config.agent, global: config.global }, cwd)
    return
  }

  // result.kind === 'ready'
  const { state } = result
  const globalConfig = readConfig()
  const resolvedModel = await resolveAutoModel(config.model, config.yes)

  let llmConfig: import('./llm-prompts.ts').LlmConfig | null = null
  if (!state.allSectionsCached && !globalConfig.skipLlm && !(config.yes && !resolvedModel))
    llmConfig = await selectLlmConfig(resolvedModel, undefined, state.updateCtx)

  await runEnhancePhase(
    state,
    llmConfig,
    { agent: config.agent, global: config.global, force: config.force, debug: config.debug, eject: config.eject },
    ui,
    cwd,
  )

  await shutdownWorker()
  const ejectMsg = isEject ? ' (ejected)' : ''
  const relDir = relative(cwd, state.skillDir)
  p.outro(config.mode === 'update'
    ? `Updated ${state.identityName}${ejectMsg}`
    : `Synced ${state.identityName} → ${relDir}${ejectMsg}`)

  try {
    await suggestPrepareHook(cwd)
  }
  catch (err) {
    p.log.warn(`Failed to suggest prepare hook: ${err instanceof Error ? err.message : String(err)}`)
  }
}

async function syncSinglePackage(packageSpec: string, config: SyncConfig): Promise<void> {
  if (isCrateSpec(packageSpec) && !packageSpec.slice('crate:'.length).trim()) {
    p.log.error('Invalid crate spec. Use format: crate:<name>')
    return
  }
  return runSimpleSync(packageSpec, config)
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
  const sections = opts.sections ?? DEFAULT_SECTIONS

  const spin = timedSpinner()
  spin.start(`Resolving ${packageSpec}`)
  const cwd = process.cwd()

  const { packageName, localVersion, resolved } = await resolvePackageOrCrate(packageSpec, {
    cwd,
    onProgress: label => spin.message(`${packageSpec}: ${label}`),
  })

  if (!resolved) {
    spin.stop(`Could not find docs for: ${packageSpec}`)
    return
  }

  const version = localVersion || resolved.version || 'latest'
  const cache = createReferenceCache(packageName, version)
  const useCache = !opts.force && cache.has()

  // Download npm dist if not in node_modules
  if (!existsSync(join(cwd, 'node_modules', packageName))) {
    spin.message(`Downloading ${packageName}@${version} dist`)
    await fetchPkgDist(packageName, version)
  }

  spin.stop(`Resolved ${packageName}@${useCache ? cache.versionKey : version}`)
  cache.ensure()

  const skillDirName = computeSkillDirName(packageName)
  const features = getActiveFeatures()

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

  const prepared = await prepareSkillReferences({
    packageName,
    version,
    cwd,
    skillDir,
    resources,
    features,
    baseDir: join(skillDir, '..'),
  })
  const { hasChangelog, shippedDocs, pkgFiles, relatedSkills } = prepared
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

  cache.eject(skillDir, cwd, resources.docsType, { features, repoInfo: resources.repoInfo })
  cache.clearSkillInternal(skillDir)

  // Write portable prompts
  for (const [section, prompt] of prompts) {
    const portable = portabilizePrompt(prompt, section)
    writeFileSync(join(skillDir, `PROMPT_${section}.md`), portable)
  }

  // Generate SKILL.md (ejected — uses ./references/ paths)
  writeGeneratedSkillMd(skillDir, {
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

  const repoSlug = parseGitHubRepoSlug(resolved.repoUrl)
  if (agent) {
    const { shared } = installSkill({
      cwd,
      agent,
      global: false,
      baseDir,
      skillDirName,
      lock: {
        packageName,
        version,
        repo: repoSlug,
        source: resources.docSource,
        syncedAt: todayIsoDate(),
        generator: 'skilld',
      },
    })
    await ensureProjectFiles({ cwd, agent, global: false, shared })
  }
  else {
    // No agent — write lockfile but skip agent linking; ensure gitignore for fallback dir
    writeLock(baseDir, skillDirName, {
      packageName,
      version,
      repo: repoSlug,
      source: resources.docSource,
      syncedAt: todayIsoDate(),
      generator: 'skilld',
    })
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
