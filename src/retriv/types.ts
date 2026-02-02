export interface Document {
  id: string
  content: string
  metadata?: Record<string, any>
}

export interface ChunkingOptions {
  chunkSize?: number
  chunkOverlap?: number
}

export interface IndexConfig {
  dbPath: string
  model?: string
  chunking?: ChunkingOptions
}

export interface SearchResult {
  id: string
  content: string
  score: number
  metadata: Record<string, any>
}

export interface SearchOptions {
  /** Max results */
  limit?: number
}

export interface SearchSnippet {
  /** Package name and version */
  package: string
  /** Source file path */
  source: string
  /** Line number (approximate) */
  line: number
  /** Snippet content */
  content: string
  /** Relevance score */
  score: number
}
