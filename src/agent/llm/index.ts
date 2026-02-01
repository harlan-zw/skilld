/**
 * LLM-based documentation optimization
 */

import type { AgentType } from '../types'
import { buildPrompt } from './prompts'
import { findProviderForModel, getProvider } from './registry'

export type { AvailableModel, LLMProvider, ModelInfo } from './types'
export type { CliProviderConfig } from './cli'
export type { PromptPreset } from './prompts'
export { registerProvider, getAvailableModels, getProviders, getProvider } from './registry'
export { buildPrompt, defaultPreset, detailedPreset, getPreset, minimalPreset, presets, simplePreset } from './prompts'
export { createCliProvider, hasCli, runCli } from './cli'

// Re-export providers
export {
  anthropicProvider,
  claudeProvider,
  codexProvider,
  geminiProvider,
  groqProvider,
  ollamaProvider,
  openaiProvider,
  opencodeProvider,
} from './providers'

export type OptimizeModel =
  // Claude
  | 'haiku' | 'sonnet' | 'opus'
  // Gemini
  | 'gemini-flash' | 'gemini-pro'
  // Codex
  | 'codex-o4-mini' | 'codex-o3' | 'codex-gpt-4.1'
  // OpenCode
  | 'opencode-claude' | 'opencode-gpt4'
  // Ollama
  | 'llama3.3' | 'qwen2.5-coder' | 'deepseek-r1' | 'mistral'
  // OpenAI
  | 'gpt-4o' | 'gpt-4o-mini' | 'o3-mini'
  // Groq
  | 'llama-3.3-70b' | 'llama-3.1-8b' | 'deepseek-r1-70b'

export type PromptPresetId = 'detailed' | 'simple' | 'minimal'

/**
 * Optimize documentation using available LLM providers
 * Falls back gracefully if no LLM available
 */
export async function optimizeDocs(
  content: string,
  packageName: string,
  _agent: AgentType | null,
  model: OptimizeModel = 'haiku',
  preset: PromptPresetId = 'simple',
): Promise<{ optimized: string, wasOptimized: boolean }> {
  const prompt = buildPrompt(packageName, content, preset)

  // Find provider for this model
  const provider = findProviderForModel(model)
  if (provider) {
    const result = await provider.generate(prompt, model)
    if (result) return { optimized: result, wasOptimized: true }
  }

  // Fallback: try Claude provider with haiku if different model failed
  if (model !== 'haiku') {
    const claudeProvider = getProvider('claude')
    if (claudeProvider?.isAvailable()) {
      const result = await claudeProvider.generate(prompt, 'haiku')
      if (result) return { optimized: result, wasOptimized: true }
    }
  }

  // No LLM available
  return { optimized: content, wasOptimized: false }
}
