/**
 * GitHub/ungh README resolution + versioned docs
 */

import { execSync } from 'node:child_process'
import { isGhAvailable } from './issues'
import { getDocOverride } from './overrides'
import { extractBranchHint, fetchText, parseGitHubUrl } from './utils'

export interface GitDocsResult {
  /** URL pattern for fetching docs (use with ref) */
  baseUrl: string
  /** Git ref (tag) used */
  ref: string
  /** List of doc file paths relative to repo root */
  files: string[]
  /** Prefix to strip when normalizing paths to docs/ (e.g. 'apps/evalite-docs/src/content/') for nested monorepo docs */
  docsPrefix?: string
}

interface UnghFilesResponse {
  meta: { sha: string }
  files: Array<{ path: string, mode: string, sha: string, size: number }>
}

/**
 * List files at a git ref using ungh (no rate limits)
 */
async function listFilesAtRef(owner: string, repo: string, ref: string): Promise<string[]> {
  const res = await fetch(
    `https://ungh.cc/repos/${owner}/${repo}/files/${ref}`,
    { headers: { 'User-Agent': 'skilld/1.0' } },
  ).catch(() => null)

  if (!res?.ok)
    return []

  const data = await res.json().catch(() => null) as UnghFilesResponse | null
  return data?.files?.map(f => f.path) ?? []
}

interface TagResult {
  ref: string
  files: string[]
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
      return { ref: branch, files }
  }

  return null
}

/**
 * Find the latest release tag matching `{packageName}@*` via ungh releases API.
 * Handles monorepos where npm version doesn't match git tag version.
 */
async function findLatestReleaseTag(owner: string, repo: string, packageName: string): Promise<string | null> {
  const res = await fetch(
    `https://ungh.cc/repos/${owner}/${repo}/releases`,
    { headers: { 'User-Agent': 'skilld/1.0' } },
  ).catch(() => null)

  if (!res?.ok)
    return null

  const data = await res.json().catch(() => null) as { releases?: Array<{ tag: string }> } | null
  const prefix = `${packageName}@`
  return data?.releases?.find(r => r.tag.startsWith(prefix))?.tag ?? null
}

/**
 * Filter file paths by prefix and md/mdx extension
 */
function filterDocFiles(files: string[], pathPrefix: string): string[] {
  return files.filter(f => f.startsWith(pathPrefix) && /\.(?:md|mdx)$/.test(f))
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
 * First tries to find clusters of md/mdx files in paths containing /docs/.
 * Falls back to finding the directory with the most markdown files (≥5).
 */
function discoverDocFiles(allFiles: string[]): DiscoveredDocs | null {
  const mdFiles = allFiles
    .filter(f => /\.(?:md|mdx)$/.test(f))
    .filter(f => !NOISE_PATTERNS.some(p => p.test(f)))
    .filter(f => f.includes('/'))

  // Strategy 1: Look for /docs/ clusters (existing behavior)
  const docsGroups = new Map<string, string[]>()

  for (const file of mdFiles) {
    const docsIdx = file.lastIndexOf('/docs/')
    if (docsIdx === -1)
      continue

    const prefix = file.slice(0, docsIdx + '/docs/'.length)
    const group = docsGroups.get(prefix) || []
    group.push(file)
    docsGroups.set(prefix, group)
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
    const group = dirGroups.get(dir) || []
    group.push(file)
    dirGroups.set(dir, group)
  }

  if (dirGroups.size === 0)
    return null

  // Score and sort directories
  const scored = [...dirGroups.entries()]
    .map(([dir, files]) => ({ dir, files, score: scoreDocDir(dir, files.length) }))
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
    const files = await listDocsAtRef(override.owner, override.repo, ref, `${override.path}/`)
    if (files.length === 0)
      return null
    return {
      baseUrl: `https://raw.githubusercontent.com/${override.owner}/${override.repo}/${ref}`,
      ref,
      files,
    }
  }

  const branchHint = repoUrl ? extractBranchHint(repoUrl) : undefined
  const tag = await findGitTag(owner, repo, version, packageName, branchHint)
  if (!tag)
    return null

  let docs = filterDocFiles(tag.files, 'docs/')
  let docsPrefix: string | undefined

  // Fallback: discover docs in nested paths (monorepos, content collections)
  if (docs.length === 0) {
    const discovered = discoverDocFiles(tag.files)
    if (discovered) {
      docs = discovered.files
      docsPrefix = discovered.prefix || undefined
    }
  }

  if (docs.length === 0)
    return null

  return {
    baseUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${tag.ref}`,
    ref: tag.ref,
    files: docs,
    docsPrefix,
  }
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
    const text = await fetchText(`${base}/${path}`)
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
      const unghRes = await fetch(`https://ungh.cc/repos/${shortName}/${shortName}`, {
        headers: { 'User-Agent': 'skilld/1.0' },
      }).catch(() => null)
      if (unghRes?.ok)
        return `https://github.com/${shortName}/${shortName}`
      continue
    }
    const unghRes = await fetch(`https://ungh.cc/repos/${candidate}`, {
      headers: { 'User-Agent': 'skilld/1.0' },
    }).catch(() => null)
    if (unghRes?.ok)
      return `https://github.com/${candidate}`
  }

  // Try gh CLI — strip @ to avoid GitHub search syntax issues
  const searchTerm = packageName.replace(/^@/, '')
  if (isGhAvailable()) {
    try {
      const json = execSync(
        `gh search repos "${searchTerm}" --json fullName --limit 5`,
        { encoding: 'utf-8', timeout: 15_000 },
      )
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
  const res = await fetch(`https://api.github.com/search/repositories?q=${query}&per_page=5`, {
    headers: { 'User-Agent': 'skilld/1.0' },
  }).catch(() => null)

  if (!res?.ok)
    return null

  const data = await res.json().catch(() => null) as { items?: Array<{ full_name: string }> } | null
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

  // Prefer gh CLI to avoid rate limits
  if (isGhAvailable()) {
    try {
      const json = execSync(`gh api "repos/${owner}/${repo}" -q '{homepage}'`, {
        encoding: 'utf-8',
        timeout: 10_000,
      })
      const data = JSON.parse(json) as { homepage?: string }
      return data?.homepage ? { homepage: data.homepage } : null
    }
    catch {
      // fall through to fetch
    }
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { 'User-Agent': 'skilld/1.0' },
  }).catch(() => null)

  if (!res?.ok)
    return null
  const data = await res.json().catch(() => null)
  return data?.homepage ? { homepage: data.homepage } : null
}

