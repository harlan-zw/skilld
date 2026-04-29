/**
 * SKILL.md file generation
 */

import type { FeaturesConfig } from '../../core/config.ts'
import { writeFileSync } from 'node:fs'
import { join } from 'pathe'
import { todayIsoDate } from '../../core/formatting.ts'
import { repairMarkdown, sanitizeMarkdown } from '../../core/sanitize.ts'
import { resolveSkilldCommand } from '../../core/shared.ts'
import { yamlEscape } from '../../core/yaml.ts'
import { getFilePatterns } from '../../sources/package-registry.ts'
import { computeSkillDirName } from '../install.ts'

export interface SkillOptions {
  name: string
  version?: string
  releasedAt?: string
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
  /** Eject mode: use ./references/ paths instead of ./.skilld/ for portable skills */
  eject?: boolean
}

export function writeSkillMd(skillDir: string, content: string): void {
  writeFileSync(join(skillDir, 'SKILL.md'), content)
}

export function writeGeneratedSkillMd(skillDir: string, opts: SkillOptions): string {
  const content = generateSkillMd(opts)
  writeSkillMd(skillDir, content)
  return content
}

export function generateSkillMd(opts: SkillOptions): string {
  const header = generatePackageHeader(opts)
  const search = !opts.eject && opts.features?.search !== false ? generateSearchBlock(opts.name) : ''
  // Eject mode: rewrite .skilld/ paths to ./references/ in LLM-generated body
  // Then strip [source](./references/pkg/...) links since pkg/ is not ejected
  let body = opts.body
  if (body && opts.eject) {
    body = body.replace(/\.\/\.skilld\//g, './references/')
    body = body.replace(/\s*\[source\]\(\.\/references\/pkg\/[^)]*\)/gi, '')
  }
  const content = body
    ? search ? `${header}\n\n${search}\n\n${body}` : `${header}\n\n${body}`
    : search ? `${header}\n\n${search}` : header
  const footer = generateFooter(opts.relatedSkills)
  return sanitizeMarkdown(repairMarkdown(`${generateFrontmatter(opts)}${content}\n${footer}`))
}

/** Format ISO date as short absolute date: "Jan 2025", "Dec 2024" */
function formatShortDate(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime()))
    return ''
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

function generatePackageHeader({ name, version, distTags, repoUrl, hasIssues, hasDiscussions, hasReleases, docsType, pkgFiles, packages, eject }: SkillOptions): string {
  const versionSuffix = version ? `@${version}` : ''
  let title = `# ${name}${versionSuffix}`
  if (repoUrl) {
    const url = repoUrl.startsWith('http') ? repoUrl : `https://github.com/${repoUrl}`
    const repoName = repoUrl.startsWith('http') ? repoUrl.split('/').slice(-2).join('/') : repoUrl
    title = `# [${repoName}](${url}) \`${name}${versionSuffix}\``
  }
  const lines: string[] = [title]

  if (distTags && Object.keys(distTags).length > 0) {
    const tags = Object.entries(distTags)
      .sort(([, a], [, b]) => (b.releasedAt ?? '').localeCompare(a.releasedAt ?? ''))
      .slice(0, 3)
      .map(([tag, info]) => {
        const relDate = info.releasedAt ? ` (${formatShortDate(info.releasedAt)})` : ''
        return `${tag}: ${info.version}${relDate}`
      })
      .join(', ')
    lines.push(`**Tags:** ${tags}`)
  }

  // References with context hints (progressive disclosure — describe what each contains)
  lines.push('')
  const refBase = eject ? './references' : './.skilld'
  const refs: string[] = []
  if (!eject) {
    refs.push(`[package.json](${refBase}/pkg/package.json)`)
    if (packages && packages.length > 1) {
      for (const pkg of packages) {
        const shortName = pkg.name.split('/').pop()!.toLowerCase()
        refs.push(`[pkg-${shortName}](${refBase}/pkg-${shortName}/package.json)`)
      }
    }
    if (pkgFiles?.includes('README.md'))
      refs.push(`[README](${refBase}/pkg/README.md)`)
  }
  if (docsType && docsType !== 'readme')
    refs.push(`[Docs](${refBase}/docs/_INDEX.md)`)
  if (hasIssues)
    refs.push(`[Issues](${refBase}/issues/_INDEX.md)`)
  if (hasDiscussions)
    refs.push(`[Discussions](${refBase}/discussions/_INDEX.md)`)
  if (hasReleases)
    refs.push(`[Releases](${refBase}/releases/_INDEX.md)`)

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
    `name: ${dirName ?? computeSkillDirName(name)}`,
    `description: ${yamlEscape(desc)}`,
  ]
  // version and generated_by go under metadata per Agent Skills spec
  const metaEntries: string[] = []
  if (version)
    metaEntries.push(`  version: ${yamlEscape(version)}`)
  if (body && generatedBy)
    metaEntries.push(`  generated_by: ${yamlEscape(generatedBy)}`)
  metaEntries.push(`  generated_at: ${todayIsoDate()}`)
  if (metaEntries.length) {
    lines.push('metadata:')
    lines.push(...metaEntries)
  }
  lines.push('---', '', '')
  return lines.join('\n')
}

function generateSearchBlock(name: string): string {
  const cmd = resolveSkilldCommand()

  return `## Search

Use \`${cmd} search "query" -p ${name}\` instead of grepping \`.skilld/\` directories. Run \`${cmd} search --guide -p ${name}\` for full syntax, filters, and operators.`
}

function generateFooter(relatedSkills: string[]): string {
  if (relatedSkills.length === 0)
    return ''
  return `\nRelated: ${relatedSkills.join(', ')}\n`
}
