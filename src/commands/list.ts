import { defineCommand } from 'citty'
import { sharedArgs } from '../cli-helpers.ts'
import { formatSource, timeAgo } from '../core/formatting.ts'
import { iterateSkills } from '../core/skills.ts'

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

export const listCommandDef = defineCommand({
  meta: { name: 'list', description: 'List installed skills' },
  args: {
    global: sharedArgs.global,
    json: {
      type: 'boolean' as const,
      description: 'Output as JSON',
      default: false,
    },
  },
  run({ args }) {
    return listCommand({ global: args.global, json: args.json })
  },
})
