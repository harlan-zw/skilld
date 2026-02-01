/**
 * Codex CLI provider (OpenAI)
 */

import { createCliProvider } from '../cli'

export const codexProvider = createCliProvider({
  id: 'codex',
  name: 'Codex CLI',
  command: 'codex',
  models: [
    { id: 'codex-o4-mini', name: 'o4-mini', description: 'Fast, recommended', recommended: true },
    { id: 'codex-o3', name: 'o3', description: 'Most capable' },
    { id: 'codex-gpt-4.1', name: 'GPT-4.1', description: 'Balanced' },
  ],
  modelMap: {
    'codex-o4-mini': 'o4-mini',
    'codex-o3': 'o3',
    'codex-gpt-4.1': 'gpt-4.1',
  },
  buildArgs: model => ['--model', model, '--quiet'],
})
