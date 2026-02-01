/**
 * Anthropic SDK provider
 */

import type { LLMProvider } from '../types'

const MODEL_MAP: Record<string, string> = {
  haiku: 'claude-3-5-haiku-latest',
  sonnet: 'claude-sonnet-4-20250514',
  opus: 'claude-opus-4-20250514',
}

export const anthropicProvider: LLMProvider = {
  id: 'anthropic-sdk',
  name: 'Anthropic API',

  isAvailable: () => !!process.env.ANTHROPIC_API_KEY,

  getModels: () => [
    { id: 'haiku', name: 'Claude Haiku (API)', description: 'Fast, cheap', recommended: true },
    { id: 'sonnet', name: 'Claude Sonnet (API)', description: 'Balanced' },
  ],

  async generate(prompt, model) {
    try {
      // @ts-expect-error - optional dependency
      const { default: Anthropic } = await import('@anthropic-ai/sdk')
      const client = new Anthropic()

      const response = await client.messages.create({
        model: MODEL_MAP[model] || 'claude-3-5-haiku-latest',
        max_tokens: 8192,
        messages: [{ role: 'user', content: prompt }],
      })

      const textBlock = response.content.find(
        (b: { type: string, text?: string }) => b.type === 'text',
      ) as { type: 'text', text: string } | undefined

      return textBlock?.text || null
    }
    catch {
      return null
    }
  },
}
