/**
 * LLM provider types
 */

export interface LLMProvider {
  id: string
  name: string
  /** Check if this provider is available */
  isAvailable: () => boolean | Promise<boolean>
  /** Get available models for this provider */
  getModels: () => ModelInfo[]
  /** Generate optimized docs */
  generate: (prompt: string, model: string) => Promise<string | null>
}

export interface ModelInfo {
  id: string
  name: string
  description: string
  recommended?: boolean
}

export interface AvailableModel extends ModelInfo {
  providerId: string
  available: boolean
}
