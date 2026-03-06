/**
 * Skill installation - write skills to agent directories
 */

import type { AgentType } from './types.ts'
import { existsSync, lstatSync, mkdirSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs'
import { join, relative } from 'pathe'
import { repairMarkdown, sanitizeMarkdown } from '../core/sanitize.ts'
import { detectInstalledAgents } from './detect.ts'
import { agents } from './registry.ts'

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
 * Compute skill directory name from package name with -skilld suffix.
 * No collisions for monorepo packages (each gets a unique name).
 *
 * Examples:
 *   vue → vue-skilld
 *   @unhead/vue → unhead-vue-skilld
 *   @unhead/react → unhead-react-skilld
 */
export function computeSkillDirName(packageName: string): string {
  return `${sanitizeName(packageName)}-skilld`
}

/**
 * Install a skill directly to agent skill directories.
 * When agents are explicitly specified, creates directories as needed.
 * When falling back to auto-detection, only writes to agents whose skills dir already exists.
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
  const explicit = !!options.agents
  const targetAgents = options.agents || detectInstalledAgents()

  const installed: AgentType[] = []
  const paths: string[] = []

  for (const agentType of targetAgents) {
    const agent = agents[agentType]

    // Skip if agent doesn't support global installation
    if (isGlobal && !agent.globalSkillsDir)
      continue

    const baseDir = isGlobal ? agent.globalSkillsDir! : join(cwd, agent.skillsDir)

    // Auto-detected agents: only write if their skills dir already exists
    if (!explicit && !existsSync(baseDir))
      continue

    const skillDir = join(baseDir, sanitized)
    const skilldDir = join(skillDir, '.skilld')
    mkdirSync(skilldDir, { recursive: true })
    writeFileSync(join(skilldDir, '_SKILL.md'), sanitizeMarkdown(repairMarkdown(skillContent)))

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
 * Create a relative symlink from the target agent's skills dir to the shared .skills/ dir.
 * Only creates directories for the explicit target agent; other agents must already have
 * their skills dir present. This prevents skilld from polluting projects with dirs
 * for agents the user doesn't use (e.g. .gemini/, .agent/).
 */
export function linkSkillToAgents(skillName: string, sharedDir: string, cwd: string, agentType?: AgentType): void {
  const targetAgents = agentType ? [[agentType, agents[agentType]] as const] : Object.entries(agents)

  for (const [type, agent] of targetAgents) {
    const agentSkillsDir = join(cwd, agent.skillsDir)
    const isTarget = agentType === type

    if (isTarget) {
      // Target agent: create skills dir if needed
      mkdirSync(agentSkillsDir, { recursive: true })
    }
    else {
      // Non-target agent: only link if skills dir already exists, never create
      if (!existsSync(agentSkillsDir))
        continue
    }

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

    const source = join(sharedDir, skillName)
    const rel = relative(agentSkillsDir, source)
    symlinkSync(rel, target)
  }
}

/**
 * Remove per-agent symlinks for a skill when removing from shared dir.
 */
export function unlinkSkillFromAgents(skillName: string, cwd: string, agentType?: AgentType): void {
  const targetAgents = agentType ? [[agentType, agents[agentType]] as const] : Object.entries(agents)

  for (const [, agent] of targetAgents) {
    const target = join(cwd, agent.skillsDir, skillName)
    try {
      if (lstatSync(target).isSymbolicLink())
        unlinkSync(target)
    }
    catch {}
  }
}
