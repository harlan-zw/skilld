#!/usr/bin/env node
import type { AgentType } from './agent'
import type { PackageUsage } from './agent/detect-imports'
import type { ProjectState } from './core'
import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, resolve } from 'node:path'
import * as p from '@clack/prompts'
import { defineCommand, runMain } from 'citty'
import pLimit from 'p-limit'
import { agents, detectImportedPackages, detectInstalledAgents, detectTargetAgent, getAgentVersion, getModelName } from './agent'
import { configCommand, installCommand, removeCommand, runWizard, searchCommand, statusCommand, syncCommand, uninstallCommand } from './commands'
import { getProjectState, hasConfig, isOutdated, readConfig } from './core'
import { fetchLatestVersion, fetchNpmRegistryMeta } from './sources'

// Suppress node:sqlite ExperimentalWarning (loaded lazily by retriv)
const _emit = process.emit
process.emit = (event: string, ...args: any[]) =>
  event === 'warning' && args[0]?.name === 'ExperimentalWarning' && args[0]?.message?.includes('SQLite')
    ? false
    : _emit.apply(process, [event, ...args])

const require = createRequire(import.meta.url)
const { version } = require('../package.json')

// ── Helpers ──

function getRepoHint(name: string, cwd: string): string | undefined {
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

function formatStatus(synced: number, outdated: number): string {
  const parts: string[] = []
  if (synced > 0)
    parts.push(`\x1B[32m${synced} synced\x1B[0m`)
  if (outdated > 0)
    parts.push(`\x1B[33m${outdated} outdated\x1B[0m`)
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
  generators?: Array<{ name: string, version: string }>
  modelId?: string
}

// ── Brand animation ──

const NOISE_CHARS = '⣿⡿⣷⣾⣽⣻⢿⡷⣯⣟⡾⣵⣳⢾⡽⣞⡷⣝⢯'

// Seed hue from cwd so each project gets a consistent color
function djb2(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++)
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h
}

function hueToChannel(p: number, q: number, t: number): number {
  const t1 = t < 0 ? t + 1 : t > 1 ? t - 1 : t
  if (t1 < 1 / 6)
    return p + (q - p) * 6 * t1
  if (t1 < 1 / 2)
    return q
  if (t1 < 2 / 3)
    return p + (q - p) * (2 / 3 - t1) * 6
  return p
}

function hsl(h: number, s: number, l: number): [number, number, number] {
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return [
    Math.round(hueToChannel(p, q, h + 1 / 3) * 255),
    Math.round(hueToChannel(p, q, h) * 255),
    Math.round(hueToChannel(p, q, h - 1 / 3) * 255),
  ]
}

const BRAND_HUE = (djb2(process.cwd()) % 360) / 360

// density 0 = random sparse braille, density 1 = ⣿ (all dots filled)
function noiseChar(brightness: number, density = 0): string {
  if (brightness < 0.08)
    return ' '
  const b = Math.min(brightness, 1)
  const ch = Math.random() < density ? '⣿' : NOISE_CHARS[Math.floor(Math.random() * NOISE_CHARS.length)]
  const [r, g, bl] = hsl(BRAND_HUE, 0.4 + b * 0.15, 0.35 + b * 0.25)
  return `\x1B[38;2;${r};${g};${bl}m${ch}`
}

function noiseLine(len: number, brightnessFn: (x: number) => number, density = 0): string {
  let s = ''
  for (let i = 0; i < len; i++)
    s += noiseChar(brightnessFn(i), density)
  return `${s}\x1B[0m`
}

