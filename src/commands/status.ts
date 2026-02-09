import type { AgentType } from '../agent'
import type { SkillInfo } from '../core/lockfile'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import * as p from '@clack/prompts'
import { join } from 'pathe'
import { agents, getAgentVersion } from '../agent'
import { CACHE_DIR, getPackageDbPath } from '../cache'
import { getCacheDir } from '../cache/version'
import { defaultFeatures, hasConfig, readConfig } from '../core/config'
import { parsePackages } from '../core/lockfile'
import { iterateSkills } from '../core/skills'

const require = createRequire(import.meta.url)
const { version: skilldVersion } = require('../package.json')

export interface StatusOptions {
  global?: boolean
}

interface TrackedPackage {
  name: string
  info: SkillInfo
  agents: Set<AgentType>
  scope: 'local' | 'global'
}

function countDocs(packageName: string, version?: string): number {
  if (!version)
    return 0
  const cacheDir = getCacheDir(packageName, version)
  if (!existsSync(cacheDir))
    return 0
  let count = 0
  const walk = (dir: string, depth = 0) => {
    if (depth > 3)
      return
    try {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === 'search.db')
          continue
        if (entry.isDirectory())
          walk(join(dir, entry.name), depth + 1)
        else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))
          count++
      }
    }
    catch {}
  }
  walk(cacheDir)
  return count
}

function countEmbeddings(packageName: string, version?: string): number | null {
  if (!version)
    return null
  const dbPath = getPackageDbPath(packageName, version)
  if (!existsSync(dbPath))
    return null
  try {
    const { DatabaseSync } = require('node:sqlite')
    const db = new DatabaseSync(dbPath, { open: true, readOnly: true })
    const row = db.prepare('SELECT count(*) as cnt FROM vector_metadata').get() as { cnt: number } | undefined
    db.close()
    return row?.cnt ?? null
  }
  catch {
    return null
  }
}

function countRefDocs(skillDir: string): number {
  const refsDir = join(skillDir, '.skilld')
  if (!existsSync(refsDir))
    return 0
  let count = 0
  const walk = (dir: string, depth = 0) => {
    if (depth > 3)
      return
    try {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory() || entry.isSymbolicLink()) {
          try {
            const stat = statSync(join(dir, entry.name))
            if (stat.isDirectory())
              walk(join(dir, entry.name), depth + 1)
          }
          catch { continue }
        }
        else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
          count++
        }
      }
    }
    catch {}
  }
  walk(refsDir)
  return count
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

// dim helper
const dim = (s: string) => `\x1B[90m${s}\x1B[0m`
const bold = (s: string) => `\x1B[1m${s}\x1B[0m`
const green = (s: string) => `\x1B[32m${s}\x1B[0m`

function getLastSynced(): string | null {
  let latest: Date | null = null
  for (const skill of iterateSkills()) {
    if (skill.info?.syncedAt) {
      const d = new Date(skill.info.syncedAt)
      if (!latest || d > latest)
        latest = d
    }
  }
  if (!latest)
    return null
  return timeAgo(latest.toISOString())
}

function buildConfigLines(): string[] {
  const config = readConfig()
  const lines: string[] = []

  lines.push(`Version   v${skilldVersion}`)
  const lastSynced = getLastSynced()
  if (lastSynced)
    lines.push(`Synced    ${dim(lastSynced)}`)
  lines.push(`Config    ${dim(join(CACHE_DIR, 'config.yaml'))}${hasConfig() ? '' : dim(' (not created)')}`)
  lines.push(`Cache     ${dim(CACHE_DIR)}`)

  const withCli = Object.entries(agents).filter(([_, a]) => a.cli) as [AgentType, typeof agents[AgentType]][]
  const installed: string[] = []
  for (const [id, agent] of withCli) {
    const ver = getAgentVersion(id)
    if (ver)
      installed.push(`${agent.displayName} v${ver}`)
  }
  if (installed.length > 0)
    lines.push(`Agents    ${installed.join(', ')}`)

  if (config.model)
    lines.push(`Model     ${config.model}`)

  const features = { ...defaultFeatures, ...config.features }
  const parts = Object.entries(features).map(([k, v]) => `${k}: ${v ? green('on') : dim('off')}`)
  lines.push(`Features  ${parts.join(', ')}`)

  if (config.projects?.length)
    lines.push(`Projects  ${config.projects.length} registered`)

  return lines
}

