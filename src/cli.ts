#!/usr/bin/env node
import type { PackageUsage } from './agent/detect-imports.ts'
import { existsSync, readFileSync, realpathSync } from 'node:fs'
import * as p from '@clack/prompts'
import { defineCommand, runMain } from 'citty'
import pLimit from 'p-limit'
import { join, resolve } from 'pathe'
import { detectImportedPackages } from './agent/index.ts'
import { formatStatus, getRepoHint, isInteractive, promptForAgent, relativeTime, resolveAgent, sharedArgs } from './cli-helpers.ts'
import { configCommand, interactiveSearch, removeCommand, runWizard, statusCommand, syncCommand } from './commands/index.ts'
import { timedSpinner } from './core/formatting.ts'
import { getProjectState, hasCompletedWizard, isOutdated, readConfig } from './core/index.ts'
import { fetchLatestVersion, fetchNpmRegistryMeta } from './sources/index.ts'

import { version } from './version.ts'

// Suppress node:sqlite ExperimentalWarning (loaded lazily by retriv)
const _emit = process.emit
process.emit = (event: string, ...args: any[]) =>
  event === 'warning' && args[0]?.name === 'ExperimentalWarning' && args[0]?.message?.includes('SQLite')
    ? false
    : _emit.apply(process, [event, ...args])

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

// ── Subcommands (lazy-loaded) ──

const SUBCOMMAND_NAMES = ['add', 'update', 'info', 'list', 'config', 'remove', 'install', 'uninstall', 'search', 'cache']

// ── Main command ──

