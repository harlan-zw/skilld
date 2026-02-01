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
