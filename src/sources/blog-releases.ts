/**
 * Blog release notes fetching for packages with curated blog releases
 * Supports version filtering and extensible for multiple packages
 */

import type { BlogRelease } from './package-registry'
import { htmlToMarkdown } from 'mdream'
import { getBlogPreset } from './package-registry'
import { compareSemver, parseSemver } from './releases'
import { $fetch } from './utils'

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
 * Parse version from blog URL
 * Handles: https://blog.vuejs.org/posts/vue-3-5 → 3.5
 */
function parseVersionFromUrl(url: string): string | null {
  const match = url.match(/\/posts\/\w+-(\d+)-(\d+)/)
  if (match)
    return `${match[1]}.${match[2]}`
  return null
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
 * Fetch and parse a single blog post
 */
async function fetchBlogPost(url: string): Promise<BlogReleasePost | null> {
  try {
    const html = await $fetch(url, { responseType: 'text', signal: AbortSignal.timeout(10_000) }).catch(() => null)
    if (!html)
      return null

    // Extract version from URL
    const version = parseVersionFromUrl(url)
    if (!version)
      return null

    // Extract title from <h1> or <title>
    let title = ''
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/)
    if (titleMatch)
      title = titleMatch[1]!.trim()

    // If no h1, try meta title
    if (!title) {
      const metaTitleMatch = html.match(/<title>([^<]+)<\/title>/)
      if (metaTitleMatch)
        title = metaTitleMatch[1]!.trim()
    }

    // Extract date from article metadata or ISO date pattern
    let date = new Date().toISOString().split('T')[0]!
    const dateMatch = html.match(/(?:published|date|posted)["']?\s*:\s*["']?(\d{4}-\d{2}-\d{2})/)
    if (dateMatch)
      date = dateMatch[1]!

    // Convert HTML to markdown using mdream
    const markdown = htmlToMarkdown(html)
    if (!markdown)
      return null

    return {
      version,
      title: title || `Release ${version}`,
      date,
      markdown,
      url,
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
    const results = await Promise.all(batch.map(entry => fetchBlogPost(entry.url)))
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
