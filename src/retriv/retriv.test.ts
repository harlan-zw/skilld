import { describe, expect, it } from 'vitest'
import type { Document, IndexConfig, SearchOptions, SearchResult } from './types'

describe('retriv types', () => {
  it('Document interface has required fields', () => {
    const doc: Document = {
      id: 'test-id',
      content: 'test content',
    }
    expect(doc.id).toBe('test-id')
    expect(doc.content).toBe('test content')
  })

  it('Document can have metadata', () => {
    const doc: Document = {
      id: 'test-id',
      content: 'test content',
      metadata: { package: 'vue', source: 'readme.md' },
    }
    expect(doc.metadata?.package).toBe('vue')
  })

  it('IndexConfig has required dbPath', () => {
    const config: IndexConfig = {
      dbPath: '/path/to/db',
    }
    expect(config.dbPath).toBe('/path/to/db')
  })

  it('IndexConfig can have optional fields', () => {
    const config: IndexConfig = {
      dbPath: '/path/to/db',
      model: 'custom-model',
      chunking: { chunkSize: 500, chunkOverlap: 50 },
    }
    expect(config.model).toBe('custom-model')
    expect(config.chunking?.chunkSize).toBe(500)
  })

  it('SearchOptions has optional fields', () => {
    const options: SearchOptions = {
      limit: 5,
    }
    expect(options.limit).toBe(5)
  })

  it('SearchResult has all required fields', () => {
    const result: SearchResult = {
      id: 'doc-1',
      content: 'matched content',
      score: 0.95,
      metadata: { source: 'api.md' },
    }
    expect(result.score).toBe(0.95)
    expect(result.metadata.source).toBe('api.md')
  })
})
