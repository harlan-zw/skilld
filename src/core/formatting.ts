import type { SearchSnippet } from '../retriv'
import type { SkillInfo } from './lockfile'
import type { ProjectState, SkillEntry } from './skills'

export function formatSkillLine(skill: SkillEntry): string {
  const info = skill.info
  const isSkilld = info?.generator === 'skilld'
  const icon = isSkilld ? '◆' : info ? '○' : '✗'
  const parts = [icon, skill.name]

  if (info?.version) parts.push(`\x1B[90m@${info.version}\x1B[0m`)
  if (info?.source && isSkilld) {
    let src = info.source
    if (src.includes('github.com')) src = src.replace(/https?:\/\/github\.com\//, '')
    else if (src.includes('llms.txt')) src = 'llms.txt'
    parts.push(`\x1B[90m(${src})\x1B[0m`)
  }

  return `    ${parts.join(' ')}`
}

export function formatSkillLineSimple(skill: string, info: SkillInfo | null): string {
  const isSkilld = info?.generator === 'skilld'
  const icon = isSkilld ? '◆' : info ? '○' : '✗'
  const parts = [icon, skill]

  if (info?.version) parts.push(`\x1B[90m@${info.version}\x1B[0m`)
  if (info?.source && isSkilld) {
    let src = info.source
    if (src.includes('github.com')) src = src.replace(/https?:\/\/github\.com\//, '')
    else if (src.includes('llms.txt')) src = 'llms.txt'
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

export function formatSnippet(r: SearchSnippet): void {
  const refPath = `.claude/skills/${r.package}/references/${r.source}`
  console.log(`${r.package} | ${refPath}:${r.line}`)
  console.log(`  ${r.content.replace(/\n/g, '\n  ')}`)
  console.log()
}

export function printLegend(): void {
  console.log('\n\x1B[90m◆ skilld · ○ other · ✗ broken\x1B[0m')
}
