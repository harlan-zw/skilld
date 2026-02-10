/**
 * Agent module - detection, installation, and skill optimization
 */

export type { CustomPrompt, ModelInfo, OptimizeDocsOptions, OptimizeModel, OptimizeResult, SkillSection, StreamProgress } from './clis'
// CLI optimization
export {
  buildAllSectionPrompts,
  buildSectionPrompt,
  getAvailableModels,
  getModelLabel,
  getModelName,
  optimizeDocs,
  SECTION_MERGE_ORDER,
  SECTION_OUTPUT_FILES,
} from './clis'
// Detection
export { detectInstalledAgents, detectTargetAgent, getAgentVersion } from './detect'
// Import detection
export { detectImportedPackages } from './detect-imports'

// Installation
export { computeSkillDirName, installSkillForAgents, linkSkillToAgents, sanitizeName, unlinkSkillFromAgents } from './install'

// Skill generation
export { generateSkillMd } from './prompts'

export type { SkillOptions } from './prompts'
// Registry
export { agents } from './registry'

// Targets
export type { AgentTarget, FrontmatterField } from './targets'

// Types
export type { AgentType, SkillMetadata } from './types'

export { FILE_PATTERN_MAP } from './types'
