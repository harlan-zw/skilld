/**
 * Shared constants and helpers for GitHub source modules (issues, discussions, releases)
 */

import { spawnSync } from 'node:child_process'
import { ofetch } from 'ofetch'

export const BOT_USERS = new Set([
  'renovate[bot]',
  'dependabot[bot]',
  'renovate-bot',
  'dependabot',
  'github-actions[bot]',
])

/** Extract YYYY-MM-DD date from an ISO timestamp */
export const isoDate = (iso: string) => iso.split('T')[0]

/** Build YAML frontmatter from a key-value object, auto-quoting strings with special chars */
export function buildFrontmatter(fields: Record<string, string | number | boolean | undefined>): string {
  const lines = ['---']
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined)
      lines.push(`${k}: ${typeof v === 'string' && /[:"[\]]/.test(v) ? `"${v.replace(/"/g, '\\"')}"` : v}`)
  }
  lines.push('---')
  return lines.join('\n')
}

// ── GitHub Auth ──

let _ghToken: string | null | undefined

/**
 * Get GitHub auth token from gh CLI (cached).
 * Returns null if gh CLI is not available or not authenticated.
 */
export function getGitHubToken(): string | null {
  if (_ghToken !== undefined)
    return _ghToken
  try {
    const { stdout } = spawnSync('gh', ['auth', 'token'], {
      encoding: 'utf-8',
      timeout: 5_000,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    _ghToken = stdout?.trim() || null
  }
  catch {
    _ghToken = null
  }
  return _ghToken
}

// ── Private Repo Tracking ──

/** Repos where ungh.cc failed but gh api succeeded (likely private) */
const _needsAuth = new Set<string>()

/** Mark a repo as needing authenticated access */
export function markRepoPrivate(owner: string, repo: string): void {
  _needsAuth.add(`${owner}/${repo}`)
}

/** Check if a repo is known to need authenticated access */
export function isKnownPrivateRepo(owner: string, repo: string): boolean {
  return _needsAuth.has(`${owner}/${repo}`)
}

// ── GitHub API (async, no process spawn) ──

const GH_API = 'https://api.github.com'

const ghApiFetch = ofetch.create({
  retry: 2,
  retryDelay: 500,
  timeout: 15_000,
  headers: { 'User-Agent': 'skilld/1.0' },
})

const LINK_NEXT_RE = /<([^>]+)>;\s*rel="next"/

/** Parse GitHub Link header for next page URL */
function parseLinkNext(header: string | null): string | null {
  if (!header)
    return null
  return header.match(LINK_NEXT_RE)?.[1] ?? null
}

/**
 * Authenticated fetch against api.github.com. Returns null if no token or request fails.
 * Endpoint should be relative, e.g. `repos/owner/repo/releases`.
 */
export async function ghApi<T>(endpoint: string): Promise<T | null> {
  const token = getGitHubToken()
  if (!token)
    return null
  return ghApiFetch<T>(`${GH_API}/${endpoint}`, {
    headers: { Authorization: `token ${token}` },
  }).catch(() => null)
}

/**
 * Paginated GitHub API fetch. Follows Link headers, returns concatenated arrays.
 * Endpoint should return a JSON array, e.g. `repos/owner/repo/releases`.
 */
export async function ghApiPaginated<T>(endpoint: string): Promise<T[]> {
  const token = getGitHubToken()
  if (!token)
    return []

  const headers = { Authorization: `token ${token}` }
  const results: T[] = []
  let url: string | null = `${GH_API}/${endpoint}`

  while (url) {
    const res = await ghApiFetch.raw<T[]>(url, { headers }).catch(() => null)
    if (!res?.ok || !Array.isArray(res._data))
      break
    results.push(...res._data)
    url = parseLinkNext(res.headers.get('link'))
  }

  return results
}
