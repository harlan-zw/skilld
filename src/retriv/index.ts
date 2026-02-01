import type { Document, IndexConfig, SearchResult } from './types'

export type { Document, IndexConfig, SearchResult }

const DEFAULT_MODEL = 'Xenova/bge-small-en-v1.5'

export async function createIndex(
  documents: Document[],
  config: IndexConfig,
): Promise<void> {
  const { sqliteVec } = await import('retriv/db/sqlite-vec')
  const { transformers } = await import('retriv/embeddings/transformers')

  const db = await sqliteVec({
    path: config.dbPath,
    embeddings: transformers({ model: config.model ?? DEFAULT_MODEL }),
  })

  await db.index(documents)
  await db.close?.()
}

export async function search(
  query: string,
  config: IndexConfig,
  limit = 10,
): Promise<SearchResult[]> {
  const { sqliteVec } = await import('retriv/db/sqlite-vec')
  const { transformers } = await import('retriv/embeddings/transformers')

  const db = await sqliteVec({
    path: config.dbPath,
    embeddings: transformers({ model: config.model ?? DEFAULT_MODEL }),
  })

  const results = await db.search(query, { limit })
  await db.close?.()

  return results.map(r => ({
    id: r.id,
    content: r.content ?? '',
    score: r.score,
    metadata: r.metadata ?? {},
  }))
}
