/**
 * Shared pipeline runner for e2e tests.
 *
 * Extracted so both sync.test.ts and crosscheck.ts can use it.
 */

import type { ResolveAttempt, ResolvedPackage } from '../../src/sources'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { FILE_PATTERN_MAP, sanitizeName } from '../../src/agent'
import {
  ensureCacheDir,
  getCacheDir,
  getPackageDbPath,
  isCached,
  writeToCache,
} from '../../src/cache'
import { createIndex } from '../../src/retriv'
import {
  downloadLlmsDocs,
  fetchGitDocs,
  fetchLlmsTxt,
  fetchReadmeContent,
  normalizeLlmsLinks,
  parseGitHubUrl,

  resolvePackageDocsWithAttempts,
} from '../../src/sources'

// ── Types ──────────────────────────────────────────────────────────

export interface PipelineResult {
  resolved: ResolvedPackage
  attempts: ResolveAttempt[]
  version: string
  docsType: 'llms.txt' | 'readme' | 'docs'
  cachedDocsCount: number
  cachedFiles: string[]
  skillMd: string
}

// ── Helpers ─────────────────────────────────────────────────────────

/** List all doc files (.md, .txt) in cache dir as relative paths */
export function listDocFiles(dir: string): string[] {
  if (!existsSync(dir))
    return []
  const files: string[] = []
  function walk(d: string, prefix = '') {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name
      if (entry.isDirectory())
        walk(join(d, entry.name), rel)
      else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx') || entry.name.endsWith('.txt'))
        files.push(rel)
    }
  }
  walk(dir)
  return files.sort()
}

export function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match)
    return {}
  const result: Record<string, string> = {}
  for (const line of match[1]!.split('\n')) {
    const idx = line.indexOf(':')
    if (idx > 0) {
      const key = line.slice(0, idx).trim()
      const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
      result[key] = value
    }
  }
  return result
}

// ── Pipeline ────────────────────────────────────────────────────────

/**
 * Run the full sync pipeline for a package (minus LLM).
 * Uses real cache — idempotent across runs.
 */
export async function runPipeline(name: string): Promise<PipelineResult> {
  ensureCacheDir()
  const { package: resolved, attempts } = await resolvePackageDocsWithAttempts(name)
  if (!resolved) {
    throw new Error(
      `Failed to resolve: ${name}\n${attempts.map(a => `  ${a.source}: ${a.status} ${a.message || ''}`).join('\n')}`,
    )
  }

  const version = resolved.version || 'latest'

  let docsType: 'llms.txt' | 'readme' | 'docs' = 'readme'
  let cachedDocsCount: number
  let cachedFiles: string[]

  const cacheDir = getCacheDir(name, version)
  const cachedDocFiles = isCached(name, version) ? listDocFiles(cacheDir) : []
  // Consider cached if we have docs (not just changelogs)
  const hasCachedDocs = cachedDocFiles.some(f =>
    f.startsWith('docs/') || f.startsWith('src/') || f === 'llms.txt'
    || (f.includes('/docs/') && !f.includes('README')),
  )

  if (hasCachedDocs) {
    cachedFiles = cachedDocFiles
    cachedDocsCount = cachedFiles.length

    if (existsSync(join(cacheDir, 'llms.txt'))) {
      docsType = 'llms.txt'
    }
    if (cachedDocFiles.some(f =>
      (f.startsWith('docs/') || f.startsWith('src/') || f.includes('/docs/'))
      && !f.includes('README'),
    )) {
      docsType = 'docs'
    }
  }
  else {
    const cachedDocs: Array<{ path: string, content: string }> = []
    const docsToIndex: Array<{ id: string, content: string, metadata: Record<string, any> }> = []

    // Try git docs
    if (resolved.gitDocsUrl && resolved.repoUrl) {
      const gh = parseGitHubUrl(resolved.repoUrl)
      if (gh) {
        const gitDocs = await fetchGitDocs(gh.owner, gh.repo, version, name)
        if (gitDocs?.files.length) {
          const BATCH = 20
          for (let i = 0; i < gitDocs.files.length; i += BATCH) {
            const batch = gitDocs.files.slice(i, i + BATCH)
            const results = await Promise.all(
              batch.map(async (file) => {
                const url = `${gitDocs.baseUrl}/${file}`
                const res = await fetch(url, { headers: { 'User-Agent': 'skilld/1.0' } }).catch(() => null)
                if (!res?.ok)
                  return null
                return { file, content: await res.text() }
              }),
            )
            for (const r of results) {
              if (r) {
                cachedDocs.push({ path: r.file, content: r.content })
                docsToIndex.push({ id: r.file, content: r.content, metadata: { package: name, source: r.file } })
              }
            }
          }
          if (cachedDocs.length > 0)
            docsType = 'docs'
        }
      }
    }

    // Try llms.txt
    if (resolved.llmsUrl && cachedDocs.length === 0) {
      const llmsContent = await fetchLlmsTxt(resolved.llmsUrl)
      if (llmsContent) {
        const baseUrl = resolved.docsUrl || new URL(resolved.llmsUrl).origin
        cachedDocs.push({ path: 'llms.txt', content: normalizeLlmsLinks(llmsContent.raw, baseUrl) })
        docsType = 'llms.txt'

        if (llmsContent.links.length > 0) {
          const docs = await downloadLlmsDocs(llmsContent, baseUrl)
          for (const doc of docs) {
            const localPath = doc.url.startsWith('/') ? doc.url.slice(1) : doc.url
            cachedDocs.push({ path: `docs/${localPath}`, content: doc.content })
            docsToIndex.push({ id: doc.url, content: doc.content, metadata: { package: name, source: `docs/${localPath}` } })
          }
          if (docs.length > 0)
            docsType = 'docs'
        }
      }
    }

    // Fallback README
    if (resolved.readmeUrl && cachedDocs.length === 0) {
      const content = await fetchReadmeContent(resolved.readmeUrl)
      if (content) {
        cachedDocs.push({ path: 'docs/README.md', content })
        docsToIndex.push({ id: 'README.md', content, metadata: { package: name, source: 'docs/README.md' } })
      }
    }

    if (cachedDocs.length > 0) {
      writeToCache(name, version, cachedDocs)
    }

    const dbPath = getPackageDbPath(name, version)
    if (docsToIndex.length > 0 && !existsSync(dbPath)) {
      await createIndex(docsToIndex, { dbPath })
    }

    const cacheDir = getCacheDir(name, version)
    cachedFiles = listDocFiles(cacheDir)
    cachedDocsCount = cachedFiles.length
  }

  // Generate SKILL.md frontmatter (pure, same as sync command)
  const patterns = FILE_PATTERN_MAP[name]
  const description = patterns?.length
    ? `Load skill when working with ${patterns.join(', ')} files or importing from "${name}".`
    : `Load skill when using anything from the package "${name}".`

  const fmLines = [
    '---',
    `name: ${sanitizeName(name)}-skilld`,
    `description: ${description}`,
  ]
  if (patterns?.length)
    fmLines.push(`globs: ${JSON.stringify(patterns)}`)
  if (version)
    fmLines.push(`version: "${version}"`)
  fmLines.push('---', '')

  return { resolved, attempts, version, docsType, cachedDocsCount, cachedFiles, skillMd: fmLines.join('\n') }
}
