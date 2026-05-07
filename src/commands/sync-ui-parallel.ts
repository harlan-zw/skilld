/**
 * Parallel `SyncUi` strategy. Many packages render concurrently into a
 * single `logUpdate` table. Each package gets its own `SyncUi` instance
 * bound to its slot in a shared state map; the runner doesn't know it's
 * one of N — it just calls UI methods, which mutate state and re-render.
 *
 * Status taxonomy:
 *   pending → resolving → downloading → embedding → done
 *                                    ↘ exploring/thinking/generating (LLM)
 *                                    ↘ error
 */

import type { SyncUi } from './sync-runner.ts'
import logUpdate from 'log-update'
import { formatDuration } from '../core/formatting.ts'

export type PackageStatus = 'pending' | 'resolving' | 'downloading' | 'embedding' | 'exploring' | 'thinking' | 'generating' | 'done' | 'error'

export interface PackageState {
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
  exploring: '\x1B[34m',
  thinking: '\x1B[35m',
  generating: '\x1B[33m',
  done: '\x1B[32m',
  error: '\x1B[31m',
}

export interface ParallelRender {
  states: Map<string, PackageState>
  /** Header verb — "Syncing" / "Updating". */
  verb: string
  /** Total packages (so progress shows "k/N done"). */
  total: number
}

/** Render the entire packages table in one logUpdate frame. */
export function renderParallel(r: ParallelRender): void {
  const maxNameLen = Math.max(...[...r.states.keys()].map(n => n.length), 20)
  const lines = [...r.states.values()].map((s) => {
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

  const doneCount = [...r.states.values()].filter(s => s.status === 'done').length
  const errorCount = [...r.states.values()].filter(s => s.status === 'error').length
  const header = `\x1B[1m${r.verb} ${r.total} packages\x1B[0m (${doneCount} done${errorCount > 0 ? `, ${errorCount} failed` : ''})\n`

  logUpdate(header + lines.join('\n'))
}

/**
 * Build a `SyncUi` bound to one package's slot. UI methods mutate that slot
 * and trigger a full re-render via `render`.
 */
export function createParallelUi(name: string, render: ParallelRender, version?: string): SyncUi {
  const state = render.states.get(name)
  if (!state)
    throw new Error(`createParallelUi: no state slot for "${name}"`)

  function update(status: PackageStatus, message: string, ver?: string): void {
    if (!state!.startedAt && status !== 'pending')
      state!.startedAt = performance.now()
    if ((status === 'done' || status === 'error') && !state!.completedAt)
      state!.completedAt = performance.now()
    state!.status = status
    state!.message = message
    state!.streamPreview = undefined
    if (ver)
      state!.version = ver
    renderParallel(render)
  }

  if (version)
    state.version = version

  return {
    resolveStart() {
      update('resolving', 'Resolving...')
    },
    resolveProgress(msg) {
      update('resolving', msg)
    },
    resolveDone(ver, opts) {
      // Parallel UI doesn't print a per-step "Resolved" line — the version
      // chip on the row already conveys it. Move into the next phase
      // immediately, mirroring `useCache` vs fresh-fetch labels.
      update('downloading', opts.cached ? 'Using cache' : opts.force ? 'Re-fetching docs...' : 'Fetching docs...', ver)
    },
    resolveFailed(_identityName) {
      // No-op; the runner returns `unresolved` and the frontend will set
      // an `error` state with the actual reason.
    },
    downloadingDist() {
      update('downloading', 'Downloading dist...')
    },
    fetchStart() {
      // Already in 'downloading' status from resolveDone; no transition.
    },
    fetchProgress(msg) {
      update('downloading', msg)
    },
    fetchDone(_parts, _cached) {
      update('downloading', 'Linking references...')
    },
    indexStart() {
      update('embedding', 'Indexing docs')
    },
    indexProgress(msg) {
      update('embedding', msg)
    },
    indexDone() {
      // Stay in 'embedding' until the base-skill write moves us to 'done'.
    },
    warn(_msg) {
      // Warnings are surfaced after the parallel render completes (frontend
      // collects from resources.warnings).
    },
    baseDone(_relPath, mode) {
      update('done', mode === 'update' ? 'Skill updated' : 'Base skill created')
    },
    sectionsCached() {
      // Frontend logs the aggregate "Applied cached for X, Y, Z" line.
    },
    llmStart(modelLabel) {
      update('generating', modelLabel)
    },
    llmProgress(progress) {
      const isReasoning = progress.type === 'reasoning'
      const status: PackageStatus = isReasoning ? 'exploring' : 'generating'
      const sectionPrefix = progress.section ? `[${progress.section}] ` : ''
      const label = progress.chunk.startsWith('[') ? `${sectionPrefix}${progress.chunk}` : `${sectionPrefix}${progress.chunk}`
      update(status, label)
    },
    llmDone(_info) {
      update('done', 'Skill optimized')
    },
    llmFailed(error, _opts) {
      update('error', error)
    },
    shippedInstalled(_skillName, _relPath) {
      update('done', 'Published SKILL.md')
    },
  }
}
