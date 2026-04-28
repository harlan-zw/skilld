/**
 * Cache module - global doc caching with symlinks
 */

// Config
export { CACHE_DIR, getPackageDbPath, getRepoCacheDir, REFERENCES_DIR, REPOS_DIR } from './config.ts'

// Storage operations
export type { ShippedSkill } from './storage.ts'

export {
  clearAllCache,
  clearCache,
  ensureCacheDir,
  getPkgKeyFiles,
  getShippedSkills,
  hasShippedDocs,
  inferDocsTypeFromCache,
  isCached,
  isReadmeOnlyCache,
  linkCachedDir,
  linkPkg,
  linkPkgNamed,
  linkRepoCachedDir,
  linkShippedSkill,
  listCached,
  listReferenceFiles,
  readCachedDocs,
  readCachedSection,
  resolvePkgDir,
  writeSections,
  writeToCache,
  writeToRepoCache,
} from './storage.ts'

// Types
export type { CacheConfig, CachedDoc, CachedPackage } from './types.ts'
// Version utilities
export { getCacheDir, getCacheKey, getVersionKey } from './version.ts'
