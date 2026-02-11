/**
 * Agent types and interfaces
 */

export type AgentType
  = | 'claude-code'
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

export interface SkillMetadata {
  name: string
  version?: string
  /** ISO date string when this version was released */
  releasedAt?: string
  description?: string
}
