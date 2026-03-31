/**
 * Registry client for skilld.dev
 *
 * Fetches curated package skills from the skilld.dev registry API.
 * Currently stubbed — returns null for all lookups until the API is live.
 */

import { ofetch } from 'ofetch'

const REGISTRY_BASE = 'https://skilld.dev/api'

export interface RegistrySkill {
  /** Skill directory name (e.g. "vue-skilld") */
  name: string
  /** npm package name */
  packageName: string
  /** Package version this skill was generated for */
  version: string
  /** Full SKILL.md content */
  content: string
  /** GitHub repo (owner/repo) */
  repo?: string
  /** ISO timestamp of last update */
  updatedAt?: string
}

export interface RegistrySearchResult {
  skills: Array<{
    name: string
    packageName: string
    version: string
    description?: string
    updatedAt?: string
  }>
}

/**
 * Fetch a curated package skill from the registry.
 * Returns null if no curated skill exists for this package.
 */
export async function fetchRegistrySkill(packageName: string): Promise<RegistrySkill | null> {
  try {
    return await ofetch<RegistrySkill>(`${REGISTRY_BASE}/skills/${encodeURIComponent(packageName)}`)
  }
  catch {
    // Registry unavailable or skill not found
    return null
  }
}

/**
 * Search the registry for skills matching a query.
 */
export async function searchRegistry(query: string): Promise<RegistrySearchResult> {
  try {
    return await ofetch<RegistrySearchResult>(`${REGISTRY_BASE}/search`, {
      query: { q: query },
    })
  }
  catch {
    return { skills: [] }
  }
}

/**
 * Check if a newer version of a registry skill is available.
 */
export async function checkRegistryUpdate(packageName: string, currentVersion: string): Promise<string | null> {
  const skill = await fetchRegistrySkill(packageName)
  if (!skill || skill.version === currentVersion)
    return null
  return skill.version
}
