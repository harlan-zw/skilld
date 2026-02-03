#!/usr/bin/env node
import type { AgentType } from './agent'
import type { ProjectState } from './core'
import { createRequire } from 'node:module'
import * as p from '@clack/prompts'
import { defineCommand, runMain } from 'citty'
import { agents, detectCurrentAgent, detectImportedPackages, detectInstalledAgents, getAgentVersion, getModelName } from './agent'
import { configCommand, installCommand, listCommand, removeCommand, searchCommand, syncCommand, uninstallCommand } from './commands'
import { getProjectState, readConfig } from './core'

const require = createRequire(import.meta.url)
const { version } = require('../package.json')

function formatStatus(synced: number, outdated: number, missing: number): string {
  const parts: string[] = []
  if (synced > 0)
    parts.push(`\x1B[32m${synced} synced\x1B[0m`)
  if (outdated > 0)
    parts.push(`\x1B[33m${outdated} outdated\x1B[0m`)
  if (missing > 0)
    parts.push(`\x1B[90m${missing} missing\x1B[0m`)
  return `Skills: ${parts.join(' · ')}`
}

function relativeTime(date: Date): string {
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

function getLastSynced(state: ProjectState): string | null {
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

interface IntroOptions {
  state: ProjectState
  availableAgents?: Array<{ name: string, version: string }>
  modelId?: string
}

function introLine({ state, availableAgents, modelId }: IntroOptions): string {
  const name = '\x1B[1m\x1B[35mskilld\x1B[0m'
  const ver = `\x1B[90mv${version}\x1B[0m`
  const lastSynced = getLastSynced(state)
  const synced = lastSynced ? ` · \x1B[90msynced ${lastSynced}\x1B[0m` : ''
  const modelStr = modelId ? ` · ${getModelName(modelId as any)}` : ''
  const agentStr = availableAgents?.length
    ? availableAgents.map(a => `${a.name} v${a.version}`).join(', ')
    : ''
  const agentLine = agentStr ? `\n\x1B[90m↳ ${agentStr}${modelStr}\x1B[0m` : ''
  return `${name} ${ver}${synced}${agentLine}`
}

/** Get installed agents with working CLIs (verified via --version) */
function getAvailableAgentsWithVersion(): Array<{ name: string, version: string }> {
  const installed = detectInstalledAgents()
  return installed
    .filter(id => agents[id].cli)
    .map((id) => {
      const version = getAgentVersion(id)
      return version ? { name: agents[id].displayName, version } : null
    })
    .filter((a): a is { name: string, version: string } => a !== null)
}

const main = defineCommand({
  meta: {
    name: 'skilld',
    description: 'Sync package documentation for agentic use',
  },
  args: {
    package: {
      type: 'positional',
      description: 'Package(s) to sync, comma-separated (e.g., vue,nuxt,pinia)',
      required: false,
    },
    query: {
      type: 'string',
      alias: 'q',
      description: 'Search docs: skilld nuxt -q "useFetch options"',
    },
    global: {
      type: 'boolean',
      alias: 'g',
      description: 'Install globally to ~/.claude/skills',
      default: false,
    },
    agent: {
      type: 'string',
      alias: 'a',
      description: 'Target specific agent (claude-code, cursor, windsurf, etc.)',
    },
    yes: {
      type: 'boolean',
      alias: 'y',
      description: 'Skip prompts, use defaults',
      default: false,
    },
  },
  async run({ args }) {
    const cwd = process.cwd()

    // Search mode
    if (args.query) {
      await searchCommand(args.query, args.package || undefined)
      return
    }

    // List command
    if (args.package === 'list') {
      return listCommand({ global: args.global })
    }

    // Uninstall command - remove skilld data by scope
    if (args.package === 'uninstall') {
      p.intro(`\x1B[1m\x1B[35mskilld\x1B[0m uninstall`)
      return uninstallCommand({
        scope: args.global ? 'all' : undefined,
        agent: args.agent as AgentType | undefined,
        yes: args.yes,
      })
    }

    // Install command - restore references from lockfile
    if (args.package === 'install') {
      const config = readConfig()
      const currentAgent = (args.agent as AgentType | undefined)
        ?? (config.agent as AgentType | undefined)
        ?? detectCurrentAgent()

      if (!currentAgent) {
        p.log.warn('Could not detect agent. Use --agent <name>')
        return
      }

      p.intro(`\x1B[1m\x1B[35mskilld\x1B[0m install`)
      return installCommand({ global: args.global, agent: currentAgent })
    }

    // Detect agent (CLI flag > config > auto-detect)
    const config = readConfig()
    const currentAgent = (args.agent as AgentType | undefined)
      ?? (config.agent as AgentType | undefined)
      ?? detectCurrentAgent()

    if (!currentAgent) {
      p.log.warn('Could not detect agent. Use --agent <name> or `skilld config`')
      p.log.info(`Supported: ${Object.keys(agents).join(', ')}`)
      return
    }

    const state = await getProjectState(cwd)
    const availableAgents = getAvailableAgentsWithVersion()

    const intro = { state, availableAgents, modelId: config.model }

    // Config command
    if (args.package === 'config') {
      p.intro(introLine(intro))
      return configCommand()
    }

    // Remove command
    if (args.package === 'remove') {
      const scope = args.global ? 'global' : 'project'
      p.intro(`${introLine(intro)} · remove (${scope})`)
      return removeCommand(state, {
        global: args.global,
        agent: currentAgent,
        yes: args.yes,
      })
    }

    p.intro(introLine(intro))

    // Explicit package(s) → sync directly
    // Support comma-separated: skilld vue,nuxt,pinia
    if (args.package) {
      const packages = args.package.split(',').map(s => s.trim()).filter(Boolean)
      return syncCommand(state, {
        packages,
        global: args.global,
        agent: currentAgent,
        yes: args.yes,
      })
    }

    // Show status
    const status = formatStatus(state.synced.length, state.outdated.length, state.missing.length)

    // First time setup - no skills yet
    if (state.skills.length === 0) {
      // Setup wizard
      p.log.info('Expert knowledge from versioned docs, source code & GitHub issues')

      const source = await p.select({
        message: 'How should I find packages that need skills?',
        options: [
          { label: 'Scan source files', value: 'imports', hint: 'Find actually used imports' },
          { label: 'Use package.json', value: 'deps', hint: `All ${state.deps.size} dependencies` },
          { label: 'Enter manually', value: 'manual' },
        ],
      })

      if (p.isCancel(source)) {
        p.cancel('Setup cancelled')
        return
      }

      // Get packages based on source
      let selected: string[]

      if (source === 'manual') {
        const input = await p.text({
          message: 'Enter package names (comma-separated)',
          placeholder: 'vue, nuxt, pinia',
        })
        if (p.isCancel(input) || !input) {
          p.cancel('No packages entered')
          return
        }
        selected = input.split(',').map(s => s.trim()).filter(Boolean)
      }
      else {
        let packages: string[]
        if (source === 'imports') {
          const spinner = p.spinner()
          spinner.start('Scanning imports...')
          const result = await detectImportedPackages(cwd)
          spinner.stop(`Found ${result.packages.length} imported packages`)

          if (result.packages.length === 0) {
            p.log.warn('No imports found, falling back to package.json')
            packages = [...state.deps.keys()]
          }
          else {
            // Filter to packages in deps
            const depSet = new Set(state.deps.keys())
            packages = result.packages
              .filter(pkg => depSet.has(pkg.name))
              .map(pkg => pkg.name)

            if (packages.length === 0) {
              p.log.warn('No matching dependencies, using all imports')
              packages = result.packages.map(pkg => pkg.name)
            }
          }
        }
        else {
          packages = [...state.deps.keys()]
        }

        // Let user select which packages
        const choice = await p.multiselect({
          message: `Select packages (${packages.length} found)`,
          options: packages.map(name => ({ label: name, value: name })),
          initialValues: packages,
        })

        if (p.isCancel(choice) || choice.length === 0) {
          p.cancel('No packages selected')
          return
        }
        selected = choice
      }

      // syncCommand will ask about LLM after generating base skills
      return syncCommand(state, {
        packages: selected,
        global: args.global,
        agent: currentAgent,
        yes: args.yes,
      })
    }

    // Has skills - show status
    p.log.info(status)

    // Build dynamic menu
    type ActionValue = 'install' | 'update' | 'regenerate' | 'remove' | 'search' | 'list' | 'config'
    const options: Array<{ label: string, value: ActionValue, hint?: string }> = []

    if (state.outdated.length > 0) {
      options.push({ label: 'Update outdated', value: 'update', hint: `\x1B[33m${state.outdated.length} outdated\x1B[0m` })
    }
    if (state.missing.length > 0) {
      options.push({ label: 'Install new', value: 'install', hint: `${state.missing.length} packages` })
    }
    if (state.synced.length > 0) {
      options.push({ label: 'Regenerate SKILL.md', value: 'regenerate', hint: `${state.synced.length} installed` })
    }
    options.push(
      { label: 'Uninstall skills', value: 'remove' },
      { label: 'Search docs', value: 'search' },
      { label: 'List installed', value: 'list' },
      { label: 'Settings', value: 'config' },
    )

    const action = await p.select({
      message: 'What would you like to do?',
      options,
    })

    if (p.isCancel(action)) {
      p.cancel('Cancelled')
      return
    }

    switch (action) {
      case 'install': {
        const selected = await p.multiselect({
          message: 'Select packages to install',
          options: state.missing.map(name => ({
            label: name,
            value: name,
          })),
          initialValues: state.missing,
        })
        if (p.isCancel(selected) || selected.length === 0) {
          p.cancel('Cancelled')
          return
        }
        return syncCommand(state, {
          packages: selected,
          global: args.global,
          agent: currentAgent,
          yes: args.yes,
        })
      }
      case 'update': {
        if (state.outdated.length === 0) {
          p.log.success('All skills up to date')
          return
        }
        const selected = await p.multiselect({
          message: 'Select packages to update',
          options: state.outdated.map(s => ({
            label: s.name,
            value: s.packageName || s.name,
            hint: `${s.info?.version ?? 'unknown'} → ${s.latestVersion}`,
          })),
          initialValues: state.outdated.map(s => s.packageName || s.name),
        })
        if (p.isCancel(selected) || selected.length === 0) {
          p.cancel('Cancelled')
          return
        }
        return syncCommand(state, {
          packages: selected,
          global: args.global,
          agent: currentAgent,
          yes: args.yes,
        })
      }
      case 'regenerate': {
        const selected = await p.multiselect({
          message: 'Select skills to regenerate',
          options: state.synced.map(s => ({
            label: s.name,
            value: s.packageName || s.name,
            hint: s.info?.version,
          })),
        })
        if (p.isCancel(selected) || selected.length === 0) {
          p.cancel('Cancelled')
          return
        }
        return syncCommand(state, {
          packages: selected,
          global: args.global,
          agent: currentAgent,
          yes: args.yes,
        })
      }
      case 'remove':
        return removeCommand(state, {
          global: args.global,
          agent: currentAgent,
          yes: args.yes,
        })
      case 'search': {
        const query = await p.text({ message: 'Search query:' })
        if (p.isCancel(query) || !query)
          return
        return searchCommand(query)
      }
      case 'list':
        return listCommand({ global: args.global })
      case 'config':
        return configCommand()
    }
  },
})

runMain(main)
