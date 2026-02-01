/**
 * NPM registry lookup
 */

import type { LocalDependency, NpmPackageInfo, ResolvedPackage } from './types'
import { fetchGitHubRepoMeta, fetchReadme } from './github'
import { fetchLlmsUrl } from './llms'
import { isGitHubRepoUrl, normalizeRepoUrl, parseGitHubUrl, verifyUrl } from './utils'

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

/**
 * Resolve documentation URL for a package
 */
export async function resolvePackageDocs(packageName: string): Promise<ResolvedPackage | null> {
  const pkg = await fetchNpmPackage(packageName)
  if (!pkg) return null

  const result: ResolvedPackage = {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
  }

  // Extract repo URL
  if (pkg.repository?.url) {
    result.repoUrl = normalizeRepoUrl(pkg.repository.url)
  }

  // Try homepage for docs (skip if it's just a GitHub repo URL)
  if (pkg.homepage && !isGitHubRepoUrl(pkg.homepage)) {
    result.docsUrl = pkg.homepage
  }

  // GitHub repo handling
  if (result.repoUrl?.includes('github.com')) {
    const gh = parseGitHubUrl(result.repoUrl)
    if (gh) {
      const subdir = pkg.repository?.directory

      // If no docsUrl, try to get website from GitHub repo metadata
      if (!result.docsUrl) {
        const repoMeta = await fetchGitHubRepoMeta(gh.owner, gh.repo)
        if (repoMeta?.homepage) {
          result.docsUrl = repoMeta.homepage
        }
      }

      // README fallback via ungh
      const readmeUrl = await fetchReadme(gh.owner, gh.repo, subdir)
      if (readmeUrl) {
        result.readmeUrl = readmeUrl
      }
    }
  }

  // Check for llms.txt on docsUrl
  if (result.docsUrl) {
    const llmsUrl = await fetchLlmsUrl(result.docsUrl)
    if (llmsUrl) {
      result.llmsUrl = llmsUrl
    }
  }

  // Must have at least one source
  if (!result.docsUrl && !result.llmsUrl && !result.readmeUrl) {
    return null
  }

  return result
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

  return Object.entries(deps)
    .filter(([name]) =>
      !name.startsWith('@types/')
      && !['typescript', 'eslint', 'prettier', 'vitest', 'jest'].includes(name),
    )
    .map(([name, version]) => ({
      name,
      version: version.replace(/^[\^~>=<]/, ''),
    }))
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
