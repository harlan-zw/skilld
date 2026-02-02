/**
 * Cache types
 */

export interface CacheConfig {
  /** Package name */
  name: string
  /** Package version (full semver) */
  version: string
}

export interface CachedPackage {
  name: string
  version: string
  dir: string
}

export interface CachedDoc {
  path: string
  content: string
}
