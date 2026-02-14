/**
 * Blog release notes fetching for packages with curated blog releases
 * Supports version filtering and extensible for multiple packages
 */

import type { BlogRelease } from './package-registry.ts'
import { htmlToMarkdown } from 'mdream'
import { getBlogPreset } from './package-registry.ts'
import { compareSemver, parseSemver } from './releases.ts'
import { $fetch } from './utils.ts'

export interface BlogReleasePost {
  version: string
  title: string
  date: string
  markdown: string
  url: string
}

interface CachedDoc {
  path: string
  content: string
}

/**
 * Format a blog release as markdown with YAML frontmatter
 */
function formatBlogRelease(release: BlogReleasePost): string {
  const fm = [
    '---',
    `version: ${release.version}`,
    `title: "${release.title.replace(/"/g, '\\"')}"`,
    `date: ${release.date}`,
    `url: ${release.url}`,
    `source: blog-release`,
    '---',
  ]

  return `${fm.join('\n')}\n\n# ${release.title}\n\n${release.markdown}`
}

/**
 * Fetch and parse a single blog post using preset metadata for version/date
 */
async function fetchBlogPost(entry: BlogRelease): Promise<BlogReleasePost | null> {
  try {
    const html = await $fetch(entry.url, { responseType: 'text', signal: AbortSignal.timeout(10_000) }).catch(() => null)
    if (!html)
      return null

    // Extract title from <h1> or <title>, fallback to preset title
    let title = ''
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/)
    if (titleMatch)
      title = titleMatch[1]!.trim()

    if (!title) {
      const metaTitleMatch = html.match(/<title>([^<]+)<\/title>/)
      if (metaTitleMatch)
        title = metaTitleMatch[1]!.trim()
    }

    const markdown = htmlToMarkdown(html)
    if (!markdown)
      return null

    return {
      version: entry.version,
      title: title || entry.title || `Release ${entry.version}`,
      date: entry.date,
      markdown,
      url: entry.url,
    }
  }
  catch {
    return null
  }
}

/**
 * Filter blog releases by installed version
 * Only includes releases where version <= installedVersion
 * Returns all releases if version parsing fails (fail-safe)
 */
function filterBlogsByVersion(entries: BlogRelease[], installedVersion: string): BlogRelease[] {
  const installedSv = parseSemver(installedVersion)
  if (!installedSv)
    return entries // Fail-safe: include all if version parsing fails

  return entries.filter((entry) => {
    const entrySv = parseSemver(entry.version)
    if (!entrySv)
      return false
    // Include only releases where version <= installed version
    return compareSemver(entrySv, installedSv) <= 0
  })
}

/**
 * Fetch blog release notes from package presets
 * Filters to only releases matching or older than the installed version
 * Returns CachedDoc[] with releases/blog-{version}.md files
 */
export async function fetchBlogReleases(
  packageName: string,
  installedVersion: string,
): Promise<CachedDoc[]> {
  const preset = getBlogPreset(packageName)
  if (!preset)
    return []

  const filteredReleases = filterBlogsByVersion(preset.releases, installedVersion)
  if (filteredReleases.length === 0)
    return []

  const releases: BlogReleasePost[] = []

  // Fetch all blog posts in parallel with 3 concurrent requests
  const batchSize = 3
  for (let i = 0; i < filteredReleases.length; i += batchSize) {
    const batch = filteredReleases.slice(i, i + batchSize)
    const results = await Promise.all(batch.map(entry => fetchBlogPost(entry)))
    for (const result of results) {
      if (result)
        releases.push(result)
    }
  }

  if (releases.length === 0)
    return []

  // Sort by version descending (newest first)
  releases.sort((a, b) => {
    const aVer = a.version.split('.').map(Number)
    const bVer = b.version.split('.').map(Number)
    for (let i = 0; i < Math.max(aVer.length, bVer.length); i++) {
      const diff = (bVer[i] ?? 0) - (aVer[i] ?? 0)
      if (diff !== 0)
        return diff
    }
    return 0
  })

  // Format as cached docs — stored in releases/ alongside regular releases
  return releases.map(r => ({
    path: `releases/blog-${r.version}.md`,
    content: formatBlogRelease(r),
  }))
}
