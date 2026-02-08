/**
 * Shared utilities for doc resolution
 */

const USER_AGENT = 'skilld/1.0'

/**
 * Fetch text content from URL
 */
export async function fetchText(url: string): Promise<string | null> {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  }).catch(() => null)

  if (!res?.ok)
    return null
  return res.text()
}

/**
 * Verify URL exists and is not HTML (likely 404 page)
 */
export async function verifyUrl(url: string): Promise<boolean> {
  const res = await fetch(url, {
    method: 'HEAD',
    headers: { 'User-Agent': USER_AGENT },
  }).catch(() => null)

  if (!res?.ok)
    return false

  const contentType = res.headers.get('content-type') || ''
  return !contentType.includes('text/html')
}

/**
 * Check if URL points to a social media or package registry site (not real docs)
 */
const USELESS_HOSTS = new Set([
  'twitter.com',
  'x.com',
  'facebook.com',
  'linkedin.com',
  'youtube.com',
  'instagram.com',
  'npmjs.com',
  'www.npmjs.com',
  'yarnpkg.com',
])

export function isUselessDocsUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url)
    return USELESS_HOSTS.has(hostname)
  }
  catch { return false }
}

/**
 * Check if URL is a GitHub repo URL (not a docs site)
 */
export function isGitHubRepoUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.hostname === 'github.com' || parsed.hostname === 'www.github.com'
  }
  catch {
    return false
  }
}

/**
 * Parse owner/repo from GitHub URL
 */
export function parseGitHubUrl(url: string): { owner: string, repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:[/#]|$)/)
  if (!match)
    return null
  return { owner: match[1]!, repo: match[2]! }
}

/**
 * Normalize git repo URL to https
 */
export function normalizeRepoUrl(url: string): string {
  return url
    .replace(/^git\+/, '')
    .replace(/#.*$/, '')
    .replace(/\.git$/, '')
    .replace(/^git:\/\//, 'https://')
    .replace(/^ssh:\/\/git@github\.com/, 'https://github.com')
}

/**
 * Extract branch hint from URL fragment (e.g. "git+https://...#main" → "main")
 */
export function extractBranchHint(url: string): string | undefined {
  const hash = url.indexOf('#')
  if (hash === -1)
    return undefined
  const fragment = url.slice(hash + 1)
  // Ignore non-branch fragments like "readme"
  if (!fragment || fragment === 'readme')
    return undefined
  return fragment
}
