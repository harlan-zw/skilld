/**
 * GitHub/ungh README resolution + versioned docs
 */

import { fetchText, verifyUrl } from './utils'

export interface GitDocsResult {
  /** URL pattern for fetching docs (use with ref) */
  baseUrl: string
  /** Git ref (tag) used */
  ref: string
  /** List of doc file paths relative to repo root */
  files: string[]
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

  if (!res?.ok) return []

  const data = await res.json().catch(() => null) as UnghFilesResponse | null
  return data?.files?.map(f => f.path) ?? []
}

/**
 * Find git tag for a version by checking if ungh can list files at that ref
 */
async function findGitTag(owner: string, repo: string, version: string): Promise<string | null> {
  for (const tag of [`v${version}`, version]) {
    const files = await listFilesAtRef(owner, repo, tag)
    if (files.length > 0) return tag
  }
  return null
}

/**
 * List markdown files in docs/ folder at a specific git ref
 */
async function listDocsAtRef(owner: string, repo: string, ref: string): Promise<string[]> {
  const files = await listFilesAtRef(owner, repo, ref)
  return files.filter(f => f.startsWith('docs/') && f.endsWith('.md'))
}

/**
 * Fetch versioned docs from GitHub repo's docs/ folder
 */
export async function fetchGitDocs(owner: string, repo: string, version: string): Promise<GitDocsResult | null> {
  const ref = await findGitTag(owner, repo, version)
  if (!ref) return null

  const files = await listDocsAtRef(owner, repo, ref)
  if (files.length === 0) return null

  return {
    baseUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${ref}`,
    ref,
    files,
  }
}

/**
 * Fetch GitHub repo metadata to get website URL
 */
export async function fetchGitHubRepoMeta(owner: string, repo: string): Promise<{ homepage?: string } | null> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { 'User-Agent': 'skilld/1.0' },
  }).catch(() => null)

  if (!res?.ok) return null
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

  // Fallback to raw.githubusercontent.com - try different case variations
  const basePath = subdir ? `${subdir}/` : ''
  for (const branch of ['main', 'master']) {
    for (const filename of ['README.md', 'readme.md', 'Readme.md']) {
      const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${basePath}${filename}`
      if (await verifyUrl(readmeUrl)) {
        return readmeUrl
      }
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
  '.ts', '.tsx', '.mts', '.cts',
  '.js', '.jsx', '.mjs', '.cjs',
  '.vue', '.svelte', '.astro',
])

/** Paths/patterns to exclude */
const EXCLUDE_PATTERNS = [
  /\.test\./,
  /\.spec\./,
  /\.d\.ts$/,
  /__tests__/,
  /__mocks__/,
  /\.config\./,
  /fixtures?[/]/,
]

/**
 * List source files in src/ folder at a specific git ref
 */
async function listSourceAtRef(owner: string, repo: string, ref: string): Promise<string[]> {
  const files = await listFilesAtRef(owner, repo, ref)
  return files.filter((path) => {
    if (!path.startsWith('src/')) return false

    const ext = path.slice(path.lastIndexOf('.'))
    if (!SOURCE_EXTENSIONS.has(ext)) return false
    if (EXCLUDE_PATTERNS.some(p => p.test(path))) return false

    return true
  })
}

/**
 * Fetch source files from GitHub repo's src/ folder
 */
export async function fetchGitSource(owner: string, repo: string, version: string): Promise<GitSourceResult | null> {
  const ref = await findGitTag(owner, repo, version)
  if (!ref) return null

  const files = await listSourceAtRef(owner, repo, ref)
  if (files.length === 0) return null

  return {
    baseUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${ref}`,
    ref,
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
    const filePath = url.slice(7)
    if (!existsSync(filePath)) return null
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

    if (!res?.ok) return null

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
