import type { SearchSnippet } from '../retriv'
import type { ProjectState } from './skills'
import * as p from '@clack/prompts'

export function formatDuration(ms: number): string {
  if (ms < 1000)
    return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

/** Spinner wrapper that appends elapsed time in dim text on stop */
export function timedSpinner() {
  const spin = p.spinner()
  let startTime = 0
  return {
    start(msg: string) {
      startTime = performance.now()
      spin.start(msg)
    },
    message(msg: string) {
      spin.message(msg)
    },
    stop(msg: string) {
      const elapsed = performance.now() - startTime
      spin.stop(`${msg} \x1B[90m(${formatDuration(elapsed)})\x1B[0m`)
    },
  }
}

export function formatSkillStatus(state: ProjectState): void {
  const { missing, outdated, synced } = state

  if (synced.length > 0)
    p.log.success(`${synced.length} synced`)
  if (outdated.length > 0)
    p.log.warn(`${outdated.length} outdated: ${outdated.map(s => s.name).join(', ')}`)
  if (missing.length > 0)
    p.log.info(`${missing.length} missing: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '...' : ''}`)
}

export function highlightTerms(content: string, terms: string[]): string {
  if (terms.length === 0)
    return content
  // Sort by length desc to match longer terms first
  const sorted = [...terms].sort((a, b) => b.length - a.length)
  const pattern = new RegExp(`(${sorted.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  return content.replace(pattern, '\x1B[33m$1\x1B[0m')
}

export function formatSnippet(r: SearchSnippet): string {
  const refPath = `.claude/skills/${r.package}/.skilld/${r.source}`
  const lineRange = r.lineStart === r.lineEnd ? `L${r.lineStart}` : `L${r.lineStart}-${r.lineEnd}`
  const score = `\x1B[90m${r.score.toFixed(2)}\x1B[0m`

  const scopeStr = r.scope?.length ? `${r.scope.map(e => e.name).join('.')} → ` : ''
  const entityStr = r.entities?.map(e => e.signature || `${e.type} ${e.name}`).join(', ')
  const highlighted = highlightTerms(r.content, r.highlights)

  return [
    `${r.package} ${score}${entityStr ? `  \x1B[36m${scopeStr}${entityStr}\x1B[0m` : ''}`,
    `\x1B[90m${refPath}:${lineRange}\x1B[0m`,
    `  ${highlighted.replace(/\n/g, '\n  ')}`,
  ].join('\n')
}

/** Compact 2-line format for interactive search list */
export function formatCompactSnippet(r: SearchSnippet, cols: number): { title: string, path: string, preview: string } {
  const entityStr = r.entities?.length
    ? r.entities.map(e => e.signature || e.name).join(', ')
    : ''
  const scopeStr = r.scope?.length ? `${r.scope.map(e => e.name).join('.')} → ` : ''
  const title = entityStr ? `${scopeStr}${entityStr}` : r.source.split('/').pop() || r.source

  const refPath = `.claude/skills/${r.package}/.skilld/${r.source}`
  const lineRange = r.lineStart === r.lineEnd ? `L${r.lineStart}` : `L${r.lineStart}-${r.lineEnd}`
  const path = `${refPath}:${lineRange}`

  // First meaningful line as preview (skip empty, frontmatter delimiters, headings-only)
  const maxPreview = cols - 6
  const firstLine = r.content.split('\n').find(l => l.trim() && l.trim() !== '---' && !/^#+\s*$/.test(l.trim())) || ''
  const preview = firstLine.length > maxPreview ? `${firstLine.slice(0, maxPreview - 1)}…` : firstLine

  return { title, path, preview }
}
