/**
 * Gemini CLI provider
 */

import { createCliProvider } from '../cli'

export const geminiProvider = createCliProvider({
  id: 'gemini',
  name: 'Gemini CLI',
  command: 'gemini',
  models: [
    { id: 'gemini-flash', name: 'Gemini 3 Flash', description: 'Fast', recommended: true },
    { id: 'gemini-pro', name: 'Gemini 3 Pro', description: 'Most capable' },
  ],
  modelMap: {
    'gemini-flash': 'gemini-3-flash-preview',
    'gemini-pro': 'gemini-3-pro-preview',
  },
})
