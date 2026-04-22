/**
 * Registry client for skilld.dev
 *
 * Talks to the public skilld.dev JSON API: resolves an npm package name to a
 * curated skill's owner/repo, then fetches the detail payload which includes
 * the raw SKILL.md. For local development, set SKILLD_REGISTRY_URL (e.g.
 * http://localhost:3000/api) to point at a running Nuxt dev server.
 *
 * Returns null when a skill isn't curated, the API is unreachable, or the
 * skill has no resolvable SKILL.md, so callers fall through to the
 * doc-generation pipeline.
 */

import { ofetch } from 'ofetch'

const DEFAULT_REGISTRY_URL = 'https://skilld.dev/api'

export function getRegistryBase(): string {
  return process.env.SKILLD_REGISTRY_URL || DEFAULT_REGISTRY_URL
}

export interface RegistrySkill {
  /** Skill directory name (matches what lands in .claude/skills/<name>/) */
  name: string
  /** npm package name used to look up this skill */
  packageName: string
  /** Raw SKILL.md content (frontmatter + body) */
  content: string
  /** Source repo owner */
  owner: string
  /** Full "owner/repo" identifier */
  repo: string
  /** Human-readable display name from the registry */
  displayName?: string
  /** Install count reported by the registry */
  installs?: number
  /** True when the source repo is on the official owners list */
  official?: boolean
  /** Default branch the SKILL.md was fetched from */
  branch?: string
  /** Path to SKILL.md within the source repo */
  skillPath?: string
  /** ISO timestamp of the source repo's last push — used for staleness */
  updatedAt?: string
}

export interface RegistrySearchHit {
  name: string
  packageName: string
  displayName?: string
  owner: string
  repo: string
  installs?: number
  official?: boolean
}

export interface RegistrySearchResult {
  skills: RegistrySearchHit[]
  total: number
}

interface ResolveResponseEntry {
  owner: string
  repo: string
  official: boolean
}

interface SkillDetailResponse {
  owner: string
  repo: string
  name: string
  displayName: string
  installs: number
  branch?: string
  skillPath?: string | null
  raw?: string | null
  pushedAt?: string | null
}

interface SkillListItem {
  name: string
  owner: string
  repo: string
  displayName: string
  installs: number
  official: boolean
}

interface SkillListResponse {
  items: SkillListItem[]
  total: number
}

export interface FetchRegistrySkillOptions {
  /** Narrow the resolve to a specific owner when multiple skills share a name */
  owner?: string
}

/**
 * Fetch a curated package skill from the registry.
 * Returns null if no curated skill exists, the SKILL.md can't be loaded, or the API is unreachable.
 */
export async function fetchRegistrySkill(
  packageName: string,
  opts: FetchRegistrySkillOptions = {},
): Promise<RegistrySkill | null> {
  const base = getRegistryBase()

  const resolved = await ofetch<Record<string, ResolveResponseEntry>>(`${base}/skills/resolve`, {
    method: 'POST',
    body: { items: [{ packageName, owner: opts.owner }] },
  }).catch(() => null)

  const hit = resolved?.[packageName]
  if (!hit)
    return null

  const slug = `${hit.owner}/${hit.repo}/${packageName}`
  const detail = await ofetch<SkillDetailResponse>(`${base}/skills/${slug}`).catch(() => null)

  if (!detail?.raw)
    return null

  return {
    name: detail.name,
    packageName,
    content: detail.raw,
    owner: detail.owner,
    repo: `${detail.owner}/${detail.repo}`,
    displayName: detail.displayName,
    installs: detail.installs,
    official: hit.official,
    branch: detail.branch,
    skillPath: detail.skillPath ?? undefined,
    updatedAt: detail.pushedAt ?? undefined,
  }
}

/**
 * Search the registry for skills matching a query.
 */
export async function searchRegistry(
  query: string,
  opts: { limit?: number, owner?: string, official?: boolean } = {},
): Promise<RegistrySearchResult> {
  const base = getRegistryBase()
  const result = await ofetch<SkillListResponse>(`${base}/skills`, {
    query: {
      q: query,
      limit: opts.limit ?? 20,
      owner: opts.owner,
      official: opts.official ? 'true' : undefined,
    },
  }).catch(() => null)

  if (!result)
    return { skills: [], total: 0 }

  return {
    skills: result.items.map(i => ({
      name: i.name,
      packageName: i.name,
      displayName: i.displayName,
      owner: i.owner,
      repo: `${i.owner}/${i.repo}`,
      installs: i.installs,
      official: i.official,
    })),
    total: result.total,
  }
}

/**
 * Check whether the registry has a newer SKILL.md than the local copy.
 * Returns the new `updatedAt` timestamp if newer, else null.
 */
export async function checkRegistryUpdate(
  packageName: string,
  currentUpdatedAt: string | undefined,
): Promise<string | null> {
  const skill = await fetchRegistrySkill(packageName)
  if (!skill?.updatedAt)
    return null
  if (!currentUpdatedAt || skill.updatedAt > currentUpdatedAt)
    return skill.updatedAt
  return null
}
