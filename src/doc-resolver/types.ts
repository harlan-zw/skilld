/**
 * Doc resolver types
 */

export interface NpmPackageInfo {
  name: string
  version?: string
  description?: string
  homepage?: string
  repository?: {
    type: string
    url: string
    directory?: string
  }
  readme?: string
}

export interface ResolvedPackage {
  name: string
  version?: string
  description?: string
  docsUrl?: string
  llmsUrl?: string
  readmeUrl?: string
  repoUrl?: string
}

export interface LocalDependency {
  name: string
  version: string
}

export interface LlmsContent {
  raw: string
  /** Markdown links extracted from llms.txt */
  links: LlmsLink[]
}

export interface LlmsLink {
  title: string
  url: string
}

export interface FetchedDoc {
  url: string
  title: string
  content: string
}
