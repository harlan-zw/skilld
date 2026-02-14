/**
 * SKILL.md file generation
 */

import type { FeaturesConfig } from '../../core/config.ts'
import { repairMarkdown, sanitizeMarkdown } from '../../core/sanitize.ts'
import { yamlEscape } from '../../core/yaml.ts'
import { getFilePatterns } from '../../sources/package-registry.ts'
import { sanitizeName } from '../install.ts'

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
  /** GitHub repo URL (owner/repo format or full URL) */
  repoUrl?: string
  /** Resolved feature flags */
  features?: FeaturesConfig
}

export function generateSkillMd(opts: SkillOptions): string {
  const header = generatePackageHeader(opts)
  const search = opts.features?.search !== false ? generateSearchBlock(opts.name, opts.hasIssues, opts.hasReleases) : ''
  const content = opts.body
    ? search ? `${header}\n\n${search}\n\n${opts.body}` : `${header}\n\n${opts.body}`
    : search ? `${header}\n\n${search}` : header
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

function generatePackageHeader({ name, description, version, releasedAt, dependencies, distTags, repoUrl, hasIssues, hasDiscussions, hasReleases, pkgFiles, packages }: SkillOptions): string {
  let title = `# ${name}`
  if (repoUrl) {
    const url = repoUrl.startsWith('http') ? repoUrl : `https://github.com/${repoUrl}`
    const repoName = repoUrl.startsWith('http') ? repoUrl.split('/').slice(-2).join('/') : repoUrl
    title = `# [${repoName}](${url}) \`${name}\``
  }
  const lines: string[] = [title]

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

  // References with context hints (progressive disclosure — describe what each contains)
  lines.push('')
  const refs: string[] = []
  refs.push(`[package.json](./.skilld/pkg/package.json) — exports, entry points`)
  if (packages && packages.length > 1) {
    for (const pkg of packages) {
      const shortName = pkg.name.split('/').pop()!.toLowerCase()
      refs.push(`[pkg-${shortName}](./.skilld/pkg-${shortName}/package.json)`)
    }
  }
  if (pkgFiles?.includes('README.md'))
    refs.push(`[README](./.skilld/pkg/README.md) — setup, basic usage`)
  if (hasIssues)
    refs.push(`[GitHub Issues](./.skilld/issues/_INDEX.md) — bugs, workarounds, edge cases`)
  if (hasDiscussions)
    refs.push(`[GitHub Discussions](./.skilld/discussions/_INDEX.md) — Q&A, patterns, recipes`)
  if (hasReleases)
    refs.push(`[Releases](./.skilld/releases/_INDEX.md) — changelog, breaking changes, new APIs`)

  if (refs.length > 0)
    lines.push(`**References:** ${refs.join(' • ')}`)

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

/**
 * Extract and expand GitHub repo name into keyword variants.
 * e.g. "motion-v" → ["motion-v", "motion v"]
 */
function expandRepoName(repoUrl: string): string[] {
  const variants = new Set<string>()
  // Extract repo name from URL or owner/repo format
  const repoName = repoUrl.startsWith('http')
    ? repoUrl.split('/').pop()!
    : repoUrl.split('/').pop()!

  if (!repoName)
    return []

  variants.add(repoName) // motion-v
  // Hyphen → space: motion-v → motion v
  if (repoName.includes('-')) {
    variants.add(repoName.replace(/-/g, ' '))
  }
  return [...variants]
}

function generateFrontmatter({ name, version, description: pkgDescription, globs, body, generatedBy, dirName, packages, repoUrl }: SkillOptions): string {
  const patterns = globs ?? getFilePatterns(name)
  const globHint = patterns?.length ? ` or working with ${patterns.join(', ')} files` : ''

  // Strip angle brackets from npm description (forbidden in frontmatter per Agent Skills spec)
  // Cap at 200 chars so the npm description doesn't crowd out our triggering prompt
  const rawDesc = pkgDescription?.replace(/[<>]/g, '').replace(/\.?\s*$/, '')
  const cleanDesc = rawDesc && rawDesc.length > 200 ? `${rawDesc.slice(0, 197)}...` : rawDesc

  const editHint = globHint
    ? `editing${globHint} or code importing`
    : 'writing code importing'

  // Structure: [What it does] + [When to use it] + [Key capabilities]
  let desc: string
  if (packages && packages.length > 1) {
    const importList = packages.map(p => `"${p.name}"`).join(', ')
    const allKeywords = new Set<string>()
    for (const pkg of packages) {
      allKeywords.add(pkg.name)
      for (const kw of expandPackageName(pkg.name))
        allKeywords.add(kw)
    }
    const keywordList = [...allKeywords].join(', ')
    const what = cleanDesc ? `${cleanDesc}. ` : ''
    desc = `${what}ALWAYS use when ${editHint} ${importList}. Consult for debugging, best practices, or modifying ${keywordList}.`
  }
  else {
    const allKeywords = new Set<string>()
    allKeywords.add(name)
    for (const kw of expandPackageName(name))
      allKeywords.add(kw)
    if (repoUrl) {
      for (const kw of expandRepoName(repoUrl))
        allKeywords.add(kw)
    }
    const nameList = [...allKeywords].join(', ')
    const what = cleanDesc ? `${cleanDesc}. ` : ''
    desc = `${what}ALWAYS use when ${editHint} "${name}". Consult for debugging, best practices, or modifying ${nameList}.`
  }

  // Enforce 1024 char limit (Agent Skills spec)
  if (desc.length > 1024)
    desc = `${desc.slice(0, 1021)}...`

  const lines = [
    '---',
    `name: ${dirName ?? sanitizeName(name)}`,
    `description: ${yamlEscape(desc)}`,
  ]
  // version and generated_by go under metadata per Agent Skills spec
  const metaEntries: string[] = []
  if (version)
    metaEntries.push(`  version: ${yamlEscape(version)}`)
  if (body && generatedBy)
    metaEntries.push(`  generated_by: ${yamlEscape(generatedBy)}`)
  if (metaEntries.length) {
    lines.push('metadata:')
    lines.push(...metaEntries)
  }
  lines.push('---', '', '')
  return lines.join('\n')
}

function generateSearchBlock(name: string, hasIssues?: boolean, hasReleases?: boolean): string {
  const examples = [
    `npx -y skilld search "query" -p ${name}`,
  ]
  if (hasIssues)
    examples.push(`npx -y skilld search "issues:error handling" -p ${name}`)
  if (hasReleases)
    examples.push(`npx -y skilld search "releases:deprecated" -p ${name}`)

  return `## Search

Use \`npx -y skilld search\` instead of grepping \`.skilld/\` directories — hybrid semantic + keyword search across all indexed docs, issues, and releases.

\`\`\`bash
${examples.join('\n')}
\`\`\`

Filters: \`docs:\`, \`issues:\`, \`releases:\` prefix narrows by source type.`
}

function generateFooter(relatedSkills: string[]): string {
  if (relatedSkills.length === 0)
    return ''
  return `\nRelated: ${relatedSkills.join(', ')}\n`
}
