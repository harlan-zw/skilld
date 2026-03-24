/**
 * Prepare command — lightweight hook for package.json "prepare" script.
 *
 * Designed to run on every `pnpm install` / `npm install`. Blocking, fast, no LLM calls.
 * 1. Restore broken symlinks from lockfile (like `install` but skips doc fetching)
 * 2. Auto-install shipped skills from deps (just symlinks + lockfile writes)
 * 3. Report outdated skills count and suggest `skilld update`
 */

import type { SkillInfo } from '../core/lockfile.ts'
import { existsSync, mkdirSync, symlinkSync } from 'node:fs'
import * as p from '@clack/prompts'
import { defineCommand } from 'citty'
import { join } from 'pathe'
import { agents, linkSkillToAgents } from '../agent/index.ts'
import { getShippedSkills, linkShippedSkill, resolvePkgDir } from '../cache/index.ts'
import { resolveAgent } from '../cli-helpers.ts'
import { mergeLocks, readLock, writeLock } from '../core/lockfile.ts'
import { getSharedSkillsDir } from '../core/shared.ts'
import { getProjectState } from '../core/skills.ts'

export const prepareCommandDef = defineCommand({
  meta: { name: 'prepare', description: 'Restore references and sync shipped skills (for package.json hooks)' },
  args: {
    agent: {
      type: 'enum' as const,
      options: Object.keys(agents),
      alias: 'a',
      description: 'Target agent',
    },
  },
  async run({ args }) {
    const cwd = process.cwd()

    const agent = resolveAgent(args.agent)
    if (!agent || agent === 'none')
      return

    const agentConfig = agents[agent]
    const shared = getSharedSkillsDir(cwd)
    const skillsDir = shared || join(cwd, agentConfig.skillsDir)

    // ── 1. Restore broken symlinks from lockfile ──

    const allSkillsDirs = shared
      ? [shared]
      : Object.values(agents).map(t => join(cwd, t.skillsDir))
    const allLocks = allSkillsDirs
      .map(dir => readLock(dir))
      .filter((l): l is NonNullable<typeof l> => !!l && Object.keys(l.skills).length > 0)

    if (allLocks.length > 0) {
      const lock = mergeLocks(allLocks)

      for (const [name, info] of Object.entries(lock.skills)) {
        if (!info.version)
          continue

        if (info.source === 'shipped') {
          const skillDir = join(skillsDir, name)
          if (!existsSync(skillDir)) {
            const pkgName = info.packageName || name
            const shipped = getShippedSkills(pkgName, cwd, info.version)
            const match = shipped.find(s => s.skillName === name)
            if (match)
              linkShippedSkill(skillsDir, name, match.skillDir)
          }
          continue
        }

        // Non-shipped: restore .skilld/pkg symlink if broken
        restorePkgSymlink(skillsDir, name, info, cwd)
      }
    }

    // ── 2. Auto-install shipped skills from deps ──

    const state = await getProjectState(cwd)
    let shippedCount = 0

    if (state.shipped.length > 0) {
      mkdirSync(skillsDir, { recursive: true })

      for (const entry of state.shipped) {
        const version = state.deps.get(entry.packageName)?.replace(/^[\^~>=<]+/, '') || '0.0.0'

        for (const skill of entry.skills) {
          linkShippedSkill(skillsDir, skill.skillName, skill.skillDir)
          writeLock(skillsDir, skill.skillName, {
            packageName: entry.packageName,
            version,
            source: 'shipped',
            syncedAt: new Date().toISOString().split('T')[0],
            generator: 'skilld',
          })

          if (shared)
            linkSkillToAgents(skill.skillName, shared, cwd, agent)

          shippedCount++
        }
      }

      if (shippedCount > 0)
        p.log.success(`Installed ${shippedCount} shipped skill${shippedCount > 1 ? 's' : ''}`)
    }

    // ── 3. Report outdated skills ──

    // Re-read state after shipped installs so they don't show as missing
    const freshState = shippedCount > 0 ? await getProjectState(cwd) : state

    if (freshState.outdated.length > 0) {
      const n = freshState.outdated.length
      p.log.info(`${n} package${n > 1 ? 's' : ''} ha${n > 1 ? 've' : 's'} new features and/or breaking changes. Run \`skilld update\` to sync.`)
    }
  },
})

/** Restore .skilld/pkg symlink to node_modules if broken */
function restorePkgSymlink(skillsDir: string, name: string, info: SkillInfo, cwd: string): void {
  const refsDir = join(skillsDir, name, '.skilld')
  const pkgLink = join(refsDir, 'pkg')

  // Only fix if the skill dir exists but the pkg symlink is broken
  if (!existsSync(join(skillsDir, name)))
    return

  if (existsSync(pkgLink))
    return

  const pkgName = info.packageName || name
  const pkgDir = resolvePkgDir(pkgName, cwd, info.version)
  if (!pkgDir)
    return

  mkdirSync(refsDir, { recursive: true })
  symlinkSync(pkgDir, pkgLink)
}
