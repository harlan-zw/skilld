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
  linkReferences,
  listCached,
  readCachedDocs,
  REFERENCES_DIR,
  SEARCH_DB,
  writeToCache,
} from './cache/index'
export type { CacheConfig, CachedDoc, CachedPackage } from './cache/index'

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
} from './doc-resolver'
export type {
  FetchedDoc,
  LlmsContent,
  LlmsLink,
  LocalDependency,
  NpmPackageInfo,
  ResolvedPackage,
} from './doc-resolver'

// Search
export {
  createIndex,
  search,
  searchSnippets,
} from './retriv'
export type {
  Document,
  IndexConfig,
  SearchFilter,
  SearchOptions,
  SearchResult,
  SearchSnippet,
} from './retriv'