function brandFrame(t: number, floor = 0, density = 0): string {
  const cx = 5
  const cy = 1
  const brightness = (x: number, y: number) => {
    const d = Math.sqrt((x - cx) ** 2 + ((y - cy) * 3) ** 2)
    let val = 0
    for (let ring = 0; ring < 3; ring++) {
      const rt = t - ring * 0.5
      if (rt <= 0)
        continue
      const front = rt * 4
      const proximity = Math.abs(d - front)
      val += Math.exp(-proximity * proximity * 0.8) * Math.exp(-rt * 0.4)
    }
    const base = Math.max(0, (t - 1.5) * 0.3) * (Math.random() * 0.3 + 0.1)
    return Math.min(1, Math.max(floor, val + base))
  }
  return [
    noiseLine(10, x => brightness(x, 0), density),
    `${noiseLine(2, x => brightness(x, 1), density)} %NAME% ${noiseLine(2, x => brightness(x + 8, 1), density)} %VER%`,
    noiseLine(10, x => brightness(x, 2), density),
  ].join('\n')
}

async function brandLoader<T>(work: () => Promise<T>, minMs = 1500): Promise<T> {
  if (process.env.SKILLD_EFFECT === 'none')
    return work()

  const logUpdate = (await import('log-update')).default
  const name = '\x1B[1m\x1B[38;2;255;255;255mskilld\x1B[0m'
  const ver = `\x1B[2mv${version}\x1B[0m`
  const status = '\x1B[2mSetting up your environment\x1B[0m'
  const start = Date.now()

  const sub = (raw: string) => raw.replace('%NAME%', name).replace('%VER%', ver)

  let done = false
  const result = Promise.all([
    work(),
    new Promise<void>(r => setTimeout(r, minMs)),
  ]).then(([v]) => {
    done = true
    return v
  })

  // Main animation — ripple with status text
  // eslint-disable-next-line no-unmodified-loop-condition -- modified async in .then()
  while (!done) {
    const t = (Date.now() - start) / 1000
    logUpdate(`\n  ${sub(brandFrame(t))}\n\n  ${status}`)
    await new Promise(r => setTimeout(r, 60))
  }

  // Fill outro — ramp floor + density so all dots fill in
  const outroMs = 500
  const outroStart = Date.now()
  const tFinal = (outroStart - start) / 1000
  while (Date.now() - outroStart < outroMs) {
    const p = (Date.now() - outroStart) / outroMs
    const eased = p * p
    logUpdate(`\n  ${sub(brandFrame(tFinal + p * 0.5, eased * 0.9, eased))}\n`)
    await new Promise(r => setTimeout(r, 40))
  }

  // Final frame — all pixels ⣿, full brightness
  logUpdate(`\n  ${sub(brandFrame(tFinal + 1, 0.9, 1))}\n`)
  logUpdate.done()
  return result
}

