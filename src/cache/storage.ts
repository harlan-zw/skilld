/**
 * Cache storage operations
 */

import type { CachedDoc, CachedPackage } from './types'
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { REFERENCES_DIR } from './config'
import { getCacheDir } from './version'

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
 * Create .skilld directory with symlinked docs (only if external fetch needed)
 *
 * Structure:
 *   .claude/skills/<skill>/.skilld/
 *     pkg -> node_modules/<pkg> (always, has package.json, README.md, dist/)
 *     docs -> ~/.skilld/references/<pkg>@<version>/docs (only if fetched externally)
 *
 * The .skilld/ dirs are gitignored. After clone, `skilld install` recreates from lockfile.
 */
export function linkReferences(skillDir: string, name: string, version: string): void {
  const cacheDir = getCacheDir(name, version)
  const referencesDir = join(skillDir, '.skilld')
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
 * Create symlink from .skilld dir to cached github data (issues + discussions)
 *
 * Structure:
 *   .claude/skills/<skill>/.skilld/github -> ~/.skilld/references/<pkg>@<version>/github
 */
export function linkGithub(skillDir: string, name: string, version: string): void {
  const cacheDir = getCacheDir(name, version)
  const referencesDir = join(skillDir, '.skilld')
  const githubLinkPath = join(referencesDir, 'github')
  const cachedGithubPath = join(cacheDir, 'github')

  mkdirSync(referencesDir, { recursive: true })

  if (existsSync(githubLinkPath)) {
    unlinkSync(githubLinkPath)
  }
  if (existsSync(cachedGithubPath)) {
    symlinkSync(cachedGithubPath, githubLinkPath, 'junction')
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
 * Check if package ships a skills/ directory with _SKILL.md subdirs
 */
export function getShippedSkills(name: string, cwd: string, version?: string): ShippedSkill[] {
  const pkgPath = resolvePkgDir(name, cwd, version)
  if (!pkgPath)
    return []

  const skillsPath = join(pkgPath, 'skills')
  if (!existsSync(skillsPath))
    return []

  return readdirSync(skillsPath, { withFileTypes: true })
    .filter(d => d.isDirectory() && existsSync(join(skillsPath, d.name, '_SKILL.md')))
    .map(d => ({ skillName: d.name, skillDir: join(skillsPath, d.name) }))
}

/**
 * Create symlink from .skilld dir to cached releases
 *
 * Structure:
 *   .claude/skills/<skill>/.skilld/releases -> ~/.skilld/references/<pkg>@<version>/releases
 */
export function linkReleases(skillDir: string, name: string, version: string): void {
  const cacheDir = getCacheDir(name, version)
  const referencesDir = join(skillDir, '.skilld')
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
