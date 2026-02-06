/**
 * Agent module - detection, installation, and skill optimization
 */

// Detection
export { detectInstalledAgents, detectTargetAgent, getAgentVersion } from './detect'
// Import detection
export { detectImportedPackages } from './detect-imports'
// Installation
export { installSkillForAgents, sanitizeName } from './install'
export type { ModelInfo, OptimizeDocsOptions, OptimizeModel, OptimizeResult, SkillSection, StreamProgress } from './llm'

// LLM optimization
export {
  buildSkillPrompt,
  getAvailableModels,
  getModelName,
  optimizeDocs,
} from './llm'

// Skill generation
export { generateSkillMd } from './prompts'

export type { SkillOptions } from './prompts'
// Registry
export { agents } from './registry'

// Types
export type { AgentConfig, AgentType, SkillMetadata } from './types'

export { FILE_PATTERN_MAP } from './types'
