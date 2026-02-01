/**
 * Agent module - detection, installation, and skill optimization
 */

// Types
export type { AgentConfig, AgentType, SkillMetadata } from './types'
export type { AvailableModel, CliProviderConfig, LLMProvider, ModelInfo, OptimizeModel, PromptPreset, PromptPresetId } from './llm'

// Registry
export { agents } from './registry'

// Detection
export { detectCurrentAgent, detectInstalledAgents } from './detect'

// Installation
export { installSkillForAgents, sanitizeName } from './install'

// Skill generation
export { generateSkillMd } from './skill'

// LLM optimization
export {
  anthropicProvider,
  buildPrompt,
  claudeProvider,
  codexProvider,
  createCliProvider,
  defaultPreset,
  detailedPreset,
  geminiProvider,
  getAvailableModels,
  getPreset,
  getProvider,
  getProviders,
  groqProvider,
  hasCli,
  minimalPreset,
  ollamaProvider,
  openaiProvider,
  opencodeProvider,
  optimizeDocs,
  presets,
  registerProvider,
  runCli,
  simplePreset,
} from './llm'
