/**
 * Cache storage operations
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { CachedDoc, CachedPackage } from './types'
import { REFERENCES_DIR } from './config'
import { getCacheDir, getCacheKey, getVersionKey } from './version'

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
 * Create references directory with symlinked docs
 *
 * Structure:
 *   .claude/skills/<skill>/references/
 *     docs -> ~/.skilld/references/<pkg>@<version>/docs
 *     dist -> node_modules/<pkg>/dist (added by linkDist)
 *
 * The symlinks are gitignored. After clone, `skilld install` recreates from lockfile.
 */
export function linkReferences(skillDir: string, name: string, version: string): void {
  const cacheDir = getCacheDir(name, version)
  const referencesDir = join(skillDir, 'references')
  const docsLinkPath = join(referencesDir, 'docs')
  const cachedDocsPath = join(cacheDir, 'docs')

  // Create references dir if needed
  mkdirSync(referencesDir, { recursive: true })

  // Symlink docs from cache
  if (existsSync(docsLinkPath)) {
    unlinkSync(docsLinkPath)
  }
  if (existsSync(cachedDocsPath)) {
    symlinkSync(cachedDocsPath, docsLinkPath, 'junction')
  }
}

/**
 * Create symlink from references dir to node_modules dist
 *
 * Structure:
 *   .claude/skills/<skill>/references/dist -> node_modules/<pkg>/dist
 */
export function linkDist(skillDir: string, name: string, cwd: string): void {
  const candidates = ['dist', 'lib', 'build', 'esm']
  const nodeModulesPath = join(cwd, 'node_modules', name)

  if (!existsSync(nodeModulesPath)) return

  const referencesDir = join(skillDir, 'references')
  mkdirSync(referencesDir, { recursive: true })

  for (const candidate of candidates) {
    const distPath = join(nodeModulesPath, candidate)
    if (existsSync(distPath)) {
      const distLinkPath = join(referencesDir, 'dist')
      if (existsSync(distLinkPath)) {
        unlinkSync(distLinkPath)
      }
      symlinkSync(distPath, distLinkPath, 'junction')
      return
    }
  }
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

/**
 * List files in references directory (docs + dist) as relative paths for prompt context
 * Returns paths like ./references/docs/api.md, ./references/dist/index.ts
 */
export function listReferenceFiles(skillDir: string, maxDepth = 3): string[] {
  const referencesDir = join(skillDir, 'references')
  if (!existsSync(referencesDir)) return []

  const files: string[] = []

  function walk(dir: string, prefix: string, depth: number) {
    if (depth > maxDepth) return
    try {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const relativePath = `${prefix}/${entry.name}`
        if (entry.isDirectory()) {
          walk(join(dir, entry.name), relativePath, depth + 1)
        }
        else {
          files.push(`.${relativePath}`)
        }
      }
    }
    catch {
      // Broken symlink or permission error
    }
  }

  walk(referencesDir, '/references', 0)
  return files
}
