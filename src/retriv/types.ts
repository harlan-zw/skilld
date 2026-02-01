export interface Document {
  id: string
  content: string
  metadata: Record<string, any>
}

export interface IndexConfig {
  dbPath: string
  model?: string
}

export interface SearchResult {
  id: string
  content: string
  score: number
  metadata: Record<string, any>
}
