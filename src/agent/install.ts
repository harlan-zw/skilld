/**
 * Skill installation - write skills to agent directories
 */

import type { AgentType } from './types'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { detectInstalledAgents } from './detect'
import { agents } from './registry'

/**
 * Sanitize skill name for filesystem
 */
export function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._]+/g, '-')
    .replace(/^[.\-]+|[.\-]+$/g, '')
    .slice(0, 255) || 'unnamed-skill'
}

/**
 * Install a skill directly to agent skill directories
 * Writes to each agent's skill folder in the project (e.g., .claude/skills/package-name/)
 */
export function installSkillForAgents(
  skillName: string,
  skillContent: string,
  options: {
    global?: boolean
    cwd?: string
    agents?: AgentType[]
    /** Additional files to write (filename -> content) */
    files?: Record<string, string>
  } = {},
): { installed: AgentType[], paths: string[] } {
  const isGlobal = options.global ?? false
  const cwd = options.cwd || process.cwd()
  const sanitized = sanitizeName(skillName)

  // Use specified agents or detect installed
  const targetAgents = options.agents || detectInstalledAgents()

  const installed: AgentType[] = []
  const paths: string[] = []

  for (const agentType of targetAgents) {
    const agent = agents[agentType]

    // Skip if agent doesn't support global installation
    if (isGlobal && !agent.globalSkillsDir)
      continue

    // Determine target directory
    const baseDir = isGlobal ? agent.globalSkillsDir! : join(cwd, agent.skillsDir)
    const skillDir = join(baseDir, sanitized)

    // Create directory and write files
    mkdirSync(skillDir, { recursive: true })
    writeFileSync(join(skillDir, 'SKILL.md'), skillContent)

    // Write additional files
    if (options.files) {
      for (const [filename, content] of Object.entries(options.files)) {
        writeFileSync(join(skillDir, filename), content)
      }
    }

    installed.push(agentType)
    paths.push(skillDir)
  }

  return { installed, paths }
}
