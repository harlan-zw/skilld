/**
 * GitHub release notes fetching via gh CLI (preferred) with ungh.cc fallback
 */

import { spawnSync } from 'node:child_process'
import { isGhAvailable } from './issues'
import { $fetch } from './utils'

export interface GitHubRelease {
  id: number
  tag: string
  name: string
  prerelease: boolean
  createdAt: string
  publishedAt: string
  markdown: string
}

interface UnghReleasesResponse {
  releases: GitHubRelease[]
}

interface CachedDoc {
  path: string
  content: string
}

interface SemVer {
  major: number
  minor: number
  patch: number
  raw: string
}

function parseSemver(version: string): SemVer | null {
  const clean = version.replace(/^v/, '')
  const match = clean.match(/^(\d+)\.(\d+)\.(\d+)/)
  if (!match)
    return null
  return { major: +match[1]!, minor: +match[2]!, patch: +match[3]!, raw: clean }
}

/**
 * Extract version from a release tag, handling monorepo formats:
 * - `pkg@1.2.3` → `1.2.3`
 * - `pkg-v1.2.3` → `1.2.3`
 * - `v1.2.3` → `1.2.3`
 * - `1.2.3` → `1.2.3`
 */
function extractVersion(tag: string, packageName?: string): string | null {
  if (packageName) {
    // Monorepo: pkg@version or pkg-vversion
    const atMatch = tag.match(new RegExp(`^${escapeRegex(packageName)}@(.+)$`))
    if (atMatch)
      return atMatch[1]!
    const dashMatch = tag.match(new RegExp(`^${escapeRegex(packageName)}-v?(.+)$`))
    if (dashMatch)
      return dashMatch[1]!
  }
  // Standard: v1.2.3 or 1.2.3
  return tag.replace(/^v/, '')
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Check if a release tag belongs to a specific package
 */
function tagMatchesPackage(tag: string, packageName: string): boolean {
  // Exact match: pkg@version or pkg-vversion
  return tag.startsWith(`${packageName}@`) || tag.startsWith(`${packageName}-v`) || tag.startsWith(`${packageName}-`)
}

function compareSemver(a: SemVer, b: SemVer): number {
  if (a.major !== b.major)
    return a.major - b.major
  if (a.minor !== b.minor)
    return a.minor - b.minor
  return a.patch - b.patch
}

/**
 * Fetch releases via gh CLI (fast, authenticated, paginated)
 */
function fetchReleasesViaGh(owner: string, repo: string): GitHubRelease[] {
  try {
    const { stdout: json } = spawnSync('gh', [
      'api',
      `repos/${owner}/${repo}/releases?per_page=100`,
      '--jq',
      '[.[] | {id: .id, tag: .tag_name, name: .name, prerelease: .prerelease, createdAt: .created_at, publishedAt: .published_at, markdown: .body}]',
    ], { encoding: 'utf-8', timeout: 15_000, stdio: ['ignore', 'pipe', 'ignore'] })
    if (!json)
      return []
    return JSON.parse(json) as GitHubRelease[]
  }
  catch {
    return []
  }
}

/**
 * Fetch all releases from a GitHub repo via ungh.cc (fallback)
 */
async function fetchReleasesViaUngh(owner: string, repo: string): Promise<GitHubRelease[]> {
  const data = await $fetch<UnghReleasesResponse>(
    `https://ungh.cc/repos/${owner}/${repo}/releases`,
    { signal: AbortSignal.timeout(15_000) },
  ).catch(() => null)
  return data?.releases ?? []
}

/**
 * Fetch all releases — gh CLI first, ungh.cc fallback
 */
async function fetchAllReleases(owner: string, repo: string): Promise<GitHubRelease[]> {
  if (isGhAvailable()) {
    const releases = fetchReleasesViaGh(owner, repo)
    if (releases.length > 0)
      return releases
  }
  return fetchReleasesViaUngh(owner, repo)
}

/**
 * Select last 20 stable releases for a package, sorted newest first.
 * For monorepos, filters to package-specific tags (pkg@version).
 * Falls back to generic tags (v1.2.3) only if no package-specific found.
 */
export function selectReleases(releases: GitHubRelease[], packageName?: string): GitHubRelease[] {
  // Check if this looks like a monorepo (has package-prefixed tags)
  const hasMonorepoTags = packageName && releases.some(r => tagMatchesPackage(r.tag, packageName))

  const filtered = releases.filter((r) => {
    if (r.prerelease)
      return false

    // Monorepo: only include tags for this package
    if (hasMonorepoTags && packageName) {
      if (!tagMatchesPackage(r.tag, packageName))
        return false
      const ver = extractVersion(r.tag, packageName)
      return ver && parseSemver(ver)
    }

    // Single-package repo: use generic version tags
    return parseSemver(r.tag)
  })

  return filtered
    .sort((a, b) => {
      const verA = extractVersion(a.tag, hasMonorepoTags ? packageName : undefined)
      const verB = extractVersion(b.tag, hasMonorepoTags ? packageName : undefined)
      if (!verA || !verB)
        return 0
      return compareSemver(parseSemver(verB)!, parseSemver(verA)!)
    })
    .slice(0, 20)
}

/**
 * Format a release as markdown with YAML frontmatter
 */
function formatRelease(release: GitHubRelease, packageName?: string): string {
  const date = (release.publishedAt || release.createdAt).split('T')[0]
  const version = extractVersion(release.tag, packageName) || release.tag

  const fm = [
    '---',
    `tag: ${release.tag}`,
    `version: ${version}`,
    `published: ${date}`,
  ]
  if (release.name && release.name !== release.tag)
    fm.push(`name: "${release.name.replace(/"/g, '\\"')}"`)
  fm.push('---')

  return `${fm.join('\n')}\n\n# ${release.name || release.tag}\n\n${release.markdown}`
}

/**
 * Generate a summary index of all releases for quick LLM scanning.
 * Shows version timeline so LLM can quickly identify breaking changes.
 */
export function generateReleaseIndex(releases: GitHubRelease[], packageName?: string): string {
  const fm = [
    '---',
    `total: ${releases.length}`,
    `latest: ${releases[0]?.tag || 'unknown'}`,
    '---',
  ]

  const lines: string[] = [fm.join('\n'), '', '# Releases Index', '']

  for (const r of releases) {
    const date = (r.publishedAt || r.createdAt).split('T')[0]
    const filename = r.tag.includes('@') || r.tag.startsWith('v') ? r.tag : `v${r.tag}`
    const version = extractVersion(r.tag, packageName) || r.tag
    // Flag major/minor bumps for visibility
    const sv = parseSemver(version)
    const label = sv?.patch === 0 && sv.minor === 0 ? ' **[MAJOR]**' : sv?.patch === 0 ? ' **[MINOR]**' : ''
    lines.push(`- [${r.tag}](./releases/${filename}.md): ${r.name || r.tag} (${date})${label}`)
  }

  lines.push('')
  return lines.join('\n')
}

/**
 * Detect if releases are just short stubs redirecting to CHANGELOG.md.
 * Samples up to 3 releases — if all are short (<500 chars) and mention CHANGELOG, it's a redirect pattern.
 */
export function isChangelogRedirectPattern(releases: GitHubRelease[]): boolean {
  const sample = releases.slice(0, 3)
  if (sample.length === 0)
    return false
  return sample.every((r) => {
    const body = (r.markdown || '').trim()
    return body.length < 500 && /changelog\.md/i.test(body)
  })
}

/**
 * Fetch CHANGELOG.md from a GitHub repo at a specific ref as fallback
 */
async function fetchChangelog(owner: string, repo: string, ref: string): Promise<string | null> {
  for (const filename of ['CHANGELOG.md', 'changelog.md', 'CHANGES.md']) {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${filename}`
    const content = await $fetch(url, { responseType: 'text', signal: AbortSignal.timeout(10_000) }).catch(() => null)
    if (content)
      return content
  }
  return null
}

/**
 * Fetch release notes for a package. Returns CachedDoc[] with releases/{tag}.md files.
 *
 * Strategy:
 * 1. Fetch GitHub releases, filter to package-specific tags for monorepos
 * 2. If no releases found, try CHANGELOG.md as fallback
 */
export async function fetchReleaseNotes(
  owner: string,
  repo: string,
  installedVersion: string,
  gitRef?: string,
  packageName?: string,
): Promise<CachedDoc[]> {
  const releases = await fetchAllReleases(owner, repo)
  const selected = selectReleases(releases, packageName)

  if (selected.length > 0) {
    // Detect changelog-redirect pattern: short stubs that just link to CHANGELOG.md
    // Sample up to 3 releases to check
    if (isChangelogRedirectPattern(selected)) {
      const ref = gitRef || selected[0]!.tag
      const changelog = await fetchChangelog(owner, repo, ref)
      if (changelog)
        return [{ path: 'CHANGELOG.md', content: changelog }]
    }

    const docs = selected.map((r) => {
      const filename = r.tag.includes('@') || r.tag.startsWith('v')
        ? r.tag
        : `v${r.tag}`
      return {
        path: `releases/${filename}.md`,
        content: formatRelease(r, packageName),
      }
    })
    // Add index for quick LLM scanning
    docs.push({
      path: 'releases/_INDEX.md',
      content: generateReleaseIndex(selected, packageName),
    })
    return docs
  }

  // Fallback: CHANGELOG.md (indexed as single file)
  const ref = gitRef || 'main'
  const changelog = await fetchChangelog(owner, repo, ref)
  if (!changelog)
    return []

  return [{ path: 'CHANGELOG.md', content: changelog }]
}
