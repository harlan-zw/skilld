/**
 * Agent module - detection, installation, and skill optimization
 */

// Detection
export { detectInstalledAgents, detectTargetAgent, getAgentVersion } from './detect'
// Import detection
export { detectImportedPackages } from './detect-imports'
// Installation
export { computeSkillDirName, installSkillForAgents, sanitizeName } from './install'
export type { CustomPrompt, ModelInfo, OptimizeDocsOptions, OptimizeModel, OptimizeResult, SkillSection, StreamProgress } from './llm'

// LLM optimization
export {
  buildAllSectionPrompts,
  buildSectionPrompt,
  getAvailableModels,
  getModelLabel,
  getModelName,
  optimizeDocs,
  SECTION_MERGE_ORDER,
  SECTION_OUTPUT_FILES,
} from './llm'

// Skill generation
export { generateSkillMd } from './prompts'

export type { SkillOptions } from './prompts'
// Registry
export { agents } from './registry'

// Types
export type { AgentConfig, AgentType, SkillMetadata } from './types'

export { FILE_PATTERN_MAP } from './types'
