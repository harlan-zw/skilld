/**
 * Groq SDK provider - fast inference
 */

import type { LLMProvider } from '../types'

const MODEL_MAP: Record<string, string> = {
  'llama-3.3-70b': 'llama-3.3-70b-versatile',
  'llama-3.1-8b': 'llama-3.1-8b-instant',
  'mixtral-8x7b': 'mixtral-8x7b-32768',
  'deepseek-r1-70b': 'deepseek-r1-distill-llama-70b',
}

export const groqProvider: LLMProvider = {
  id: 'groq',
  name: 'Groq API',

  isAvailable: () => !!process.env.GROQ_API_KEY,

  getModels: () => [
    { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', description: 'Fast, capable', recommended: true },
    { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', description: 'Very fast' },
    { id: 'deepseek-r1-70b', name: 'DeepSeek R1 70B', description: 'Reasoning' },
  ],

  async generate(prompt, model) {
    try {
      // @ts-expect-error - optional dependency
      const { default: Groq } = await import('groq-sdk')
      const client = new Groq()

      const response = await client.chat.completions.create({
        model: MODEL_MAP[model] || 'llama-3.3-70b-versatile',
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
