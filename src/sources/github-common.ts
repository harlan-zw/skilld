/**
 * Shared constants and helpers for GitHub source modules (issues, discussions, releases)
 */

export const BOT_USERS = new Set([
  'renovate[bot]',
  'dependabot[bot]',
  'renovate-bot',
  'dependabot',
  'github-actions[bot]',
])

/** Extract YYYY-MM-DD date from an ISO timestamp */
export const isoDate = (iso: string) => iso.split('T')[0]

/** Build YAML frontmatter from a key-value object, auto-quoting strings with special chars */
export function buildFrontmatter(fields: Record<string, string | number | boolean | undefined>): string {
  const lines = ['---']
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined)
      lines.push(`${k}: ${typeof v === 'string' && /[:"[\]]/.test(v) ? `"${v.replace(/"/g, '\\"')}"` : v}`)
  }
  lines.push('---')
  return lines.join('\n')
}
