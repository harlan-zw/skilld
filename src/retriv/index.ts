import type { Document, IndexConfig, SearchOptions, SearchResult, SearchSnippet } from './types'

export type { Document, IndexConfig, SearchOptions, SearchResult, SearchSnippet }

const DEFAULT_MODEL = 'Xenova/bge-small-en-v1.5'

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
  const { limit = 10 } = options
  const db = await getDb(config)
  const results = await db.search(query, { limit, returnContent: true, returnMetadata: true })
  await db.close?.()

  return results.map(r => ({
    id: r.id,
    content: r.content ?? '',
    score: r.score,
    metadata: r.metadata ?? {},
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

  return results.map((r) => {
    const content = stripFrontmatter(r.content)

    return {
      package: r.metadata.package || 'unknown',
      source: r.metadata.source || r.id,
      line: r.metadata.line || 1,
      content,
      score: r.score,
    }
  })
}
