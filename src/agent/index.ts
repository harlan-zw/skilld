/**
 * Agent module - detection, installation, and skill optimization
 */

// Types
export type { AgentConfig, AgentType, SkillMetadata } from './types'
export type { ModelInfo, OptimizeModel, PromptPreset, PromptPresetId } from './llm'

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
  buildPrompt,
  defaultPreset,
  detailedPreset,
  getAvailableModels,
  getPreset,
  minimalPreset,
  optimizeDocs,
  presets,
  simplePreset,
} from './llm'
