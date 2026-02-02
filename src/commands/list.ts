import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { agents, detectInstalledAgents } from '../agent'
import { formatSkillLineSimple, printLegend } from '../core/formatting'
import { readLock, parseSkillFrontmatter } from '../core/lockfile'
import type { SkillInfo } from '../core/lockfile'

export interface ListOptions {
  global?: boolean
}

function getSkillInfo(skillsDir: string, skill: string, lock: ReturnType<typeof readLock>): SkillInfo | null {
  if (lock?.skills[skill]) return lock.skills[skill]
  return parseSkillFrontmatter(join(skillsDir, skill, 'SKILL.md'))
}

export function listCommand(opts: ListOptions = {}): void {
  const installedAgents = detectInstalledAgents()
  const cwd = process.cwd()
  let hasSkills = false

  printLegend()

  // Local skills (project-level)
  if (!opts.global) {
    console.log('\n\x1B[1mLocal Skills\x1B[0m (project)')
    let localFound = false

    for (const agentType of installedAgents) {
      const agent = agents[agentType]
      const skillsDir = join(cwd, agent.skillsDir)

      if (existsSync(skillsDir)) {
        const skills = readdirSync(skillsDir).filter(f => !f.startsWith('.') && f !== 'skilld-lock.yaml')
        if (skills.length > 0) {
          localFound = true
          hasSkills = true
          const lock = readLock(skillsDir)
          console.log(`  \x1B[36m${agent.displayName}\x1B[0m (${agent.skillsDir})`)
          for (const skill of skills) {
            const info = getSkillInfo(skillsDir, skill, lock)
            console.log(formatSkillLineSimple(skill, info))
          }
        }
      }
    }

    if (!localFound) {
      console.log('  \x1B[90m(none)\x1B[0m')
    }
  }

  // Global skills
  console.log('\n\x1B[1mGlobal Skills\x1B[0m')
  let globalFound = false

  for (const agentType of installedAgents) {
    const agent = agents[agentType]
    const globalDir = agent.globalSkillsDir

    if (globalDir && existsSync(globalDir)) {
      const skills = readdirSync(globalDir).filter(f => !f.startsWith('.') && f !== 'skilld-lock.yaml')
      if (skills.length > 0) {
        globalFound = true
        hasSkills = true
        const lock = readLock(globalDir)
        console.log(`  \x1B[36m${agent.displayName}\x1B[0m (${globalDir})`)
        for (const skill of skills) {
          const info = getSkillInfo(globalDir, skill, lock)
          console.log(formatSkillLineSimple(skill, info))
        }
      }
    }
  }

  if (!globalFound) {
    console.log('  \x1B[90m(none)\x1B[0m')
  }

  if (!hasSkills) {
    console.log('\nRun \x1B[1mskilld <package>\x1B[0m to install skills')
  }

  console.log()
}