const main = defineCommand({
  meta: {
    name: 'skilld',
    version,
    description: 'Sync package documentation for agentic use',
  },
  args: {
    agent: sharedArgs.agent,
  },
  subCommands: {
    add: () => import('./commands/sync.ts').then(m => m.addCommandDef),
    update: () => import('./commands/sync.ts').then(m => m.updateCommandDef),
    info: () => import('./commands/status.ts').then(m => m.infoCommandDef),
    list: () => import('./commands/list.ts').then(m => m.listCommandDef),
    config: () => import('./commands/config.ts').then(m => m.configCommandDef),
    remove: () => import('./commands/remove.ts').then(m => m.removeCommandDef),
    install: () => import('./commands/install.ts').then(m => m.installCommandDef),
    uninstall: () => import('./commands/uninstall.ts').then(m => m.uninstallCommandDef),
    search: () => import('./commands/search.ts').then(m => m.searchCommandDef),
    cache: () => import('./commands/cache.ts').then(m => m.cacheCommandDef),
  },
  async run({ args }) {
    // Guard: citty always calls parent run() after subcommand dispatch.
    // If a subcommand was invoked, bail out here.
    const firstArg = process.argv[2]
    if (firstArg && !firstArg.startsWith('-') && SUBCOMMAND_NAMES.includes(firstArg))
      return

    const cwd = process.cwd()

    // Bare `skilld` — interactive menu (requires TTY)
    if (!isInteractive()) {
      const state = await getProjectState(cwd)
      const status = formatStatus(state.synced.length, state.outdated.length)
      console.log(`skilld v${version} · ${status}`)
      return
    }

    let currentAgent = resolveAgent(args.agent)

    if (!currentAgent) {
      currentAgent = await promptForAgent()
      if (!currentAgent)
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
      if (!hasCompletedWizard()) {
        await runWizard()
      }

      // Transition to project setup
      const pkgJsonPath = join(cwd, 'package.json')
      const hasPkgJson = existsSync(pkgJsonPath)
      const projectName = hasPkgJson
        ? JSON.parse(readFileSync(pkgJsonPath, 'utf-8')).name
        : undefined
      const projectLabel = projectName
        ? `Generating skills for \x1B[36m${projectName}\x1B[0m`
        : 'Generating skills for current directory'
      p.log.step(projectLabel)

      if (!hasPkgJson) {
        p.log.warn('No package.json found — enter package names manually or run inside a project')
      }

      p.log.info('Tip: Only generate skills for packages your agent struggles with.\n     The fewer skills, the more context you have for everything else :)')

      // Initial setup loop — allow user to go back
      let setupComplete = false
      while (!setupComplete) {
        const source = hasPkgJson
          ? await p.select({
              message: 'How should I find packages?',
              options: [
                { label: 'Scan source files', value: 'imports', hint: 'Find actually used imports' },
                { label: 'Use package.json', value: 'deps', hint: `All ${state.deps.size} dependencies` },
                { label: 'Enter manually', value: 'manual' },
              ],
            })
          : 'manual' as const

        if (p.isCancel(source)) {
          p.cancel('Setup cancelled')
          return
        }

        // Get packages based on source
        let selected: string[]

        if (source === 'manual') {
          const input = await p.text({
            message: 'Enter package names (space or comma-separated)',
            placeholder: 'vue nuxt pinia',
          })
          if (p.isCancel(input)) {
            if (!hasPkgJson) {
              p.cancel('Setup cancelled')
              return
            }
            continue
          }
          if (!input) {
            p.log.warn('No packages entered')
            continue
          }
          selected = input.split(/[,\s]+/).map(s => s.trim()).filter(Boolean)
          if (selected.length === 0) {
            p.log.warn('No valid packages entered')
            continue
          }
        }
        else {
          let usages: PackageUsage[]
          if (source === 'imports') {
            const spinner = timedSpinner()
            spinner.start('Scanning imports...')
            const result = await detectImportedPackages(cwd)

            if (result.packages.length === 0) {
              spinner.stop('No imports found, falling back to package.json')
              usages = [...state.deps.keys()].map(name => ({ name, count: 0 }))
            }
            else {
              const depSet = new Set(state.deps.keys())
              usages = result.packages.filter(pkg => depSet.has(pkg.name) || pkg.source === 'preset')

              if (usages.length === 0) {
                spinner.stop(`Found ${result.packages.length} imported packages but none match dependencies`)
                usages = result.packages
              }
              else {
                spinner.stop(`Found ${usages.length} imported packages`)
              }
            }
          }
          else {
            usages = [...state.deps.keys()].map(name => ({ name, count: 0 }))
          }

          // Let user select which packages
          const packages = usages.map(u => u.name)
          if (packages.length === 0) {
            p.log.warn('No packages found')
            continue
          }
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

          if (p.isCancel(choice)) {
            continue
          }
          if (choice.length === 0) {
            p.log.warn('No packages selected')
            continue
          }
          selected = choice
        }

        // syncCommand will ask about LLM after generating base skills
        await syncCommand(state, {
          packages: selected,
          global: false,
          agent: currentAgent,
          yes: false,
        })
        setupComplete = true
      }
      return
    }

    // Has skills - show status + interactive menu
    const status = formatStatus(state.synced.length, state.outdated.length)
    p.log.info(status)

    // Menu loop — Escape in sub-actions returns to menu

    while (true) {
      type ActionValue = 'install' | 'update' | 'remove' | 'search' | 'info' | 'config'
      const options: Array<{ label: string, value: ActionValue, hint?: string }> = []

      options.push({ label: 'Add new skills', value: 'install' })
      if (state.outdated.length > 0) {
        options.push({ label: 'Update skills', value: 'update', hint: `\x1B[33m${state.outdated.length} outdated\x1B[0m` })
      }
      options.push(
        { label: 'Remove skills', value: 'remove' },
        { label: 'Search docs', value: 'search' },
        { label: 'Info', value: 'info' },
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
          const hasPkgJsonMenu = existsSync(join(cwd, 'package.json'))

          const source = hasPkgJsonMenu
            ? await p.select({
                message: 'How should I find packages?',
                options: [
                  { label: 'Scan source files', value: 'imports' as const, hint: allDepsInstalled ? 'all installed' : 'find actually used imports', disabled: allDepsInstalled },
                  { label: 'Use package.json', value: 'deps' as const, hint: allDepsInstalled ? 'all installed' : `${uninstalledDeps.length} uninstalled`, disabled: allDepsInstalled },
                  { label: 'Enter manually', value: 'manual' as const },
                ],
              })
            : 'manual' as const

          if (p.isCancel(source))
            continue

          let selected: string[]

          if (source === 'manual') {
            const input = await p.text({
              message: 'Enter package names (space or comma-separated)',
              placeholder: 'vue nuxt pinia',
            })
            if (p.isCancel(input) || !input)
              continue
            selected = input.split(/[,\s]+/).map(s => s.trim()).filter(Boolean)
            if (selected.length === 0)
              continue
          }
          else {
            let usages: PackageUsage[]
            if (source === 'imports') {
              const spinner = timedSpinner()
              spinner.start('Scanning imports...')
              const result = await detectImportedPackages(cwd)

              if (result.packages.length === 0) {
                spinner.stop('No imports found, falling back to package.json')
                usages = uninstalledDeps.map(name => ({ name, count: 0 }))
              }
              else {
                const depSet = new Set(state.deps.keys())
                usages = result.packages
                  .filter(pkg => depSet.has(pkg.name) || pkg.source === 'preset')
                  .filter(pkg => !installedNames.has(pkg.name))

                if (usages.length === 0) {
                  spinner.stop('All detected imports already have skills')
                  continue
                }
                else {
                  spinner.stop(`Found ${usages.length} imported packages`)
                }
              }
            }
            else {
              usages = uninstalledDeps.map(name => ({ name, count: 0 }))
            }

            const packages = usages.map(u => u.name)
            if (packages.length === 0) {
              p.log.warn('No packages found')
              continue
            }
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
        case 'search': {
          await interactiveSearch()
          continue
        }
        case 'info':
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
