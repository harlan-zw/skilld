/**
 * Skill installation - write skills to agent directories
 */

import type { AgentType } from './types'
import { existsSync, lstatSync, mkdirSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs'
import { join, relative } from 'pathe'
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

/**
 * Create relative symlinks from each detected agent's skills dir to the shared .skills/ dir.
 * Only targets agents whose config dir already exists in the project.
 * Replaces existing symlinks, skips real directories (user's custom skills).
 */
export function linkSkillToAgents(skillName: string, sharedDir: string, cwd: string): void {
  for (const [, agent] of Object.entries(agents)) {
    const agentSkillsDir = join(cwd, agent.skillsDir)

    // Only link if the agent's parent config dir exists (e.g. .claude/, .cursor/)
    const agentConfigDir = join(cwd, agent.skillsDir.split('/')[0]!)
    if (!existsSync(agentConfigDir))
      continue

    const target = join(agentSkillsDir, skillName)

    // Check what's at the target path
    let isSymlink = false
    let targetExists = false
    try {
      const stat = lstatSync(target)
      targetExists = true
      isSymlink = stat.isSymbolicLink()
    }
    catch {}

    // Skip real directories (user's custom skills, not managed by us)
    if (targetExists && !isSymlink)
      continue

    // Remove existing symlink (including dangling)
    if (isSymlink)
      unlinkSync(target)

    mkdirSync(agentSkillsDir, { recursive: true })

    const source = join(sharedDir, skillName)
    const rel = relative(agentSkillsDir, source)
    symlinkSync(rel, target)
  }
}

/**
 * Remove per-agent symlinks for a skill when removing from shared dir.
 */
export function unlinkSkillFromAgents(skillName: string, cwd: string): void {
  for (const [, agent] of Object.entries(agents)) {
    const target = join(cwd, agent.skillsDir, skillName)
    try {
      if (lstatSync(target).isSymbolicLink())
        unlinkSync(target)
    }
    catch {}
  }
}
