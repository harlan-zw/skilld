/**
 * skilld - Package documentation for agentic use
 *
 * Main entry point re-exports cache and retriv modules.
 */

// Cache management
export {
  CACHE_DIR,
  REFERENCES_DIR,
  SEARCH_DB,
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
  writeToCache,
} from './cache/index'
export type { CachedDoc, CachedPackage, CacheConfig } from './cache/index'

// Search
export {
  createIndex,
  search,
  searchSnippets,
} from './retriv'
export type {
  Document,
  IndexConfig,
  SearchOptions,
  SearchResult,
  SearchSnippet,
} from './retriv'

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
