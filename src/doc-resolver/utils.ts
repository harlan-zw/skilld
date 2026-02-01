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

  if (!res?.ok) return null
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

  if (!res?.ok) return false

  const contentType = res.headers.get('content-type') || ''
  return !contentType.includes('text/html')
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
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
  if (!match) return null
  return { owner: match[1]!, repo: match[2]! }
}

/**
 * Normalize git repo URL to https
 */
export function normalizeRepoUrl(url: string): string {
  return url
    .replace(/^git\+/, '')
    .replace(/\.git$/, '')
    .replace(/^git:\/\//, 'https://')
    .replace(/^ssh:\/\/git@github\.com/, 'https://github.com')
}