function introLine({ state, generators, modelId }: IntroOptions): string {
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

/** Get installed LLM generators with working CLIs (verified via --version) */
function getInstalledGenerators(): Array<{ name: string, version: string }> {
  const installed = detectInstalledAgents()
  return installed
    .filter(id => agents[id].cli)
    .map((id) => {
      const version = getAgentVersion(id)
      return version ? { name: agents[id].displayName, version } : null
    })
    .filter((a): a is { name: string, version: string } => a !== null)
}

/** Non-interactive sync for pnpm prepare hook. Syncs outdated skills only, no LLM, exits 0 always. */
async function prepareSync(cwd: string, agentFlag?: AgentType): Promise<void> {
  const agent = resolveAgent(agentFlag)

  if (!agent)
    return

  const state = await getProjectState(cwd)
  if (state.outdated.length === 0) {
    p.log.success('Skills up to date')
    return
  }

  const packages = state.outdated.map(s => s.packageName || s.name)
  await syncCommand(state, {
    packages,
    global: false,
    agent,
    yes: true,
  })
}

/** Resolve agent from flags/cwd/config. cwd is source of truth over config. */
function resolveAgent(agentFlag?: string): AgentType | null {
  return (agentFlag as AgentType | undefined)
    ?? detectTargetAgent()
    ?? (readConfig().agent as AgentType | undefined)
    ?? null
}

// ── Shared args reused by subcommands ──

const sharedArgs = {
  global: {
    type: 'boolean' as const,
    alias: 'g',
    description: 'Install globally to ~/.claude/skills',
    default: false,
  },
  agent: {
    type: 'string' as const,
    alias: 'a',
    description: 'Agent where skills are installed (claude-code, cursor, windsurf, etc.)',
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
}

// ── Subcommands ──

const SUBCOMMAND_NAMES = ['add', 'update', 'status', 'config', 'remove', 'install', 'uninstall', 'search']

const addCommand = defineCommand({
  meta: { name: 'add', description: 'Add skills for package(s)' },
  args: {
    package: {
      type: 'positional',
      description: 'Package(s) to sync, comma-separated (e.g., vue,nuxt,pinia)',
      required: true,
    },
    ...sharedArgs,
  },
  async run({ args }) {
    const cwd = process.cwd()
    const agent = resolveAgent(args.agent)
    if (!agent) {
      p.log.warn('Could not detect agent. Use --agent <name>')
      return
    }

    const state = await getProjectState(cwd)
    p.intro(introLine({ state }))

    const packages = args.package.split(',').map(s => s.trim()).filter(Boolean)
    return syncCommand(state, {
      packages,
      global: args.global,
      agent,
      yes: args.yes,
      force: args.force,
    })
  },
})

const updateSubCommand = defineCommand({
  meta: { name: 'update', description: 'Update outdated skills' },
  args: {
    package: {
      type: 'positional',
      description: 'Package(s) to update, comma-separated. Without args, syncs all outdated.',
      required: false,
    },
    ...sharedArgs,
  },
  async run({ args }) {
    const cwd = process.cwd()
    const agent = resolveAgent(args.agent)
    if (!agent) {
      p.log.warn('Could not detect agent. Use --agent <name>')
      return
    }

    const state = await getProjectState(cwd)
    const generators = getInstalledGenerators()
    const config = readConfig()
    p.intro(introLine({ state, generators, modelId: config.model }))

    // Specific packages
    if (args.package) {
      const packages = args.package.split(',').map(s => s.trim()).filter(Boolean)
      return syncCommand(state, {
        packages,
        global: args.global,
        agent,
        yes: args.yes,
        force: args.force,
      })
    }

    // No args: sync all outdated
    if (state.outdated.length === 0) {
      p.log.success('All skills up to date')
      return
    }

    const packages = state.outdated.map(s => s.packageName || s.name)
    return syncCommand(state, {
      packages,
      global: args.global,
      agent,
      yes: args.yes,
      force: args.force,
    })
  },
})

const statusSubCommand = defineCommand({
  meta: { name: 'status', description: 'Show skill status' },
  args: {
    global: sharedArgs.global,
  },
  run({ args }) {
    return statusCommand({ global: args.global })
  },
})

const configSubCommand = defineCommand({
  meta: { name: 'config', description: 'Edit settings' },
  args: {},
  async run() {
    const cwd = process.cwd()
    const state = await getProjectState(cwd)
    const generators = getInstalledGenerators()
    const config = readConfig()
    p.intro(introLine({ state, generators, modelId: config.model }))
    return configCommand()
  },
})

const removeSubCommand = defineCommand({
  meta: { name: 'remove', description: 'Remove installed skills' },
  args: {
    ...sharedArgs,
  },
  async run({ args }) {
    const cwd = process.cwd()
    const agent = resolveAgent(args.agent)
    if (!agent) {
      p.log.warn('Could not detect agent. Use --agent <name>')
      return
    }

    const state = await getProjectState(cwd)
    const generators = getInstalledGenerators()
    const config = readConfig()
    const scope = args.global ? 'global' : 'project'
    const intro = { state, generators, modelId: config.model }
    p.intro(`${introLine(intro)} · remove (${scope})`)

    return removeCommand(state, {
      global: args.global,
      agent,
      yes: args.yes,
    })
  },
})

const installSubCommand = defineCommand({
  meta: { name: 'install', description: 'Restore references from lockfile' },
  args: {
    global: sharedArgs.global,
    agent: sharedArgs.agent,
  },
  async run({ args }) {
    const agent = resolveAgent(args.agent)
    if (!agent) {
      p.log.warn('Could not detect agent. Use --agent <name>')
      return
    }

    p.intro(`\x1B[1m\x1B[35mskilld\x1B[0m install`)
    return installCommand({ global: args.global, agent })
  },
})

const uninstallSubCommand = defineCommand({
  meta: { name: 'uninstall', description: 'Remove skilld data' },
  args: {
    ...sharedArgs,
  },
  async run({ args }) {
    p.intro(`\x1B[1m\x1B[35mskilld\x1B[0m uninstall`)
    return uninstallCommand({
      scope: args.global ? 'all' : undefined,
      agent: args.agent as AgentType | undefined,
      yes: args.yes,
    })
  },
})

const searchSubCommand = defineCommand({
  meta: { name: 'search', description: 'Search indexed docs' },
  args: {
    query: {
      type: 'positional',
      description: 'Search query (e.g., "useFetch options")',
      required: true,
    },
    package: {
      type: 'string',
      alias: 'p',
      description: 'Filter by package name',
    },
  },
  async run({ args }) {
    return searchCommand(args.query, args.package || undefined)
  },
})

// ── Main command ──

const main = defineCommand({
  meta: {
    name: 'skilld',
    description: 'Sync package documentation for agentic use',
  },
  args: {
    prepare: {
      type: 'boolean',
      description: 'Non-interactive sync for pnpm prepare hook (outdated only, no LLM, always exits 0)',
      default: false,
    },
    background: {
      type: 'boolean',
      alias: 'b',
      description: 'Run --prepare in background (detached process)',
      default: false,
    },
    agent: sharedArgs.agent,
  },
  subCommands: {
    add: addCommand,
    update: updateSubCommand,
    status: statusSubCommand,
    config: configSubCommand,
    remove: removeSubCommand,
    install: installSubCommand,
    uninstall: uninstallSubCommand,
    search: searchSubCommand,
  },
  async run({ args }) {
    // Guard: citty always calls parent run() after subcommand dispatch.
    // If a subcommand was invoked, bail out here.
    const firstArg = process.argv[2]
    if (firstArg && !firstArg.startsWith('-') && SUBCOMMAND_NAMES.includes(firstArg))
      return

    const cwd = process.cwd()

    // Prepare mode — pnpm prepare hook: sync outdated only, no LLM, no prompts, always exit 0
    if (args.prepare) {
      // Background mode: spawn detached process and exit immediately
      if (args.background) {
        const { spawn } = await import('node:child_process')
        const child = spawn(process.execPath, [process.argv[1], '--prepare', ...(args.agent ? ['--agent', args.agent] : [])], {
          cwd,
          detached: true,
          stdio: 'ignore',
        })
        child.unref()
        return
      }
      await prepareSync(cwd, args.agent as AgentType | undefined).catch(() => {})
      return
    }

    // Bare `skilld` — interactive menu
    const currentAgent = resolveAgent(args.agent)

    if (!currentAgent) {
      p.log.warn('Could not detect agent. Use --agent <name> or `skilld config`')
      p.log.info(`Supported: ${Object.keys(agents).join(', ')}`)
      return
    }

    // Animate brand while bootstrapping + check for updates
    const { state, selfUpdate } = await brandLoader(async () => {
      const config = readConfig()
      const state = await getProjectState(cwd)

      // Run self-update check + unmatched skills NPM check in parallel
      let selfUpdate = null as { latest: string, releasedAt?: string } | null
      const tasks: Promise<void>[] = []

      // Check if skilld itself has a newer version (skip for npx/dlx/bunx)
      const isEphemeral = process.env.npm_command === 'exec'
      if (!isEphemeral) {
        tasks.push(
          fetchNpmRegistryMeta('skilld', version).then((meta) => {
            const latestTag = meta.distTags?.latest
            if (latestTag && latestTag.version !== version)
              selfUpdate = { latest: latestTag.version, releasedAt: latestTag.releasedAt }
          }).catch(() => {}),
        )
      }

      // For skills not in local deps, check NPM for version updates
      if (state.unmatched.length > 0) {
        const limit = pLimit(5)
        tasks.push(
          Promise.all(state.unmatched.map(skill => limit(async () => {
            const pkgName = skill.info?.packageName || skill.name
            const latest = await fetchLatestVersion(pkgName)
            if (latest && isOutdated(skill, latest)) {
              state.outdated.push({ ...skill, packageName: pkgName, latestVersion: latest })
            }
            else if (latest) {
              state.synced.push({ ...skill, packageName: pkgName, latestVersion: latest })
            }
          }))).then(() => {}),
        )
      }

      await Promise.all(tasks)
      return { config, state, selfUpdate }
    })

    // Show self-update notification
    if (selfUpdate) {
      const released = selfUpdate.releasedAt ? `\x1B[90m · ${relativeTime(new Date(selfUpdate.releasedAt))}\x1B[0m` : ''
      const binPath = realpathSync(process.argv[1])
      const isLocal = binPath.startsWith(resolve(cwd, 'node_modules'))
      const flag = isLocal ? '' : ' -g'
      const cmd = `npx nypm add${flag} skilld@${selfUpdate.latest}`
      p.note(
        `\x1B[90m${version}\x1B[0m → \x1B[1m\x1B[32m${selfUpdate.latest}\x1B[0m${released}\n\x1B[36m${cmd}\x1B[0m`,
        '\x1B[33mUpdate available\x1B[0m',
      )
    }

    // First time setup - no skills yet
    if (state.skills.length === 0) {
      if (!hasConfig()) {
        await runWizard()
      }

      // Transition to project setup
      const pkgJsonPath = join(cwd, 'package.json')
      const projectName = existsSync(pkgJsonPath)
        ? JSON.parse(readFileSync(pkgJsonPath, 'utf-8')).name
        : undefined
      const projectLabel = projectName
        ? `Generating skills for \x1B[36m${projectName}\x1B[0m`
        : 'Generating skills for current directory'
      p.log.step(projectLabel)
      p.log.info('Tip: Only generate skills for packages your agent struggles with.\n     The fewer skills, the more context you have for everything else :)')

      const source = await p.select({
        message: 'How should I find packages?',
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
        let usages: PackageUsage[]
        if (source === 'imports') {
          const spinner = p.spinner()
          spinner.start('Scanning imports...')
          const result = await detectImportedPackages(cwd)
          spinner.stop(`Found ${result.packages.length} imported packages`)

          if (result.packages.length === 0) {
            p.log.warn('No imports found, falling back to package.json')
            usages = [...state.deps.keys()].map(name => ({ name, count: 0 }))
          }
          else {
            // Filter to packages in deps (presets pass through even if not in deps)
            const depSet = new Set(state.deps.keys())
            usages = result.packages.filter(pkg => depSet.has(pkg.name) || pkg.source === 'preset')

            if (usages.length === 0) {
              p.log.warn('No matching dependencies, using all imports')
              usages = result.packages
            }
          }
        }
        else {
          usages = [...state.deps.keys()].map(name => ({ name, count: 0 }))
        }

        // Let user select which packages
        const packages = usages.map(u => u.name)
        const sourceMap = new Map(usages.map(u => [u.name, u.source]))
        const maxLen = Math.max(...packages.map(n => n.length))
        const choice = await p.multiselect({
          message: `Select packages (${packages.length} found)`,
          options: packages.map((name) => {
            const ver = state.deps.get(name)?.replace(/^[\^~>=<]/, '') || ''
            const repo = getRepoHint(name, cwd)
            const hint = sourceMap.get(name) === 'preset' ? 'nuxt module' : undefined
            const pad = ' '.repeat(maxLen - name.length + 2)
            const meta = [ver, hint, repo].filter(Boolean).join('  ')
            return { label: meta ? `${name}${pad}\x1B[90m${meta}\x1B[39m` : name, value: name }
          }),
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
        global: false,
        agent: currentAgent,
        yes: false,
      })
    }

    // Has skills - show status + interactive menu
    const status = formatStatus(state.synced.length, state.outdated.length)
    p.log.info(status)

    // Menu loop — Escape in sub-actions returns to menu

    while (true) {
      type ActionValue = 'install' | 'update' | 'remove' | 'status' | 'config'
      const options: Array<{ label: string, value: ActionValue, hint?: string }> = []

      options.push({ label: 'Add new skills', value: 'install' })
      if (state.outdated.length > 0) {
        options.push({ label: 'Update skills', value: 'update', hint: `\x1B[33m${state.outdated.length} outdated\x1B[0m` })
      }
      options.push(
        { label: 'Remove skills', value: 'remove' },
        { label: 'Status', value: 'status' },
        { label: 'Configure', value: 'config' },
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
          const installedNames = new Set(state.skills.map(s => s.packageName || s.name))
          const uninstalledDeps = [...state.deps.keys()].filter(d => !installedNames.has(d))
          const allDepsInstalled = uninstalledDeps.length === 0

          const source = await p.select({
            message: 'How should I find packages?',
            options: [
              { label: 'Scan source files', value: 'imports' as const, hint: allDepsInstalled ? 'all installed' : 'find actually used imports', disabled: allDepsInstalled },
              { label: 'Use package.json', value: 'deps' as const, hint: allDepsInstalled ? 'all installed' : `${uninstalledDeps.length} uninstalled`, disabled: allDepsInstalled },
              { label: 'Enter manually', value: 'manual' as const },
            ],
          })

          if (p.isCancel(source))
            continue

          let selected: string[]

          if (source === 'manual') {
            const input = await p.text({
              message: 'Enter package names (comma-separated)',
              placeholder: 'vue, nuxt, pinia',
            })
            if (p.isCancel(input) || !input)
              continue
            selected = input.split(',').map(s => s.trim()).filter(Boolean)
            if (selected.length === 0)
              continue
          }
          else {
            let usages: PackageUsage[]
            if (source === 'imports') {
              const spinner = p.spinner()
              spinner.start('Scanning imports...')
              const result = await detectImportedPackages(cwd)
              spinner.stop(`Found ${result.packages.length} imported packages`)

              if (result.packages.length === 0) {
                p.log.warn('No imports found, falling back to package.json')
                usages = uninstalledDeps.map(name => ({ name, count: 0 }))
              }
              else {
                const depSet = new Set(state.deps.keys())
                usages = result.packages
                  .filter(pkg => depSet.has(pkg.name) || pkg.source === 'preset')
                  .filter(pkg => !installedNames.has(pkg.name))

                if (usages.length === 0) {
                  p.log.warn('All detected imports already have skills')
                  continue
                }
              }
            }
            else {
              usages = uninstalledDeps.map(name => ({ name, count: 0 }))
            }

            const packages = usages.map(u => u.name)
            const sourceMap = new Map(usages.map(u => [u.name, u.source]))
            const maxLen = Math.max(...packages.map(n => n.length))
            const choice = await p.multiselect({
              message: `Select packages (${packages.length} found)`,
              options: packages.map((name) => {
                const ver = state.deps.get(name)?.replace(/^[\^~>=<]/, '') || ''
                const repo = getRepoHint(name, cwd)
                const hint = sourceMap.get(name) === 'preset' ? 'nuxt module' : undefined
                const pad = ' '.repeat(maxLen - name.length + 2)
                const meta = [ver, hint, repo].filter(Boolean).join('  ')
                return { label: meta ? `${name}${pad}\x1B[90m${meta}\x1B[39m` : name, value: name }
              }),
              initialValues: packages,
            })

            if (p.isCancel(choice) || choice.length === 0)
              continue
            selected = choice
          }

          return syncCommand(state, {
            packages: selected,
            global: false,
            agent: currentAgent,
            yes: false,
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
          if (p.isCancel(selected) || selected.length === 0)
            continue
          return syncCommand(state, {
            packages: selected,
            global: false,
            agent: currentAgent,
            yes: false,
          })
        }
        case 'remove':
          await removeCommand(state, {
            global: false,
            agent: currentAgent,
            yes: false,
          })
          continue
        case 'status':
          await statusCommand({ global: false })
          continue
        case 'config':
          await configCommand()
          continue
      }
    }
  },
})

runMain(main)
