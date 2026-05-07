/**
 * SkillBuilder: turns cached references into a generated SKILL.md.
 *
 * Two entry points, both consume a `SkillContext` (skill-state) plus a
 * per-call `RunOptions` (invocation intent):
 *   - `enhanceSkillWithLLM`  — runs the LLM optimization pipeline and writes
 *     the final SKILL.md (with cost/warning surfacing).
 *   - `writePromptFiles`     — emits PROMPT_*.md per section into `.skilld/`
 *     for manual LLM usage (no LLM call).
 *
 * Both share the same per-section prompt assembly via `buildAllSectionPrompts`.
 */

import type { FeaturesConfig } from '../core/config.ts'
import type { CustomPrompt, OptimizeModel, OptimizeResult, SkillSection, StreamProgress } from './index.ts'
import { mkdirSync, writeFileSync } from 'node:fs'
import * as p from '@clack/prompts'
import { join, relative } from 'pathe'
import { createReferenceCache, listReferenceFiles } from '../cache/index.ts'
import { skillInternalDir } from '../core/paths.ts'
import {
  buildAllSectionPrompts,
  createToolProgress,
  getModelLabel,
  optimizeDocs,
  SECTION_MERGE_ORDER,
  SECTION_OUTPUT_FILES,
  wrapSection,
  writeGeneratedSkillMd,
} from './index.ts'

const RATE_LIMIT_RE = /\b429\b|rate.?limit|exhausted.*capacity|quota.*reset/i

/** Upstream metadata gathered during URL/content resolution. */
export interface ResolvedSkillMeta {
  repoUrl?: string
  llmsUrl?: string
  releasedAt?: string
  description?: string
  docsUrl?: string
  gitRef?: string
  dependencies?: Record<string, string>
  distTags?: Record<string, { version: string, releasedAt?: string }>
}

/** Reference-cache state for a skill: what's been linked under `.skilld/`. */
export interface SkillReferences {
  docsType: 'llms.txt' | 'readme' | 'docs'
  hasShippedDocs: boolean
  pkgFiles: string[]
  hasIssues: boolean
  hasDiscussions: boolean
  hasReleases: boolean
  hasChangelog: string | false
}

/**
 * Everything a SkillBuilder needs to know about a skill *before* deciding how
 * to invoke the LLM. Constructed by the orchestrator after fetch+link finish.
 */
export interface SkillContext {
  /** Identity for display/frontmatter; storage key defaults to name. */
  packageName: string
  cachePackageName?: string
  version: string
  skillDir: string
  dirName?: string
  references: SkillReferences
  resolved: ResolvedSkillMeta
  relatedSkills: string[]
  packages?: Array<{ name: string }>
  features?: FeaturesConfig
  /** Lines consumed by SKILL.md overhead (frontmatter, etc.) */
  overheadLines?: number
}

/** Per-call flags for `enhanceSkillWithLLM`. */
export interface EnhanceRunOptions {
  model: OptimizeModel
  force?: boolean
  debug?: boolean
  eject?: boolean
  sections?: SkillSection[]
  customPrompt?: CustomPrompt
}

/** Per-call flags for `writePromptFiles`. */
export interface PromptRunOptions {
  sections: SkillSection[]
  customPrompt?: CustomPrompt
}

/**
 * Pure entry: invoke the LLM, write SKILL.md on success, return the result.
 * No clack UI, no error handling — caller decides how to surface progress and
 * what to do on failure (warn vs throw).
 */
export async function runSkillEnhancement(
  ctx: SkillContext,
  run: EnhanceRunOptions,
  onProgress: (progress: StreamProgress) => void,
): Promise<OptimizeResult> {
  const { packageName, cachePackageName, version, skillDir, dirName, resolved, relatedSkills, references, packages, features, overheadLines } = ctx
  const { docsType, hasShippedDocs: shippedDocs, pkgFiles, hasIssues, hasDiscussions, hasReleases, hasChangelog } = references
  const { model, force, debug, sections, customPrompt, eject } = run
  const cacheKey = cachePackageName || packageName

  const docFiles = listReferenceFiles(skillDir)
  const hasGithub = hasIssues || hasDiscussions
  const result = await optimizeDocs({
    packageName: cacheKey,
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
    features,
    pkgFiles,
    overheadLines,
    onProgress,
  })

  if (result.wasOptimized) {
    writeGeneratedSkillMd(skillDir, {
      name: packageName,
      version,
      releasedAt: resolved.releasedAt,
      distTags: resolved.distTags,
      body: result.optimized,
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
      features,
      eject,
    })
  }

  return result
}

/**
 * Interactive entry: wraps `runSkillEnhancement` with a clack `taskLog` and
 * surfaces cost/warnings/errors. Use this from interactive sync flows.
 */
