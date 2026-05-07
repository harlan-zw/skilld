/**
 * Higher-level reference-cache operations: composition over the cache
 * primitives in `src/cache/index.ts`.
 *
 * Owns:
 *   - The on-disk shape of `~/.skilld/references/<pkg>@<version>/`
 *   - `.skilld/` symlinks inside agent skill dirs (linkAllReferences)
 *   - Loading cached docs back as a `ResolvedContent`-shaped result
 *   - Force-clearing and ejecting (portable copy) caches
 *
 * Callers (sync, sync-parallel, sync-git, install, author) should use these
 * helpers instead of touching cache primitives directly.
 */

import type { FeaturesConfig } from '../core/config.ts'
import type { IndexDoc } from '../sources/content-resolver.ts'
import { copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, realpathSync, rmSync } from 'node:fs'
import { dirname, join } from 'pathe'
import { defaultFeatures, readConfig } from '../core/config.ts'
import { skillInternalDir } from '../core/paths.ts'
import {
  clearCache,
  getCacheDir,
  getPackageDbPath,
  getRepoCacheDir,
  hasShippedDocs,
  linkCachedDir,
  linkPkg,
  linkPkgNamed,
  linkRepoCachedDir,
  readCachedDocs,
} from './index.ts'

/**
 * Resolve every symlink under `<skillDir>/.skilld/` to its real path, plus
 * the parent dirs CLI sandboxes need (e.g. Gemini). What an LLM CLI passes to
 * `--add-dir` to make references readable.
 */
export function getSkillReferenceDirs(skillDir: string): string[] {
  const refsDir = skillInternalDir(skillDir)
  if (!existsSync(refsDir))
    return []
  const resolved = readdirSync(refsDir)
    .map(entry => join(refsDir, entry))
    .filter(p => lstatSync(p).isSymbolicLink() && existsSync(p))
    .map(p => realpathSync(p))

  const parents = new Set<string>()
  for (const p of resolved) {
    const parent = dirname(p)
    if (!resolved.includes(parent))
      parents.add(parent)
  }

  return [...resolved, ...parents]
}

/**
 * Remove the transient `<skillDir>/.skilld/` symlink dir. Used after eject to
 * clean up references that have been copied as real files.
 */
export function clearSkillInternalDir(skillDir: string): void {
  const refsDir = skillInternalDir(skillDir)
  if (existsSync(refsDir))
    rmSync(refsDir, { recursive: true, force: true })
}

/** Classify a cached doc path into the right metadata type */
export function classifyCachedDoc(path: string): { type: string, number?: number } {
  const issueMatch = path.match(/^issues\/issue-(\d+)\.md$/)
  if (issueMatch)
    return { type: 'issue', number: Number(issueMatch[1]) }
  const discussionMatch = path.match(/^discussions\/discussion-(\d+)\.md$/)
  if (discussionMatch)
    return { type: 'discussion', number: Number(discussionMatch[1]) }
  if (path.startsWith('releases/'))
    return { type: 'release' }
  return { type: 'doc' }
}

/** Clear cache + db for --force flag */
export function forceClearCache(packageName: string, version: string, repoInfo?: { owner: string, repo: string }): void {
  clearCache(packageName, version)
  const forcedDbPath = getPackageDbPath(packageName, version)
  if (existsSync(forcedDbPath))
    rmSync(forcedDbPath, { recursive: true, force: true })
  // Also clear repo-level cache when force is used
  if (repoInfo) {
    const repoDir = getRepoCacheDir(repoInfo.owner, repoInfo.repo)
    if (existsSync(repoDir))
      rmSync(repoDir, { recursive: true, force: true })
  }
}

/** Link all reference symlinks (pkg, docs, issues, discussions, releases) */
export function linkAllReferences(skillDir: string, packageName: string, cwd: string, version: string, docsType: string, extraPackages?: Array<{ name: string, version?: string }>, features?: FeaturesConfig, repoInfo?: { owner: string, repo: string }): void {
  const f = features ?? readConfig().features ?? defaultFeatures
  try {
    linkPkg(skillDir, packageName, cwd, version)
    linkPkgNamed(skillDir, packageName, cwd, version)
    if (!hasShippedDocs(packageName, cwd, version) && docsType !== 'readme') {
      linkCachedDir(skillDir, packageName, version, 'docs')
    }
    // Issues/discussions/releases: use repo cache when available, else package cache
    if (f.issues) {
      if (repoInfo)
        linkRepoCachedDir(skillDir, repoInfo.owner, repoInfo.repo, 'issues')
      else
        linkCachedDir(skillDir, packageName, version, 'issues')
    }
    if (f.discussions) {
      if (repoInfo)
        linkRepoCachedDir(skillDir, repoInfo.owner, repoInfo.repo, 'discussions')
      else
        linkCachedDir(skillDir, packageName, version, 'discussions')
    }
    if (f.releases) {
      if (repoInfo)
        linkRepoCachedDir(skillDir, repoInfo.owner, repoInfo.repo, 'releases')
      else
        linkCachedDir(skillDir, packageName, version, 'releases')
    }
    linkCachedDir(skillDir, packageName, version, 'sections')
    // Create named symlinks for additional packages in multi-package skills
    if (extraPackages) {
      for (const pkg of extraPackages) {
        if (pkg.name !== packageName)
          linkPkgNamed(skillDir, pkg.name, cwd, pkg.version)
      }
    }
  }
  catch {
    // Symlink may fail on some systems
  }
}

