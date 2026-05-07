/**
 * Unified sync pipeline.
 *
 * `runBaseSync` and `runEnhancePhase` own the shared skeleton for every sync
 * frontend (sync, sync-parallel, sync-git). Frontends supply:
 *   - a `PackageResolver`  — how to turn a spec string into a ResolvedSpec
 *   - a `SyncUi`           — how to surface progress (clack vs logUpdate)
 *
 * Eject mode is threaded through both phases via `RunBaseConfig.eject` /
 * `RunEnhanceConfig.eject`. When set, the runner skips the lockfile +
 * agent-linking steps and emits the `./references/` portable path layout.
 */

import type { AgentType, SkillSection, StreamProgress } from '../agent/index.ts'
import type { SkillContext } from '../agent/skill-builder.ts'
import type { SkillInfo } from '../core/lockfile.ts'
import type { ResolveAttempt, ResolvedPackage } from '../sources/index.ts'
import type { LlmConfig, UpdateContext } from './llm-prompts.ts'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve as resolvePath } from 'pathe'
import { computeSkillDirName, getModelLabel, linkSkillToAgents, sanitizeName } from '../agent/index.ts'
import { applyCachedSections, runSkillEnhancement, writeBaseSkill, writePromptFiles } from '../agent/skill-builder.ts'
import { ensureProjectFiles, handleShippedSkills, installSkill, linkShippedToAgents, resolveBaseDir } from '../agent/skill-installer.ts'
import { createReferenceCache } from '../cache/index.ts'
import { getActiveFeatures } from '../core/config.ts'
import { todayIsoDate } from '../core/formatting.ts'
import { findSkillDirByPackage, parsePackageNames, readLock } from '../core/lockfile.ts'
import { parseFrontmatter } from '../core/markdown.ts'
import { getSharedSkillsDir } from '../core/paths.ts'
import { fetchPkgDist, isPrerelease, parseGitHubRepoSlug } from '../sources/index.ts'
import { buildSkillContext, fetchAndCacheResources, prepareSkillReferences } from './sync-pipeline.ts'

const RATE_LIMIT_RE = /\b429\b|rate.?limit|exhausted.*capacity|quota.*reset/i

/**
 * Frontend-agnostic progress surface. Sequential frontends typically wire
 * these to clack `taskLog`/`spinner`; parallel frontends update a state map
 * and re-render via `logUpdate`.
 */
export interface SyncUi {
  /** Resolution started for `spec`. */
  resolveStart: (spec: string) => void
  /** Resolver progress message (e.g. cascade step). */
  resolveProgress: (msg: string) => void
  /** Resolution succeeded. */
  resolveDone: (version: string, opts: { cached: boolean, force?: boolean }) => void
  /** Resolution failed (no docs, not shipped). Frontend may still prompt for suggestions. */
  resolveFailed: (identityName: string) => void

  downloadingDist: () => void

  /** Resource fetching: lifecycle + per-source progress. */
  fetchStart: () => void
  fetchProgress: (msg: string) => void
  fetchDone: (parts: string[], cached: boolean) => void

  /** Search index lifecycle (only invoked when `features.search`). */
  indexStart: () => void
  indexProgress: (msg: string) => void
  indexDone: () => void

  /** Non-fatal warning (e.g. partial fetch failure). */
  warn: (msg: string) => void

  /** Base SKILL.md written. */
  baseDone: (relPath: string, mode: 'add' | 'update') => void

  /** All sections served from LLM cache; LLM call skipped. */
  sectionsCached: () => void

  /** LLM optimization started. */
  llmStart: (modelLabel: string) => void
  llmProgress: (progress: StreamProgress) => void
  llmDone: (info: {
    usage?: { totalTokens: number }
    cost?: number
    debugLogsDir?: string
    error?: string
    warnings?: string[]
  }) => void
  llmFailed: (error: string, opts: { rateLimited: boolean }) => void

  /** A shipped (in-package) SKILL.md was linked instead of generated. */
  shippedInstalled: (skillName: string, relPath: string) => void
}

/** Spec resolved into the facts every runner step needs. */
export interface ResolvedSpec {
  /** Identity for display + lockfile (`@scope/pkg`). */
  identityName: string
  /** Storage / cache key (often == identity for npm; differs for crates). */
  storageName: string
  version: string
  resolved: ResolvedPackage
  /** Source kind — controls dist download and shipped-skill probing. */
  kind: 'npm' | 'crate' | 'github'
  /** Tag the user requested via `pkg@tag` (used to gate prerelease warning). */
  requestedTag?: string
  /** Local node_modules version, when present (gates prerelease warning). */
  localVersion?: string
}

