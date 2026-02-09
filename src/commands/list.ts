import { iterateSkills } from '../core/skills'

export interface ListOptions {
  global?: boolean
  json?: boolean
}

interface ListEntry {
  name: string
  version: string
  source: string
  synced: string
}

function formatSource(source?: string): string {
  if (!source)
    return ''
  if (source === 'shipped')
    return 'shipped'
  if (source.includes('llms.txt'))
    return 'llms.txt'
  if (source.includes('github.com'))
    return source.replace(/https?:\/\/github\.com\//, '')
  return source
}

function timeAgo(iso?: string): string {
  if (!iso)
    return ''
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days <= 0)
    return 'today'
  if (days === 1)
    return '1d ago'
  if (days < 7)
    return `${days}d ago`
  if (days < 30)
    return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export function listCommand(opts: ListOptions = {}): void {
  const scope = opts.global ? 'global' : 'all'
  const skills = [...iterateSkills({ scope })]

  // Deduplicate by package identity
  const seen = new Set<string>()
  const entries: ListEntry[] = []

  for (const skill of skills) {
    const key = skill.info?.packageName || skill.name
    if (seen.has(key))
      continue
    seen.add(key)
    entries.push({
      name: skill.name,
      version: skill.info?.version || '',
      source: formatSource(skill.info?.source),
      synced: timeAgo(skill.info?.syncedAt),
    })
  }

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(entries)}\n`)
    return
  }

  if (entries.length === 0) {
    process.stdout.write('No skills installed\n')
    return
  }

  // Column widths
  const nameW = Math.max(...entries.map(e => e.name.length))
  const verW = Math.max(...entries.map(e => e.version.length))
  const srcW = Math.max(...entries.map(e => e.source.length))

  for (const e of entries) {
    const line = [
      e.name.padEnd(nameW),
      e.version.padEnd(verW),
      e.source.padEnd(srcW),
      e.synced,
    ].join('  ')
    process.stdout.write(`${line}\n`)
  }
}
