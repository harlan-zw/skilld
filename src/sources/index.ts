/**
 * Doc resolver - resolves documentation for NPM packages
 */

export { fetchBlogReleases } from './blog-releases.ts'

// Discussions
export type { GitHubDiscussion } from './discussions.ts'
export {
  fetchGitHubDiscussions,
  formatDiscussionAsMarkdown,
  generateDiscussionIndex,
} from './discussions.ts'

// Entries
export type { EntryFile } from './entries.ts'
export { resolveEntryFiles } from './entries.ts'

// Git skills
export type { GitSkillSource, RemoteSkill } from './git-skills.ts'
export {
  fetchGitSkills,
  parseGitSkillInput,
  parseSkillFrontmatterName,
} from './git-skills.ts'

// GitHub
export type { GitDocsResult } from './github.ts'

export {
  fetchGitDocs,
  fetchGitHubRepoMeta,
  fetchReadme,
  fetchReadmeContent,
  isShallowGitDocs,
  MIN_GIT_DOCS,
  validateGitDocsWithLlms,
} from './github.ts'
// Issues
export type { GitHubIssue } from './issues.ts'

export {
  fetchGitHubIssues,
  formatIssueAsMarkdown,
  generateIssueIndex,
  isGhAvailable,
} from './issues.ts'

// llms.txt
export {
  downloadLlmsDocs,
  extractSections,
  fetchLlmsTxt,
  fetchLlmsUrl,
  normalizeLlmsLinks,
  parseMarkdownLinks,
} from './llms.ts'
// NPM
export type { LocalPackageInfo, ResolveOptions, ResolveStep } from './npm.ts'

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
} from './npm.ts'
// Package registry
export type { BlogPreset, BlogRelease, DocOverride } from './package-registry.ts'

export { getBlogPreset, getDocOverride, getFilePatterns, getRelatedPackages, getRepoEntry, getRepoKeyForPackage } from './package-registry.ts'

// Releases
export type { GitHubRelease, ReleaseIndexOptions, SemVer } from './releases.ts'

export { compareSemver, fetchReleaseNotes, generateReleaseIndex, isPrerelease, parseSemver } from './releases.ts'

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
} from './types.ts'
// Utils
export {
  $fetch,
  extractBranchHint,
  fetchText,
  isGitHubRepoUrl,
  normalizeRepoUrl,
  parseGitHubUrl,
  verifyUrl,
} from './utils.ts'
