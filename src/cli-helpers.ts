/**
 * Shared CLI helpers used by subcommand definitions and the main CLI entry.
 * Extracted to avoid circular deps between cli.ts and commands/*.ts.
 */

import type { AgentType, OptimizeModel } from './agent'
import type { ProjectState } from './core/skills'
import { existsSync, readFileSync } from 'node:fs'
import * as p from '@clack/prompts'
import { join } from 'pathe'
import { detectCurrentAgent } from 'unagent/env'
import { agents, detectInstalledAgents, detectTargetAgent, getAgentVersion, getModelName } from './agent'
import { readConfig, updateConfig } from './core/config'
import { version } from './version'

export type { AgentType, OptimizeModel }

export interface IntroOptions {
  state: ProjectState
  generators?: Array<{ name: string, version: string }>
  modelId?: string
}

export const sharedArgs = {
  global: {
    type: 'boolean' as const,
    alias: 'g',
    description: 'Install globally to ~/.skilld/skills',
    default: false,
  },
  agent: {
    type: 'enum' as const,
    options: Object.keys(agents),
    alias: 'a',
    description: 'Agent where skills are installed',
  },
  model: {
    type: 'string' as const,
    alias: 'm',
    description: 'LLM model for skill generation',
    valueHint: 'id',
  },
  yes: {
    type: 'boolean' as const,
    alias: 'y',
    description: 'Skip prompts, use defaults',
    default: false,
  },
  force: {
    type: 'boolean' as const,
    alias: 'f',
    description: 'Ignore all caches, re-fetch docs and regenerate',
    default: false,
  },
  debug: {
    type: 'boolean' as const,
    description: 'Save raw LLM output to logs/ for each section',
    default: false,
  },
}

/** Check if the current environment supports interactive prompts */
export function isInteractive(): boolean {
  if (detectCurrentAgent())
    return false
  if (process.env.CI)
    return false
  if (!process.stdout.isTTY)
    return false
  return true
}

/** Exit with error if interactive terminal is required but unavailable */
export function requireInteractive(command: string): void {
  if (!isInteractive()) {
    console.error(`Error: \`skilld ${command}\` requires an interactive terminal`)
    process.exit(1)
  }
}

/** Resolve agent from flags/cwd/config. cwd is source of truth over config. */
export function resolveAgent(agentFlag?: string): AgentType | null {
  return (agentFlag as AgentType | undefined)
    ?? detectTargetAgent()
    ?? (readConfig().agent as AgentType | undefined)
    ?? null
}

/** Prompt user to pick an agent when auto-detection fails */
export async function promptForAgent(): Promise<AgentType | null> {
  const installed = detectInstalledAgents()

  // Non-interactive: auto-select sole installed agent or error
  if (!isInteractive()) {
    if (installed.length === 1) {
      updateConfig({ agent: installed[0] })
      return installed[0]!
    }
    console.error('Error: could not auto-detect agent. Pass --agent <name> to specify.')
    process.exit(1)
  }

  const options = (installed.length ? installed : Object.keys(agents) as AgentType[])
    .map(id => ({ label: agents[id].displayName, value: id, hint: agents[id].skillsDir }))

  const hint = installed.length
    ? `Detected ${installed.map(t => agents[t].displayName).join(', ')} but couldn't determine which to use`
    : 'No agents auto-detected'

  p.log.warn(`Could not detect which coding agent to install skills for.\n  ${hint}`)

  const choice = await p.select({
    message: 'Which coding agent should skills be installed for?',
    options,
  })

  if (p.isCancel(choice))
    return null

  // Save as default so they don't get asked again
  updateConfig({ agent: choice })
  p.log.success(`Default agent set to ${agents[choice].displayName}`)
  return choice
}

/** Get installed LLM generators with working CLIs (verified via --version) */
export function getInstalledGenerators(): Array<{ name: string, version: string }> {
  const installed = detectInstalledAgents()
  return installed
    .filter(id => agents[id].cli)
    .map((id) => {
      const ver = getAgentVersion(id)
      return ver ? { name: agents[id].displayName, version: ver } : null
    })
    .filter((a): a is { name: string, version: string } => a !== null)
}

export function relativeTime(date: Date): string {
  const now = Date.now()
  const diff = now - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1)
    return 'just now'
  if (mins < 60)
    return `${mins}m ago`
  if (hours < 24)
    return `${hours}h ago`
  return `${days}d ago`
}

export function getLastSynced(state: ProjectState): string | null {
  let latest: Date | null = null
  for (const skill of state.skills) {
    if (skill.info?.syncedAt) {
      const d = new Date(skill.info.syncedAt)
      if (!latest || d > latest)
        latest = d
    }
  }
  return latest ? relativeTime(latest) : null
}

export function introLine({ state, generators, modelId }: IntroOptions): string {
  const name = '\x1B[1m\x1B[35mskilld\x1B[0m'
  const ver = `\x1B[90mv${version}\x1B[0m`
  const lastSynced = getLastSynced(state)
  const synced = lastSynced ? ` · \x1B[90msynced ${lastSynced}\x1B[0m` : ''
  const modelStr = modelId ? ` · ${getModelName(modelId as any)}` : ''
  const genStr = generators?.length
    ? generators.map(g => `${g.name} v${g.version}`).join(', ')
    : ''
  const genLine = genStr ? `\n\x1B[90m↳ ${genStr}${modelStr}\x1B[0m` : ''
  return `${name} ${ver}${synced}${genLine}`
}

export function formatStatus(synced: number, outdated: number): string {
  const parts: string[] = []
  if (synced > 0)
    parts.push(`\x1B[32m${synced} synced\x1B[0m`)
  if (outdated > 0)
    parts.push(`\x1B[33m${outdated} outdated\x1B[0m`)
  return `Skills: ${parts.join(' · ')}`
}

export function getRepoHint(name: string, cwd: string): string | undefined {
  const pkgJsonPath = join(cwd, 'node_modules', name, 'package.json')
  if (!existsSync(pkgJsonPath))
    return undefined
  const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'))
  const url = typeof pkg.repository === 'string'
    ? pkg.repository
    : pkg.repository?.url
  if (!url)
    return undefined
  return url
    .replace(/^git\+/, '')
    .replace(/\.git$/, '')
    .replace(/^git:\/\//, 'https://')
    .replace(/^ssh:\/\/git@github\.com/, 'https://github.com')
    .replace(/^https?:\/\/(www\.)?github\.com\//, '')
}
