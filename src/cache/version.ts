/**
 * Version utilities
 */

import { join } from 'node:path'
import { REFERENCES_DIR } from './config'

/**
 * Get exact version key for cache keying
 */
export function getVersionKey(version: string): string {
  return version
}

/**
 * Get cache key for a package: name@version
 */
export function getCacheKey(name: string, version: string): string {
  return `${name}@${getVersionKey(version)}`
}

/**
 * Get path to cached package references
 */
export function getCacheDir(name: string, version: string): string {
  return join(REFERENCES_DIR, getCacheKey(name, version))
}
