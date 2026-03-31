import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { multiselect } from '@clack/prompts'
import { defineCommand } from 'citty'
import { colorize } from 'consola/utils'
import { ofetch } from 'ofetch'
import { join } from 'pathe'
import { readLock } from '../core/lockfile.ts'
import { parseFrontmatter } from '../core/markdown.ts'

const UPLOAD_URL = 'https://skilld.dev/api/collections/import'

interface DiscoveredSkill {
  name: string
  description?: string
  version?: string
  repo?: string
  generator?: string
  source: 'local' | 'global' | 'plugin'
}

function readSkillsFromDir(dir: string, source: 'local' | 'global', extraLockDirs?: string[]): DiscoveredSkill[] {
  if (!existsSync(dir))
    return []

  // Merge lockfiles: primary dir + any extra dirs (e.g. ~/.skilld/skills/ for global)
  let lock = readLock(dir)
  if (!lock && extraLockDirs) {
    for (const d of extraLockDirs) {
      lock = readLock(d)
      if (lock)
        break
    }
  }
  const entries = readdirSync(dir).filter((f) => {
    if (f.startsWith('.') || f.endsWith('.yaml') || f.endsWith('.yml'))
      return false
    const full = join(dir, f)
    return statSync(full).isDirectory()
  })

  const skills: DiscoveredSkill[] = []
  for (const dirName of entries) {
    const skillMd = join(dir, dirName, 'SKILL.md')
    if (!existsSync(skillMd))
      continue
    const content = readFileSync(skillMd, 'utf-8')
    const fm = parseFrontmatter(content)
    const lockInfo = lock?.skills[dirName]
    skills.push({
      name: fm.name || dirName,
      description: fm.description,
      version: fm.version || lockInfo?.version,
      repo: lockInfo?.repo,
      generator: lockInfo?.generator,
      source,
    })
  }

  return skills
}

interface MarketplaceInfo {
  source: { source: string, repo: string }
}

function readPlugins(configDir: string): DiscoveredSkill[] {
  const settingsPath = join(configDir, 'settings.json')
  if (!existsSync(settingsPath))
    return []

  const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'))
  const enabledPlugins = settings.enabledPlugins as Record<string, boolean> | undefined
  if (!enabledPlugins)
    return []

  // Load marketplace repos for GitHub links
  const marketplacesPath = join(configDir, 'plugins', 'known_marketplaces.json')
  const marketplaces: Record<string, MarketplaceInfo> = existsSync(marketplacesPath)
    ? JSON.parse(readFileSync(marketplacesPath, 'utf-8'))
    : {}

  // Load installed plugins for version info
  const installedPath = join(configDir, 'plugins', 'installed_plugins.json')
  const installed: { plugins: Record<string, Array<{ version?: string }>> } = existsSync(installedPath)
    ? JSON.parse(readFileSync(installedPath, 'utf-8'))
    : { plugins: {} }

  return Object.entries(enabledPlugins)
    .filter(([, enabled]) => enabled)
    .map(([id]) => {
      const marketplace = id.split('@')[1]
      const pluginName = id.split('@')[0]
      const marketplaceInfo = marketplace ? marketplaces[marketplace] : undefined
      const repo = marketplaceInfo?.source?.repo
      const versions = installed.plugins[id]
      const version = versions?.[0]?.version !== 'unknown' ? versions?.[0]?.version : undefined

      return {
        name: pluginName!,
        version,
        repo: repo ? `${repo}` : undefined,
        source: 'plugin' as const,
      }
    })
}

function discoverAllSkills(cwd: string): DiscoveredSkill[] {
  const claudeHome = process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude')
  const localDir = join(cwd, '.claude', 'skills')
  const globalDir = join(claudeHome, 'skills')

  const skilldGlobalDir = join(homedir(), '.skilld', 'skills')
  const local = readSkillsFromDir(localDir, 'local')
  const global = readSkillsFromDir(globalDir, 'global', [skilldGlobalDir])
  const plugins = readPlugins(claudeHome)

  // Filter out skilld-generated skills, deduplicate by repo
  const seenRepos = new Set<string>()
  const all: DiscoveredSkill[] = []
  for (const skill of [...local, ...global, ...plugins]) {
    if (!skill.repo || seenRepos.has(skill.repo))
      continue
    if (skill.generator === 'skilld')
      continue
    seenRepos.add(skill.repo)
    all.push(skill)
  }
  return all
}

const SOURCE_COLORS: Record<string, string> = {
  local: 'green',
  global: 'blue',
  plugin: 'magenta',
}

export async function uploadCommand(options?: { dryRun?: boolean }): Promise<void> {
  const skills = discoverAllSkills(process.cwd())

  if (skills.length === 0) {
    process.stdout.write('No skills found.\n')
    return
  }

  if (options?.dryRun) {
    process.stdout.write(`Found ${colorize('bold', String(skills.length))} skill${skills.length === 1 ? '' : 's'}:\n\n`)
    for (const skill of skills) {
      const version = skill.version ? colorize('dim', ` v${skill.version}`) : ''
      const tag = colorize((SOURCE_COLORS[skill.source] || 'dim') as 'dim', skill.source)
      const repo = skill.repo ? colorize('dim', ` github.com/${skill.repo}`) : ''
      process.stdout.write(`  ${colorize('cyan', skill.name)}${version} ${tag}${repo}\n`)
    }
    process.stdout.write(`\n${colorize('dim', 'Dry run complete. No requests were made.')}\n`)
    return
  }

  const selected = await multiselect({
    message: `Select skills to upload (${skills.length} found)`,
    options: skills.map((s) => {
      const version = s.version ? ` v${s.version}` : ''
      const repo = s.repo ? ` github.com/${s.repo}` : ''
      return {
        value: s.name,
        label: `${s.name}${version}`,
        hint: `${s.source}${repo}`,
      }
    }),
    initialValues: [],
  })

  if (typeof selected === 'symbol' || selected.length === 0)
    return

  const selectedSet = new Set(selected)
  const payload = skills
    .filter(s => selectedSet.has(s.name))
    .map(s => ({
      name: s.name,
      version: s.version,
      repo: s.repo,
      source: s.source,
    }))

  const { token, expires } = await ofetch<{ token: string, expires: string }>(UPLOAD_URL, {
    method: 'POST',
    body: { skills: payload },
  })

  const expiresDate = new Date(expires)
  const minutesLeft = Math.round((expiresDate.getTime() - Date.now()) / 60000)

  process.stdout.write(`\nToken: ${colorize('green', token)}\n\n`)
  process.stdout.write(`Paste this token at: ${colorize('cyan', 'https://skilld.dev/people/YOUR_HANDLE/edit-skills')}\n`)
  process.stdout.write(colorize('dim', `Token expires in ${minutesLeft} minutes.\n`))
}

export const uploadCommandDef = defineCommand({
  meta: { name: 'publish', description: 'Publish your skill list to skilld.dev' },
  args: {
    dryRun: {
      type: 'boolean',
      alias: 'd',
      description: 'Show what would be uploaded without making any requests',
      default: false,
    },
  },
  run({ args }) {
    return uploadCommand({ dryRun: args.dryRun })
  },
})
