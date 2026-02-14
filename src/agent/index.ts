/**
 * Agent module - detection, installation, and skill optimization
 */

export type { CustomPrompt, ModelInfo, OptimizeDocsOptions, OptimizeModel, OptimizeResult, SkillSection, StreamProgress } from './clis/index.ts'
// CLI optimization
export {
  buildAllSectionPrompts,
  buildSectionPrompt,
  createToolProgress,
  getAvailableModels,
  getModelLabel,
  getModelName,
  optimizeDocs,
  SECTION_MERGE_ORDER,
  SECTION_OUTPUT_FILES,
} from './clis/index.ts'
// Import detection
export { detectImportedPackages } from './detect-imports.ts'
// Detection
export { detectInstalledAgents, detectTargetAgent, getAgentVersion } from './detect.ts'

// Installation
export { computeSkillDirName, installSkillForAgents, linkSkillToAgents, sanitizeName, unlinkSkillFromAgents } from './install.ts'

// Skill generation
export { generateSkillMd } from './prompts/index.ts'

export type { SkillOptions } from './prompts/index.ts'
// Registry
export { agents } from './registry.ts'

// Targets
export type { AgentTarget, FrontmatterField } from './targets/index.ts'

// Types
export type { AgentType, SkillMetadata } from './types.ts'
