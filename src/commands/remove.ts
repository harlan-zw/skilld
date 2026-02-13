import type { AgentType } from '../agent'
import type { ProjectState, SkillEntry } from '../core/skills'
import { existsSync, rmSync } from 'node:fs'
import * as p from '@clack/prompts'
import { defineCommand } from 'citty'
import { unlinkSkillFromAgents } from '../agent'
import { getInstalledGenerators, introLine, promptForAgent, resolveAgent, sharedArgs } from '../cli-helpers'
import { readConfig } from '../core/config'
import { removeLockEntry } from '../core/lockfile'
import { getSharedSkillsDir } from '../core/shared'
import { getProjectState, getSkillsDir, iterateSkills } from '../core/skills'

export interface RemoveOptions {
  packages?: string[]
  global: boolean
  agent: AgentType
  yes: boolean
}

export async function removeCommand(state: ProjectState, opts: RemoveOptions): Promise<void> {
  // Get skills from the appropriate scope
  const scope = opts.global ? 'global' : 'local'
  const allSkills = [...iterateSkills({ scope })]

  // Get skills to choose from
  const skills = opts.packages
    ? allSkills.filter(s => opts.packages!.includes(s.name))
    : await pickSkillsToRemove(allSkills, scope)

  if (!skills || skills.length === 0) {
    p.log.info('No skills selected')
    return
  }

  // Confirm deletion
  if (!opts.yes) {
    const confirmed = await p.confirm({
      message: `Remove ${skills.length} skill(s)? ${skills.map(s => s.name).join(', ')}`,
    })

    if (p.isCancel(confirmed) || !confirmed) {
      p.cancel('Cancelled')
      return
    }
  }

  // Delete each skill
  const cwd = process.cwd()
  const shared = getSharedSkillsDir(cwd)
  for (const skill of skills) {
    const skillsDir = getSkillsDir(skill.agent, skill.scope)

    if (existsSync(skill.dir)) {
      rmSync(skill.dir, { recursive: true, force: true })
      removeLockEntry(skillsDir, skill.name)
      // Clean up per-agent symlinks when removing from shared dir
      if (shared && skill.scope === 'local')
        unlinkSkillFromAgents(skill.name, cwd)
      p.log.success(`Removed ${skill.name}`)
    }
    else {
      p.log.warn(`${skill.name} not found`)
    }
  }

  p.outro(`Removed ${skills.length} skill(s)`)
}

async function pickSkillsToRemove(skills: SkillEntry[], scope: 'local' | 'global'): Promise<SkillEntry[] | null> {
  if (skills.length === 0) {
    p.log.warn(`No ${scope} skills installed`)
    return null
  }

  const options = skills.map(skill => ({
    label: skill.name,
    value: skill.name,
    hint: skill.info?.version ? `@${skill.info.version}` : undefined,
  }))

  const selected = await p.multiselect({
    message: 'Select skills to remove',
    options,
    required: false,
  })

  if (p.isCancel(selected)) {
    p.cancel('Cancelled')
    return null
  }

  const selectedSet = new Set(selected as string[])
  return skills.filter(s => selectedSet.has(s.name))
}

export const removeCommandDef = defineCommand({
  meta: { name: 'remove', description: 'Remove installed skills' },
  args: {
    ...sharedArgs,
  },
  async run({ args }) {
    const cwd = process.cwd()
    let agent = resolveAgent(args.agent)
    if (!agent) {
      agent = await promptForAgent()
      if (!agent)
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
