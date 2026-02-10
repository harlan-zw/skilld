/**
 * Cache module - global doc caching with symlinks
 */

// Config
export { CACHE_DIR, getPackageDbPath, REFERENCES_DIR } from './config'

// Storage operations
export type { ShippedSkill } from './storage'

export {
  clearAllCache,
  clearCache,
  ensureCacheDir,
  getPkgKeyFiles,
  getShippedSkills,
  hasShippedDocs,
  isCached,
  linkCachedDir,
  linkPkg,
  linkPkgNamed,
  linkShippedSkill,
  listCached,
  listReferenceFiles,
  readCachedDocs,
  readCachedSection,
  resolvePkgDir,
  writeSections,
  writeToCache,
} from './storage'

// Types
export type { CacheConfig, CachedDoc, CachedPackage } from './types'
// Version utilities
export { getCacheDir, getCacheKey, getVersionKey } from './version'
