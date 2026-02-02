/**
 * Agent module - detection, installation, and skill optimization
 */

// Types
export type { AgentConfig, AgentType, SkillMetadata } from './types'
export type { ModelInfo, OptimizeDocsOptions, OptimizeModel, OptimizeResult, StreamProgress } from './llm'

// Registry
export { agents } from './registry'

// Detection
export { detectCurrentAgent, detectInstalledAgents, getAgentVersion } from './detect'

// Installation
export { installSkillForAgents, sanitizeName } from './install'

// Skill generation
export { generateSkillMd } from './skill'

// Import detection
export { detectImportedPackages } from './detect-imports'

// LLM optimization
export {
  buildPrompt,
  getAvailableModels,
  getModelName,
  optimizeDocs,
} from './llm'
