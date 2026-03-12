/**
 * Shared utilities for doc resolution
 */

import { ofetch } from 'ofetch'
import { getGitHubToken, isKnownPrivateRepo, markRepoPrivate } from './github-common.ts'

export const $fetch = ofetch.create({
  retry: 3,
  retryDelay: 500,
  timeout: 15_000,
  headers: { 'User-Agent': 'skilld/1.0' },
})

/**
 * Fetch text content from URL
 */
export async function fetchText(url: string): Promise<string | null> {
  return $fetch(url, { responseType: 'text' }).catch(() => null)
}

const RAW_GH_RE = /raw\.githubusercontent\.com\/([^/]+)\/([^/]+)/

/** Extract owner/repo from a GitHub raw content URL */
function extractGitHubRepo(url: string): { owner: string, repo: string } | null {
  const match = url.match(RAW_GH_RE)
  return match ? { owner: match[1]!, repo: match[2]! } : null
}

/**
 * Fetch text from a GitHub raw URL with auth fallback for private repos.
 * Tries unauthenticated first (fast path), falls back to authenticated
 * request when the repo is known to be private or unauthenticated fails.
 *
 * Only sends auth tokens to raw.githubusercontent.com — returns null for
 * non-GitHub URLs that fail unauthenticated to prevent token leakage.
 */
export async function fetchGitHubRaw(url: string): Promise<string | null> {
  const gh = extractGitHubRepo(url)
  const isKnownPrivate = gh ? isKnownPrivateRepo(gh.owner, gh.repo) : false

  // Fast path: skip unauthenticated attempt for known private repos
  if (!isKnownPrivate) {
    const content = await fetchText(url)
    if (content)
      return content
  }

  // Only send auth tokens to raw.githubusercontent.com
  if (!gh)
    return null

  // Fallback: authenticated request for private repos
  const token = getGitHubToken()
  if (!token)
    return null

  const content = await $fetch(url, {
    responseType: 'text',
    headers: { Authorization: `token ${token}` },
  }).catch(() => null) as string | null
  if (content)
    markRepoPrivate(gh.owner, gh.repo)
  return content
}

/**
 * Verify URL exists and is not HTML (likely 404 page)
 */
export async function verifyUrl(url: string): Promise<boolean> {
  const res = await $fetch.raw(url, { method: 'HEAD' }).catch(() => null)
  if (!res)
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
    // SSH format: git@github.com:owner/repo
    .replace(/^git@github\.com:/, 'https://github.com/')
}

/**
 * Parse package spec with optional dist-tag or version: "vue@beta" → { name: "vue", tag: "beta" }
 * Handles scoped packages: "@vue/reactivity@beta" → { name: "@vue/reactivity", tag: "beta" }
 */
export function parsePackageSpec(spec: string): { name: string, tag?: string } {
  // Scoped: @scope/pkg@tag — find the second @
  if (spec.startsWith('@')) {
    const slashIdx = spec.indexOf('/')
    if (slashIdx !== -1) {
      const atIdx = spec.indexOf('@', slashIdx + 1)
      if (atIdx !== -1)
        return { name: spec.slice(0, atIdx), tag: spec.slice(atIdx + 1) }
    }
    return { name: spec }
  }
  // Unscoped: pkg@tag
  const atIdx = spec.indexOf('@')
  if (atIdx !== -1)
    return { name: spec.slice(0, atIdx), tag: spec.slice(atIdx + 1) }
  return { name: spec }
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