/** Resolution failure: caller decides whether to suggest, retry, or abort. */
export interface UnresolvedSpec {
  identityName: string
  /** Shipped skill registered as a fallback when no docs were resolvable. */
  shipped?: { skillName: string, skillDir: string }[]
  attempts: ResolveAttempt[]
  registryVersion?: string
}

export type ResolverResult = ResolvedSpec | UnresolvedSpec

export interface ResolverOpts {
  cwd: string
  agent: AgentType
  global: boolean
  onProgress: (msg: string) => void
}

export type PackageResolver = (spec: string, opts: ResolverOpts) => Promise<ResolverResult>

/** Result of `runBaseSync` — discriminated so the frontend knows what to do next. */
export type BaseSyncResult
  = | { kind: 'shipped' }
    | { kind: 'unresolved', unresolved: UnresolvedSpec }
    | { kind: 'merge-needed', state: MergeNeededState }
    | { kind: 'ready', state: ReadyState }

/**
 * Returned when the target skill dir already holds a different primary
 * package — the runner stops before fetching/caching so the frontend can run
 * its merge-specific writeGeneratedSkillMd flow with both packages.
 */
export interface MergeNeededState {
  identityName: string
  storageName: string
  version: string
  resolved: ResolvedPackage
  baseDir: string
  skillDir: string
  skillDirName: string
  existingLock: SkillInfo
}

export interface ReadyState {
  ctx: SkillContext
  skillDir: string
  skillDirName: string
  baseDir: string
  updateCtx?: UpdateContext
  /** True when every requested section is already in the LLM cache. */
  allSectionsCached: boolean
  /** Identity name (for outro / telemetry). */
  identityName: string
  /** Storage / cache key (needed for eject's `ejectReferences` cleanup). */
  storageName: string
  version: string
  docsType: 'llms.txt' | 'readme' | 'docs'
  repoInfo?: { owner: string, repo: string }
}

export interface RunBaseConfig {
  agent: AgentType
  global: boolean
  mode?: 'add' | 'update'
  force?: boolean
  /** Skip building search index / embeddings even when configured. */
  noSearch?: boolean
  /** Override skill directory name (only honored on add). */
  name?: string
  /** Lower-bound date for release/issue/discussion collection. */
  from?: string
  /**
   * Eject mode:
   *   - `false` / undefined  → write under agent baseDir, link, lock
   *   - `true`               → write under `<cwd>/skills/<name>` (portable)
   *   - `string`             → write under `<resolve(cwd, string)>/<name>`
   * When set, lockfile + agent-linking + named-pkg symlink are skipped.
   */
  eject?: boolean | string
}

