/**
 * Cache module - global doc caching with symlinks
 */

// Project layout (re-exported from core/paths for cache consumers)
export { CACHE_DIR, getPackageDbPath, getRepoCacheDir, REFERENCES_DIR, REPOS_DIR } from '../core/paths.ts'

export type { ReferenceCache, ReferenceCacheEjectOpts, ReferenceCacheLinkOpts } from './reference-cache.ts'
export { createReferenceCache } from './reference-cache.ts'
// Composed reference-cache operations (the higher-level surface most callers want)
export type { CachedReferencesResult, LoadCachedReferencesOptions } from './references.ts'

export {
  classifyCachedDoc,
  clearSkillInternalDir,
  detectDocsType,
  ejectReferences,
  forceClearCache,
  getSkillReferenceDirs,
  linkAllReferences,
  loadCachedReferences,
} from './references.ts'

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
