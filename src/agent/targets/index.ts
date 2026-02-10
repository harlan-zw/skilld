/**
 * Agent target definitions — how each coding agent discovers and loads skills.
 *
 * Each target documents the agent's skill format, frontmatter fields,
 * directory paths, and any agent-specific quirks. This serves as both
 * runtime configuration and a debuggable reference.
 *
 * Sources are linked in each target's `docs` field.
 */

export { targets } from './registry'
export type { AgentTarget, FrontmatterField } from './types'
