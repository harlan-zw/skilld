/**
 * Version utilities
 */

import { join } from 'node:path'
import { REFERENCES_DIR } from './config'

/**
 * Get major.minor version key from full semver
 */
export function getVersionKey(version: string): string {
  const match = version.match(/^(\d+)\.(\d+)/)
  return match ? `${match[1]}.${match[2]}` : version
}

/**
 * Get cache key for a package: name@major.minor
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
