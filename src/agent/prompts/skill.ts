/**
 * SKILL.md file generation
 */

import { repairMarkdown, sanitizeMarkdown } from '../../core/sanitize'
import { yamlEscape } from '../../core/yaml'
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
  hasIssues?: boolean
  hasDiscussions?: boolean
  hasReleases?: boolean
  hasChangelog?: string | false
  docsType?: 'llms.txt' | 'readme' | 'docs'
  hasShippedDocs?: boolean
  /** Key files in package (entry points + docs) */
  pkgFiles?: string[]
  /** Model used to generate LLM sections */
  generatedBy?: string
  /** Override directory name for frontmatter (repo-based, e.g. "vuejs-core") */
  dirName?: string
  /** All packages tracked by this skill (multi-package skills) */
  packages?: Array<{ name: string }>
}

export function generateSkillMd(opts: SkillOptions): string {
  const header = generatePackageHeader(opts)
  const refs = generateReferencesBlock(opts)
  const content = opts.body ? `${header}\n\n${refs}${opts.body}` : `${header}\n\n${refs.trimEnd()}`
  const footer = generateFooter(opts.relatedSkills)
  return sanitizeMarkdown(repairMarkdown(`${generateFrontmatter(opts)}${content}\n${footer}`))
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
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  const weeks = Math.floor(diffDays / 7)
  if (diffDays < 30)
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  const months = Math.floor(diffDays / 30)
  if (diffDays < 365)
    return `${months} month${months === 1 ? '' : 's'} ago`
  const years = Math.floor(diffDays / 365)
  return `${years} year${years === 1 ? '' : 's'} ago`
}

function generatePackageHeader({ name, description, version, releasedAt, dependencies, distTags, hasIssues, hasDiscussions }: SkillOptions & { repoUrl?: string }): string {
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

  if (hasIssues)
    lines.push(`**Issues:** \`./.skilld/issues/\``)
  if (hasDiscussions)
    lines.push(`**Discussions:** \`./.skilld/discussions/\``)

  return lines.join('\n')
}

/**
 * Expand a package name into keyword variants for better trigger matching.
 * e.g. "@nuxt/ui" → ["nuxt ui", "nuxt/ui"], "vue-router" → ["vue router"]
 */
function expandPackageName(name: string): string[] {
  const variants = new Set<string>()
  // Strip scope for matching: @nuxt/ui → nuxt/ui → nuxt ui
  const unscoped = name.replace(/^@/, '')
  if (unscoped !== name) {
    variants.add(unscoped) // nuxt/ui
    variants.add(unscoped.replace(/\//g, ' ')) // nuxt ui
  }
  // Hyphen → space: vue-router → vue router
  if (name.includes('-')) {
    const spaced = name.replace(/^@/, '').replace(/\//g, ' ').replace(/-/g, ' ')
    variants.add(spaced)
  }
  // Remove the original name itself from variants (it's already in the description)
  variants.delete(name)
  return [...variants]
}

function generateFrontmatter({ name, version, description: pkgDescription, globs, body, generatedBy, dirName, packages }: SkillOptions): string {
  const patterns = globs ?? FILE_PATTERN_MAP[name]
  const globHint = patterns?.length ? ` or working with ${patterns.join(', ')} files` : ''
  const descSuffix = pkgDescription ? ` (${pkgDescription.replace(/\.?\s*$/, '')})` : ''

  let desc: string
  if (packages && packages.length > 1) {
    // Multi-package description: list all imports and keywords
    const importList = packages.map(p => `"${p.name}"`).join(', ')
    const allKeywords = new Set<string>()
    for (const pkg of packages) {
      allKeywords.add(pkg.name)
      for (const kw of expandPackageName(pkg.name))
        allKeywords.add(kw)
    }
    const keywordList = [...allKeywords].join(', ')
    desc = `Using code importing from ${importList}${globHint}. Researching or debugging ${keywordList}.${descSuffix}`
  }
  else {
    const keywords = expandPackageName(name)
    const nameList = [name, ...keywords].join(', ')
    desc = `Using code importing from "${name}"${globHint}. Researching or debugging ${nameList}.${descSuffix}`
  }

  const lines = [
    '---',
    `name: ${dirName ?? sanitizeName(name)}-skilld`,
    `description: ${yamlEscape(desc)}`,
  ]
  if (patterns?.length)
    lines.push(`globs: ${JSON.stringify(patterns)}`)
  if (version)
    lines.push(`version: ${yamlEscape(version)}`)
  if (body && generatedBy)
    lines.push(`generated_by: ${yamlEscape(generatedBy)}`)
  lines.push('---', '', '')
  return lines.join('\n')
}

function generateSearchBlock(name: string, hasIssues?: boolean, hasReleases?: boolean): string {
  const examples = [
    `npx skilld search "query" -p ${name}`,
  ]
  if (hasIssues)
    examples.push(`npx skilld search "issues:error handling" -p ${name}`)
  if (hasReleases)
    examples.push(`npx skilld search "releases:deprecated" -p ${name}`)

  return `## Search

Use \`npx skilld search\` instead of grepping \`.skilld/\` directories — hybrid semantic + keyword search across all indexed docs, issues, and releases.

\`\`\`bash
${examples.join('\n')}
\`\`\`

Filters: \`docs:\`, \`issues:\`, \`releases:\` prefix narrows by source type.`
}

function generateReferencesBlock({ name, hasIssues, hasDiscussions, hasReleases, docsType = 'docs', hasShippedDocs = false, pkgFiles = [], packages }: SkillOptions): string {
  const lines: string[] = [
    generateSearchBlock(name, hasIssues, hasReleases),
    '',
    '## References',
    '',
  ]

  // Package with inline file list
  const fileList = pkgFiles.length ? ` — ${pkgFiles.map(f => `\`${f}\``).join(', ')}` : ''
  lines.push(`**Package:** \`./.skilld/pkg/\`${fileList}`)

  // Named package symlinks for multi-package skills
  if (packages && packages.length > 1) {
    for (const pkg of packages) {
      const shortName = pkg.name.split('/').pop()!.toLowerCase()
      lines.push(`**Package (${pkg.name}):** \`./.skilld/pkg-${shortName}/\``)
    }
  }

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

  if (hasIssues)
    lines.push(`**Issues:** \`./.skilld/issues/\``)
  if (hasDiscussions)
    lines.push(`**Discussions:** \`./.skilld/discussions/\``)

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
