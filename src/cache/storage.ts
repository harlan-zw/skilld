/**
 * Cache storage operations
 */

import type { CachedDoc, CachedPackage } from './types'
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs'
import { basename, join, resolve } from 'pathe'
import { sanitizeMarkdown } from '../core/sanitize'
import { REFERENCES_DIR } from './config'
import { getCacheDir } from './version'

/** Safely create a symlink, validating target is under REFERENCES_DIR */
function safeSymlink(target: string, linkPath: string): void {
  const resolved = resolve(target)
  if (!resolved.startsWith(REFERENCES_DIR))
    throw new Error(`Symlink target outside references dir: ${resolved}`)
  // Remove pre-existing symlink (check with lstat to detect symlinks)
  try {
    const stat = lstatSync(linkPath)
    if (stat.isSymbolicLink() || stat.isFile())
      unlinkSync(linkPath)
  }
  catch {}
  symlinkSync(target, linkPath, 'junction')
}

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
  mkdirSync(REFERENCES_DIR, { recursive: true, mode: 0o700 })
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
  mkdirSync(cacheDir, { recursive: true, mode: 0o700 })

  for (const doc of docs) {
    const filePath = join(cacheDir, doc.path)
    mkdirSync(join(filePath, '..'), { recursive: true, mode: 0o700 })
    writeFileSync(filePath, sanitizeMarkdown(doc.content), { mode: 0o600 })
  }

  return cacheDir
}

/**
 * Create symlink from .skilld dir to a cached subdirectory.
 * Unified handler for docs, issues, discussions, sections, releases.
 *
 * Structure:
 *   .claude/skills/<skill>/.skilld/<subdir> -> ~/.skilld/references/<pkg>@<version>/<subdir>
 *
 * The .skilld/ dirs are gitignored. After clone, `skilld install` recreates from lockfile.
 */
export function linkCachedDir(skillDir: string, name: string, version: string, subdir: string): void {
  const cacheDir = getCacheDir(name, version)
  const referencesDir = join(skillDir, '.skilld')
  const linkPath = join(referencesDir, subdir)
  const cachedPath = join(cacheDir, subdir)

  mkdirSync(referencesDir, { recursive: true })

  if (existsSync(cachedPath)) {
    safeSymlink(cachedPath, linkPath)
  }
}

/**
 * Resolve the package directory: node_modules first, then cached dist fallback.
 * Returns the path if found, null otherwise.
 */
export function resolvePkgDir(name: string, cwd: string, version?: string): string | null {
  const nodeModulesPath = join(cwd, 'node_modules', name)
  if (existsSync(nodeModulesPath))
    return nodeModulesPath

  // Fallback: check cached npm dist
  if (version) {
    const cachedPkgDir = join(getCacheDir(name, version), 'pkg')
    if (existsSync(join(cachedPkgDir, 'package.json')))
      return cachedPkgDir
  }

  return null
}

/**
 * Create symlink from .skilld dir to package directory
 *
 * Structure:
 *   .claude/skills/<skill>/.skilld/pkg -> node_modules/<pkg> OR ~/.skilld/references/<pkg>@<version>/pkg
 *
 * This gives access to package.json, README.md, dist/, and any shipped docs/
 */
export function linkPkg(skillDir: string, name: string, cwd: string, version?: string): void {
  const pkgPath = resolvePkgDir(name, cwd, version)
  if (!pkgPath)
    return

  const referencesDir = join(skillDir, '.skilld')
  mkdirSync(referencesDir, { recursive: true })

  const pkgLinkPath = join(referencesDir, 'pkg')
  if (existsSync(pkgLinkPath)) {
    unlinkSync(pkgLinkPath)
  }
  symlinkSync(pkgPath, pkgLinkPath, 'junction')
}

/**
 * Create named symlink from .skilld dir to package directory.
 * Short name = last segment of package name (e.g., @vue/reactivity → pkg-reactivity)
 *
 * Structure:
 *   .claude/skills/<skill>/.skilld/pkg-<short> -> node_modules/<pkg>
 */
