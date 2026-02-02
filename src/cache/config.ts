/**
 * Cache configuration
 */

import { homedir } from 'node:os'
import { join } from 'node:path'

/** Global cache directory */
export const CACHE_DIR = join(homedir(), '.skilld')

/** References subdirectory */
export const REFERENCES_DIR = join(CACHE_DIR, 'references')

/** Global search database */
export const SEARCH_DB = join(CACHE_DIR, 'search.db')
