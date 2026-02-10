/**
 * Types for agent target definitions
 */

import type { AgentType } from '../types'

export interface FrontmatterField {
  /** Field name in YAML frontmatter */
  name: string
  /** Whether the field is required by the agent */
  required: boolean
  /** Description of what the field does */
  description: string
  /** Constraints (max length, regex, etc.) */
  constraints?: string
}

export interface AgentTarget {
  /** Agent identifier */
  agent: AgentType
  /** Human-readable agent name */
  displayName: string

  // --- Runtime ---

  /** Check if agent is installed on the system */
  detectInstalled: () => boolean
  /** Check env vars to detect if running inside this agent */
  detectEnv: () => boolean
  /** Check project-level config dirs/files to detect this agent */
  detectProject: (cwd: string) => boolean
  /** CLI command name (if agent has a CLI for skill generation) */
  cli?: string

  // --- Skill file conventions ---

  /** Required skill filename (always SKILL.md for Agent Skills spec agents) */
  skillFilename: string
  /** Project-level skill directory */
  skillsDir: string
  /** Global (user-level) skill directory (resolved absolute path) */
  globalSkillsDir: string
  /** Additional directories this agent scans for skills (cross-compat) */
  additionalSkillsDirs: string[]

  // --- Frontmatter ---

  /** Supported frontmatter fields */
  frontmatter: FrontmatterField[]
  /** Whether `name` must exactly match the parent directory name */
  nameMatchesDir: boolean
  /** Name field regex constraint */
  namePattern: string

  // --- Discovery ---

  /** How skills are discovered: 'eager' (startup scan) or 'lazy' (on-demand) */
  discoveryStrategy: 'eager' | 'lazy'
  /** Brief description of how discovery works */
  discoveryNotes: string

  // --- Spec compliance ---

  /** Whether this agent follows the agentskills.io spec */
  agentSkillsSpec: boolean
  /** Agent-specific extensions beyond the spec */
  extensions: string[]

  // --- Docs ---

  /** Link to official documentation */
  docs: string
  /** Additional notes, quirks, known issues */
  notes: string[]
}
