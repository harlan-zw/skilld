/**
 * skilld - Package documentation for agentic use
 *
 * Main entry point re-exports cache and retriv modules.
 */

// Cache management
export {
  CACHE_DIR,
  clearAllCache,
  clearCache,
  ensureCacheDir,
  getCacheDir,
  getCacheKey,
  getVersionKey,
  isCached,
  listCached,
  readCachedDocs,
  REFERENCES_DIR,
  writeToCache,
} from './cache/index.ts'
export type { CacheConfig, CachedDoc, CachedPackage } from './cache/index.ts'

// Search
export {
  createIndex,
  search,
  searchSnippets,
} from './retriv/index.ts'
export type {
  Document,
  IndexConfig,
  SearchFilter,
  SearchOptions,
  SearchResult,
  SearchSnippet,
} from './retriv/index.ts'

// Doc resolver
export {
  downloadLlmsDocs,
  fetchLlmsTxt,
  fetchNpmPackage,
  fetchReadmeContent,
  normalizeLlmsLinks,
  parseMarkdownLinks,
  readLocalDependencies,
  resolvePackageDocs,
} from './sources/index.ts'
export type {
  FetchedDoc,
  LlmsContent,
  LlmsLink,
  LocalDependency,
  NpmPackageInfo,
  ResolvedPackage,
} from './sources/index.ts'
