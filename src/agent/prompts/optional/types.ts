import type { FeaturesConfig } from '../../../core/config'

export interface ReferenceWeight {
  name: string
  path: string
  /** 1-10 usefulness score for this section */
  score: number
  /** What this reference is useful for in this section */
  useFor: string
}

export interface PromptSection {
  task?: string
  format?: string
  rules?: string[]
  /** Per-reference usefulness ratings to guide LLM attention */
  referenceWeights?: ReferenceWeight[]
}

export interface SectionContext {
  packageName: string
  version?: string
  hasIssues?: boolean
  hasDiscussions?: boolean
  hasReleases?: boolean
  hasChangelog?: string | false
  features?: FeaturesConfig
}

export interface CustomPrompt {
  heading: string
  body: string
}
