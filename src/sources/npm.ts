/**
 * NPM registry lookup
 */

import type { LocalDependency, NpmPackageInfo, ResolveAttempt, ResolvedPackage, ResolveResult } from './types.ts'
import { spawnSync } from 'node:child_process'
import { createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, unlinkSync } from 'node:fs'
import { Writable } from 'node:stream'
import { pathToFileURL } from 'node:url'
import { resolvePathSync } from 'mlly'
import { basename, dirname, join, resolve } from 'pathe'
import { getCacheDir } from '../cache/version.ts'
import { fetchGitDocs, fetchGitHubRepoMeta, fetchReadme, searchGitHubRepo, validateGitDocsWithLlms } from './github.ts'
import { fetchLlmsTxt, fetchLlmsUrl } from './llms.ts'
import { $fetch, isGitHubRepoUrl, isUselessDocsUrl, normalizeRepoUrl, parseGitHubUrl } from './utils.ts'

/**
 * Search npm registry for packages matching a query.
 * Used as a fallback when direct package lookup fails.
 */
export async function searchNpmPackages(query: string, size = 5): Promise<Array<{ name: string, description?: string, version: string }>> {
  const data = await $fetch<{
    objects: Array<{ package: { name: string, description?: string, version: string } }>
  }>(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=${size}`).catch(() => null)

  if (!data?.objects?.length)
    return []

  return data.objects.map(o => ({
    name: o.package.name,
    description: o.package.description,
    version: o.package.version,
  }))
}

/**
 * Fetch package info from npm registry
 */
export async function fetchNpmPackage(packageName: string): Promise<NpmPackageInfo | null> {
  // Try unpkg first (faster, CDN)
  const data = await $fetch<NpmPackageInfo>(`https://unpkg.com/${packageName}/package.json`).catch(() => null)
  if (data)
    return data

  // Fallback to npm registry
  return $fetch<NpmPackageInfo>(`https://registry.npmjs.org/${packageName}/latest`).catch(() => null)
}

export interface DistTagInfo {
  version: string
  releasedAt?: string
}

export interface NpmRegistryMeta {
  releasedAt?: string
  distTags?: Record<string, DistTagInfo>
}

/**
 * Fetch release date and dist-tags from npm registry
 */
export async function fetchNpmRegistryMeta(packageName: string, version: string): Promise<NpmRegistryMeta> {
  const data = await $fetch<{
    'time'?: Record<string, string>
    'dist-tags'?: Record<string, string>
  }>(`https://registry.npmjs.org/${packageName}`).catch(() => null)

  if (!data)
    return {}

  // Enrich dist-tags with release dates
  const distTags: Record<string, DistTagInfo> | undefined = data['dist-tags']
    ? Object.fromEntries(
        Object.entries(data['dist-tags']).map(([tag, ver]) => [
          tag,
          { version: ver, releasedAt: data.time?.[ver] },
        ]),
      )
    : undefined

  return {
    releasedAt: data.time?.[version] || undefined,
    distTags,
  }
}

export type ResolveStep = 'npm' | 'github-docs' | 'github-meta' | 'github-search' | 'readme' | 'llms.txt' | 'local'

export interface ResolveOptions {
  /** User's installed version - used to fetch versioned git docs */
  version?: string
  /** Current working directory - for local readme fallback */
  cwd?: string
  /** Progress callback - called before each resolution step */
  onProgress?: (step: ResolveStep) => void
}

/**
 * Shared GitHub resolution cascade: git docs → repo meta (homepage) → README.
 * Used for both "repo URL found in package.json" and "repo URL found via search" paths.
 */
async function resolveGitHub(
  gh: { owner: string, repo: string },
  targetVersion: string | undefined,
  pkg: { name: string },
  result: ResolvedPackage,
  attempts: ResolveAttempt[],
  onProgress?: (step: ResolveStep) => void,
  opts?: { rawRepoUrl?: string, subdir?: string },
): Promise<string[] | undefined> {
  let allFiles: string[] | undefined

  // Try versioned git docs first (docs/**/*.md at git tag)
  if (targetVersion) {
    onProgress?.('github-docs')
    const gitDocs = await fetchGitDocs(gh.owner, gh.repo, targetVersion, pkg.name, opts?.rawRepoUrl)
    if (gitDocs) {
      result.gitDocsUrl = gitDocs.baseUrl
      result.gitRef = gitDocs.ref
      result.gitDocsFallback = gitDocs.fallback
      allFiles = gitDocs.allFiles
      attempts.push({
        source: 'github-docs',
        url: gitDocs.baseUrl,
        status: 'success',
        message: gitDocs.fallback
          ? `Found ${gitDocs.files.length} docs at ${gitDocs.ref} (no tag for v${targetVersion})`
          : `Found ${gitDocs.files.length} docs at ${gitDocs.ref}`,
      })
    }
    else {
      attempts.push({
        source: 'github-docs',
        url: `${result.repoUrl}/tree/v${targetVersion}/docs`,
        status: 'not-found',
        message: 'No docs/ folder found at version tag',
      })
    }
  }

  // If no docsUrl yet (npm had no homepage), try GitHub repo metadata
  if (!result.docsUrl) {
    onProgress?.('github-meta')
    const repoMeta = await fetchGitHubRepoMeta(gh.owner, gh.repo, pkg.name)
    if (repoMeta?.homepage && !isUselessDocsUrl(repoMeta.homepage)) {
      result.docsUrl = repoMeta.homepage
      attempts.push({
        source: 'github-meta',
        url: result.repoUrl!,
        status: 'success',
        message: `Found homepage: ${repoMeta.homepage}`,
      })
    }
    else {
      attempts.push({
        source: 'github-meta',
        url: result.repoUrl!,
        status: 'not-found',
        message: 'No homepage in repo metadata',
      })
    }
  }

  // README fallback via ungh
  onProgress?.('readme')
  const readmeUrl = await fetchReadme(gh.owner, gh.repo, opts?.subdir, result.gitRef)
  if (readmeUrl) {
    result.readmeUrl = readmeUrl
    attempts.push({
      source: 'readme',
      url: readmeUrl,
      status: 'success',
    })
  }
  else {
    attempts.push({
      source: 'readme',
      url: `${result.repoUrl}/README.md`,
      status: 'not-found',
      message: 'No README found',
    })
  }

  return allFiles
}

/**
 * Resolve documentation URL for a package (legacy - returns null on failure)
 */
export async function resolvePackageDocs(packageName: string, options: ResolveOptions = {}): Promise<ResolvedPackage | null> {
  const result = await resolvePackageDocsWithAttempts(packageName, options)
  return result.package
}

/**
 * Resolve documentation URL for a package with attempt tracking
 */
export async function resolvePackageDocsWithAttempts(packageName: string, options: ResolveOptions = {}): Promise<ResolveResult> {
  const attempts: ResolveAttempt[] = []
  const { onProgress } = options

  onProgress?.('npm')
  const pkg = await fetchNpmPackage(packageName)
  if (!pkg) {
    attempts.push({
      source: 'npm',
      url: `https://registry.npmjs.org/${packageName}/latest`,
      status: 'not-found',
      message: 'Package not found on npm registry',
    })
    return { package: null, attempts }
  }

  attempts.push({
    source: 'npm',
    url: `https://registry.npmjs.org/${packageName}/latest`,
    status: 'success',
    message: `Found ${pkg.name}@${pkg.version}`,
  })

  // Fetch release date and dist-tags for this version
  const registryMeta = pkg.version
    ? await fetchNpmRegistryMeta(packageName, pkg.version)
    : {}

  const result: ResolvedPackage = {
    name: pkg.name,
    version: pkg.version,
    releasedAt: registryMeta.releasedAt,
    description: pkg.description,
    dependencies: pkg.dependencies,
    distTags: registryMeta.distTags,
  }

  // Track allFiles from heuristic git doc discovery for llms.txt validation
  let gitDocsAllFiles: string[] | undefined

  // Extract repo URL (handle both object and shorthand string formats)
  let subdir: string | undefined
  let rawRepoUrl: string | undefined
  if (typeof pkg.repository === 'object' && pkg.repository?.url) {
    rawRepoUrl = pkg.repository.url
    const normalized = normalizeRepoUrl(rawRepoUrl)
    // Handle shorthand "owner/repo" in repository.url field (e.g. cac)
    if (!normalized.includes('://') && normalized.includes('/') && !normalized.includes(':'))
      result.repoUrl = `https://github.com/${normalized}`
    else
      result.repoUrl = normalized
    subdir = pkg.repository.directory
  }
  else if (typeof pkg.repository === 'string') {
    if (pkg.repository.includes('://')) {
      // Full URL string (e.g. "https://github.com/org/repo/tree/main/packages/sub")
      const gh = parseGitHubUrl(pkg.repository)
      if (gh)
        result.repoUrl = `https://github.com/${gh.owner}/${gh.repo}`
    }
    else {
      // Shorthand: "owner/repo" or "github:owner/repo"
      const repo = pkg.repository.replace(/^github:/, '')
      if (repo.includes('/') && !repo.includes(':'))
        result.repoUrl = `https://github.com/${repo}`
    }
  }

  // Use npm homepage early (skip GitHub repo URLs)
  if (pkg.homepage && !isGitHubRepoUrl(pkg.homepage) && !isUselessDocsUrl(pkg.homepage)) {
    result.docsUrl = pkg.homepage
  }

  // GitHub repo handling - try versioned git docs first
  if (result.repoUrl?.includes('github.com')) {
    const gh = parseGitHubUrl(result.repoUrl)
    if (gh) {
      const targetVersion = options.version || pkg.version
      gitDocsAllFiles = await resolveGitHub(gh, targetVersion, pkg, result, attempts, onProgress, { rawRepoUrl, subdir })
    }
  }
  else if (!result.repoUrl) {
    // No repo URL in package.json — try to find it via GitHub search
    onProgress?.('github-search')
    const searchedUrl = await searchGitHubRepo(pkg.name)
    if (searchedUrl) {
      result.repoUrl = searchedUrl
      attempts.push({
        source: 'github-search',
        url: searchedUrl,
        status: 'success',
        message: `Found via GitHub search: ${searchedUrl}`,
      })

      const gh = parseGitHubUrl(searchedUrl)
      if (gh) {
        const targetVersion = options.version || pkg.version
        gitDocsAllFiles = await resolveGitHub(gh, targetVersion, pkg, result, attempts, onProgress)
      }
    }
    else {
      attempts.push({
        source: 'github-search',
        status: 'not-found',
        message: 'No repository URL in package.json and GitHub search found no match',
      })
    }
  }

  // Check for llms.txt on docsUrl
  if (result.docsUrl) {
    onProgress?.('llms.txt')
    const llmsUrl = await fetchLlmsUrl(result.docsUrl)
    if (llmsUrl) {
      result.llmsUrl = llmsUrl
      attempts.push({
        source: 'llms.txt',
        url: llmsUrl,
        status: 'success',
      })
    }
    else {
      attempts.push({
        source: 'llms.txt',
        url: `${new URL(result.docsUrl).origin}/llms.txt`,
        status: 'not-found',
        message: 'No llms.txt at docs URL',
      })
    }
  }

  // Validate heuristic git docs against llms.txt links
  if (result.gitDocsUrl && result.llmsUrl && gitDocsAllFiles) {
    const llmsContent = await fetchLlmsTxt(result.llmsUrl)
    if (llmsContent && llmsContent.links.length > 0) {
      const validation = validateGitDocsWithLlms(llmsContent.links, gitDocsAllFiles)
      if (!validation.isValid) {
        attempts.push({
          source: 'github-docs',
          url: result.gitDocsUrl,
          status: 'not-found',
          message: `Heuristic git docs don't match llms.txt links (${Math.round(validation.matchRatio * 100)}% match), preferring llms.txt`,
        })
        result.gitDocsUrl = undefined
        result.gitRef = undefined
      }
    }
  }

  // Fallback: check local node_modules readme when all else fails
  if (!result.docsUrl && !result.llmsUrl && !result.readmeUrl && !result.gitDocsUrl && options.cwd) {
    onProgress?.('local')
    const pkgDir = join(options.cwd, 'node_modules', packageName)
    // Check common readme variations (case-insensitive)
    const readmeFile = existsSync(pkgDir) && readdirSync(pkgDir).find(f => /^readme\.md$/i.test(f))
    if (readmeFile) {
      const readmePath = join(pkgDir, readmeFile)
      result.readmeUrl = pathToFileURL(readmePath).href
      attempts.push({
        source: 'readme',
        url: readmePath,
        status: 'success',
        message: 'Found local readme in node_modules',
      })
    }
  }

  // Must have at least one source
  if (!result.docsUrl && !result.llmsUrl && !result.readmeUrl && !result.gitDocsUrl) {
    return { package: null, attempts }
  }

  return { package: result, attempts }
}

/**
 * Parse version specifier, handling protocols like link:, workspace:, npm:, file:
 */
export function parseVersionSpecifier(
  name: string,
  version: string,
  cwd: string,
): LocalDependency | null {
  // link: - resolve local package.json
  if (version.startsWith('link:')) {
    const linkPath = resolve(cwd, version.slice(5))
    const linkedPkgPath = join(linkPath, 'package.json')
    if (existsSync(linkedPkgPath)) {
      const linkedPkg = JSON.parse(readFileSync(linkedPkgPath, 'utf-8'))
      return {
        name: linkedPkg.name || name,
        version: linkedPkg.version || '0.0.0',
      }
    }
    return null // linked package doesn't exist
  }

  // npm: - extract aliased package name
  if (version.startsWith('npm:')) {
    const specifier = version.slice(4)
    const atIndex = specifier.startsWith('@')
      ? specifier.indexOf('@', 1)
      : specifier.indexOf('@')
    const realName = atIndex > 0 ? specifier.slice(0, atIndex) : specifier
    return { name: realName, version: resolveInstalledVersion(realName, cwd) || '*' }
  }

  // file: and git: - skip (local/custom sources)
  if (version.startsWith('file:') || version.startsWith('git:') || version.startsWith('git+')) {
    return null
  }

  // For everything else (semver, catalog:, workspace:, etc.)
  // resolve the actual installed version from node_modules
  const installed = resolveInstalledVersion(name, cwd)
  if (installed)
    return { name, version: installed }

  // Fallback: strip semver prefix if it looks like one
  if (/^[\^~>=<\d]/.test(version))
    return { name, version: version.replace(/^[\^~>=<]/, '') }

  // catalog: and workspace: specifiers - include with wildcard version
  // so the dep isn't silently dropped from state.deps
  if (version.startsWith('catalog:') || version.startsWith('workspace:'))
    return { name, version: '*' }

  return null
}

/**
 * Resolve the actual installed version of a package by finding its package.json
 * via mlly's resolvePathSync. Works regardless of package manager or version protocol.
 */
export function resolveInstalledVersion(name: string, cwd: string): string | null {
  try {
    const resolved = resolvePathSync(`${name}/package.json`, { url: cwd })
    const pkg = JSON.parse(readFileSync(resolved, 'utf-8'))
    return pkg.version || null
  }
  catch {
    // Packages with `exports` that don't expose ./package.json
    // Resolve the entry point, then walk up to find package.json
    try {
      const entry = resolvePathSync(name, { url: cwd })
      let dir = dirname(entry)
      while (dir && basename(dir) !== 'node_modules') {
        const pkgPath = join(dir, 'package.json')
        if (existsSync(pkgPath)) {
          const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
          return pkg.version || null
        }
        dir = dirname(dir)
      }
    }
    catch {}
    return null
  }
}

/**
 * Read package.json dependencies with versions
 */
export async function readLocalDependencies(cwd: string): Promise<LocalDependency[]> {
  const pkgPath = join(cwd, 'package.json')
  if (!existsSync(pkgPath)) {
    throw new Error('No package.json found in current directory')
  }

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
  const deps: Record<string, string> = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  }

  const results: LocalDependency[] = []

  for (const [name, version] of Object.entries(deps)) {
    const parsed = parseVersionSpecifier(name, version, cwd)
    if (parsed) {
      results.push(parsed)
    }
  }

  return results
}

