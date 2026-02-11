/**
 * Doc resolver - resolves documentation for NPM packages
 */

export { fetchBlogReleases } from './blog-releases'

// Discussions
export type { GitHubDiscussion } from './discussions'
export {
  fetchGitHubDiscussions,
  formatDiscussionAsMarkdown,
  generateDiscussionIndex,
} from './discussions'

// Entries
export type { EntryFile } from './entries'
export { resolveEntryFiles } from './entries'

// Git skills
export type { GitSkillSource, RemoteSkill } from './git-skills'
export {
  fetchGitSkills,
  parseGitSkillInput,
  parseSkillFrontmatterName,
} from './git-skills'

// GitHub
export type { GitDocsResult } from './github'

export {
  fetchGitDocs,
  fetchGitHubRepoMeta,
  fetchReadme,
  fetchReadmeContent,
  isShallowGitDocs,
  MIN_GIT_DOCS,
  validateGitDocsWithLlms,
} from './github'
// Issues
export type { GitHubIssue } from './issues'

export {
  fetchGitHubIssues,
  formatIssueAsMarkdown,
  generateIssueIndex,
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
  searchNpmPackages,
} from './npm'
// Package registry
export type { BlogPreset, BlogRelease, DocOverride } from './package-registry'

export { getBlogPreset, getDocOverride, getFilePatterns, getRelatedPackages, getRepoEntry, getRepoKeyForPackage } from './package-registry'

// Releases
export type { GitHubRelease, ReleaseIndexOptions, SemVer } from './releases'

export { compareSemver, fetchReleaseNotes, generateReleaseIndex, parseSemver } from './releases'

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
  $fetch,
  extractBranchHint,
  fetchText,
  isGitHubRepoUrl,
  normalizeRepoUrl,
  parseGitHubUrl,
  verifyUrl,
} from './utils'
