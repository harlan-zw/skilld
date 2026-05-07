/**
 * Git skill sync — install pre-authored skills from git repos,
 * or generate skills from repo docs when no pre-authored skills exist.
 */

import type { AgentType, OptimizeModel } from '../agent/index.ts'
import type { GitSkillSource } from '../sources/git-skills.ts'
import { mkdirSync, writeFileSync } from 'node:fs'
import * as p from '@clack/prompts'
import { dirname, join, relative } from 'pathe'
import { agents, writeSkillMd } from '../agent/index.ts'
import { installSkill } from '../agent/skill-installer.ts'
import { CACHE_DIR } from '../cache/index.ts'
import { readConfig } from '../core/config.ts'
import { timedSpinner, todayIsoDate } from '../core/formatting.ts'
import { sanitizeMarkdown } from '../core/sanitize.ts'
import { shutdownWorker } from '../retriv/pool.ts'
import { fetchGitSkills } from '../sources/git-skills.ts'
import { track } from '../telemetry.ts'
import { DEFAULT_SECTIONS, selectLlmConfig } from './llm-prompts.ts'
import { createGithubResolver } from './sync-resolvers.ts'
import { runBaseSync, runEnhancePhase } from './sync-runner.ts'
import { createClackUi } from './sync-ui-clack.ts'

export interface GitSyncOptions {
  source: GitSkillSource
  global: boolean
  agent: AgentType
  yes: boolean
  model?: OptimizeModel
  force?: boolean
  debug?: boolean
  from?: string
  /** Filter to specific skill names (comma-separated via --skill flag) */
  skillFilter?: string[]
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

  const { skills } = await fetchGitSkills(source, msg => spin.message(msg))

  if (skills.length === 0) {
    // No pre-authored skills — fall back to generating from repo docs (GitHub only)
    if (source.type === 'github' && source.owner && source.repo) {
      spin.stop(`No pre-authored skills in ${label}, generating from repo docs...`)
      return syncGitHubRepo(opts)
    }
    spin.stop(`No skills found in ${label}`)
    return
  }

  spin.stop(`Found ${skills.length} skill(s) in ${label}`)

  // Select skills to install
  let selected = skills

  if (opts.skillFilter?.length) {
    // --skill flag: filter to matching names (strip -skilld suffix for comparison)
    const filterSet = new Set(opts.skillFilter.map(s => s.toLowerCase().replace(/-skilld$/, '')))
    selected = skills.filter(s => filterSet.has(s.name.toLowerCase().replace(/-skilld$/, '')))
    if (selected.length === 0) {
      p.log.warn(`No skills matched: ${opts.skillFilter.join(', ')}`)
      p.log.message(`Available: ${skills.map(s => s.name).join(', ')}`)
      return
    }
  }
  else if (source.skillPath) {
    // Direct path: auto-select the matched skill
    selected = skills
  }
  else if (skills.length > 1 && !yes) {
    const choices = await p.autocompleteMultiselect({
      message: `Select skills to install from ${label}`,
      options: skills.map(s => ({
        label: s.name.replace(/-skilld$/, ''),
        value: s.name,
        hint: s.description || s.path,
      })),
      initialValues: [],
    })

    if (p.isCancel(choices))
      return

    const selectedNames = new Set(choices)
    selected = skills.filter(s => selectedNames.has(s.name))
    if (selected.length === 0)
      return
  }

  // Install each selected skill
  mkdirSync(baseDir, { recursive: true })

  for (const skill of selected) {
    const skillDir = join(baseDir, skill.name)
    mkdirSync(skillDir, { recursive: true })

    // Sanitize and write SKILL.md
    writeSkillMd(skillDir, sanitizeMarkdown(skill.content))

    // Write supporting files directly in skill dir (not under .skilld/)
    // so SKILL.md relative paths like ./references/docs/guide.md resolve correctly
    if (skill.files.length > 0) {
      for (const f of skill.files) {
        const filePath = join(skillDir, f.path)
        mkdirSync(dirname(filePath), { recursive: true })
        writeFileSync(filePath, f.content)
      }
    }

    const sourceType = source.type === 'local' ? 'local' : source.type
    installSkill({
      cwd,
      agent,
      global: isGlobal,
      baseDir,
      skillDirName: skill.name,
      lock: {
        source: sourceType,
        repo: source.type === 'local' ? source.localPath : `${source.owner}/${source.repo}`,
        path: skill.path || undefined,
        ref: source.ref || 'main',
        syncedAt: todayIsoDate(),
        generator: 'external',
      },
      skipLinkAgents: true,
    })
  }

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

  for (const skill of selected) {
    const skillRel = relative(cwd, join(baseDir, skill.name))
    const fileLines = ['SKILL.md', ...skill.files.map(f => f.path)]
      .map(f => `  \x1B[90m└\x1B[0m ${f}`)
      .join('\n')
    p.log.success(`Installed \x1B[36m${skill.name}\x1B[0m \x1B[90m→ ${skillRel}\x1B[0m\n${fileLines}`)
  }
}

/**
 * Generate a skill from a GitHub repo's docs (no npm package required).
 * Routes through the unified runner with a `createGithubResolver` so the
 * fetch / cache / install / LLM cycle is shared with npm flows.
 */
async function syncGitHubRepo(opts: GitSyncOptions): Promise<void> {
  const { source, agent, global: isGlobal, yes } = opts
  const owner = source.owner!
  const repo = source.repo!
  const cwd = process.cwd()
  const ui = createClackUi({ cwd })
  const spec = `${owner}/${repo}`

  const result = await runBaseSync(
    spec,
    {
      agent,
      global: isGlobal,
      force: opts.force,
      from: opts.from,
    },
    ui,
    createGithubResolver(owner, repo),
    cwd,
    DEFAULT_SECTIONS,
  )

  if (result.kind !== 'ready')
    return

  const { state } = result
  const globalConfig = readConfig()
  let llmConfig: import('./llm-prompts.ts').LlmConfig | null = null
  if (!state.allSectionsCached && !globalConfig.skipLlm && (!yes || opts.model))
    llmConfig = await selectLlmConfig(opts.model)

  await runEnhancePhase(
    state,
    llmConfig,
    { agent, global: isGlobal, force: opts.force, debug: opts.debug },
    ui,
    cwd,
  )

  await shutdownWorker()

  track({
    event: 'install',
    source: spec,
    skills: state.skillDirName,
    agents: agent,
    ...(isGlobal && { global: '1' as const }),
    sourceType: 'github-generated',
  })

  p.outro(`Synced ${spec} to ${relative(cwd, state.skillDir)}`)
}
