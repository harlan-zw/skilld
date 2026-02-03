/**
 * SKILL.md file generation
 */

import { sanitizeName } from '../install'
import { FILE_PATTERN_MAP } from '../types'

export interface SkillOptions {
  name: string
  version?: string
  releasedAt?: string
  globs?: string[]
  description?: string
  /** LLM-generated body — replaces default heading + description */
  body?: string
  relatedSkills: string[]
  hasIssues?: boolean
  hasReleases?: boolean
  hasChangelog?: boolean
  docsType?: 'llms.txt' | 'readme' | 'docs'
  hasShippedDocs?: boolean
}

export function generateSkillMd(opts: SkillOptions): string {
  const content = opts.body
    ? opts.body
    : `# ${opts.name}\n\n${opts.description || ''}`
  return `${generateFrontmatter(opts)}${generateImportantBlock(opts)}${content}
${generateFooter(opts.relatedSkills)}`
}

function generateFrontmatter({ name, version, releasedAt, globs }: SkillOptions): string {
  const patterns = globs ?? FILE_PATTERN_MAP[name]
  const description = patterns?.length
    ? `Load skill when working with ${patterns.join(', ')} files or importing from "${name}".`
    : `Load skill when using anything from the package "${name}".`

  const lines = [
    '---',
    `name: ${sanitizeName(name)}`,
    `description: ${description}`,
  ]
  if (patterns?.length)
    lines.push(`globs: ${JSON.stringify(patterns)}`)
  if (version)
    lines.push(`version: "${version}"`)
  if (releasedAt)
    lines.push(`releasedAt: "${releasedAt.split('T')[0]}"`)
  lines.push('---', '', '')
  return lines.join('\n')
}

function generateImportantBlock({ name, hasIssues, hasReleases, hasChangelog, docsType = 'docs', hasShippedDocs = false }: SkillOptions): string {
  const searchDesc = hasIssues ? 'Docs + issues' : 'Docs'
  const searchCmd = `\`Bash 'npx skilld ${name} -q "<query>"'\``

  const docsPath = hasShippedDocs
    ? '`./references/pkg/docs/` or `./references/pkg/README.md`'
    : docsType === 'llms.txt'
      ? '`./references/docs/llms.txt`'
      : docsType === 'readme'
        ? '`./references/pkg/README.md`'
        : '`./references/docs/`'

  const rows = [
    [searchDesc, searchCmd],
    ['Docs', docsPath],
    ['Package', '`./references/pkg/`'],
  ]
  if (hasIssues) {
    rows.push(['Issues', '`./references/issues/`'])
  }
  if (hasChangelog) {
    rows.push(['Changelog', '`./references/pkg/CHANGELOG.md`'])
  }
  if (hasReleases) {
    rows.push(['Releases', '`./references/releases/`'])
  }

  const table = [
    '| Resource | Command |',
    '|----------|---------|',
    ...rows.map(([desc, cmd]) => `| ${desc} | ${cmd} |`),
  ].join('\n')

  return `**IMPORTANT:** Use these references\n\n${table}\n\n`
}

function generateFooter(relatedSkills: string[]): string {
  if (relatedSkills.length === 0)
    return ''
  return `\nRelated: ${relatedSkills.join(', ')}\n`
}
