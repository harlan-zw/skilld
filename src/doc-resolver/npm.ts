/**
 * NPM registry lookup
 */

import type { LocalDependency, NpmPackageInfo, ResolveAttempt, ResolvedPackage, ResolveResult } from './types'
import { fetchGitDocs, fetchGitHubRepoMeta, fetchReadme } from './github'
import { fetchLlmsUrl } from './llms'
import { isGitHubRepoUrl, normalizeRepoUrl, parseGitHubUrl } from './utils'

/**
 * Fetch package info from npm registry
 */
export async function fetchNpmPackage(packageName: string): Promise<NpmPackageInfo | null> {
  const res = await fetch(`https://registry.npmjs.org/${packageName}/latest`, {
    headers: { 'User-Agent': 'skilld/1.0' },
  }).catch(() => null)

  if (!res?.ok) return null
  return res.json()
}

export interface ResolveOptions {
  /** User's installed version - used to fetch versioned git docs */
  version?: string
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

  const result: ResolvedPackage = {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
  }

  // Extract repo URL
  if (pkg.repository?.url) {
    result.repoUrl = normalizeRepoUrl(pkg.repository.url)
  }

  // GitHub repo handling - try versioned git docs first
  if (result.repoUrl?.includes('github.com')) {
    const gh = parseGitHubUrl(result.repoUrl)
    if (gh) {
      const subdir = pkg.repository?.directory
      const targetVersion = options.version || pkg.version

      // Try versioned git docs first (docs/**/*.md at git tag)
      if (targetVersion) {
        const gitDocs = await fetchGitDocs(gh.owner, gh.repo, targetVersion)
        if (gitDocs) {
          result.gitDocsUrl = gitDocs.baseUrl
          result.gitRef = gitDocs.ref
          attempts.push({
            source: 'github-docs',
            url: gitDocs.baseUrl,
            status: 'success',
            message: `Found ${gitDocs.files.length} docs at ${gitDocs.ref}`,
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

      // If no docsUrl from homepage, try GitHub repo metadata
      if (!result.docsUrl) {
        const repoMeta = await fetchGitHubRepoMeta(gh.owner, gh.repo)
        if (repoMeta?.homepage) {
          result.docsUrl = repoMeta.homepage
          attempts.push({
            source: 'github-meta',
            url: result.repoUrl,
            status: 'success',
            message: `Found homepage: ${repoMeta.homepage}`,
          })
        }
        else {
          attempts.push({
            source: 'github-meta',
            url: result.repoUrl,
            status: 'not-found',
            message: 'No homepage in repo metadata',
          })
        }
      }

      // README fallback via ungh
      const readmeUrl = await fetchReadme(gh.owner, gh.repo, subdir)
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
    }
  }
  else if (!result.repoUrl) {
    attempts.push({
      source: 'github-docs',
      status: 'not-found',
      message: 'No repository URL in package.json',
    })
  }

  // Try homepage for docs (skip if it's just a GitHub repo URL)
  if (pkg.homepage && !isGitHubRepoUrl(pkg.homepage)) {
    result.docsUrl = pkg.homepage
  }

  // Check for llms.txt on docsUrl
  if (result.docsUrl) {
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
        url: `${result.docsUrl}/llms.txt`,
        status: 'not-found',
        message: 'No llms.txt at docs URL',
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
  // eslint-disable-next-line ts/no-require-imports
  const { readFileSync, existsSync } = require('node:fs') as typeof import('node:fs')
  // eslint-disable-next-line ts/no-require-imports
  const { join, resolve } = require('node:path') as typeof import('node:path')

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

  // workspace: - strip protocol, keep name
  if (version.startsWith('workspace:')) {
    return {
      name,
      version: version.slice(10).replace(/^[\^~*]/, '') || '*',
    }
  }

  // npm: - extract aliased package name and version
  if (version.startsWith('npm:')) {
    const specifier = version.slice(4)
    // Handle @scope/pkg@version vs pkg@version
    const atIndex = specifier.startsWith('@')
      ? specifier.indexOf('@', 1)
      : specifier.indexOf('@')
    if (atIndex > 0) {
      return {
        name: specifier.slice(0, atIndex),
        version: specifier.slice(atIndex + 1),
      }
    }
    // npm:package without version
    return { name: specifier, version: '*' }
  }

  // file: and git: - skip (local/custom sources)
  if (version.startsWith('file:') || version.startsWith('git:') || version.startsWith('git+')) {
    return null
  }

  // Standard semver
  return {
    name,
    version: version.replace(/^[\^~>=<]/, ''),
  }
}

/**
 * Read package.json dependencies with versions
 */
export async function readLocalDependencies(cwd: string): Promise<LocalDependency[]> {
  const { readFileSync, existsSync } = await import('node:fs')
  const { join } = await import('node:path')

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
    // Skip types and dev tools
    if (name.startsWith('@types/') || ['typescript', 'eslint', 'prettier', 'vitest', 'jest'].includes(name)) {
      continue
    }

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
  // eslint-disable-next-line ts/no-require-imports
  const { readFileSync, existsSync } = require('node:fs') as typeof import('node:fs')
  // eslint-disable-next-line ts/no-require-imports
  const { join } = require('node:path') as typeof import('node:path')

  const pkgPath = join(localPath, 'package.json')
  if (!existsSync(pkgPath)) return null

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
  if (!info) return null

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
      const gitDocs = await fetchGitDocs(gh.owner, gh.repo, info.version)
      if (gitDocs) {
        result.gitDocsUrl = gitDocs.baseUrl
        result.gitRef = gitDocs.ref
      }

      // README fallback via ungh
      const readmeUrl = await fetchReadme(gh.owner, gh.repo)
      if (readmeUrl) {
        result.readmeUrl = readmeUrl
      }
    }
  }

  // Fallback: read local README.md
  if (!result.readmeUrl && !result.gitDocsUrl) {
    const { existsSync } = await import('node:fs')
    const { join } = await import('node:path')

    const localReadme = join(localPath, 'README.md')
    if (existsSync(localReadme)) {
      result.readmeUrl = `file://${localReadme}`
    }
  }

  if (!result.readmeUrl && !result.gitDocsUrl) {
    return null
  }

  return result
}

/**
 * Get installed skill version from SKILL.md
 */
export async function getInstalledSkillVersion(skillDir: string): Promise<string | null> {
  const { readFileSync, existsSync } = await import('node:fs')
  const { join } = await import('node:path')

  const skillPath = join(skillDir, 'SKILL.md')
  if (!existsSync(skillPath)) return null

  const content = readFileSync(skillPath, 'utf-8')
  const match = content.match(/^version:\s*"?([^"\n]+)"?/m)
  return match?.[1] || null
}
