/**
 * GitHub tag/version resolution and release listing.
 *
 * Owns the "find a usable git ref for this version" cascade plus the lower-level
 * `listFilesAtRef` primitive (shared with doc-discovery / source fetch).
 */

import { fetchUnghOrApi, ghApi, ghApiPaginated } from './github-common.ts'
import { $fetch } from './utils.ts'

interface UnghFilesResponse {
  meta: { sha: string }
  files: Array<{ path: string, mode: string, sha: string, size: number }>
}

/**
 * List files at a git ref. Tries ungh.cc first (fast, no rate limits),
 * falls back to GitHub API for private repos.
 */
export async function listFilesAtRef(owner: string, repo: string, ref: string): Promise<string[]> {
  const files = await fetchUnghOrApi<string[]>(
    owner,
    repo,
    async () => {
      const data = await $fetch<UnghFilesResponse>(`https://ungh.cc/repos/${owner}/${repo}/files/${ref}`)
      return data.files?.length ? data.files.map(f => f.path) : null
    },
    async () => {
      const tree = await ghApi<{ tree?: Array<{ path: string }> }>(`repos/${owner}/${repo}/git/trees/${ref}?recursive=1`)
      return tree?.tree?.length ? tree.tree.map(f => f.path) : null
    },
  )
  return files ?? []
}

export interface TagResult {
  ref: string
  files: string[]
  /** True when ref is a branch fallback (main/master) rather than a version tag */
  fallback?: boolean
}

/**
 * Find git tag for a version by checking if ungh can list files at that ref.
 * Tries v{version}, {version}, and optionally {packageName}@{version} (changeset convention).
 */
export async function findGitTag(owner: string, repo: string, version: string, packageName?: string, branchHint?: string): Promise<TagResult | null> {
  const candidates = [`v${version}`, version]
  if (packageName)
    candidates.push(`${packageName}@${version}`)

  for (const tag of candidates) {
    const files = await listFilesAtRef(owner, repo, tag)
    if (files.length > 0)
      return { ref: tag, files }
  }

  // Fallback: find latest release tag matching {packageName}@* (version mismatch in monorepos)
  if (packageName) {
    const latestTag = await findLatestReleaseTag(owner, repo, packageName)
    if (latestTag) {
      const files = await listFilesAtRef(owner, repo, latestTag)
      if (files.length > 0)
        return { ref: latestTag, files }
    }
  }

  // Last resort: try default branch (prefer hint from repo URL fragment)
  const branches = branchHint
    ? [branchHint, ...['main', 'master'].filter(b => b !== branchHint)]
    : ['main', 'master']
  for (const branch of branches) {
    const files = await listFilesAtRef(owner, repo, branch)
    if (files.length > 0)
      return { ref: branch, files, fallback: true }
  }

  return null
}

interface GitHubApiRelease {
  tag_name: string
  published_at?: string
}

/** Fetch releases from ungh.cc first, fall back to GitHub API for private repos. */
export async function fetchUnghReleases(owner: string, repo: string): Promise<Array<{ tag: string, publishedAt?: string }>> {
  const releases = await fetchUnghOrApi<Array<{ tag: string, publishedAt?: string }>>(
    owner,
    repo,
    async () => {
      const data = await $fetch<{ releases?: Array<{ tag: string, publishedAt?: string }> }>(`https://ungh.cc/repos/${owner}/${repo}/releases`)
      return data.releases?.length ? data.releases : null
    },
    async () => {
      const raw = await ghApiPaginated<GitHubApiRelease>(`repos/${owner}/${repo}/releases`)
      return raw.length > 0 ? raw.map(r => ({ tag: r.tag_name, publishedAt: r.published_at })) : null
    },
  )
  return releases ?? []
}

/** Find the latest release tag matching `{packageName}@*`. */
export async function findLatestReleaseTag(owner: string, repo: string, packageName: string): Promise<string | null> {
  const prefix = `${packageName}@`
  const releases = await fetchUnghReleases(owner, repo)
  return releases.find(r => r.tag.startsWith(prefix))?.tag ?? null
}