export function statusCommand(opts: StatusOptions = {}): void {
  const allSkills = [...iterateSkills({ scope: opts.global ? 'global' : 'all' })]

  // Config section
  p.log.step(bold('Skilld Config'))
  p.log.message(buildConfigLines().join('\n'))

  if (allSkills.length === 0) {
    p.log.step(bold('Skills'))
    p.log.message(`${dim('(none)')}\n\nRun ${bold('skilld add <package>')} to install skills`)
    return
  }

  // Deduplicate by package identity, grouped by scope
  const localPkgs = new Map<string, TrackedPackage>()
  const globalPkgs = new Map<string, TrackedPackage>()

  for (const skill of allSkills) {
    const key = skill.info?.packageName || skill.name
    const map = skill.scope === 'local' ? localPkgs : globalPkgs

    if (!map.has(key)) {
      map.set(key, {
        name: skill.name,
        info: skill.info || {},
        agents: new Set([skill.agent]),
        scope: skill.scope,
      })
    }
    else {
      map.get(key)!.agents.add(skill.agent)
    }
  }

  const buildPackageLines = (pkgs: Map<string, TrackedPackage>): string[] => {
    const lines: string[] = []
    for (const [, pkg] of pkgs) {
      const { info } = pkg
      const isShipped = info.source === 'shipped'
      const icon = isShipped ? '▶' : '◆'

      const pkgsList = parsePackages(info.packages)
      const nameDisplay = pkgsList.length > 1
        ? `${pkg.name} ${dim(`(${pkgsList.map(p => p.name).join(', ')})`)}`
        : pkg.name
      const parts = [`${icon} ${bold(nameDisplay)}`]
      if (info.version)
        parts.push(dim(info.version))
      const source = formatSource(info.source)
      if (source && source !== 'shipped')
        parts.push(dim(source))

      lines.push(parts.join('  '))

      const meta: string[] = []
      const pkgName = info.packageName || pkg.name
      const docs = countDocs(pkgName, info.version) || countRefDocs(join(
        pkg.scope === 'global'
          ? agents[pkg.agents.values().next().value!].globalSkillsDir!
          : join(process.cwd(), agents[pkg.agents.values().next().value!].skillsDir),
        pkg.name,
      ))
      if (docs > 0)
        meta.push(`${docs} docs`)

      const embeddings = countEmbeddings(pkgName, info.version)
      if (embeddings !== null)
        meta.push(`${embeddings} chunks`)

      const ago = timeAgo(info.syncedAt)
      if (ago)
        meta.push(`synced ${ago}`)

      if (pkg.agents.size > 0) {
        const agentNames = [...pkg.agents].map(a => agents[a].displayName)
        meta.push(agentNames.join(', '))
      }

      if (meta.length > 0)
        lines.push(`  ${dim(meta.join(' · '))}`)
    }
    return lines
  }

  if (!opts.global && localPkgs.size > 0) {
    p.log.step(`${bold('Local')} (project)`)
    p.log.message(buildPackageLines(localPkgs).join('\n'))
  }

  if (globalPkgs.size > 0) {
    p.log.step(bold('Global'))
    p.log.message(buildPackageLines(globalPkgs).join('\n'))
  }

  if (!opts.global && localPkgs.size === 0) {
    p.log.step(`${bold('Local')} (project)`)
    p.log.message(dim('(none)'))
  }

  const total = localPkgs.size + globalPkgs.size
  p.log.info(`${total} package${total !== 1 ? 's' : ''}`)
}
