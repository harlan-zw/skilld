/**
 * Sequential clack-based `SyncUi` strategy. Used by single-package sync flows
 * (sync-single, sync-git docs fallback). Composes:
 *   - `timedSpinner` for the resolve / fetch / index phases
 *   - `taskLog` for the LLM enhancement phase (multi-line stream)
 *   - `p.log.*` for status messages
 */

import type { StreamProgress } from '../agent/index.ts'
import type { SyncUi } from './sync-runner.ts'
import * as p from '@clack/prompts'
import { relative } from 'pathe'
import { timedSpinner } from '../core/formatting.ts'

export interface ClackUiOptions {
  /** Used to resolve `debugLogsDir` against — typically `process.cwd()`. */
  cwd: string
}

/**
 * Build a sequential UI bound to a fresh spinner/taskLog set. Each call
 * returns a new UI; do not share between concurrent syncs.
 */
export function createClackUi({ cwd }: ClackUiOptions): SyncUi {
  // Spinner is reused across resolve → fetch → index phases. We create it
  // lazily on first use and stop it at each phase boundary.
  let spinner: ReturnType<typeof timedSpinner> | null = null
  let resourceSpinner: ReturnType<typeof timedSpinner> | null = null
  let indexSpinner: ReturnType<typeof timedSpinner> | null = null
  let llmLog: ReturnType<typeof p.taskLog> | null = null
  let currentSpec = ''

  return {
    resolveStart(spec) {
      currentSpec = spec
      spinner = timedSpinner()
      spinner.start(`Resolving ${spec}`)
    },
    resolveProgress(msg) {
      spinner?.message(msg)
    },
    resolveDone(version, opts) {
      const suffix = opts.force ? ' (force)' : opts.cached ? ' (cached)' : ''
      spinner?.stop(`Resolved ${currentSpec}@${version}${suffix}`)
      spinner = null
    },
    resolveFailed(identityName) {
      spinner?.stop(`Could not find docs for: ${identityName}`)
      spinner = null
    },
    downloadingDist() {
      spinner?.message('Downloading dist')
    },
    fetchStart() {
      resourceSpinner = timedSpinner()
      resourceSpinner.start('Finding resources')
    },
    fetchProgress(msg) {
      resourceSpinner?.message(msg)
    },
    fetchDone(parts, cached) {
      const summary = parts.length > 0 ? parts.join(', ') : 'resources'
      resourceSpinner?.stop(cached ? `Loaded ${summary} (cached)` : `Fetched ${summary}`)
      resourceSpinner = null
    },
    indexStart() {
      indexSpinner = timedSpinner()
      indexSpinner.start('Creating search index')
    },
    indexProgress(msg) {
      indexSpinner?.message(msg)
    },
    indexDone() {
      indexSpinner?.stop('Search index ready')
      indexSpinner = null
    },
    warn(msg) {
      p.log.warn(`\x1B[33m${msg}\x1B[0m`)
    },
    baseDone(relPath, mode) {
      p.log.success(mode === 'update' ? `Updated skill: ${relPath}` : `Created base skill: ${relPath}`)
    },
    sectionsCached() {
      p.log.success('Applied cached SKILL.md sections')
    },
    llmStart(modelLabel) {
      p.log.step(modelLabel)
      llmLog = p.taskLog({ title: `Agent exploring ${currentSpec}`, limit: 3 })
    },
    llmProgress(progress: StreamProgress) {
      if (!llmLog)
        return
      // Mirror the line format `enhanceSkillWithLLM` previously used: prefer
      // the chunk text when it's a hint marker `[...]`, otherwise show model.
      const sectionPrefix = progress.section ? `[${progress.section}] ` : ''
      const line = progress.chunk.startsWith('[') ? `${sectionPrefix}${progress.chunk}` : `${sectionPrefix}${progress.chunk}`
      llmLog.message(line)
    },
    llmDone(info) {
      if (!llmLog)
        return
      const parts: string[] = []
      if (info.usage)
        parts.push(`${Math.round(info.usage.totalTokens / 1000)}k tokens`)
      if (info.cost)
        parts.push(`$${info.cost.toFixed(2)}`)
      const suffix = parts.length > 0 ? ` (${parts.join(', ')})` : ''
      llmLog.success(`Generated best practices${suffix}`)
      llmLog = null
      if (info.debugLogsDir)
        p.log.info(`Debug logs: ${relative(cwd, info.debugLogsDir)}`)
      if (info.error)
        p.log.warn(`\x1B[33mPartial failure: ${info.error}\x1B[0m`)
      if (info.warnings) {
        for (const w of info.warnings)
          p.log.warn(`\x1B[33m${w}\x1B[0m`)
      }
    },
    llmFailed(error, opts) {
      if (!llmLog)
        return
      if (opts.rateLimited)
        llmLog.error(`Rate limited by LLM provider. Try again shortly or use a different model via \`skilld config\``)
      else
        llmLog.error(`Enhancement failed${error ? `: ${error}` : ''}`)
      llmLog = null
    },
    shippedInstalled(skillName, relPath) {
      p.log.success(`Using published SKILL.md: ${skillName} → ${relPath}`)
    },
  }
}
