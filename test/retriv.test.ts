import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock retriv module
vi.mock('retriv', () => ({
  createRetriv: vi.fn(),
}))

vi.mock('retriv/db/sqlite-vec', () => ({
  sqliteVec: vi.fn(),
}))

vi.mock('retriv/embeddings/transformers-js', () => ({
  transformersJs: vi.fn(),
}))

describe('retriv', () => {
  const mockDb = {
    index: vi.fn(),
    search: vi.fn(),
    close: vi.fn(),
  }

  beforeEach(async () => {
    vi.resetAllMocks()
    const { createRetriv } = await import('retriv')
    vi.mocked(createRetriv).mockReturnValue(mockDb as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createIndex', () => {
    it('indexes documents and closes db', async () => {
      const { createIndex } = await import('../src/retriv')

      const docs = [
        { id: 'doc1', content: 'Hello world', metadata: { package: 'vue' } },
        { id: 'doc2', content: 'Test content', metadata: { package: 'vue' } },
      ]

      await createIndex(docs, { dbPath: '/tmp/test.db' })

      expect(mockDb.index).toHaveBeenCalledWith(docs)
      expect(mockDb.close).toHaveBeenCalled()
    })
  })

  describe('search', () => {
    it('searches and returns mapped results', async () => {
      const { search } = await import('../src/retriv')
      mockDb.search.mockResolvedValue([
        { id: 'doc1', content: 'Result 1', score: 0.9, metadata: { package: 'vue' }, _meta: { highlights: ['result'] } },
        { id: 'doc2', content: 'Result 2', score: 0.8, metadata: { package: 'nuxt' }, _meta: { highlights: [] } },
      ])

      const results = await search('query', { dbPath: '/tmp/test.db' })

      expect(mockDb.search).toHaveBeenCalledWith('query', {
        limit: 10,
        filter: undefined,
        returnContent: true,
        returnMetadata: true,
        returnMeta: true,
      })
      expect(results).toHaveLength(2)
      expect(results[0]).toEqual({
        id: 'doc1',
        content: 'Result 1',
        score: 0.9,
        metadata: { package: 'vue' },
        highlights: ['result'],
      })
    })

    it('respects limit option', async () => {
      const { search } = await import('../src/retriv')
      mockDb.search.mockResolvedValue([
        { id: 'doc1', content: 'A', score: 0.9, metadata: {} },
        { id: 'doc2', content: 'B', score: 0.8, metadata: {} },
        { id: 'doc3', content: 'C', score: 0.7, metadata: {} },
      ])

      await search('q', { dbPath: '/tmp/test.db' }, { limit: 2 })

      expect(mockDb.search).toHaveBeenCalledWith('q', expect.objectContaining({ limit: 2 }))
    })

    it('passes filter to retriv', async () => {
      const { search } = await import('../src/retriv')
      mockDb.search.mockResolvedValue([
        { id: 'd1', content: 'A', score: 0.9, metadata: { type: 'issue' } },
      ])

      await search('q', { dbPath: '/tmp/test.db' }, { filter: { type: 'issue' } })

      expect(mockDb.search).toHaveBeenCalledWith('q', expect.objectContaining({
        filter: { type: 'issue' },
      }))
    })

    it('handles missing metadata gracefully', async () => {
      const { search } = await import('../src/retriv')
      mockDb.search.mockResolvedValue([
        { id: 'doc1', score: 0.9 }, // no content, no metadata
      ])

      const results = await search('q', { dbPath: '/tmp/test.db' })

      expect(results[0]).toEqual({
        id: 'doc1',
        content: '',
        score: 0.9,
        metadata: {},
        highlights: [],
      })
    })
  })

  describe('searchSnippets', () => {
    it('formats results as snippets', async () => {
      const { searchSnippets } = await import('../src/retriv')
      mockDb.search.mockResolvedValue([
        {
          id: 'doc1',
          content: 'This is a test snippet. It has multiple sentences. And more content here.',
          score: 0.9,
          metadata: { package: 'vue', source: 'readme.md' },
          _meta: { highlights: [] },
        },
      ])

      const snippets = await searchSnippets('q', { dbPath: '/tmp/test.db' })

      expect(snippets).toHaveLength(1)
      expect(snippets[0].package).toBe('vue')
      expect(snippets[0].source).toBe('readme.md')
      expect(snippets[0].score).toBe(0.9)
    })

    it('uses id as source fallback', async () => {
      const { searchSnippets } = await import('../src/retriv')
      mockDb.search.mockResolvedValue([
        { id: 'my-doc-id', content: 'Test', score: 0.9, metadata: {}, _meta: { highlights: [] } },
      ])

      const snippets = await searchSnippets('q', { dbPath: '/tmp/test.db' })

      expect(snippets[0].source).toBe('my-doc-id')
    })

    it('uses "unknown" as package fallback', async () => {
      const { searchSnippets } = await import('../src/retriv')
      mockDb.search.mockResolvedValue([
        { id: 'doc1', content: 'Test', score: 0.9, metadata: {}, _meta: { highlights: [] } },
      ])

      const snippets = await searchSnippets('q', { dbPath: '/tmp/test.db' })

      expect(snippets[0].package).toBe('unknown')
    })
  })
})
