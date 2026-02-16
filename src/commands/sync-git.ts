/**
 * Git skill sync — install pre-authored skills from git repos
 *
 * Mirrors the shipped skills pattern: pre-authored SKILL.md files
 * copied directly, no doc resolution or LLM generation.
 */

import type { AgentType } from '../agent/index.ts'
import type { GitSkillSource } from '../sources/git-skills.ts'
import { mkdirSync, writeFileSync } from 'node:fs'
import * as p from '@clack/prompts'
import { dirname, join } from 'pathe'
import { agents } from '../agent/index.ts'
import { CACHE_DIR } from '../cache/index.ts'
import { registerProject } from '../core/config.ts'
import { timedSpinner } from '../core/formatting.ts'
import { writeLock } from '../core/lockfile.ts'
import { sanitizeMarkdown } from '../core/sanitize.ts'
import { fetchGitSkills } from '../sources/git-skills.ts'
import { track } from '../telemetry.ts'

export interface GitSyncOptions {
  source: GitSkillSource
  global: boolean
  agent: AgentType
  yes: boolean
}

export async function syncGitSkills(opts: GitSyncOptions): Promise<void> {
  const { source, agent, global: isGlobal, yes } = opts
  const cwd = process.cwd()
  const agentConfig = agents[agent]
  const baseDir = isGlobal
    ? join(CACHE_DIR, 'skills')
    : join(cwd, agentConfig.skillsDir)

  const label = source.type === 'local'
    ? source.localPath!
    : `${source.owner}/${source.repo}`

  const spin = timedSpinner()
  spin.start(`Fetching skills from ${label}`)

  const { skills, commitSha } = await fetchGitSkills(source, msg => spin.message(msg))

  if (skills.length === 0) {
    spin.stop(`No skills found in ${label}`)
    return
  }

  spin.stop(`Found ${skills.length} skill(s) in ${label}`)

  // Select skills to install
  let selected = skills

  if (source.skillPath) {
    // Direct path: auto-select the matched skill
    selected = skills
  }
  else if (skills.length > 1 && !yes) {
    const choices = await p.multiselect({
      message: `Select skills to install from ${label}`,
      options: skills.map(s => ({
        label: s.name,
        value: s.name,
        hint: s.description || s.path,
      })),
      initialValues: skills.map(s => s.name),
    })

    if (p.isCancel(choices))
      return

    const selectedNames = new Set(choices)
    selected = skills.filter(s => selectedNames.has(s.name))
  }

  // Install each selected skill
  mkdirSync(baseDir, { recursive: true })

  for (const skill of selected) {
    const skillDir = join(baseDir, skill.name)
    mkdirSync(skillDir, { recursive: true })

    // Sanitize and write SKILL.md
    writeFileSync(join(skillDir, 'SKILL.md'), sanitizeMarkdown(skill.content))

    // Write supporting files directly in skill dir (not under .skilld/)
    // so SKILL.md relative paths like ./references/docs/guide.md resolve correctly
    if (skill.files.length > 0) {
      for (const f of skill.files) {
        const filePath = join(skillDir, f.path)
        mkdirSync(dirname(filePath), { recursive: true })
        writeFileSync(filePath, f.content)
      }
    }

    // Write lockfile entry
    const sourceType = source.type === 'local' ? 'local' : source.type
    writeLock(baseDir, skill.name, {
      source: sourceType,
      repo: source.type === 'local' ? source.localPath : `${source.owner}/${source.repo}`,
      path: skill.path || undefined,
      ref: source.ref || 'main',
      commit: commitSha,
      syncedAt: new Date().toISOString().split('T')[0],
      generator: 'external',
    })
  }

  if (!isGlobal)
    registerProject(cwd)

  // Track telemetry (skip local sources)
  if (source.type !== 'local' && source.owner && source.repo) {
    track({
      event: 'install',
      source: `${source.owner}/${source.repo}`,
      skills: selected.map(s => s.name).join(','),
      agents: agent,
      ...(isGlobal && { global: '1' as const }),
      sourceType: source.type,
    })
  }

  const names = selected.map(s => `\x1B[36m${s.name}\x1B[0m`).join(', ')
  p.log.success(`Installed ${names}`)
}
