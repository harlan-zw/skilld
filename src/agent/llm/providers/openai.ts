/**
 * OpenAI SDK provider
 */

import type { LLMProvider } from '../types'

const MODEL_MAP: Record<string, string> = {
  'gpt-4o': 'gpt-4o',
  'gpt-4o-mini': 'gpt-4o-mini',
  'o1': 'o1',
  'o3-mini': 'o3-mini',
}

export const openaiProvider: LLMProvider = {
  id: 'openai',
  name: 'OpenAI API',

  isAvailable: () => !!process.env.OPENAI_API_KEY,

  getModels: () => [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast, cheap', recommended: true },
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable' },
    { id: 'o3-mini', name: 'o3-mini', description: 'Reasoning model' },
  ],

  async generate(prompt, model) {
    try {
      // @ts-expect-error - optional dependency
      const { default: OpenAI } = await import('openai')
      const client = new OpenAI()

      const response = await client.chat.completions.create({
        model: MODEL_MAP[model] || 'gpt-4o-mini',
        max_tokens: 8192,
        messages: [{ role: 'user', content: prompt }],
      })

      return response.choices[0]?.message?.content || null
    }
    catch {
      return null
    }
  },
}
