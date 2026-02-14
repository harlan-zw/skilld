import type { FeaturesConfig } from '../../core/config.ts'
import type { CustomPrompt, SkillSection } from '../prompts/index.ts'
import type { AgentType } from '../types.ts'

export interface ParsedEvent {
  /** Token-level text delta */
  textDelta?: string
  /** Complete text from a full message (non-partial) */
  fullText?: string
  /** Tool name being invoked */
  toolName?: string
  /** Tool input hint (file path, query, etc) */
  toolHint?: string
  /** Content from a Write tool call (fallback if Write is denied) */
  writeContent?: string
  /** Stream finished */
  done?: boolean
  /** Token usage */
  usage?: { input: number, output: number }
  /** Cost in USD */
  cost?: number
  /** Number of agentic turns */
  turns?: number
}

export type OptimizeModel
  = | 'opus'
    | 'sonnet'
    | 'haiku'
    | 'gemini-3-pro'
    | 'gemini-3-flash'
    | 'gpt-5.2-codex'
    | 'gpt-5.1-codex-max'
    | 'gpt-5.2'
    | 'gpt-5.1-codex-mini'

export interface ModelInfo {
  id: OptimizeModel
  name: string
  hint: string
  recommended?: boolean
  agentId: string
  agentName: string
}

export interface StreamProgress {
  chunk: string
  type: 'reasoning' | 'text'
  text: string
  reasoning: string
  section?: SkillSection
}

export interface OptimizeDocsOptions {
  packageName: string
  skillDir: string
  model?: OptimizeModel
  version?: string
  hasGithub?: boolean
  hasReleases?: boolean
  hasChangelog?: string | false
  docFiles?: string[]
  docsType?: 'llms.txt' | 'readme' | 'docs'
  hasShippedDocs?: boolean
  onProgress?: (progress: StreamProgress) => void
  timeout?: number
  verbose?: boolean
  debug?: boolean
  noCache?: boolean
  /** Which sections to generate */
  sections?: SkillSection[]
  /** Custom instructions from the user */
  customPrompt?: CustomPrompt
  /** Resolved feature flags */
  features?: FeaturesConfig
}

export interface OptimizeResult {
  optimized: string
  wasOptimized: boolean
  error?: string
  warnings?: string[]
  reasoning?: string
  finishReason?: string
  usage?: { inputTokens: number, outputTokens: number, totalTokens: number }
  cost?: number
  debugLogsDir?: string
}

export interface SectionResult {
  section: SkillSection
  content: string
  wasOptimized: boolean
  error?: string
  warnings?: ValidationWarning[]
  usage?: { input: number, output: number }
  cost?: number
}

export interface ValidationWarning {
  section: string
  warning: string
}

/** Per-model config without redundant cli/agentId (those come from the CLI file) */
export interface CliModelEntry {
  /** Model flag passed to the CLI */
  model: string
  /** Human-readable model name */
  name: string
  /** Short description hint */
  hint: string
  /** Whether this is the recommended model for this CLI */
  recommended?: boolean
}

/** Full model config (assembled from CLI files + their models) */
export interface CliModelConfig extends CliModelEntry {
  cli: CliName
  agentId: AgentType
}

export type CliName = 'claude' | 'gemini' | 'codex'
