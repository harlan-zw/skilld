/**
 * Shared defaults and factory for agent target definitions.
 * All targets share identical skillFilename, nameMatchesDir, namePattern,
 * and common frontmatter fields from the agentskills.io spec.
 */

import type { AgentTarget, FrontmatterField } from './types.ts'

/** Common frontmatter fields from agentskills.io spec */
export const SPEC_FRONTMATTER: Record<string, FrontmatterField> = {
  'name': { name: 'name', required: true, description: 'Skill identifier. Must match parent directory name.', constraints: '1-64 chars, lowercase alphanumeric + hyphens' },
  'description': { name: 'description', required: true, description: 'What the skill does and when to use it.', constraints: '1-1024 chars' },
  'license': { name: 'license', required: false, description: 'License reference' },
  'compatibility': { name: 'compatibility', required: false, description: 'Environment requirements', constraints: 'max 500 chars' },
  'metadata': { name: 'metadata', required: false, description: 'Arbitrary key-value pairs' },
  'allowed-tools': { name: 'allowed-tools', required: false, description: 'Space-delimited pre-approved tools (experimental)' },
}

/** Shared defaults for all agent targets */
const BASE_DEFAULTS = {
  skillFilename: 'SKILL.md' as const,
  nameMatchesDir: true,
  namePattern: '^[a-z0-9]+(-[a-z0-9]+)*$',
  additionalSkillsDirs: [] as string[],
  extensions: [] as string[],
  notes: [] as string[],
} satisfies Partial<AgentTarget>

type DefaultedFields = 'skillFilename' | 'nameMatchesDir' | 'namePattern' | 'additionalSkillsDirs' | 'extensions' | 'notes'

/** Define an agent target with shared defaults applied */
export function defineTarget(
  target: Omit<AgentTarget, DefaultedFields> & Partial<Pick<AgentTarget, DefaultedFields>>,
): AgentTarget {
  return { ...BASE_DEFAULTS, ...target }
}
