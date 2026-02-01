/**
 * Agent types and interfaces
 */

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

export interface SkillMetadata {
  name: string
  version?: string
  description?: string
}
