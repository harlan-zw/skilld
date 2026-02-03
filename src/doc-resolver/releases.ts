/**
 * GitHub release notes fetching via ungh.cc API
 */

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

function compareSemver(a: SemVer, b: SemVer): number {
  if (a.major !== b.major)
    return a.major - b.major
  if (a.minor !== b.minor)
    return a.minor - b.minor
  return a.patch - b.patch
}

/**
 * Fetch all releases from a GitHub repo via ungh.cc
 */
async function fetchAllReleases(owner: string, repo: string): Promise<GitHubRelease[]> {
  const res = await fetch(
    `https://ungh.cc/repos/${owner}/${repo}/releases`,
    { headers: { 'User-Agent': 'skilld/1.0' } },
  ).catch(() => null)

  if (!res?.ok)
    return []

  const data = await res.json().catch(() => null) as UnghReleasesResponse | null
  return data?.releases ?? []
}

/**
 * Find release notes for last major and last minor versions relative to installed version.
 *
 * e.g. installed = 3.5.13 → last major = latest 2.x.x, last minor = latest 3.4.x
 */
export function selectReleases(releases: GitHubRelease[], installedVersion: string): GitHubRelease[] {
  const installed = parseSemver(installedVersion)
  if (!installed)
    return []

  // Filter to stable releases with valid semver tags
  const stable = releases
    .filter(r => !r.prerelease)
    .map(r => ({ release: r, semver: parseSemver(r.tag)! }))
    .filter(r => r.semver !== null)

  const selected: GitHubRelease[] = []

  // Last major: highest version where major < installedMajor
  const prevMajor = stable
    .filter(r => r.semver.major < installed.major)
    .sort((a, b) => compareSemver(b.semver, a.semver))
  if (prevMajor.length > 0)
    selected.push(prevMajor[0]!.release)

  // Last minor: highest version where major === installedMajor && minor < installedMinor
  const prevMinor = stable
    .filter(r => r.semver.major === installed.major && r.semver.minor < installed.minor)
    .sort((a, b) => compareSemver(b.semver, a.semver))
  if (prevMinor.length > 0)
    selected.push(prevMinor[0]!.release)

  return selected
}

/**
 * Format a release as markdown
 */
function formatRelease(release: GitHubRelease): string {
  const date = (release.publishedAt || release.createdAt).split('T')[0]
  return `# ${release.name || release.tag}\n\nTag: ${release.tag} | Published: ${date}\n\n${release.markdown}`
}

/**
 * Fetch CHANGELOG.md from a GitHub repo at a specific ref as fallback
 */
async function fetchChangelog(owner: string, repo: string, ref: string): Promise<string | null> {
  for (const filename of ['CHANGELOG.md', 'changelog.md', 'CHANGES.md']) {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${filename}`
    const res = await fetch(url, { headers: { 'User-Agent': 'skilld/1.0' } }).catch(() => null)
    if (res?.ok)
      return res.text()
  }
  return null
}

/**
 * Extract sections from a CHANGELOG for specific versions.
 * Looks for headings like ## 2.17.0, ## [3.4.0], ## v2.17.0, etc.
 */
export function extractChangelogSections(changelog: string, versions: string[]): CachedDoc[] {
  const docs: CachedDoc[] = []

  for (const version of versions) {
    const escaped = version.replace(/\./g, '\\.')
    const pattern = new RegExp(`^##\\s+\\[?v?${escaped}\\]?[^\\n]*\\n`, 'm')
    const match = changelog.match(pattern)
    if (!match?.index && match?.index !== 0)
      continue

    const start = match.index
    const rest = changelog.slice(start + match[0].length)
    const nextHeading = rest.match(/^## /m)
    const section = nextHeading?.index
      ? changelog.slice(start, start + match[0].length + nextHeading.index)
      : changelog.slice(start)

    if (section.trim()) {
      docs.push({ path: `releases/v${version}.md`, content: section.trim() })
    }
  }

  return docs
}

/**
 * Fetch release notes for a package. Returns CachedDoc[] with releases/{tag}.md files.
 *
 * Strategy:
 * 1. Fetch GitHub releases via ungh.cc, select last major + last minor
 * 2. If no releases found, try CHANGELOG.md as fallback
 */
export async function fetchReleaseNotes(
  owner: string,
  repo: string,
  installedVersion: string,
  gitRef?: string,
): Promise<CachedDoc[]> {
  const releases = await fetchAllReleases(owner, repo)
  const selected = selectReleases(releases, installedVersion)

  if (selected.length > 0) {
    return selected.map(r => ({
      path: `releases/${r.tag.startsWith('v') ? r.tag : `v${r.tag}`}.md`,
      content: formatRelease(r),
    }))
  }

  // Fallback: CHANGELOG.md
  const ref = gitRef || 'main'
  const changelog = await fetchChangelog(owner, repo, ref)
  if (!changelog)
    return []

  const installed = parseSemver(installedVersion)
  if (!installed)
    return []

  const targetVersions: string[] = []

  // Parse all version headings from changelog
  const headings = [...changelog.matchAll(/^##\s+\[?v?(\d+\.\d+\.\d+)\]?/gm)]
    .map(m => ({ version: m[1]!, semver: parseSemver(m[1]!)! }))
    .filter(h => h.semver !== null)

  // Last major
  const prevMajor = headings
    .filter(h => h.semver.major < installed.major)
    .sort((a, b) => compareSemver(b.semver, a.semver))
  if (prevMajor.length > 0)
    targetVersions.push(prevMajor[0]!.version)

  // Last minor
  const prevMinor = headings
    .filter(h => h.semver.major === installed.major && h.semver.minor < installed.minor)
    .sort((a, b) => compareSemver(b.semver, a.semver))
  if (prevMinor.length > 0)
    targetVersions.push(prevMinor[0]!.version)

  if (targetVersions.length === 0)
    return []

  return extractChangelogSections(changelog, targetVersions)
}
