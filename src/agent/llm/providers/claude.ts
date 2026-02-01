/**
 * Claude CLI provider
 */

import { createCliProvider } from '../cli'

export const claudeProvider = createCliProvider({
  id: 'claude',
  name: 'Claude CLI',
  command: 'claude',
  models: [
    { id: 'haiku', name: 'Claude Haiku', description: 'Fast, cheap', recommended: true },
    { id: 'sonnet', name: 'Claude Sonnet', description: 'Balanced' },
    { id: 'opus', name: 'Claude Opus', description: 'Most capable' },
  ],
  modelMap: {
    haiku: 'haiku',
    sonnet: 'sonnet',
    opus: 'opus',
  },
  buildArgs: model => ['--model', model, '--print'],
})
