export interface PromptSection {
  task?: string
  format?: string
  rules?: string[]
}

export interface SectionContext {
  packageName: string
  hasIssues?: boolean
  hasDiscussions?: boolean
  hasReleases?: boolean
  hasChangelog?: string | false
}

export interface CustomPrompt {
  heading: string
  body: string
}
