/**
 * OpenCode CLI provider
 */

import { createCliProvider } from '../cli'

export const opencodeProvider = createCliProvider({
  id: 'opencode',
  name: 'OpenCode CLI',
  command: 'opencode',
  models: [
    { id: 'opencode-claude', name: 'Claude Sonnet', description: 'Default', recommended: true },
    { id: 'opencode-gpt4', name: 'GPT-4', description: 'OpenAI' },
  ],
  modelMap: {
    'opencode-claude': 'claude-sonnet',
    'opencode-gpt4': 'gpt-4',
  },
  buildArgs: model => ['--model', model],
})