export interface LocalPackageInfo {
  name: string
  version: string
  description?: string
  repoUrl?: string
  localPath: string
}

/**
 * Read package info from a local path (for link: deps)
 */
export function readLocalPackageInfo(localPath: string): LocalPackageInfo | null {
  const pkgPath = join(localPath, 'package.json')
  if (!existsSync(pkgPath))
    return null

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

  let repoUrl: string | undefined
  if (pkg.repository?.url) {
    repoUrl = normalizeRepoUrl(pkg.repository.url)
  }
  else if (typeof pkg.repository === 'string') {
    repoUrl = normalizeRepoUrl(pkg.repository)
  }

  return {
    name: pkg.name,
    version: pkg.version || '0.0.0',
    description: pkg.description,
    repoUrl,
    localPath,
  }
}

/**
 * Resolve docs for a local package (link: dependency)
 */
export async function resolveLocalPackageDocs(localPath: string): Promise<ResolvedPackage | null> {
  const info = readLocalPackageInfo(localPath)
  if (!info)
    return null

  const result: ResolvedPackage = {
    name: info.name,
    version: info.version,
    description: info.description,
    repoUrl: info.repoUrl,
  }

  // Try GitHub if repo URL available
  if (info.repoUrl?.includes('github.com')) {
    const gh = parseGitHubUrl(info.repoUrl)
    if (gh) {
      // Try versioned git docs
      const gitDocs = await fetchGitDocs(gh.owner, gh.repo, info.version, info.name)
      if (gitDocs) {
        result.gitDocsUrl = gitDocs.baseUrl
        result.gitRef = gitDocs.ref
        result.gitDocsFallback = gitDocs.fallback
      }

      // README fallback via ungh
      const readmeUrl = await fetchReadme(gh.owner, gh.repo, undefined, result.gitRef)
      if (readmeUrl) {
        result.readmeUrl = readmeUrl
      }
    }
  }

  // Fallback: read local readme (case-insensitive)
  if (!result.readmeUrl && !result.gitDocsUrl) {
    const readmeFile = readdirSync(localPath).find(f => /^readme\.md$/i.test(f))
    if (readmeFile) {
      result.readmeUrl = pathToFileURL(join(localPath, readmeFile)).href
    }
  }

  if (!result.readmeUrl && !result.gitDocsUrl) {
    return null
  }

  return result
}

