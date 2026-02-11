import type { FeaturesConfig } from '../../core/config'

export interface PromptSection {
  task?: string
  format?: string
  rules?: string[]
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
