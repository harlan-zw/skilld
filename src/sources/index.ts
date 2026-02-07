/**
 * Doc resolver - resolves documentation for NPM packages
 */

// Discussions
export type { GitHubDiscussion } from './discussions'

export {
  fetchGitHubDiscussions,
  formatDiscussionsAsMarkdown,
} from './discussions'
// Entries
export type { EntryFile } from './entries'

export { resolveEntryFiles } from './entries'
// GitHub
export type { GitDocsResult } from './github'

export {
  fetchGitDocs,
  fetchGitHubRepoMeta,
  fetchReadme,
  fetchReadmeContent,
} from './github'
// Issues
export type { GitHubIssue } from './issues'

export {
  fetchGitHubIssues,
  formatIssuesAsMarkdown,
  isGhAvailable,
} from './issues'

// llms.txt
export {
  downloadLlmsDocs,
  extractSections,
  fetchLlmsTxt,
  fetchLlmsUrl,
  normalizeLlmsLinks,
  parseMarkdownLinks,
} from './llms'
// NPM
export type { LocalPackageInfo, ResolveOptions, ResolveStep } from './npm'

export {
  fetchLatestVersion,
  fetchNpmPackage,
  fetchNpmRegistryMeta,
  fetchPkgDist,
  getInstalledSkillVersion,
  parseVersionSpecifier,
  readLocalDependencies,
  readLocalPackageInfo,
  resolveInstalledVersion,
  resolveLocalPackageDocs,
  resolvePackageDocs,
  resolvePackageDocsWithAttempts,
} from './npm'

// Overrides
export type { DocOverride } from './overrides'
export { DOC_OVERRIDES, getDocOverride } from './overrides'

// Releases
export type { GitHubRelease } from './releases'
export { fetchReleaseNotes } from './releases'
// Types
export type {
  FetchedDoc,
  LlmsContent,
  LlmsLink,
  LocalDependency,
  NpmPackageInfo,
  ResolveAttempt,
  ResolvedPackage,
  ResolveResult,
} from './types'

// Utils
export {
  fetchText,
  isGitHubRepoUrl,
  normalizeRepoUrl,
  parseGitHubUrl,
  verifyUrl,
} from './utils'
