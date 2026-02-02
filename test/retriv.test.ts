import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock retriv module
vi.mock('retriv', () => ({
  createRetriv: vi.fn(),
}))

vi.mock('retriv/db/sqlite-vec', () => ({
  sqliteVec: vi.fn(),
}))

vi.mock('retriv/embeddings/transformers', () => ({
  transformers: vi.fn(),
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
        { id: 'doc1', content: 'Result 1', score: 0.9, metadata: { package: 'vue' } },
        { id: 'doc2', content: 'Result 2', score: 0.8, metadata: { package: 'nuxt' } },
      ])

      const results = await search('query', { dbPath: '/tmp/test.db' })

      expect(mockDb.search).toHaveBeenCalledWith('query', { limit: 10 })
      expect(results).toHaveLength(2)
      expect(results[0]).toEqual({
        id: 'doc1',
        content: 'Result 1',
        score: 0.9,
        metadata: { package: 'vue' },
      })
    })

    it('respects limit option', async () => {
      const { search } = await import('../src/retriv')
      mockDb.search.mockResolvedValue([
        { id: 'doc1', content: 'A', score: 0.9, metadata: {} },
        { id: 'doc2', content: 'B', score: 0.8, metadata: {} },
        { id: 'doc3', content: 'C', score: 0.7, metadata: {} },
      ])

      const results = await search('q', { dbPath: '/tmp/test.db' }, { limit: 2 })

      expect(results).toHaveLength(2)
    })

    it('filters by package', async () => {
      const { search } = await import('../src/retriv')
      mockDb.search.mockResolvedValue([
        { id: 'd1', content: 'A', score: 0.9, metadata: { package: 'vue' } },
        { id: 'd2', content: 'B', score: 0.8, metadata: { package: 'nuxt' } },
        { id: 'd3', content: 'C', score: 0.7, metadata: { package: 'vue' } },
      ])

      const results = await search('q', { dbPath: '/tmp/test.db' }, { package: 'vue' })

      expect(results).toHaveLength(2)
      expect(results.every(r => r.metadata.package === 'vue')).toBe(true)
    })

    it('fetches more results when filtering by package', async () => {
      const { search } = await import('../src/retriv')
      mockDb.search.mockResolvedValue([])

      await search('q', { dbPath: '/tmp/test.db' }, { limit: 5, package: 'vue' })

      // Should fetch 5 * 3 = 15 results to ensure enough after filtering
      expect(mockDb.search).toHaveBeenCalledWith('q', { limit: 15 })
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
        },
      ])

      const snippets = await searchSnippets('q', { dbPath: '/tmp/test.db' })

      expect(snippets).toHaveLength(1)
      expect(snippets[0].package).toBe('vue')
      expect(snippets[0].source).toBe('readme.md')
      expect(snippets[0].score).toBe(0.9)
      expect(snippets[0].line).toBeGreaterThan(0)
    })

    it('truncates long content to 200 chars', async () => {
      const { searchSnippets } = await import('../src/retriv')
      const longContent = 'A'.repeat(300)
      mockDb.search.mockResolvedValue([
        { id: 'doc1', content: longContent, score: 0.9, metadata: {} },
      ])

      const snippets = await searchSnippets('q', { dbPath: '/tmp/test.db' })

      expect(snippets[0].content.length).toBeLessThanOrEqual(200)
    })

    it('trims to last sentence if period after 100 chars', async () => {
      const { searchSnippets } = await import('../src/retriv')
      // Period at position ~120
      const content = 'A'.repeat(110) + '. More content here that should be cut off.'
      mockDb.search.mockResolvedValue([
        { id: 'doc1', content, score: 0.9, metadata: {} },
      ])

      const snippets = await searchSnippets('q', { dbPath: '/tmp/test.db' })

      expect(snippets[0].content.endsWith('.')).toBe(true)
    })

    it('uses id as source fallback', async () => {
      const { searchSnippets } = await import('../src/retriv')
      mockDb.search.mockResolvedValue([
        { id: 'my-doc-id', content: 'Test', score: 0.9, metadata: {} },
      ])

      const snippets = await searchSnippets('q', { dbPath: '/tmp/test.db' })

      expect(snippets[0].source).toBe('my-doc-id')
    })

    it('uses "unknown" as package fallback', async () => {
      const { searchSnippets } = await import('../src/retriv')
      mockDb.search.mockResolvedValue([
        { id: 'doc1', content: 'Test', score: 0.9, metadata: {} },
      ])

      const snippets = await searchSnippets('q', { dbPath: '/tmp/test.db' })

      expect(snippets[0].package).toBe('unknown')
    })
  })
})
