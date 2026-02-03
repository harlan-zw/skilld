import type { SearchSnippet } from '../retriv'
import type { SkillInfo } from './lockfile'
import type { ProjectState, SkillEntry } from './skills'

export function formatSkillLine(skill: SkillEntry): string {
  const info = skill.info
  const isShipped = info?.source === 'shipped'
  const isSkilld = info?.generator === 'skilld'
  const icon = isShipped ? '▶' : isSkilld ? '◆' : info ? '○' : '✗'
  const parts = [icon, skill.name]

  if (info?.version)
    parts.push(`\x1B[90m@${info.version}\x1B[0m`)
  if (isShipped && info?.packageName) {
    parts.push(`\x1B[90m(shipped by ${info.packageName})\x1B[0m`)
  }
  else if (info?.source && isSkilld) {
    let src = info.source
    if (src.includes('github.com'))
      src = src.replace(/https?:\/\/github\.com\//, '')
    else if (src.includes('llms.txt'))
      src = 'llms.txt'
    parts.push(`\x1B[90m(${src})\x1B[0m`)
  }

  return `    ${parts.join(' ')}`
}

export function formatSkillLineSimple(skill: string, info: SkillInfo | null): string {
  const isShipped = info?.source === 'shipped'
  const isSkilld = info?.generator === 'skilld'
  const icon = isShipped ? '▶' : isSkilld ? '◆' : info ? '○' : '✗'
  const parts = [icon, skill]

  if (info?.version)
    parts.push(`\x1B[90m@${info.version}\x1B[0m`)
  if (isShipped && info?.packageName) {
    parts.push(`\x1B[90m(shipped by ${info.packageName})\x1B[0m`)
  }
  else if (info?.source && isSkilld) {
    let src = info.source
    if (src.includes('github.com'))
      src = src.replace(/https?:\/\/github\.com\//, '')
    else if (src.includes('llms.txt'))
      src = 'llms.txt'
    parts.push(`\x1B[90m(${src})\x1B[0m`)
  }

  return `    ${parts.join(' ')}`
}

export function formatSkillStatus(state: ProjectState): void {
  const { missing, outdated, synced } = state

  if (synced.length > 0) {
    console.log(`\x1B[32m✓\x1B[0m ${synced.length} synced`)
  }
  if (outdated.length > 0) {
    console.log(`\x1B[33m↻\x1B[0m ${outdated.length} outdated: ${outdated.map(s => s.name).join(', ')}`)
  }
  if (missing.length > 0) {
    console.log(`\x1B[90m○\x1B[0m ${missing.length} missing: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '...' : ''}`)
  }
}

function highlightTerms(content: string, terms: string[]): string {
  if (terms.length === 0)
    return content
  // Sort by length desc to match longer terms first
  const sorted = [...terms].sort((a, b) => b.length - a.length)
  const pattern = new RegExp(`(${sorted.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  return content.replace(pattern, '\x1B[33m$1\x1B[0m')
}

export function formatSnippet(r: SearchSnippet): void {
  const refPath = `.claude/skills/${r.package}/references/${r.source}`
  const lineRange = r.lineStart === r.lineEnd ? `L${r.lineStart}` : `L${r.lineStart}-${r.lineEnd}`
  const score = `\x1B[90m${r.score.toFixed(2)}\x1B[0m`
  console.log(`${r.package} ${score}`)
  console.log(`\x1B[90m${refPath}:${lineRange}\x1B[0m`)
  const highlighted = highlightTerms(r.content, r.highlights)
  console.log(`  ${highlighted.replace(/\n/g, '\n  ')}`)
  console.log()
}

export function printLegend(): void {
  console.log('\n\x1B[90m▶ shipped · ◆ skilld · ○ other · ✗ broken\x1B[0m')
}
