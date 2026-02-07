/**
 * SKILL.md file generation
 */

import { sanitizeName } from '../install'
import { FILE_PATTERN_MAP } from '../types'

export interface SkillOptions {
  name: string
  version?: string
  releasedAt?: string
  /** Production dependencies with version specifiers */
  dependencies?: Record<string, string>
  /** npm dist-tags with version and release date */
  distTags?: Record<string, { version: string, releasedAt?: string }>
  globs?: string[]
  description?: string
  /** LLM-generated body — replaces default heading + description */
  body?: string
  relatedSkills: string[]
  hasGithub?: boolean
  hasReleases?: boolean
  hasChangelog?: string | false
  docsType?: 'llms.txt' | 'readme' | 'docs'
  hasShippedDocs?: boolean
  /** Key files in package (entry points + docs) */
  pkgFiles?: string[]
}

export function generateSkillMd(opts: SkillOptions): string {
  const header = generatePackageHeader(opts)
  const refs = generateReferencesBlock(opts)
  const content = opts.body ? `${header}\n\n${refs}${opts.body}` : `${header}\n\n${refs.trimEnd()}`
  const footer = generateFooter(opts.relatedSkills)
  return `${generateFrontmatter(opts)}${content}\n${footer}`
}

function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0)
    return 'today'
  if (diffDays === 1)
    return 'yesterday'
  if (diffDays < 7)
    return `${diffDays} days ago`
  if (diffDays < 30)
    return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365)
    return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

function generatePackageHeader({ name, description, version, releasedAt, dependencies, distTags, hasGithub }: SkillOptions & { repoUrl?: string }): string {
  const lines: string[] = [`# ${name}`]

  if (description)
    lines.push('', `> ${description}`)

  // Version with link and relative date
  if (version) {
    const relativeDate = releasedAt ? formatRelativeDate(releasedAt) : ''
    const versionStr = relativeDate ? `${version} (${relativeDate})` : version
    lines.push('', `**Version:** ${versionStr}`)
  }

  if (dependencies && Object.keys(dependencies).length > 0) {
    const deps = Object.entries(dependencies)
      .map(([n, v]) => `${n}@${v}`)
      .join(', ')
    lines.push(`**Deps:** ${deps}`)
  }

  if (distTags && Object.keys(distTags).length > 0) {
    const tags = Object.entries(distTags)
      .map(([tag, info]) => {
        const relDate = info.releasedAt ? ` (${formatRelativeDate(info.releasedAt)})` : ''
        return `${tag}: ${info.version}${relDate}`
      })
      .join(', ')
    lines.push(`**Tags:** ${tags}`)
  }

  if (hasGithub)
    lines.push(`**GitHub:** \`./.skilld/github/\``)

  return lines.join('\n')
}

function generateFrontmatter({ name, version, globs }: SkillOptions): string {
  const patterns = globs ?? FILE_PATTERN_MAP[name]
  const description = patterns?.length
    ? `Load skill when working with ${patterns.join(', ')} files or importing from "${name}".`
    : `Load skill when using anything from the package "${name}".`

  const lines = [
    '---',
    `name: ${sanitizeName(name)}-skilld`,
    `description: ${description}`,
  ]
  if (patterns?.length)
    lines.push(`globs: ${JSON.stringify(patterns)}`)
  if (version)
    lines.push(`version: "${version}"`)
  lines.push('---', '', '')
  return lines.join('\n')
}

function generateReferencesBlock({ name, hasGithub, hasReleases, docsType = 'docs', hasShippedDocs = false, pkgFiles = [] }: SkillOptions): string {
  const lines: string[] = [
    '## References',
    '',
    `IMPORTANT: Search all references (semantic and keyword) using \`skilld search "<query>" -p ${name}\`.`,
    '',
  ]

  // Package with inline file list
  const fileList = pkgFiles.length ? ` — ${pkgFiles.map(f => `\`${f}\``).join(', ')}` : ''
  lines.push(`**Package:** \`./.skilld/pkg/\`${fileList}`)

  // Docs (only if separate from pkg)
  if (hasShippedDocs) {
    lines.push(`**Docs:** \`./.skilld/pkg/docs/\``)
  }
  else if (docsType === 'llms.txt') {
    lines.push(`**Docs:** \`./.skilld/docs/llms.txt\``)
  }
  else if (docsType === 'docs') {
    lines.push(`**Docs:** \`./.skilld/docs/\``)
  }

  if (hasGithub)
    lines.push(`**GitHub:** \`./.skilld/github/\``)

  if (hasReleases)
    lines.push(`**Releases:** \`./.skilld/releases/\``)

  lines.push('')
  return lines.join('\n')
}

function generateFooter(relatedSkills: string[]): string {
  if (relatedSkills.length === 0)
    return ''
  return `\nRelated: ${relatedSkills.join(', ')}\n`
}
