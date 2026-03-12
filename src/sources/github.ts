/**
 * GitHub/ungh README resolution + versioned docs
 */

import type { LlmsLink, ResolvedPackage } from './types.ts'
import { spawnSync } from 'node:child_process'
import { existsSync as fsExistsSync, readFileSync as fsReadFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { mapInsert } from '../core/shared.ts'
import { getGitHubToken, ghApi, ghApiPaginated, isKnownPrivateRepo, markRepoPrivate } from './github-common.ts'
import { isGhAvailable } from './issues.ts'
import { fetchLlmsUrl } from './llms.ts'
import { getDocOverride } from './package-registry.ts'
import { $fetch, extractBranchHint, fetchGitHubRaw, fetchText, parseGitHubUrl } from './utils.ts'

/** Minimum git-doc file count to prefer over llms.txt */
export const MIN_GIT_DOCS = 5

/** True when git-docs exist but are too few to be useful (< MIN_GIT_DOCS) */
export const isShallowGitDocs = (n: number) => n > 0 && n < MIN_GIT_DOCS

export interface GitDocsResult {
  /** URL pattern for fetching docs (use with ref) */
  baseUrl: string
  /** Git ref (tag) used */
  ref: string
  /** List of doc file paths relative to repo root */
  files: string[]
  /** Prefix to strip when normalizing paths to docs/ (e.g. 'apps/evalite-docs/src/content/') for nested monorepo docs */
  docsPrefix?: string
  /** Full repo file tree — only set when discoverDocFiles() heuristic was used (not standard docs/ prefix) */
  allFiles?: string[]
  /** True when ref is a branch (main/master) rather than a version-specific tag */
  fallback?: boolean
}

interface UnghFilesResponse {
  meta: { sha: string }
  files: Array<{ path: string, mode: string, sha: string, size: number }>
}

/**
 * List files at a git ref. Tries ungh.cc first (fast, no rate limits),
 * falls back to GitHub API for private repos.
 */
async function listFilesAtRef(owner: string, repo: string, ref: string): Promise<string[]> {
  // Skip ungh.cc for known private repos
  if (!isKnownPrivateRepo(owner, repo)) {
    const data = await $fetch<UnghFilesResponse>(
      `https://ungh.cc/repos/${owner}/${repo}/files/${ref}`,
    ).catch(() => null)
    if (data?.files?.length)
      return data.files.map(f => f.path)
  }

  // Fallback: GitHub API (authenticated, async)
  const tree = await ghApi<{ tree?: Array<{ path: string }> }>(
    `repos/${owner}/${repo}/git/trees/${ref}?recursive=1`,
  )
  if (tree?.tree?.length) {
    markRepoPrivate(owner, repo)
    return tree.tree.map(f => f.path)
  }

  return []
}

interface TagResult {
  ref: string
  files: string[]
  /** True when ref is a branch fallback (main/master) rather than a version tag */
  fallback?: boolean
}

/**
 * Find git tag for a version by checking if ungh can list files at that ref.
 * Tries v{version}, {version}, and optionally {packageName}@{version} (changeset convention).
 */
async function findGitTag(owner: string, repo: string, version: string, packageName?: string, branchHint?: string): Promise<TagResult | null> {
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

/**
 * Fetch releases from ungh.cc first, fall back to GitHub API for private repos.
 */
async function fetchUnghReleases(owner: string, repo: string): Promise<Array<{ tag: string, publishedAt?: string }>> {
  if (!isKnownPrivateRepo(owner, repo)) {
    const data = await $fetch<{ releases?: Array<{ tag: string, publishedAt?: string }> }>(
      `https://ungh.cc/repos/${owner}/${repo}/releases`,
    ).catch(() => null)
    if (data?.releases?.length)
      return data.releases
  }

  // Fallback: GitHub API (paginated, authenticated)
  const raw = await ghApiPaginated<GitHubApiRelease>(`repos/${owner}/${repo}/releases`)
  if (raw.length > 0) {
    markRepoPrivate(owner, repo)
    return raw.map(r => ({ tag: r.tag_name, publishedAt: r.published_at }))
  }

  return []
}

/**
 * Find the latest release tag matching `{packageName}@*`.
 */
async function findLatestReleaseTag(owner: string, repo: string, packageName: string): Promise<string | null> {
  const prefix = `${packageName}@`
  const releases = await fetchUnghReleases(owner, repo)
  return releases.find(r => r.tag.startsWith(prefix))?.tag ?? null
}

/**
 * Filter file paths by prefix and md/mdx extension
 */
function filterDocFiles(files: string[], pathPrefix: string): string[] {
  return files.filter(f => f.startsWith(pathPrefix) && /\.(?:md|mdx)$/.test(f))
}

const FRAMEWORK_NAMES = new Set(['vue', 'react', 'solid', 'angular', 'svelte', 'preact', 'lit', 'qwik'])

/**
 * Filter out docs for other frameworks when the package targets a specific one.
 * e.g. @tanstack/vue-query → keep vue + shared docs, exclude react/solid/angular
 * Uses word-boundary matching to catch all path conventions:
 *   framework/react/, 0.react/, api/ai-react.md, react-native.mdx, etc.
 */
export function filterFrameworkDocs(files: string[], packageName?: string): string[] {
  if (!packageName)
    return files
  const shortName = packageName.replace(/^@.*\//, '')
  const targetFramework = [...FRAMEWORK_NAMES].find(fw => shortName.includes(fw))
  if (!targetFramework)
    return files

  const otherFrameworks = [...FRAMEWORK_NAMES].filter(fw => fw !== targetFramework)
  const excludePattern = new RegExp(`\\b(?:${otherFrameworks.join('|')})\\b`)
  return files.filter(f => !excludePattern.test(f))
}

/** Known noise paths to exclude from doc discovery */
const NOISE_PATTERNS = [
  /^\.changeset\//,
  /CHANGELOG\.md$/i,
  /CONTRIBUTING\.md$/i,
  /^\.github\//,
]

/** Directories to exclude from "best directory" heuristic */
const EXCLUDE_DIRS = new Set([
  'test',
  'tests',
  '__tests__',
  'fixtures',
  'fixture',
  'examples',
  'example',
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  'e2e',
  'spec',
  'mocks',
  '__mocks__',
])

/** Directory names that suggest documentation */
const DOC_DIR_BONUS = new Set([
  'docs',
  'documentation',
  'pages',
  'content',
  'website',
  'guide',
  'guides',
  'wiki',
  'manual',
  'api',
])

interface DiscoveredDocs {
  files: string[]
  /** Prefix before 'docs/' to strip when normalizing (e.g. 'apps/evalite-docs/src/content/') */
  prefix: string
}

/**
 * Check if a path contains any excluded directory
 */
function hasExcludedDir(path: string): boolean {
  const parts = path.split('/')
  return parts.some(p => EXCLUDE_DIRS.has(p.toLowerCase()))
}

/**
 * Get the depth of a path (number of directory levels)
 */
function getPathDepth(path: string): number {
  return path.split('/').filter(Boolean).length
}

/**
 * Check if path contains a doc-related directory name
 */
function hasDocDirBonus(path: string): boolean {
  const parts = path.split('/')
  return parts.some(p => DOC_DIR_BONUS.has(p.toLowerCase()))
}

/**
 * Score a directory for doc likelihood.
 * Higher = better. Formula: count * nameBonus / depth
 */
function scoreDocDir(dir: string, fileCount: number): number {
  const depth = getPathDepth(dir) || 1
  const nameBonus = hasDocDirBonus(dir) ? 1.5 : 1
  return (fileCount * nameBonus) / depth
}

/**
 * Discover doc files in non-standard locations.
 * First tries to scope to sub-package dir in monorepos.
 * Then looks for clusters of md/mdx files in paths containing /docs/.
 * Falls back to finding the directory with the most markdown files (≥5).
 */
function discoverDocFiles(allFiles: string[], packageName?: string): DiscoveredDocs | null {
  const mdFiles = allFiles
    .filter(f => /\.(?:md|mdx)$/.test(f))
    .filter(f => !NOISE_PATTERNS.some(p => p.test(f)))
    .filter(f => f.includes('/'))

  // Strategy 0: Scope to sub-package in monorepos
  if (packageName?.includes('/')) {
    const shortName = packageName.split('/').pop()!.toLowerCase()
    const subPkgPrefix = `packages/${shortName}/`
    const subPkgFiles = mdFiles.filter(f => f.startsWith(subPkgPrefix))
    if (subPkgFiles.length >= 3)
      return { files: subPkgFiles, prefix: subPkgPrefix }
  }

  // Strategy 1: Look for /docs/ clusters (existing behavior)
  const docsGroups = new Map<string, string[]>()

  for (const file of mdFiles) {
    const docsIdx = file.lastIndexOf('/docs/')
    if (docsIdx === -1)
      continue

    const prefix = file.slice(0, docsIdx + '/docs/'.length)
    mapInsert(docsGroups, prefix, () => []).push(file)
  }

  if (docsGroups.size > 0) {
    const largest = [...docsGroups.entries()].sort((a, b) => b[1].length - a[1].length)[0]!
    if (largest[1].length >= 3) {
      const fullPrefix = largest[0]
      const docsIdx = fullPrefix.lastIndexOf('docs/')
      const stripPrefix = docsIdx > 0 ? fullPrefix.slice(0, docsIdx) : ''
      return { files: largest[1], prefix: stripPrefix }
    }
  }

  // Strategy 2: Find best directory by file count (for non-standard structures)
  const dirGroups = new Map<string, string[]>()

  for (const file of mdFiles) {
    if (hasExcludedDir(file))
      continue

    // Group by immediate parent directory
    const lastSlash = file.lastIndexOf('/')
    if (lastSlash === -1)
      continue

    const dir = file.slice(0, lastSlash + 1)
    mapInsert(dirGroups, dir, () => []).push(file)
  }

  if (dirGroups.size === 0)
    return null

  // Score and sort directories
  const scored = Array.from(dirGroups.entries(), ([dir, files]) => ({ dir, files, score: scoreDocDir(dir, files.length) }))
    .filter(d => d.files.length >= 5) // Minimum threshold
    .sort((a, b) => b.score - a.score)

  if (scored.length === 0)
    return null

  const best = scored[0]!

  // For non-docs paths, the prefix is everything up to (but not including) the final dir
  // e.g. 'website/pages/' -> prefix is 'website/' so files normalize to 'pages/...'
  // But actually we want the full prefix so downstream can strip it
  return { files: best.files, prefix: best.dir }
}

/**
 * List markdown files in a folder at a specific git ref
 */
async function listDocsAtRef(owner: string, repo: string, ref: string, pathPrefix = 'docs/'): Promise<string[]> {
  const files = await listFilesAtRef(owner, repo, ref)
  return filterDocFiles(files, pathPrefix)
}

/**
 * Fetch versioned docs from GitHub repo's docs/ folder.
 * Pass packageName to check doc overrides (e.g. vue -> vuejs/docs).
 */
export async function fetchGitDocs(owner: string, repo: string, version: string, packageName?: string, repoUrl?: string): Promise<GitDocsResult | null> {
  const override = packageName ? getDocOverride(packageName) : undefined
  if (override) {
    const ref = override.ref || 'main'
    const fallback = !override.ref
    const files = await listDocsAtRef(override.owner, override.repo, ref, `${override.path}/`)
    if (files.length === 0)
      return null
    return {
      baseUrl: `https://raw.githubusercontent.com/${override.owner}/${override.repo}/${ref}`,
      ref,
      files,
      fallback,
      // Strip non-standard prefix so sync normalizes paths under docs/
      docsPrefix: `${override.path}/` !== 'docs/' ? `${override.path}/` : undefined,
    }
  }

  const branchHint = repoUrl ? extractBranchHint(repoUrl) : undefined
  const tag = await findGitTag(owner, repo, version, packageName, branchHint)
  if (!tag)
    return null

  let docs = filterDocFiles(tag.files, 'docs/')
  let docsPrefix: string | undefined
  let allFiles: string[] | undefined

  // Fallback: discover docs in nested paths (monorepos, content collections)
  if (docs.length === 0) {
    const discovered = discoverDocFiles(tag.files, packageName)
    if (discovered) {
      docs = discovered.files
      docsPrefix = discovered.prefix || undefined
      allFiles = tag.files
    }
  }

  // Filter out docs for other frameworks (e.g. keep vue/, exclude react/)
  docs = filterFrameworkDocs(docs, packageName)

  if (docs.length === 0)
    return null

  return {
    baseUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${tag.ref}`,
    ref: tag.ref,
    files: docs,
    docsPrefix,
    allFiles,
    fallback: tag.fallback,
  }
}

/**
 * Strip file extension (.md, .mdx) and leading slash from a path
 */
function normalizePath(p: string): string {
  return p.replace(/^\//, '').replace(/\.(?:md|mdx)$/, '')
}

/**
 * Validate that discovered git docs are relevant by cross-referencing llms.txt links
 * against the repo file tree. Uses extensionless suffix matching to handle monorepo nesting.
 *
 * Returns { isValid, matchRatio } where isValid = matchRatio >= 0.3
 */
export function validateGitDocsWithLlms(
  llmsLinks: LlmsLink[],
  repoFiles: string[],
): { isValid: boolean, matchRatio: number } {
  if (llmsLinks.length === 0)
    return { isValid: true, matchRatio: 1 }

  // Sample up to 10 links
  const sample = llmsLinks.slice(0, 10)

  // Normalize llms link paths
  const normalizedLinks = sample.map((link) => {
    let path = link.url
    // Strip absolute URL to pathname
    if (path.startsWith('http')) {
      try {
        path = new URL(path).pathname
      }
      catch { /* keep as-is */ }
    }
    return normalizePath(path)
  })

  // Pre-process repo files: strip extensions to get extensionless paths
  const repoNormalized = new Set(repoFiles.map(normalizePath))

  let matches = 0
  for (const linkPath of normalizedLinks) {
    // Check if any repo file ends with this path (suffix matching for monorepo nesting)
    for (const repoPath of repoNormalized) {
      if (repoPath === linkPath || repoPath.endsWith(`/${linkPath}`)) {
        matches++
        break
      }
    }
  }

  const matchRatio = matches / sample.length
  return { isValid: matchRatio >= 0.3, matchRatio }
}

/**
 * Verify a GitHub repo is the source for an npm package by checking package.json name field.
 * Checks root first, then common monorepo paths (packages/{shortName}, packages/{name}).
 */
async function verifyNpmRepo(owner: string, repo: string, packageName: string): Promise<boolean> {
  const base = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD`
  const shortName = packageName.replace(/^@.*\//, '')
  const paths = [
    'package.json',
    `packages/${shortName}/package.json`,
    `packages/${packageName.replace(/^@/, '').replace('/', '-')}/package.json`,
  ]
  for (const path of paths) {
    const text = await fetchGitHubRaw(`${base}/${path}`)
    if (!text)
      continue
    try {
      const pkg = JSON.parse(text) as { name?: string }
      if (pkg.name === packageName)
        return true
    }
    catch {}
  }
  return false
}

export async function searchGitHubRepo(packageName: string): Promise<string | null> {
  // Try ungh heuristic first — check if repo name matches package name
  const shortName = packageName.replace(/^@.*\//, '')
  for (const candidate of [packageName.replace(/^@/, '').replace('/', '/'), shortName]) {
    // Only try if it looks like owner/repo
    if (!candidate.includes('/')) {
      // Try common patterns: {name}/{name}
      const unghRes = await $fetch.raw(`https://ungh.cc/repos/${shortName}/${shortName}`).catch(() => null)
      if (unghRes?.ok)
        return `https://github.com/${shortName}/${shortName}`
      continue
    }
    const unghRes = await $fetch.raw(`https://ungh.cc/repos/${candidate}`).catch(() => null)
    if (unghRes?.ok)
      return `https://github.com/${candidate}`
  }

  // Try gh CLI — strip @ to avoid GitHub search syntax issues
  const searchTerm = packageName.replace(/^@/, '')
  if (isGhAvailable()) {
    try {
      const { stdout: json } = spawnSync('gh', ['search', 'repos', searchTerm, '--json', 'fullName', '--limit', '5'], {
        encoding: 'utf-8',
        timeout: 15_000,
      })
      if (!json)
        throw new Error('no output')
      const repos = JSON.parse(json) as Array<{ fullName: string }>
      // Prefer exact suffix match
      const match = repos.find(r =>
        r.fullName.toLowerCase().endsWith(`/${packageName.toLowerCase()}`)
        || r.fullName.toLowerCase().endsWith(`/${shortName.toLowerCase()}`),
      )
      if (match)
        return `https://github.com/${match.fullName}`
      // Validate remaining results via package.json
      for (const candidate of repos) {
        const gh = parseGitHubUrl(`https://github.com/${candidate.fullName}`)
        if (gh && await verifyNpmRepo(gh.owner, gh.repo, packageName))
          return `https://github.com/${candidate.fullName}`
      }
    }
    catch {
      // fall through to REST API
    }
  }

  // Fallback: GitHub REST search API (no auth needed, but rate-limited)
  const query = encodeURIComponent(`${searchTerm} in:name`)
  const data = await $fetch<{ items?: Array<{ full_name: string }> }>(
    `https://api.github.com/search/repositories?q=${query}&per_page=5`,
  ).catch(() => null)
  if (!data?.items?.length)
    return null

  // Prefer exact suffix match
  const match = data.items.find(r =>
    r.full_name.toLowerCase().endsWith(`/${packageName.toLowerCase()}`)
    || r.full_name.toLowerCase().endsWith(`/${shortName.toLowerCase()}`),
  )
  if (match)
    return `https://github.com/${match.full_name}`

  // Validate remaining results via package.json
  for (const candidate of data.items) {
    const gh = parseGitHubUrl(`https://github.com/${candidate.full_name}`)
    if (gh && await verifyNpmRepo(gh.owner, gh.repo, packageName))
      return `https://github.com/${candidate.full_name}`
  }

  return null
}

/**
 * Fetch GitHub repo metadata to get website URL.
 * Pass packageName to check doc overrides first (avoids API call).
 */
export async function fetchGitHubRepoMeta(owner: string, repo: string, packageName?: string): Promise<{ homepage?: string } | null> {
  const override = packageName ? getDocOverride(packageName) : undefined
  if (override?.homepage)
    return { homepage: override.homepage }

  // Try authenticated API first (no rate limits), fall back to unauthenticated
  const data = await ghApi<{ homepage?: string }>(`repos/${owner}/${repo}`)
    ?? await $fetch<{ homepage?: string }>(`https://api.github.com/repos/${owner}/${repo}`).catch(() => null)
  return data?.homepage ? { homepage: data.homepage } : null
}

/**
 * Resolve README URL for a GitHub repo, returns ungh:// pseudo-URL or raw URL
 */
export async function fetchReadme(owner: string, repo: string, subdir?: string, ref?: string): Promise<string | null> {
  const branch = ref || 'main'

  // Try ungh first (skip for known private repos)
  if (!isKnownPrivateRepo(owner, repo)) {
    const unghUrl = subdir
      ? `https://ungh.cc/repos/${owner}/${repo}/files/${branch}/${subdir}/README.md`
      : `https://ungh.cc/repos/${owner}/${repo}/readme${ref ? `?ref=${ref}` : ''}`

    const unghRes = await $fetch.raw(unghUrl).catch(() => null)

    if (unghRes?.ok) {
      return `ungh://${owner}/${repo}${subdir ? `/${subdir}` : ''}${ref ? `@${ref}` : ''}`
    }
  }

  // Fallback to raw.githubusercontent.com — use GET instead of HEAD
  // because raw.githubusercontent.com sometimes returns HTML on HEAD for valid URLs
  // Lightweight existence check (no content download), auth-aware for known private repos
  const basePath = subdir ? `${subdir}/` : ''
  const branches = ref ? [ref] : ['main', 'master']
  const token = isKnownPrivateRepo(owner, repo) ? getGitHubToken() : null
  const authHeaders: HeadersInit = token ? { Authorization: `token ${token}` } : {}
  for (const b of branches) {
    for (const filename of ['README.md', 'Readme.md', 'readme.md']) {
      const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${b}/${basePath}${filename}`
      const res = await $fetch.raw(readmeUrl, { headers: authHeaders }).catch(() => null)
      if (res?.ok)
        return readmeUrl
    }
  }

  // Last resort: GitHub API (handles private repos via token auth)
  const refParam = ref ? `?ref=${ref}` : ''
  const endpoint = subdir
    ? `repos/${owner}/${repo}/contents/${subdir}/README.md${refParam}`
    : `repos/${owner}/${repo}/readme${refParam}`
  const apiData = await ghApi<{ download_url?: string }>(endpoint)
  if (apiData?.download_url) {
    markRepoPrivate(owner, repo)
    return apiData.download_url
  }

  return null
}

/**
 * Fetch README content from ungh:// pseudo-URL, file:// URL, or regular URL
 */
export interface GitSourceResult {
  /** URL pattern for fetching source */
  baseUrl: string
  /** Git ref (tag) used */
  ref: string
  /** List of source file paths relative to repo root */
  files: string[]
}

/** Source file extensions to include */
const SOURCE_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.mts',
  '.cts',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.vue',
  '.svelte',
  '.astro',
])

/** Paths/patterns to exclude */
const EXCLUDE_PATTERNS = [
  /\.test\./,
  /\.spec\./,
  /\.d\.ts$/,
  /__tests__/,
  /__mocks__/,
  /\.config\./,
  /fixtures?\//,
]

/**
 * Filter source files from a file list
 */
function filterSourceFiles(files: string[]): string[] {
  return files.filter((path) => {
    if (!path.startsWith('src/'))
      return false

    const ext = path.slice(path.lastIndexOf('.'))
    if (!SOURCE_EXTENSIONS.has(ext))
      return false
    if (EXCLUDE_PATTERNS.some(p => p.test(path)))
      return false

    return true
  })
}

/**
 * Fetch source files from GitHub repo's src/ folder
 */
export async function fetchGitSource(owner: string, repo: string, version: string, packageName?: string, repoUrl?: string): Promise<GitSourceResult | null> {
  const branchHint = repoUrl ? extractBranchHint(repoUrl) : undefined
  const tag = await findGitTag(owner, repo, version, packageName, branchHint)
  if (!tag)
    return null

  const files = filterSourceFiles(tag.files)
  if (files.length === 0)
    return null

  return {
    baseUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${tag.ref}`,
    ref: tag.ref,
    files,
  }
}

/**
 * Fetch README content from ungh:// pseudo-URL, file:// URL, or regular URL
 */
export async function fetchReadmeContent(url: string): Promise<string | null> {
  // Local file
  if (url.startsWith('file://')) {
    const filePath = fileURLToPath(url)
    if (!fsExistsSync(filePath))
      return null
    return fsReadFileSync(filePath, 'utf-8')
  }

  if (url.startsWith('ungh://')) {
    let path = url.replace('ungh://', '')
    let ref = 'main'

    // Parse ref from owner/repo/subdir@ref
    const atIdx = path.lastIndexOf('@')
    if (atIdx !== -1) {
      ref = path.slice(atIdx + 1)
      path = path.slice(0, atIdx)
    }

    const parts = path.split('/')
    const owner = parts[0]
    const repo = parts[1]
    const subdir = parts.slice(2).join('/')

    const unghUrl = subdir
      ? `https://ungh.cc/repos/${owner}/${repo}/files/${ref}/${subdir}/README.md`
      : `https://ungh.cc/repos/${owner}/${repo}/readme?ref=${ref}`

    const text = await $fetch(unghUrl, { responseType: 'text' }).catch(() => null)
    if (!text)
      return null

    try {
      const json = JSON.parse(text) as { markdown?: string, file?: { contents?: string } }
      return json.markdown || json.file?.contents || null
    }
    catch {
      return text
    }
  }

  // For raw.githubusercontent.com URLs, use auth-aware fetch (private repo support)
  if (url.includes('raw.githubusercontent.com'))
    return fetchGitHubRaw(url)

  return fetchText(url)
}

/**
 * Resolve a GitHub repo into a ResolvedPackage (no npm registry needed).
 * Fetches repo meta, latest release version, git docs, README, and llms.txt.
 */
export async function resolveGitHubRepo(
  owner: string,
  repo: string,
  onProgress?: (msg: string) => void,
): Promise<ResolvedPackage | null> {
  onProgress?.('Fetching repo metadata')

  // Fetch repo metadata (homepage, description) via gh CLI or GitHub API
  const repoUrl = `https://github.com/${owner}/${repo}`
  const meta = await ghApi<{ homepage?: string, description?: string }>(`repos/${owner}/${repo}`)
    ?? await $fetch<{ homepage?: string, description?: string }>(`https://api.github.com/repos/${owner}/${repo}`).catch(() => null)
  const homepage = meta?.homepage || undefined
  const description = meta?.description || undefined

  // Fetch latest release tag for version
  onProgress?.('Fetching latest release')
  const releases = await fetchUnghReleases(owner, repo)

  let version = 'main'
  let releasedAt: string | undefined
  const latestRelease = releases[0]
  if (latestRelease) {
    // Extract version from tag (strip leading "v")
    version = latestRelease.tag.replace(/^v/, '')
    releasedAt = latestRelease.publishedAt
  }

  // Fetch git docs
  onProgress?.('Resolving docs')
  const gitDocs = await fetchGitDocs(owner, repo, version)
  const gitDocsUrl = gitDocs ? `${repoUrl}/tree/${gitDocs.ref}/docs` : undefined
  const gitRef = gitDocs?.ref

  // Fetch README
  onProgress?.('Fetching README')
  const readmeUrl = await fetchReadme(owner, repo)

  // Check for llms.txt at homepage
  let llmsUrl: string | undefined
  if (homepage) {
    onProgress?.('Checking llms.txt')
    llmsUrl = await fetchLlmsUrl(homepage).catch(() => null) ?? undefined
  }

  // Must have at least some docs
  if (!gitDocsUrl && !readmeUrl && !llmsUrl)
    return null

  return {
    name: repo,
    version: latestRelease ? version : undefined,
    releasedAt,
    description,
    repoUrl,
    docsUrl: homepage,
    gitDocsUrl,
    gitRef,
    gitDocsFallback: gitDocs?.fallback,
    readmeUrl: readmeUrl ?? undefined,
    llmsUrl,
  }
}