/** Detect docs type from cached directory contents */
export function detectDocsType(packageName: string, version: string, repoUrl?: string, llmsUrl?: string): { docsType: 'docs' | 'llms.txt' | 'readme', docSource?: string } {
  const cacheDir = getCacheDir(packageName, version)
  if (existsSync(join(cacheDir, 'docs', 'index.md')) || existsSync(join(cacheDir, 'docs', 'guide'))) {
    return {
      docsType: 'docs',
      docSource: repoUrl ? `${repoUrl}/tree/v${version}/docs` : 'git',
    }
  }
  if (existsSync(join(cacheDir, 'llms.txt'))) {
    return {
      docsType: 'llms.txt',
      docSource: llmsUrl || 'llms.txt',
    }
  }
  if (existsSync(join(cacheDir, 'docs', 'README.md'))) {
    return { docsType: 'readme' }
  }
  return { docsType: 'readme' }
}

/** Eject (portable copy) of cached references into a skill dir */
export function ejectReferences(skillDir: string, packageName: string, cwd: string, version: string, docsType: string, features?: FeaturesConfig, repoInfo?: { owner: string, repo: string }): void {
  const f = features ?? readConfig().features ?? defaultFeatures
  const cacheDir = getCacheDir(packageName, version)
  const refsDir = join(skillDir, 'references')
  // Repo-level data source (falls back to package cache)
  const repoDir = repoInfo ? getRepoCacheDir(repoInfo.owner, repoInfo.repo) : cacheDir

  // Copy cached docs (skip pkg — eject is for portable sharing, pkg references node_modules)
  if (!hasShippedDocs(packageName, cwd, version) && docsType !== 'readme')
    copyCachedSubdir(cacheDir, refsDir, 'docs')

  if (f.issues)
    copyCachedSubdir(repoDir, refsDir, 'issues')
  if (f.discussions)
    copyCachedSubdir(repoDir, refsDir, 'discussions')
  if (f.releases)
    copyCachedSubdir(repoDir, refsDir, 'releases')
}

/** Recursively copy a cached subdirectory into the references dir */
function copyCachedSubdir(cacheDir: string, refsDir: string, subdir: string): void {
  const srcDir = join(cacheDir, subdir)
  if (!existsSync(srcDir))
    return

  const destDir = join(refsDir, subdir)
  mkdirSync(destDir, { recursive: true })

  function walk(dir: string, rel: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const srcPath = join(dir, entry.name)
      const destPath = join(destDir, rel ? `${rel}/${entry.name}` : entry.name)
      if (entry.isDirectory()) {
        mkdirSync(destPath, { recursive: true })
        walk(srcPath, rel ? `${rel}/${entry.name}` : entry.name)
      }
      else {
        copyFileSync(srcPath, destPath)
      }
    }
  }

  walk(srcDir, '')
}

export interface CachedReferencesResult {
  /** Docs to feed the embedding index (empty if db already exists) */
  docsToIndex: IndexDoc[]
  /** Resolved doc-source label (URL or git path) */
  docSource: string
  /** Detected docs type from cache layout */
  docsType: 'docs' | 'llms.txt' | 'readme'
  /** _INDEX.md to write if missing (backfill for older caches) */
  backfillIndex?: { path: string, content: string }
}

export interface LoadCachedReferencesOptions {
  packageName: string
  version: string
  repoUrl?: string
  llmsUrl?: string
  readmeUrl?: string
  onProgress: (message: string) => void
  /** Caller supplies index generator to avoid the cache module pulling sources */
  generateDocsIndex: (docs: Array<{ path: string, content: string }>) => string | null
}

/**
 * Load cached references for a package and produce the index/backfill data
 * needed to continue the sync pipeline without re-fetching.
 */
export function loadCachedReferences(opts: LoadCachedReferencesOptions): CachedReferencesResult {
  const { packageName, version, repoUrl, llmsUrl, readmeUrl, onProgress, generateDocsIndex } = opts
  onProgress('Loading cached docs')
  const detected = detectDocsType(packageName, version, repoUrl, llmsUrl)
  const docsType = detected.docsType
  const docSource = detected.docSource ?? readmeUrl ?? 'readme'
  const docsToIndex: IndexDoc[] = []

  // Load cached docs for indexing if db doesn't exist yet
  const dbPath = getPackageDbPath(packageName, version)
  if (!existsSync(dbPath)) {
    onProgress('Reading cached docs for indexing')
    const cached = readCachedDocs(packageName, version)
    for (const doc of cached) {
      docsToIndex.push({
        id: doc.path,
        content: doc.content,
        metadata: { package: packageName, source: doc.path, ...classifyCachedDoc(doc.path) },
      })
    }
  }

  // Backfill docs index for caches created before this feature
  let backfillIndex: { path: string, content: string } | undefined
  if (docsType !== 'readme' && !existsSync(join(getCacheDir(packageName, version), 'docs', '_INDEX.md'))) {
    onProgress('Generating docs index')
    const cached = readCachedDocs(packageName, version)
    const docFiles = cached.filter(d => d.path.startsWith('docs/') && d.path.endsWith('.md'))
    if (docFiles.length > 1) {
      const docsIndex = generateDocsIndex(cached)
      if (docsIndex)
        backfillIndex = { path: 'docs/_INDEX.md', content: docsIndex }
    }
  }

  return { docsToIndex, docSource, docsType, backfillIndex }
}
