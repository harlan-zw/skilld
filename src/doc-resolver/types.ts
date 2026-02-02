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
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

export interface ResolvedPackage {
  name: string
  version?: string
  description?: string
  docsUrl?: string
  llmsUrl?: string
  readmeUrl?: string
  repoUrl?: string
  /** Git docs folder - versioned docs from repo */
  gitDocsUrl?: string
  /** Git tag/ref used for gitDocsUrl */
  gitRef?: string
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

export interface ResolveAttempt {
  source: 'npm' | 'github-docs' | 'github-meta' | 'llms.txt' | 'readme'
  url?: string
  status: 'success' | 'not-found' | 'error'
  message?: string
}

export interface ResolveResult {
  package: ResolvedPackage | null
  attempts: ResolveAttempt[]
}
