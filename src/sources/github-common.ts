/**
 * Shared constants and helpers for GitHub source modules (issues, discussions, releases)
 */

import { spawnSync } from 'node:child_process'

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