export function linkPkgNamed(skillDir: string, name: string, cwd: string, version?: string): void {
  const pkgPath = resolvePkgDir(name, cwd, version)
  if (!pkgPath)
    return

  const shortName = name.split('/').pop()!.toLowerCase()
  const referencesDir = join(skillDir, '.skilld')
  mkdirSync(referencesDir, { recursive: true })

  const linkPath = join(referencesDir, `pkg-${shortName}`)
  if (existsSync(linkPath))
    unlinkSync(linkPath)
  symlinkSync(pkgPath, linkPath, 'junction')
}

/**
 * Get key files from a package directory for display
 * Returns entry points + docs files
 */
export function getPkgKeyFiles(name: string, cwd: string, version?: string): string[] {
  const pkgPath = resolvePkgDir(name, cwd, version)
  if (!pkgPath)
    return []

  const files: string[] = []
  const pkgJsonPath = join(pkgPath, 'package.json')

  if (existsSync(pkgJsonPath)) {
    const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'))

    // Entry points
    if (pkg.main)
      files.push(basename(pkg.main))
    if (pkg.module && pkg.module !== pkg.main)
      files.push(basename(pkg.module))
  }

  // Check for common doc files (case-insensitive readme match)
  const entries = readdirSync(pkgPath).filter(f =>
    /^readme\.md$/i.test(f) || /^changelog\.md$/i.test(f),
  )
  files.push(...entries)

  return [...new Set(files)]
}

/**
 * Check if package ships its own docs folder
 */
export interface ShippedSkill {
  skillName: string
  skillDir: string
}

/**
 * Check if package ships a skills/ directory with SKILL.md or _SKILL.md subdirs
 */
export function getShippedSkills(name: string, cwd: string, version?: string): ShippedSkill[] {
  const pkgPath = resolvePkgDir(name, cwd, version)
  if (!pkgPath)
    return []

  const skillsPath = join(pkgPath, 'skills')
  if (!existsSync(skillsPath))
    return []

  return readdirSync(skillsPath, { withFileTypes: true })
    .filter(d => d.isDirectory() && (existsSync(join(skillsPath, d.name, 'SKILL.md')) || existsSync(join(skillsPath, d.name, '_SKILL.md'))))
    .map(d => ({ skillName: d.name, skillDir: join(skillsPath, d.name) }))
}

/**
 * Write LLM-generated section outputs to global cache for cross-project reuse
 *
 * Structure:
 *   ~/.skilld/references/<pkg>@<version>/sections/_BEST_PRACTICES.md
 */
export function writeSections(name: string, version: string, sections: Array<{ file: string, content: string }>): void {
  const cacheDir = getCacheDir(name, version)
  const sectionsDir = join(cacheDir, 'sections')
  mkdirSync(sectionsDir, { recursive: true, mode: 0o700 })
  for (const { file, content } of sections) {
    writeFileSync(join(sectionsDir, file), content, { mode: 0o600 })
  }
}

/**
 * Read a cached section from the global references dir
 */
export function readCachedSection(name: string, version: string, file: string): string | null {
  const path = join(getCacheDir(name, version), 'sections', file)
  if (!existsSync(path))
    return null
  return readFileSync(path, 'utf-8')
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

export function hasShippedDocs(name: string, cwd: string, version?: string): boolean {
  const pkgPath = resolvePkgDir(name, cwd, version)
  if (!pkgPath)
    return false

  const docsCandidates = ['docs', 'documentation', 'doc']
  for (const candidate of docsCandidates) {
    const docsPath = join(pkgPath, candidate)
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
      else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
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
 * List files in .skilld directory (pkg + docs) as relative paths for prompt context
 * Returns paths like ./.skilld/pkg/README.md, ./.skilld/docs/api.md
 */
export function listReferenceFiles(skillDir: string, maxDepth = 3): string[] {
  const referencesDir = join(skillDir, '.skilld')
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
