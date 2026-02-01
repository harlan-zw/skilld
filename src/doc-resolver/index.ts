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
  ResolvedPackage,
} from './types'

// NPM
export {
  fetchNpmPackage,
  getInstalledSkillVersion,
  readLocalDependencies,
  resolvePackageDocs,
} from './npm'

// GitHub
export {
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
