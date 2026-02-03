/**
 * Cache module - global doc caching with symlinks
 */

// Config
export { CACHE_DIR, getPackageDbPath, REFERENCES_DIR, SEARCH_DB } from './config'

// Storage operations
export type { ShippedSkill } from './storage'

export {
  clearAllCache,
  clearCache,
  ensureCacheDir,
  getShippedSkills,
  hasShippedDocs,
  isCached,
  linkIssues,
  linkPkg,
  linkReferences,
  linkReleases,
  linkShippedSkill,
  listCached,
  listReferenceFiles,
  readCachedDocs,
  writeToCache,
} from './storage'

// Types
export type { CacheConfig, CachedDoc, CachedPackage } from './types'
// Version utilities
export { getCacheDir, getCacheKey, getVersionKey } from './version'
