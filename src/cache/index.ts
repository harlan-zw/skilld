/**
 * Cache module - global doc caching with symlinks
 */

// Types
export type { CachedDoc, CachedPackage, CacheConfig } from './types'

// Config
export { CACHE_DIR, REFERENCES_DIR, SEARCH_DB } from './config'

// Version utilities
export { getCacheDir, getCacheKey, getVersionKey } from './version'

// Storage operations
export {
  clearAllCache,
  clearCache,
  ensureCacheDir,
  isCached,
  linkReferences,
  listCached,
  readCachedDocs,
  writeToCache,
} from './storage'
