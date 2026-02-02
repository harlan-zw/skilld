/**
 * Doc resolver - resolves documentation for NPM packages
 */

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

// NPM
export type { LocalPackageInfo, ResolveOptions } from './npm'
export {
  fetchNpmPackage,
  getInstalledSkillVersion,
  parseVersionSpecifier,
  readLocalDependencies,
  readLocalPackageInfo,
  resolveLocalPackageDocs,
  resolvePackageDocs,
  resolvePackageDocsWithAttempts,
} from './npm'

// GitHub
export type { GitDocsResult } from './github'
export {
  fetchGitDocs,
  fetchGitHubRepoMeta,
  fetchReadme,
  fetchReadmeContent,
} from './github'

// llms.txt
export {
  downloadLlmsDocs,
  extractSections,
  fetchLlmsTxt,
  fetchLlmsUrl,
  normalizeLlmsLinks,
  parseMarkdownLinks,
} from './llms'

// Utils
export {
  fetchText,
  isGitHubRepoUrl,
  normalizeRepoUrl,
  parseGitHubUrl,
  verifyUrl,
} from './utils'