/** Phase 1: resolve → fetch → cache → install → write base SKILL.md. */
export async function runBaseSync(
  spec: string,
  config: RunBaseConfig,
  ui: SyncUi,
  resolver: PackageResolver,
  cwd: string,
  defaultSections: SkillSection[],
): Promise<BaseSyncResult> {
  ui.resolveStart(spec)

  const resolverResult = await resolver(spec, {
    cwd,
    agent: config.agent,
    global: config.global,
    onProgress: msg => ui.resolveProgress(msg),
  })

  if (!('resolved' in resolverResult)) {
    if (resolverResult.shipped && resolverResult.shipped.length > 0) {
      for (const s of resolverResult.shipped)
        ui.shippedInstalled(s.skillName, relative(cwd, s.skillDir))
      return { kind: 'shipped' }
    }
    ui.resolveFailed(resolverResult.identityName)
    return { kind: 'unresolved', unresolved: resolverResult }
  }

  const { identityName, storageName, version, resolved, kind, requestedTag, localVersion } = resolverResult
  const cache = createReferenceCache(storageName, version)

  if (config.force)
    cache.clearForce()

  const useCache = cache.has()

  // Download npm dist when not in node_modules (crates have no dist).
  if (kind !== 'crate' && !existsSync(join(cwd, 'node_modules', identityName))) {
    ui.downloadingDist()
    await fetchPkgDist(identityName, version)
  }

  // Shipped skills: short-circuit before cache/LLM.
  if (kind !== 'crate') {
    const shipped = handleShippedSkills(identityName, version, cwd, config.agent, config.global)
    if (shipped) {
      linkShippedToAgents(shipped.shipped, cwd, config.agent, config.global)
      for (const s of shipped.shipped)
        ui.shippedInstalled(s.skillName, relative(cwd, s.skillDir))
      return { kind: 'shipped' }
    }
  }

  ui.resolveDone(version, { cached: useCache, force: config.force })

  // Prerelease nudge: if user didn't pin and we resolved to stable latest,
  // surface that a newer next/beta/alpha tag exists they could opt into.
  if (kind === 'npm' && !localVersion && !requestedTag && !isPrerelease(version)) {
    const nextTag = resolved.distTags?.next ?? resolved.distTags?.beta ?? resolved.distTags?.alpha
    if (nextTag && (!resolved.releasedAt || !nextTag.releasedAt || nextTag.releasedAt > resolved.releasedAt))
      ui.warn(`No local dependency found — using latest stable (${version}). Prerelease ${nextTag.version} available: skilld add ${identityName}@beta`)
  }

  cache.ensure()

  const isEject = !!config.eject
  const baseDir = resolveBaseDir(cwd, config.agent, config.global)
  let skillDirName = config.name ? sanitizeName(config.name) : computeSkillDirName(storageName)
  if (config.mode === 'update' && !config.name && !isEject) {
    const lock = readLock(baseDir)
    const found = lock ? findSkillDirByPackage(lock, identityName) : null
    if (found)
      skillDirName = found
  }
  // Eject path lives under the user's working tree; lockfile lives under baseDir.
  const skillDir = isEject
    ? typeof config.eject === 'string'
      ? join(resolvePath(cwd, config.eject), skillDirName)
      : join(cwd, 'skills', skillDirName)
    : join(baseDir, skillDirName)
  mkdirSync(skillDir, { recursive: true })

  // Capture pre-update context before lockfile gets overwritten.
  // Eject mode never reads/writes the lockfile, so skip merge detection too.
  const existingLock = isEject ? undefined : readLock(baseDir)?.skills[skillDirName]
  // Merge: skill dir already holds a different primary package — defer to
  // the frontend, which owns the merge SKILL.md regen.
  if (existingLock && existingLock.packageName && existingLock.packageName !== identityName) {
    return {
      kind: 'merge-needed',
      state: {
        identityName,
        storageName,
        version,
        resolved,
        baseDir,
        skillDir,
        skillDirName,
        existingLock,
      },
    }
  }
  const updateCtx: UpdateContext | undefined = config.mode === 'update' && existingLock
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

  const features = getActiveFeatures(config.noSearch ? { search: false } : undefined)

  ui.fetchStart()
  const resources = await fetchAndCacheResources({
    packageName: storageName,
    resolved,
    version,
    useCache,
    features,
    from: config.from,
    onProgress: msg => ui.fetchProgress(msg),
  })
  const parts: string[] = []
  if (resources.docsToIndex.length > 0) {
    const docCount = resources.docsToIndex.filter(d => d.metadata?.type === 'doc').length
    if (docCount > 0)
      parts.push(`${docCount} docs`)
  }
  if (resources.hasIssues)
    parts.push('issues')
  if (resources.hasDiscussions)
    parts.push('discussions')
  if (resources.hasReleases)
    parts.push('releases')
  ui.fetchDone(parts, resources.usedCache)
  for (const w of resources.warnings)
    ui.warn(w)

  if (features.search)
    ui.indexStart()
  const prepared = await prepareSkillReferences({
    packageName: storageName,
    version,
    cwd,
    skillDir,
    resources,
    features,
    baseDir,
    onIndexProgress: msg => ui.indexProgress(msg),
  })
  if (features.search)
    ui.indexDone()

  // Eject mode skips per-pkg symlink + lockfile + agent-linking. The lockfile
  // is also where we read merged-package state from; eject keeps just `[name]`.
  if (!isEject) {
    const repoSlug = parseGitHubRepoSlug(resolved.repoUrl)
    cache.linkPkgNamed(skillDir, cwd)
    const lock: SkillInfo = {
      packageName: identityName,
      version,
      repo: repoSlug,
      source: resources.docSource,
      syncedAt: todayIsoDate(),
      generator: 'skilld',
    }
    installSkill({
      cwd,
      agent: config.agent,
      global: config.global,
      baseDir,
      skillDirName,
      lock,
      dedupePackageName: identityName,
      skipLinkAgents: true,
    })
  }

  const updatedLock = isEject ? undefined : readLock(baseDir)?.skills[skillDirName]
  const allPackages = parsePackageNames(updatedLock?.packages)

  const ctx = buildSkillContext({
    packageName: identityName,
    cachePackageName: storageName,
    version,
    skillDir,
    skillDirName,
    resources,
    prepared,
    resolved,
    packages: allPackages,
    features,
  })

  const baseSkillMd = writeBaseSkill(ctx, { eject: isEject })
  ctx.overheadLines = baseSkillMd.split('\n').length
  ui.baseDone(relative(cwd, skillDir), config.mode === 'update' ? 'update' : 'add')

  const allSectionsCached = !config.force && applyCachedSections(ctx, defaultSections, { eject: isEject })
  if (allSectionsCached)
    ui.sectionsCached()

  return {
    kind: 'ready',
    state: {
      ctx,
      skillDir,
      skillDirName,
      baseDir,
      updateCtx,
      allSectionsCached,
      identityName,
      storageName,
      version,
      docsType: resources.docsType,
      repoInfo: resources.repoInfo,
    },
  }
}