/**
 * Resolve README URL for a GitHub repo, returns ungh:// pseudo-URL or raw URL
 */
export async function fetchReadme(owner: string, repo: string, subdir?: string): Promise<string | null> {
  // Try ungh first
  const unghUrl = subdir
    ? `https://ungh.cc/repos/${owner}/${repo}/files/main/${subdir}/README.md`
    : `https://ungh.cc/repos/${owner}/${repo}/readme`

  const unghRes = await fetch(unghUrl, {
    headers: { 'User-Agent': 'skilld/1.0' },
  }).catch(() => null)

  if (unghRes?.ok) {
    return `ungh://${owner}/${repo}${subdir ? `/${subdir}` : ''}`
  }

  // Fallback to raw.githubusercontent.com — use GET instead of HEAD
  // because raw.githubusercontent.com sometimes returns HTML on HEAD for valid URLs
  const basePath = subdir ? `${subdir}/` : ''
  for (const branch of ['main', 'master']) {
    for (const filename of ['README.md', 'Readme.md', 'readme.md']) {
      const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${basePath}${filename}`
      const res = await fetch(readmeUrl, {
        headers: { 'User-Agent': 'skilld/1.0' },
      }).catch(() => null)
      if (res?.ok)
        return readmeUrl
    }
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
    const { readFileSync, existsSync } = await import('node:fs')
    const { fileURLToPath } = await import('node:url')
    const filePath = fileURLToPath(url)
    if (!existsSync(filePath))
      return null
    return readFileSync(filePath, 'utf-8')
  }

  if (url.startsWith('ungh://')) {
    const parts = url.replace('ungh://', '').split('/')
    const owner = parts[0]
    const repo = parts[1]
    const subdir = parts.slice(2).join('/')

    const unghUrl = subdir
      ? `https://ungh.cc/repos/${owner}/${repo}/files/main/${subdir}/README.md`
      : `https://ungh.cc/repos/${owner}/${repo}/readme`

    const res = await fetch(unghUrl, {
      headers: { 'User-Agent': 'skilld/1.0' },
    }).catch(() => null)

    if (!res?.ok)
      return null

    const text = await res.text()
    try {
      const json = JSON.parse(text) as { markdown?: string, file?: { contents?: string } }
      return json.markdown || json.file?.contents || null
    }
    catch {
      return text
    }
  }

  return fetchText(url)
}
