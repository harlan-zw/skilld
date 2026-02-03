/**
 * Cache storage operations
 */

import type { CachedDoc, CachedPackage } from './types'
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { REFERENCES_DIR } from './config'
import { getCacheDir, getCacheKey } from './version'

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
 * Write docs to cache, cleaning stale version dirs for the same package
 */
export function writeToCache(
  name: string,
  version: string,
  docs: CachedDoc[],
): string {
  const cacheDir = getCacheDir(name, version)
  mkdirSync(cacheDir, { recursive: true })

  // Clean stale cache dirs for same package with different version keys
  cleanStaleCacheDirs(name, version)

  for (const doc of docs) {
    const filePath = join(cacheDir, doc.path)
    mkdirSync(join(filePath, '..'), { recursive: true })
    writeFileSync(filePath, doc.content)
  }

  return cacheDir
}

/**
 * Remove stale cache dirs for same package but different version keys
 * e.g. @clack/prompts@1.0 vs @clack/prompts@1.0.0
 */
function cleanStaleCacheDirs(name: string, version: string): void {
  const currentKey = getCacheKey(name, version)
  const prefix = `${name}@`

  // For scoped packages, check inside the scope dir
  if (name.startsWith('@')) {
    const [scope, pkg] = name.split('/')
    const scopeDir = join(REFERENCES_DIR, scope!)
    if (!existsSync(scopeDir))
      return

    const scopePrefix = `${pkg}@`
    const currentDirName = basename(getCacheDir(name, version))

    for (const entry of readdirSync(scopeDir)) {
      if (entry.startsWith(scopePrefix) && entry !== currentDirName) {
        rmSync(join(scopeDir, entry), { recursive: true, force: true })
      }
    }
  }
  else {
    if (!existsSync(REFERENCES_DIR))
      return
    for (const entry of readdirSync(REFERENCES_DIR)) {
      if (entry.startsWith(prefix) && entry !== basename(getCacheDir(name, version))) {
        rmSync(join(REFERENCES_DIR, entry), { recursive: true, force: true })
      }
    }
  }
}

/**
 * Create references directory with symlinked docs (only if external fetch needed)
 *
 * Structure:
 *   .claude/skills/<skill>/references/
 *     pkg -> node_modules/<pkg> (always, has package.json, README.md, dist/)
 *     docs -> ~/.skilld/references/<pkg>@<version>/docs (only if fetched externally)
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
 * Create symlink from references dir to cached issues
 *
 * Structure:
 *   .claude/skills/<skill>/references/issues -> ~/.skilld/references/<pkg>@<version>/issues
 */
export function linkIssues(skillDir: string, name: string, version: string): void {
  const cacheDir = getCacheDir(name, version)
  const referencesDir = join(skillDir, 'references')
  const issuesLinkPath = join(referencesDir, 'issues')
  const cachedIssuesPath = join(cacheDir, 'issues')

  mkdirSync(referencesDir, { recursive: true })

  if (existsSync(issuesLinkPath)) {
    unlinkSync(issuesLinkPath)
  }
  if (existsSync(cachedIssuesPath)) {
    symlinkSync(cachedIssuesPath, issuesLinkPath, 'junction')
  }
}

/**
 * Create symlink from references dir to entire node_modules package
 *
 * Structure:
 *   .claude/skills/<skill>/references/pkg -> node_modules/<pkg>
 *
 * This gives access to package.json, README.md, dist/, and any shipped docs/
 */
export function linkPkg(skillDir: string, name: string, cwd: string): void {
  const nodeModulesPath = join(cwd, 'node_modules', name)

  if (!existsSync(nodeModulesPath))
    return

  const referencesDir = join(skillDir, 'references')
  mkdirSync(referencesDir, { recursive: true })

  const pkgLinkPath = join(referencesDir, 'pkg')
  if (existsSync(pkgLinkPath)) {
    unlinkSync(pkgLinkPath)
  }
  symlinkSync(nodeModulesPath, pkgLinkPath, 'junction')
}

/**
 * Check if package ships its own docs folder
 */
export interface ShippedSkill {
  skillName: string
  skillDir: string
}

/**
 * Check if package ships a skills/ directory with SKILL.md subdirs
 */
export function getShippedSkills(name: string, cwd: string): ShippedSkill[] {
  const skillsPath = join(cwd, 'node_modules', name, 'skills')
  if (!existsSync(skillsPath))
    return []

  return readdirSync(skillsPath, { withFileTypes: true })
    .filter(d => d.isDirectory() && existsSync(join(skillsPath, d.name, 'SKILL.md')))
    .map(d => ({ skillName: d.name, skillDir: join(skillsPath, d.name) }))
}

/**
 * Create symlink from references dir to cached releases
 *
 * Structure:
 *   .claude/skills/<skill>/references/releases -> ~/.skilld/references/<pkg>@<version>/releases
 */
export function linkReleases(skillDir: string, name: string, version: string): void {
  const cacheDir = getCacheDir(name, version)
  const referencesDir = join(skillDir, 'references')
  const releasesLinkPath = join(referencesDir, 'releases')
  const cachedReleasesPath = join(cacheDir, 'releases')

  mkdirSync(referencesDir, { recursive: true })

  if (existsSync(releasesLinkPath)) {
    unlinkSync(releasesLinkPath)
  }
  if (existsSync(cachedReleasesPath)) {
    symlinkSync(cachedReleasesPath, releasesLinkPath, 'junction')
  }
}

/**
 * Create symlink from skills dir to shipped skill dir
 */
export function linkShippedSkill(baseDir: string, skillName: string, targetDir: string): void {
  const linkPath = join(baseDir, skillName)
  if (existsSync(linkPath)) {
    const stat = lstatSync(linkPath)
    if (stat.isSymbolicLink())
      unlinkSync(linkPath)
    else rmSync(linkPath, { recursive: true, force: true })
  }
  symlinkSync(targetDir, linkPath)
}

export function hasShippedDocs(name: string, cwd: string): boolean {
  const nodeModulesPath = join(cwd, 'node_modules', name)
  if (!existsSync(nodeModulesPath))
    return false

  const docsCandidates = ['docs', 'documentation', 'doc']
  for (const candidate of docsCandidates) {
    const docsPath = join(nodeModulesPath, candidate)
    if (existsSync(docsPath))
      return true
  }
  return false
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
 * List files in references directory (pkg + docs) as relative paths for prompt context
 * Returns paths like ./references/pkg/README.md, ./references/docs/api.md
 */
export function listReferenceFiles(skillDir: string, maxDepth = 3): string[] {
  const referencesDir = join(skillDir, 'references')
  if (!existsSync(referencesDir))
    return []

  const files: string[] = []

  function walk(dir: string, depth: number) {
    if (depth > maxDepth)
      return
    try {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name)
        if (entry.isDirectory() || entry.isSymbolicLink()) {
          try {
            const stat = statSync(full)
            if (stat.isDirectory()) {
              walk(full, depth + 1)
              continue
            }
          }
          catch { continue }
        }
        if (entry.name.endsWith('.md')) {
          files.push(full)
        }
      }
    }
    catch {
      // Broken symlink or permission error
    }
  }

  walk(referencesDir, 0)
  return files
}