export interface RunEnhanceConfig {
  agent: AgentType
  global: boolean
  force?: boolean
  debug?: boolean
  /** Same flag as RunBaseConfig.eject; passed again so cleanup runs at the right step. */
  eject?: boolean | string
}

/**
 * Phase 2: enhance with LLM (or write prompt files), then finalize.
 * In eject mode, finalization is `clearSkillInternalDir` + `ejectReferences`.
 * Otherwise it's `linkSkillToAgents` + `ensureProjectFiles`.
 */
export async function runEnhancePhase(
  state: ReadyState,
  llmConfig: LlmConfig | null,
  config: RunEnhanceConfig,
  ui: SyncUi,
  cwd: string,
): Promise<void> {
  const isEject = !!config.eject

  if (llmConfig?.promptOnly) {
    writePromptFiles(
      { ...state.ctx, packageName: state.ctx.cachePackageName ?? state.ctx.packageName, cachePackageName: undefined },
      { sections: llmConfig.sections, customPrompt: llmConfig.customPrompt },
    )
  }
  else if (llmConfig) {
    await enhanceWithUi(state.ctx, llmConfig, { ...config, eject: isEject }, ui)
  }

  if (isEject) {
    const cache = createReferenceCache(state.storageName, state.version)
    if (!config.debug)
      cache.clearSkillInternal(state.skillDir)
    cache.eject(state.skillDir, cwd, state.docsType, {
      features: state.ctx.features ?? getActiveFeatures(),
      repoInfo: state.repoInfo,
    })
    return
  }

  const shared: string | false = config.global ? false : (getSharedSkillsDir(cwd) ?? false)
  if (shared)
    linkSkillToAgents(state.skillDirName, shared, cwd, config.agent)

  await ensureProjectFiles({ cwd, agent: config.agent, global: config.global, shared })
}

async function enhanceWithUi(
  ctx: SkillContext,
  llmConfig: LlmConfig,
  config: RunEnhanceConfig,
  ui: SyncUi,
): Promise<void> {
  ui.llmStart(getModelLabel(llmConfig.model))
  const result = await runSkillEnhancement(
    ctx,
    {
      model: llmConfig.model,
      force: config.force,
      debug: config.debug,
      sections: llmConfig.sections,
      customPrompt: llmConfig.customPrompt,
      eject: !!config.eject,
    },
    progress => ui.llmProgress(progress),
  )

  if (result.wasOptimized) {
    ui.llmDone({
      usage: result.usage ? { totalTokens: result.usage.totalTokens } : undefined,
      cost: result.cost,
      debugLogsDir: result.debugLogsDir,
      error: result.error,
      warnings: result.warnings,
    })
  }
  else {
    ui.llmFailed(result.error ?? '', { rateLimited: !!result.error && RATE_LIMIT_RE.test(result.error) })
  }
}

// Re-exports so call sites can pull `OptimizeModel`/`CustomPrompt` from one
// place when wiring frontends.
export type { CustomPrompt, OptimizeModel, SkillSection } from '../agent/index.ts'
