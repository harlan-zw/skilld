/**
 * Cache configuration
 */

import { homedir } from 'node:os'
import { join } from 'pathe'

/** Global cache directory */
export const CACHE_DIR = join(homedir(), '.skilld')

/** References subdirectory */
export const REFERENCES_DIR = join(CACHE_DIR, 'references')

/** Repo-level cache (issues, discussions, releases shared across monorepo packages) */
export const REPOS_DIR = join(CACHE_DIR, 'repos')

/** Get repo cache dir for owner/repo with path traversal validation */
export function getRepoCacheDir(owner: string, repo: string): string {
  if (owner.includes('..') || repo.includes('..') || owner.includes('/') || repo.includes('/'))
    throw new Error(`Invalid repo path: ${owner}/${repo}`)
  return join(REPOS_DIR, owner, repo)
}

/** Get search DB path for a specific package@version */
export function getPackageDbPath(name: string, version: string): string {
  return join(REFERENCES_DIR, `${name}@${version}`, 'search.db')
}
