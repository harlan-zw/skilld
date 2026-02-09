/**
 * Skill installation - write skills to agent directories
 */

import type { AgentType } from './types'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'pathe'
import { repairMarkdown, sanitizeMarkdown } from '../core/sanitize'
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
 * Compute skill directory name from GitHub owner/repo when available,
 * falling back to sanitized package name.
 *
 * Examples:
 *   vue (vuejs/core) → vuejs-core
 *   @nuxt/ui (nuxt/ui) → nuxt-ui
 *   vue-router (vuejs/router) → vuejs-router
 */
export function computeSkillDirName(packageName: string, repoUrl?: string): string {
  if (repoUrl) {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:[/#]|$)/)
    if (match)
      return sanitizeName(`${match[1]}-${match[2]}`)
  }
  return sanitizeName(packageName)
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

    // Create directory and write files (inside .skilld/ to keep git clean)
    const skilldDir = join(skillDir, '.skilld')
    mkdirSync(skilldDir, { recursive: true })
    writeFileSync(join(skilldDir, '_SKILL.md'), sanitizeMarkdown(repairMarkdown(skillContent)))

    // Write additional files
    if (options.files) {
      for (const [filename, content] of Object.entries(options.files)) {
        writeFileSync(join(skillDir, filename), filename.endsWith('.md') ? sanitizeMarkdown(repairMarkdown(content)) : content)
      }
    }

    installed.push(agentType)
    paths.push(skillDir)
  }

  return { installed, paths }
}
