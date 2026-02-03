import type { Document, IndexConfig, SearchFilter, SearchOptions, SearchResult, SearchSnippet } from './types'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

export type { Document, IndexConfig, SearchFilter, SearchOptions, SearchResult, SearchSnippet }

async function getDb(config: IndexConfig) {
  // Suppress Node's experimental SQLite warning
  const originalEmit = process.emit
  // @ts-expect-error overriding emit
  process.emit = function (event, error) {
    if (event === 'warning' && (error as Error)?.name === 'ExperimentalWarning') {
      return false
    }
    // @ts-expect-error calling original
    return originalEmit.apply(process, arguments)
  }

  const { createRetriv } = await import('retriv')
  const { sqliteVec } = await import('retriv/db/sqlite-vec')
  const { transformersJs } = await import('retriv/embeddings/transformers-js')

  return createRetriv({
    driver: sqliteVec({
      path: config.dbPath,
      embeddings: transformersJs({ model: 'Xenova/bge-base-en-v1.5', dimensions: 768 }),
    }),
    chunking: config.chunking ?? {},
  })
}

export async function createIndex(
  documents: Document[],
  config: IndexConfig,
): Promise<void> {
  const db = await getDb(config)

  // Batch documents to report progress
  const BATCH_SIZE = 5
  let indexed = 0

  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = documents.slice(i, i + BATCH_SIZE)
    await db.index(batch)
    indexed += batch.length
    config.onProgress?.(indexed, documents.length)
  }

  await db.close?.()
}

export async function search(
  query: string,
  config: IndexConfig,
  options: SearchOptions = {},
): Promise<SearchResult[]> {
  const { limit = 10, filter } = options
  const db = await getDb(config)
  const results = await db.search(query, { limit, filter, returnContent: true, returnMetadata: true, returnMeta: true })
  await db.close?.()

  return results.map(r => ({
    id: r.id,
    content: r.content ?? '',
    score: r.score,
    metadata: r.metadata ?? {},
    highlights: r._meta?.highlights ?? [],
  }))
}

/**
 * Strip YAML frontmatter from markdown content
 */
function stripFrontmatter(content: string): string {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/)
  return match ? content.slice(match[0].length).trim() : content
}

/**
 * Find line range where snippet appears in original file
 */
function findLineRange(dbPath: string, source: string, snippet: string): { start: number, end: number } | null {
  // DB path: ~/.skilld/references/<pkg>@<ver>/search.db
  // Source file: <dbDir>/<source>
  const refDir = dirname(dbPath)
  const filePath = join(refDir, source)

  if (!existsSync(filePath))
    return null

  const content = readFileSync(filePath, 'utf-8')
  const firstLine = snippet.split('\n')[0].trim()
  if (!firstLine)
    return null

  const lines = content.split('\n')
  const startIdx = lines.findIndex(l => l.trim() === firstLine)
  if (startIdx === -1)
    return null

  const snippetLines = snippet.split('\n').length
  return { start: startIdx + 1, end: startIdx + snippetLines }
}

/**
 * Search and return formatted snippets
 */
export async function searchSnippets(
  query: string,
  config: IndexConfig,
  options: SearchOptions = {},
): Promise<SearchSnippet[]> {
  const results = await search(query, config, options)

  return results.map((r) => {
    const content = stripFrontmatter(r.content)
    const source = r.metadata.source || r.id
    const range = findLineRange(config.dbPath, source, content)

    return {
      package: r.metadata.package || 'unknown',
      source,
      lineStart: range?.start ?? 1,
      lineEnd: range?.end ?? content.split('\n').length,
      content,
      score: r.score,
      highlights: r.highlights,
    }
  })
}
