/**
 * Agent detection and skill installation
 * Writes directly to agent skill directories in the project
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const home = homedir()
const configHome = process.env.XDG_CONFIG_HOME || join(home, '.config')
const claudeHome = process.env.CLAUDE_CONFIG_DIR || join(home, '.claude')
const codexHome = process.env.CODEX_HOME || join(home, '.codex')

export type AgentType =
  | 'claude-code'
  | 'cursor'
  | 'windsurf'
  | 'cline'
  | 'codex'
  | 'github-copilot'
  | 'gemini-cli'
  | 'goose'
  | 'amp'
  | 'opencode'
  | 'roo'

export interface AgentConfig {
  name: AgentType
  displayName: string
  /** Project-level skills directory (e.g., .claude/skills) */
  skillsDir: string
  /** Global skills directory (e.g., ~/.claude/skills) */
  globalSkillsDir: string | undefined
  /** Check if agent is installed on the system */
  detectInstalled: () => boolean
}

export const agents: Record<AgentType, AgentConfig> = {
  'claude-code': {
    name: 'claude-code',
    displayName: 'Claude Code',
    skillsDir: '.claude/skills',
    globalSkillsDir: join(claudeHome, 'skills'),
    detectInstalled: () => existsSync(claudeHome),
  },
  cursor: {
    name: 'cursor',
    displayName: 'Cursor',
    skillsDir: '.cursor/skills',
    globalSkillsDir: join(home, '.cursor/skills'),
    detectInstalled: () => existsSync(join(home, '.cursor')),
  },
  windsurf: {
    name: 'windsurf',
    displayName: 'Windsurf',
    skillsDir: '.windsurf/skills',
    globalSkillsDir: join(home, '.codeium/windsurf/skills'),
    detectInstalled: () => existsSync(join(home, '.codeium/windsurf')),
  },
  cline: {
    name: 'cline',
    displayName: 'Cline',
    skillsDir: '.cline/skills',
    globalSkillsDir: join(home, '.cline/skills'),
    detectInstalled: () => existsSync(join(home, '.cline')),
  },
  codex: {
    name: 'codex',
    displayName: 'Codex',
    skillsDir: '.codex/skills',
    globalSkillsDir: join(codexHome, 'skills'),
    detectInstalled: () => existsSync(codexHome),
  },
  'github-copilot': {
    name: 'github-copilot',
    displayName: 'GitHub Copilot',
    skillsDir: '.github/skills',
    globalSkillsDir: join(home, '.copilot/skills'),
    detectInstalled: () => existsSync(join(home, '.copilot')),
  },
  'gemini-cli': {
    name: 'gemini-cli',
    displayName: 'Gemini CLI',
    skillsDir: '.gemini/skills',
    globalSkillsDir: join(home, '.gemini/skills'),
    detectInstalled: () => existsSync(join(home, '.gemini')),
  },
  goose: {
    name: 'goose',
    displayName: 'Goose',
    skillsDir: '.goose/skills',
    globalSkillsDir: join(configHome, 'goose/skills'),
    detectInstalled: () => existsSync(join(configHome, 'goose')),
  },
  amp: {
    name: 'amp',
    displayName: 'Amp',
    skillsDir: '.agents/skills',
    globalSkillsDir: join(configHome, 'agents/skills'),
    detectInstalled: () => existsSync(join(configHome, 'amp')),
  },
  opencode: {
    name: 'opencode',
    displayName: 'OpenCode',
    skillsDir: '.opencode/skills',
    globalSkillsDir: join(configHome, 'opencode/skills'),
    detectInstalled: () => existsSync(join(configHome, 'opencode')),
  },
  roo: {
    name: 'roo',
    displayName: 'Roo Code',
    skillsDir: '.roo/skills',
    globalSkillsDir: join(home, '.roo/skills'),
    detectInstalled: () => existsSync(join(home, '.roo')),
  },
}

/**
 * Detect which agents are installed on the system
 */
export function detectInstalledAgents(): AgentType[] {
  return Object.entries(agents)
    .filter(([_, config]) => config.detectInstalled())
    .map(([type]) => type as AgentType)
}

/**
 * Detect which agent is currently running this command
 * Returns the active agent based on environment variables and context
 */
export function detectCurrentAgent(): AgentType | null {
  // Check environment variables set by agents
  if (process.env.CLAUDE_CODE || process.env.CLAUDE_CONFIG_DIR) {
    return 'claude-code'
  }
  if (process.env.CURSOR_SESSION || process.env.CURSOR_TRACE_ID) {
    return 'cursor'
  }
  if (process.env.WINDSURF_SESSION) {
    return 'windsurf'
  }
  if (process.env.CLINE_TASK_ID) {
    return 'cline'
  }
  if (process.env.CODEX_HOME || process.env.CODEX_SESSION) {
    return 'codex'
  }
  if (process.env.GITHUB_COPILOT_SESSION) {
    return 'github-copilot'
  }
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_SESSION) {
    return 'gemini-cli'
  }
  if (process.env.GOOSE_SESSION) {
    return 'goose'
  }
  if (process.env.AMP_SESSION) {
    return 'amp'
  }
  if (process.env.OPENCODE_SESSION) {
    return 'opencode'
  }
  if (process.env.ROO_SESSION) {
    return 'roo'
  }

  // Check for project-level agent config directories
  const cwd = process.cwd()
  if (existsSync(join(cwd, '.claude'))) {
    return 'claude-code'
  }
  if (existsSync(join(cwd, '.cursor'))) {
    return 'cursor'
  }
  if (existsSync(join(cwd, '.windsurf'))) {
    return 'windsurf'
  }
  if (existsSync(join(cwd, '.cline'))) {
    return 'cline'
  }

  return null
}

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
    if (isGlobal && !agent.globalSkillsDir) continue

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

export interface SkillMetadata {
  name: string
  version?: string
  description?: string
}

/**
 * Generate SKILL.md frontmatter content
 * The description tells the agent when to use this skill
 */
export function generateSkillMd(
  meta: SkillMetadata,
  body: string,
): string {
  const { name, version, description: packageDescription } = meta

  // Create an actionable description that tells the agent when to use this skill
  const description = packageDescription
    ? `${packageDescription} Use this skill when working with ${name}, importing from "${name}", or when the user asks about ${name} features, API, or usage.`
    : `Documentation for ${name}. Use this skill when working with ${name} or importing from "${name}".`

  const frontmatter = [
    '---',
    `name: ${name}`,
    `description: ${description}`,
  ]

  if (version) {
    frontmatter.push(`version: "${version}"`)
  }

  frontmatter.push('---')

  return frontmatter.join('\n') + '\n\n' + body
}
