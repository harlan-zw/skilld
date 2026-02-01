/**
 * LLM provider registry
 */

import type { AvailableModel, LLMProvider } from './types'
import {
  anthropicProvider,
  claudeProvider,
  codexProvider,
  geminiProvider,
  groqProvider,
  ollamaProvider,
  openaiProvider,
  opencodeProvider,
} from './providers'

/** Registered providers in priority order */
const providers: LLMProvider[] = [
  // CLI-based (preferred - no API keys needed)
  claudeProvider,
  geminiProvider,
  codexProvider,
  opencodeProvider,
  ollamaProvider,
  // SDK-based (require API keys)
  anthropicProvider,
  openaiProvider,
  groqProvider,
]

/**
 * Register a custom provider
 */
export function registerProvider(provider: LLMProvider): void {
  providers.push(provider)
}

/**
 * Get all registered providers
 */
export function getProviders(): LLMProvider[] {
  return providers
}

/**
 * Get provider by ID
 */
export function getProvider(id: string): LLMProvider | undefined {
  return providers.find(p => p.id === id)
}

/**
 * Find provider that supports a given model
 */
export function findProviderForModel(modelId: string): LLMProvider | undefined {
  return providers.find(p =>
    p.isAvailable() && p.getModels().some(m => m.id === modelId),
  )
}

/**
 * Get all available models from all providers
 */
export async function getAvailableModels(): Promise<AvailableModel[]> {
  const models: AvailableModel[] = []
  const seenModels = new Set<string>()

  for (const provider of providers) {
    const available = await provider.isAvailable()
    if (!available) continue

    for (const model of provider.getModels()) {
      // Skip duplicate model IDs (first provider wins)
      if (seenModels.has(model.id)) continue
      seenModels.add(model.id)

      models.push({
        ...model,
        providerId: provider.id,
        available: true,
      })
    }
  }

  return models
}
