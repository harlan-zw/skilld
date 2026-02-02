import type { Document, IndexConfig, SearchOptions, SearchResult, SearchSnippet } from './types'

export type { Document, IndexConfig, SearchOptions, SearchResult, SearchSnippet }

const DEFAULT_MODEL = 'Xenova/bge-small-en-v1.5'

async function getDb(config: IndexConfig) {
  const { createRetriv } = await import('retriv')
  const { sqliteVec } = await import('retriv/db/sqlite-vec')
  const { transformers } = await import('retriv/embeddings/transformers')

  return createRetriv({
    driver: sqliteVec({
      path: config.dbPath,
      embeddings: transformers({ model: config.model ?? DEFAULT_MODEL }),
    }),
    chunking: config.chunking,
  })
}

export async function createIndex(
  documents: Document[],
  config: IndexConfig,
): Promise<void> {
  const db = await getDb(config)
  await db.index(documents)
  await db.close?.()
}

export async function search(
  query: string,
  config: IndexConfig,
  options: SearchOptions = {},
): Promise<SearchResult[]> {
  const { limit = 10, package: pkg } = options
  const db = await getDb(config)

  // Get more results if filtering by package
  const fetchLimit = pkg ? limit * 3 : limit
  const results = await db.search(query, { limit: fetchLimit })
  await db.close?.()

  let filtered = results.map(r => ({
    id: r.id,
    content: r.content ?? '',
    score: r.score,
    metadata: r.metadata ?? {},
  }))

  // Filter by package if specified
  if (pkg) {
    filtered = filtered.filter(r => r.metadata.package === pkg)
  }

  return filtered.slice(0, limit)
}

/**
 * Search and return formatted snippets with line numbers
 */
export async function searchSnippets(
  query: string,
  config: IndexConfig,
  options: SearchOptions = {},
): Promise<SearchSnippet[]> {
  const results = await search(query, config, options)

  return results.map((r) => {
    // Estimate line number from content position
    const lines = r.content.split('\n')
    const line = Math.max(1, Math.ceil(lines.length / 2))

    // Get snippet (first 200 chars, trimmed to sentence)
    let snippet = r.content.slice(0, 200)
    const lastPeriod = snippet.lastIndexOf('.')
    if (lastPeriod > 100)
      snippet = snippet.slice(0, lastPeriod + 1)

    return {
      package: r.metadata.package || 'unknown',
      source: r.metadata.source || r.id,
      line,
      content: snippet.trim(),
      score: r.score,
    }
  })
}
