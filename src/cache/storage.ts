/**
 * Cache storage operations
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { CachedDoc, CachedPackage } from './types'
import { REFERENCES_DIR } from './config'
import { getCacheDir, getVersionKey } from './version'

/**
 * Check if package is cached at given version
 */
export function isCached(name: string, version: string): boolean {
  return existsSync(getCacheDir(name, version))
}

/**
 * Ensure cache directories exist
 */
export function ensureCacheDir(): void {
  mkdirSync(REFERENCES_DIR, { recursive: true })
}

/**
 * Write docs to cache
 */
export function writeToCache(
  name: string,
  version: string,
  docs: CachedDoc[],
): string {
  const cacheDir = getCacheDir(name, version)
  mkdirSync(cacheDir, { recursive: true })

  for (const doc of docs) {
    const filePath = join(cacheDir, doc.path)
    mkdirSync(join(filePath, '..'), { recursive: true })
    writeFileSync(filePath, doc.content)
  }

  return cacheDir
}

/**
 * Create symlink from project skill dir to cached references
 */
export function linkReferences(skillDir: string, name: string, version: string): void {
  const cacheDir = getCacheDir(name, version)
  const linkPath = join(skillDir, 'references')

  // Remove existing link/dir
  if (existsSync(linkPath)) {
    unlinkSync(linkPath)
  }

  symlinkSync(cacheDir, linkPath, 'junction')
}

/**
 * List all cached packages
 */
export function listCached(): CachedPackage[] {
  if (!existsSync(REFERENCES_DIR))
    return []

  return readdirSync(REFERENCES_DIR)
    .filter(name => name.includes('@'))
    .map((dir) => {
      const [name, version] = dir.split('@')
      return { name: name!, version: version!, dir: join(REFERENCES_DIR, dir) }
    })
}

/**
 * Read cached docs for a package
 */
export function readCachedDocs(name: string, version: string): CachedDoc[] {
  const cacheDir = getCacheDir(name, version)
  if (!existsSync(cacheDir))
    return []

  const docs: CachedDoc[] = []

  function walk(dir: string, prefix = '') {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const entryPath = join(dir, entry.name)
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name

      if (entry.isDirectory()) {
        walk(entryPath, relativePath)
      }
      else if (entry.name.endsWith('.md')) {
        docs.push({
          path: relativePath,
          content: readFileSync(entryPath, 'utf-8'),
        })
      }
    }
  }

  walk(cacheDir)
  return docs
}

/**
 * Clear cache for a specific package
 */
export function clearCache(name: string, version: string): boolean {
  const cacheDir = getCacheDir(name, version)
  if (!existsSync(cacheDir))
    return false

  const { rmSync } = require('node:fs')
  rmSync(cacheDir, { recursive: true })
  return true
}

/**
 * Clear all cache
 */
export function clearAllCache(): number {
  const packages = listCached()
  for (const pkg of packages) {
    clearCache(pkg.name, pkg.version)
  }
  return packages.length
}
