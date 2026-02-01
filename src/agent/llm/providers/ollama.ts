/**
 * Ollama provider - local models
 */

import { createCliProvider } from '../cli'

export const ollamaProvider = createCliProvider({
  id: 'ollama',
  name: 'Ollama',
  command: 'ollama',
  models: [
    { id: 'llama3.3', name: 'Llama 3.3 70B', description: 'Best open model', recommended: true },
    { id: 'qwen2.5-coder', name: 'Qwen 2.5 Coder', description: 'Code-focused' },
    { id: 'deepseek-r1', name: 'DeepSeek R1', description: 'Reasoning model' },
    { id: 'mistral', name: 'Mistral 7B', description: 'Fast, lightweight' },
  ],
  modelMap: {
    'llama3.3': 'llama3.3:70b',
    'qwen2.5-coder': 'qwen2.5-coder:32b',
    'deepseek-r1': 'deepseek-r1:32b',
    'mistral': 'mistral:latest',
  },
  buildArgs: model => ['run', model],
})