/**
 * Download and extract npm package tarball to cache directory.
 * Used when the package isn't available in node_modules.
 *
 * Extracts to: ~/.skilld/references/<pkg>@<version>/pkg/
 * Returns the extracted directory path, or null on failure.
 */
export async function fetchPkgDist(name: string, version: string): Promise<string | null> {
  const cacheDir = getCacheDir(name, version)
  const pkgDir = join(cacheDir, 'pkg')

  // Already extracted
  if (existsSync(join(pkgDir, 'package.json')))
    return pkgDir

  // Fetch version metadata to get tarball URL
  const data = await $fetch<{ dist?: { tarball?: string } }>(
    `https://registry.npmjs.org/${name}/${version}`,
  ).catch(() => null)
  if (!data)
    return null
  const tarballUrl = data.dist?.tarball
  if (!tarballUrl)
    return null

  // Download tarball to temp file
  const tarballRes = await fetch(tarballUrl, {
    headers: { 'User-Agent': 'skilld/1.0' },
  }).catch(() => null)

  if (!tarballRes?.ok || !tarballRes.body)
    return null

  mkdirSync(pkgDir, { recursive: true })

  const tmpTarball = join(cacheDir, '_pkg.tgz')
  const fileStream = createWriteStream(tmpTarball)

  // Stream response body to file
  const reader = tarballRes.body.getReader()
  await new Promise<void>((res, reject) => {
    const writable = new Writable({
      write(chunk, _encoding, callback) {
        fileStream.write(chunk, callback)
      },
    })
    writable.on('finish', () => {
      fileStream.end()
      res()
    })
    writable.on('error', reject)

    function pump() {
      reader.read().then(({ done, value }) => {
        if (done) {
          writable.end()
          return
        }
        writable.write(value, () => pump())
      }).catch(reject)
    }
    pump()
  })

  // Extract tarball — npm tarballs have a "package/" prefix
  const { status } = spawnSync('tar', ['xzf', tmpTarball, '--strip-components=1', '-C', pkgDir], { stdio: 'ignore' })
  if (status !== 0) {
    rmSync(pkgDir, { recursive: true, force: true })
    rmSync(tmpTarball, { force: true })
    return null
  }

  unlinkSync(tmpTarball)
  return pkgDir
}

/**
 * Fetch just the latest version string from npm (lightweight)
 */
export async function fetchLatestVersion(packageName: string): Promise<string | null> {
  const data = await $fetch<{ version?: string }>(
    `https://unpkg.com/${packageName}/package.json`,
  ).catch(() => null)
  return data?.version || null
}

/**
 * Get installed skill version from SKILL.md
 */
export function getInstalledSkillVersion(skillDir: string): string | null {
  const skillPath = join(skillDir, 'SKILL.md')
  if (!existsSync(skillPath))
    return null

  const content = readFileSync(skillPath, 'utf-8')
  const match = content.match(/^version:\s*"?([^"\n]+)"?/m)
  return match?.[1] || null
}
