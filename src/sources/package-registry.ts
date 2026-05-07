/**
 * Package registry — types, lookup helpers, and reverse index.
 * Curated registry data lives in package-registry.data.ts.
 * Keyed by GitHub 'owner/repo' (source code repo).
 */

import { REPO_REGISTRY } from './package-registry.data.ts'

export interface BlogRelease {
  version: string
  url: string
  date: string
  title?: string
}

export interface PackageEntry {
  filePatterns?: string[]
  primary?: boolean
  /** Extra rules injected into skill generation prompts */
  rules?: string[]
}

export interface RepoEntry {
  owner: string
  repo: string
  /** Separate docs repo name (e.g. 'docs' → owner/docs) */
  docsRepo?: string
  /** Path prefix to filter markdown files */
  docsPath?: string
  /** Branch/ref override */
  docsRef?: string
  /** Homepage URL */
  homepage?: string
  /** URL pattern to crawl for docs (glob, e.g. 'https://example.com/docs/**') */
  crawlUrl?: string
  /** Branch to fetch CHANGELOG.md from when installed version is a prerelease (e.g. 'minor' for Vue) */
  prereleaseChangelogRef?: string
  /** Packages in this repo */
  packages: Record<string, PackageEntry>
  /** Curated blog release posts */
  blogReleases?: BlogRelease[]
}

// Backwards-compatible types
export interface DocOverride {
  owner: string
  repo: string
  path: string
  ref?: string
  homepage?: string
}

export interface BlogPreset {
  packageName: string
  releases: BlogRelease[]
}

// ── Reverse index (auto-generated) ──

const PACKAGE_TO_REPO_MAP: Record<string, string> = {}

for (const [repoKey, entry] of Object.entries(REPO_REGISTRY)) {
  for (const packageName of Object.keys(entry.packages)) {
    PACKAGE_TO_REPO_MAP[packageName] = repoKey
  }
}

// ── Backwards-compatible helpers ──

export function getDocOverride(packageName: string): DocOverride | undefined {
  const repoKey = PACKAGE_TO_REPO_MAP[packageName]
  if (!repoKey)
    return undefined
  const entry = REPO_REGISTRY[repoKey]
  if (!entry?.docsRepo && !entry?.docsPath)
    return undefined

  return {
    owner: entry.owner,
    repo: entry.docsRepo || entry.repo,
    path: entry.docsPath || '',
    ref: entry.docsRef,
    homepage: entry.homepage,
  }
}

export function getBlogPreset(packageName: string): BlogPreset | undefined {
  const repoKey = PACKAGE_TO_REPO_MAP[packageName]
  if (!repoKey)
    return undefined
  const entry = REPO_REGISTRY[repoKey]
  if (!entry?.blogReleases)
    return undefined

  return {
    packageName,
    releases: entry.blogReleases,
  }
}

export function getFilePatterns(packageName: string): string[] | undefined {
  const repoKey = PACKAGE_TO_REPO_MAP[packageName]
  if (!repoKey)
    return undefined
  return REPO_REGISTRY[repoKey]?.packages[packageName]?.filePatterns
}

// ── New APIs ──

export function getRepoEntry(repoKey: string): RepoEntry | undefined {
  return REPO_REGISTRY[repoKey]
}

export function getRepoKeyForPackage(packageName: string): string | undefined {
  return PACKAGE_TO_REPO_MAP[packageName]
}

export function getPackageRules(packageName: string): string[] {
  const repoKey = PACKAGE_TO_REPO_MAP[packageName]
  if (!repoKey)
    return []
  return REPO_REGISTRY[repoKey]?.packages[packageName]?.rules ?? []
}

export function getPrereleaseChangelogRef(packageName: string): string | undefined {
  const repoKey = PACKAGE_TO_REPO_MAP[packageName]
  if (!repoKey)
    return undefined
  return REPO_REGISTRY[repoKey]?.prereleaseChangelogRef
}

export function getCrawlUrl(packageName: string): string | undefined {
  const repoKey = PACKAGE_TO_REPO_MAP[packageName]
  if (!repoKey)
    return undefined
  return REPO_REGISTRY[repoKey]?.crawlUrl
}

export function getRelatedPackages(packageName: string): string[] {
  const repoKey = PACKAGE_TO_REPO_MAP[packageName]
  if (!repoKey)
    return []
  const entry = REPO_REGISTRY[repoKey]
  if (!entry)
    return []
  return Object.keys(entry.packages)
}