export async function enhanceSkillWithLLM(ctx: SkillContext, run: EnhanceRunOptions): Promise<void> {
  const llmLog = p.taskLog({ title: `Agent exploring ${ctx.packageName}`, limit: 3 })
  const { wasOptimized, usage, cost, warnings, error, debugLogsDir } = await runSkillEnhancement(ctx, run, createToolProgress(llmLog))

  if (wasOptimized) {
    const costParts: string[] = []
    if (usage) {
      const totalK = Math.round(usage.totalTokens / 1000)
      costParts.push(`${totalK}k tokens`)
    }
    if (cost)
      costParts.push(`$${cost.toFixed(2)}`)
    const costSuffix = costParts.length > 0 ? ` (${costParts.join(', ')})` : ''
    llmLog.success(`Generated best practices${costSuffix}`)
    if (debugLogsDir)
      p.log.info(`Debug logs: ${relative(process.cwd(), debugLogsDir)}`)
    if (error)
      p.log.warn(`\x1B[33mPartial failure: ${error}\x1B[0m`)
    if (warnings?.length) {
      for (const w of warnings)
        p.log.warn(`\x1B[33m${w}\x1B[0m`)
    }
  }
  else {
    if (error && RATE_LIMIT_RE.test(error))
      llmLog.error(`Rate limited by LLM provider. Try again shortly or use a different model via \`skilld config\``)
    else
      llmLog.error(`Enhancement failed${error ? `: ${error}` : ''}`)
  }
}

/** Per-call options for `writeBaseSkill`. */
export interface BaseSkillOptions {
  /** LLM-generated body inserted between header and footer. */
  body?: string
  /** Label written into frontmatter (`generated_by`); use 'cached' for replays. */
  generatedBy?: string
  /** Eject mode: portable layout with `./references/` paths. */
  eject?: boolean
}

/**
 * Write the SKILL.md for `ctx`. Single seam for the writeGeneratedSkillMd
 * field-bag every sync command was assembling inline.
 *
 * Returns the written content (callers use it for line-count diagnostics).
 */
export function writeBaseSkill(ctx: SkillContext, opts: BaseSkillOptions = {}): string {
  const { packageName, version, skillDir, dirName, references, resolved, relatedSkills, packages, features } = ctx
  return writeGeneratedSkillMd(skillDir, {
    name: packageName,
    version,
    releasedAt: resolved.releasedAt,
    description: resolved.description,
    distTags: resolved.distTags,
    body: opts.body,
    relatedSkills,
    hasIssues: references.hasIssues,
    hasDiscussions: references.hasDiscussions,
    hasReleases: references.hasReleases,
    hasChangelog: references.hasChangelog,
    docsType: references.docsType,
    hasShippedDocs: references.hasShippedDocs,
    pkgFiles: references.pkgFiles,
    generatedBy: opts.generatedBy,
    dirName,
    packages,
    repoUrl: resolved.repoUrl,
    features,
    eject: opts.eject,
  })
}

/**
 * If every section in `sections` has cached LLM output for this package,
 * assemble the body and write SKILL.md with `generated_by: cached`.
 *
 * Returns true when applied. Caller passes `DEFAULT_SECTIONS` (or an override)
 * so the agent layer doesn't need to know about command-layer defaults.
 */
export function applyCachedSections(ctx: SkillContext, sections: SkillSection[], opts: { eject?: boolean } = {}): boolean {
  const cache = createReferenceCache(ctx.cachePackageName || ctx.packageName, ctx.version)
  const allCached = sections.every(s => cache.readSection(SECTION_OUTPUT_FILES[s]) !== null)
  if (!allCached)
    return false

  const parts: string[] = []
  for (const s of SECTION_MERGE_ORDER) {
    if (!sections.includes(s))
      continue
    const content = cache.readSection(SECTION_OUTPUT_FILES[s])
    if (content)
      parts.push(wrapSection(s, content))
  }
  writeBaseSkill(ctx, { body: parts.join('\n\n'), generatedBy: 'cached', eject: opts.eject })
  return true
}

/**
 * Build and write PROMPT_*.md files for manual LLM use.
 * Returns the list of sections that had prompts written.
 */
export function writePromptFiles(ctx: SkillContext, run: PromptRunOptions): SkillSection[] {
  const { packageName, version, skillDir, references, features, overheadLines } = ctx
  const { sections, customPrompt } = run
  const docFiles = listReferenceFiles(skillDir)
  const prompts = buildAllSectionPrompts({
    packageName,
    skillDir,
    version,
    hasIssues: references.hasIssues,
    hasDiscussions: references.hasDiscussions,
    hasReleases: references.hasReleases,
    hasChangelog: references.hasChangelog,
    docFiles,
    docsType: references.docsType,
    hasShippedDocs: references.hasShippedDocs,
    pkgFiles: references.pkgFiles,
    customPrompt,
    features,
    overheadLines,
    sections,
  })

  const skilldDir = skillInternalDir(skillDir)
  mkdirSync(skilldDir, { recursive: true })

  for (const [section, prompt] of prompts)
    writeFileSync(join(skilldDir, `PROMPT_${section}.md`), prompt)

  const written = [...prompts.keys()]
  if (written.length > 0) {
    const relDir = relative(process.cwd(), skillDir)
    const promptFiles = written.map(s => `PROMPT_${s}.md`).join(', ')
    const outputFileList = written.map(s => SECTION_OUTPUT_FILES[s]).join(', ')
    p.log.info(`Prompt files written to ${relDir}/.skilld/\n\x1B[2m\x1B[3m  Read each prompt file (${promptFiles}) in ${relDir}/.skilld/, read the\n  referenced files, then write your output to the matching file (${outputFileList}).\n  When done, run: skilld assemble\x1B[0m`)
  }

  return written
}
