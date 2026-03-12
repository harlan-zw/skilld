import type { ChunkEntity, Document, IndexConfig, IndexPhase, IndexProgress, SearchFilter, SearchOptions, SearchResult, SearchSnippet } from './types.ts'
import { stripFrontmatter } from '../core/markdown.ts'

export type { ChunkEntity, Document, IndexConfig, IndexPhase, IndexProgress, SearchFilter, SearchOptions, SearchResult, SearchSnippet }

type RetrivInstance = Awaited<ReturnType<typeof getDb>>

export class SearchDepsUnavailableError extends Error {
  constructor(cause: unknown) {
    super('Search dependencies unavailable (sqlite-vec or retriv not installed). Search indexing skipped.')
    this.name = 'SearchDepsUnavailableError'
    this.cause = cause
  }
}

// Dynamic imports: retriv/chunkers/auto eagerly loads typescript which may not be installed (e.g. npx)
export async function getDb(config: Pick<IndexConfig, 'dbPath'>) {
  let createRetriv, autoChunker, sqliteMod, sqliteVec, transformersJs, cachedEmbeddings
  try {
    ;([
      { createRetriv },
      { autoChunker },
      sqliteMod,
      sqliteVec,
      { transformersJs },
      { cachedEmbeddings },
    ] = await Promise.all([
      import('retriv'),
      import('retriv/chunkers/auto'),
      import('retriv/db/sqlite'),
      import('sqlite-vec'),
      import('retriv/embeddings/transformers-js'),
      import('./embedding-cache.ts'),
    ]))
  }
  catch (err: any) {
    if (err?.code === 'ERR_MODULE_NOT_FOUND')
      throw new SearchDepsUnavailableError(err)
    throw err
  }
  const embeddings = await cachedEmbeddings(transformersJs())
  return createRetriv({
    driver: sqliteMod.default({
      path: config.dbPath,
      embeddings,
      sqliteVec,
    }),
    chunking: autoChunker(),
  })
}

/**
 * Index documents in-process (no worker thread).
 * Preferred for tests and environments where worker_threads is unreliable.
 */
export async function createIndexDirect(
  documents: Document[],
  config: IndexConfig,
): Promise<void> {
  const db = await getDb(config)
  await db.index(documents, { onProgress: config.onProgress })
  await db.close?.()
}

/**
 * Index documents in a background worker thread.
 * Falls back to direct indexing if worker fails to spawn.
 */
export async function createIndex(
  documents: Document[],
  config: IndexConfig,
): Promise<void> {
  // Dynamic import justified: search/searchSnippets shouldn't pull in worker_threads
  const { createIndexInWorker } = await import('./pool.ts')
  return createIndexInWorker(documents, config)
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
    lineRange: r._chunk?.lineRange,
    entities: r._chunk?.entities,
    scope: r._chunk?.scope,
  }))
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
  return toSnippets(results)
}

function toSnippets(results: SearchResult[]): SearchSnippet[] {
  return results.map((r) => {
    const content = stripFrontmatter(r.content)
    const source = r.metadata.source || r.id
    const lines = content.split('\n').length

    return {
      package: r.metadata.package || 'unknown',
      source,
      lineStart: r.lineRange?.[0] ?? 1,
      lineEnd: r.lineRange?.[1] ?? lines,
      content,
      score: r.score,
      highlights: r.highlights,
      entities: r.entities,
      scope: r.scope,
    }
  })
}

// ── Pooled DB access for interactive search ──

export async function openPool(dbPaths: string[]): Promise<Map<string, RetrivInstance>> {
  const pool = new Map<string, RetrivInstance>()
  await Promise.all(dbPaths.map(async (dbPath) => {
    const db = await getDb({ dbPath })
    pool.set(dbPath, db)
  }))
  return pool
}

export async function searchPooled(
  query: string,
  pool: Map<string, RetrivInstance>,
  options: SearchOptions = {},
): Promise<SearchSnippet[]> {
  const { limit = 10, filter } = options
  const fetchLimit = limit * 2 // Over-fetch to compensate for dedup
  const allResults = await Promise.all(
    Array.from(pool.values(), async (db) => {
      const results = await db.search(query, { limit: fetchLimit, filter, returnContent: true, returnMetadata: true, returnMeta: true })
      return results.map(r => ({
        id: r.id,
        content: r.content ?? '',
        score: r.score,
        metadata: r.metadata ?? {},
        highlights: r._meta?.highlights ?? [],
        lineRange: r._chunk?.lineRange as [number, number] | undefined,
        entities: r._chunk?.entities,
        scope: r._chunk?.scope,
      }))
    }),
  )
  // Deduplicate by source+lineRange (overlapping chunks from same doc)
  const seen = new Set<string>()
  const merged = allResults.flat()
    .sort((a, b) => b.score - a.score)
    .filter((r) => {
      const lr = r.lineRange
      const key = `${r.metadata.source || r.id}:${lr?.[0]}-${lr?.[1]}`
      if (seen.has(key))
        return false
      seen.add(key)
      return true
    })
    .slice(0, limit)
  return toSnippets(merged)
}

export async function closePool(pool: Map<string, RetrivInstance>): Promise<void> {
  await Promise.all(Array.from(pool.values(), db => db.close?.()))
  pool.clear()
}
