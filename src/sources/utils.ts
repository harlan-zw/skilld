/**
 * Shared utilities for doc resolution
 */

import { ofetch } from 'ofetch'

export const SKILLD_USER_AGENT = 'skilld/1.0 (+https://github.com/harlan-zw/skilld)'

export const $fetch = ofetch.create({
  retry: 3,
  retryDelay: 1000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
  timeout: 15_000,
  headers: { 'User-Agent': SKILLD_USER_AGENT },
})

export function createRateLimitedRunner(intervalMs: number): <T>(task: () => Promise<T>) => Promise<T> {
  let queue: Promise<void> = Promise.resolve()
  let lastRunAt = 0

  return async function runRateLimited<T>(task: () => Promise<T>): Promise<T> {
    const run = async (): Promise<T> => {
      const elapsed = Date.now() - lastRunAt
      const waitMs = intervalMs - elapsed
      if (waitMs > 0)
        await new Promise(resolve => setTimeout(resolve, waitMs))

      lastRunAt = Date.now()
      return task()
    }

    const request = queue.then(run, run)
    queue = request.then(() => undefined, () => undefined)
    return request
  }
}

/**
 * Fetch text content from URL
 */
export async function fetchText(url: string): Promise<string | null> {
  return $fetch(url, { responseType: 'text' }).catch(() => null)
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

export function isLikelyCodeHostUrl(url: string | undefined): boolean {
  if (!url)
    return false
  try {
    const parsed = new URL(url)
    return ['github.com', 'www.github.com', 'gitlab.com', 'www.gitlab.com'].includes(parsed.hostname)
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
