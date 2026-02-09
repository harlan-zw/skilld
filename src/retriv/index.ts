import type { ChunkEntity, Document, IndexConfig, IndexPhase, IndexProgress, SearchFilter, SearchOptions, SearchResult, SearchSnippet } from './types'
import { createRetriv } from 'retriv'
import { autoChunker } from 'retriv/chunkers/auto'
import sqlite from 'retriv/db/sqlite'
import { transformersJs } from 'retriv/embeddings/transformers-js'

export type { ChunkEntity, Document, IndexConfig, IndexPhase, IndexProgress, SearchFilter, SearchOptions, SearchResult, SearchSnippet }

type RetrivInstance = Awaited<ReturnType<typeof createRetriv>>

function getDb(config: IndexConfig) {
  return createRetriv({
    driver: sqlite({
      path: config.dbPath,
      embeddings: transformersJs(),
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
  const { createIndexInWorker } = await import('./pool')
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
 * Strip YAML frontmatter from markdown content
 */
function stripFrontmatter(content: string): string {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/)
  return match ? content.slice(match[0].length).trim() : content
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
  const allResults = await Promise.all(
    [...pool.values()].map(async (db) => {
      const results = await db.search(query, { limit, filter, returnContent: true, returnMetadata: true, returnMeta: true })
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
  const merged = allResults.flat().sort((a, b) => b.score - a.score).slice(0, limit)
  return toSnippets(merged)
}

export async function closePool(pool: Map<string, RetrivInstance>): Promise<void> {
  await Promise.all([...pool.values()].map(db => db.close?.()))
  pool.clear()
}
