/**
 * Cache module - global doc caching with symlinks
 */

// Config
export { CACHE_DIR, getPackageDbPath, REFERENCES_DIR } from './config.ts'

// Storage operations
export type { ShippedSkill } from './storage.ts'

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
} from './storage.ts'

// Types
export type { CacheConfig, CachedDoc, CachedPackage } from './types.ts'
// Version utilities
export { getCacheDir, getCacheKey, getVersionKey } from './version.ts'
