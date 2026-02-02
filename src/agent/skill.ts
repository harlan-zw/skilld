/**
 * Skill file generation
 */

import type { SkillMetadata } from './types'

/**
 * Generate SKILL.md frontmatter content
 * The description tells the agent when to use this skill
 */
export function generateSkillMd(
  meta: SkillMetadata,
  body: string,
): string {
  const { name, version } = meta

  // Simple, consistent description format
  const description = `Documentation for ${name}. Use this skill when working with ${name} or importing from "${name}".`

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
