/**
 * Cache configuration
 */

import { homedir } from 'node:os'
import { join } from 'pathe'
import { getCacheKey } from './version'

/** Global cache directory */
export const CACHE_DIR = join(homedir(), '.skilld')

/** References subdirectory */
export const REFERENCES_DIR = join(CACHE_DIR, 'references')

/** @deprecated Use getPackageDbPath instead */
export const SEARCH_DB = join(CACHE_DIR, 'search.db')

/** Get search DB path for a specific package@version */
export function getPackageDbPath(name: string, version: string): string {
  return join(REFERENCES_DIR, getCacheKey(name, version), 'search.db')
}
