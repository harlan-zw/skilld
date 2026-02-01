/**
 * NPM package discovery and documentation resolution
 */

export interface NpmPackageInfo {
  name: string
  version?: string
  description?: string
  homepage?: string
  repository?: {
    type: string
    url: string
    directory?: string
  }
  readme?: string
}

export interface ResolvedPackage {
  name: string
  version?: string
  description?: string
  docsUrl?: string
  llmsUrl?: string
  readmeUrl?: string
  repoUrl?: string
}

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
    const repoUrl = pkg.repository.url
      .replace(/^git\+/, '')
      .replace(/\.git$/, '')
      .replace(/^git:\/\//, 'https://')
      .replace(/^ssh:\/\/git@github\.com/, 'https://github.com')
    result.repoUrl = repoUrl
  }

  // Try homepage for docs (skip if it's just a GitHub repo URL)
  if (pkg.homepage && !isGitHubRepoUrl(pkg.homepage)) {
    result.docsUrl = pkg.homepage
  }

  // GitHub repo handling
  if (result.repoUrl?.includes('github.com')) {
    const match = result.repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (match) {
      const owner = match[1]
      const repo = match[2]
      const subdir = pkg.repository?.directory

      // If no docsUrl, try to get website from GitHub repo metadata
      if (!result.docsUrl) {
        const repoMeta = await fetchGitHubRepoMeta(owner, repo)
        if (repoMeta?.homepage) {
          result.docsUrl = repoMeta.homepage
        }
      }

      // README fallback via ungh
      const unghUrl = subdir
        ? `https://ungh.cc/repos/${owner}/${repo}/files/main/${subdir}/README.md`
        : `https://ungh.cc/repos/${owner}/${repo}/readme`

      const unghRes = await fetch(unghUrl, {
        headers: { 'User-Agent': 'skilld/1.0' },
      }).catch(() => null)

      if (unghRes?.ok) {
        result.readmeUrl = `ungh://${owner}/${repo}${subdir ? `/${subdir}` : ''}`
      }
      else {
        // Fallback to raw.githubusercontent.com
        const basePath = subdir ? `${subdir}/` : ''
        for (const branch of ['main', 'master']) {
          const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${basePath}README.md`
          if (await verifyUrl(readmeUrl)) {
            result.readmeUrl = readmeUrl
            break
          }
        }
      }
    }
  }

  // Check for llms.txt on docsUrl
  if (result.docsUrl) {
    const llmsUrl = `${result.docsUrl.replace(/\/$/, '')}/llms.txt`
    if (await verifyUrl(llmsUrl)) {
      result.llmsUrl = llmsUrl
    }
  }

  // Must have at least one source
  if (!result.docsUrl && !result.llmsUrl && !result.readmeUrl) {
    return null
  }

  return result
}

export interface LocalDependency {
  name: string
  version: string
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
      // Skip common non-doc packages
      !name.startsWith('@types/')
      && !['typescript', 'eslint', 'prettier', 'vitest', 'jest'].includes(name),
    )
    .map(([name, version]) => ({
      name,
      // Clean version string (remove ^, ~, etc.)
      version: version.replace(/^[\^~>=<]/, ''),
    }))
}

/**
 * Get installed skill version from SKILL.md
 */
export async function getInstalledSkillVersion(
  skillDir: string,
): Promise<string | null> {
  const { readFileSync, existsSync } = await import('node:fs')
  const { join } = await import('node:path')

  const skillPath = join(skillDir, 'SKILL.md')
  if (!existsSync(skillPath)) return null

  const content = readFileSync(skillPath, 'utf-8')
  const match = content.match(/^version:\s*"?([^"\n]+)"?/m)
  return match?.[1] || null
}

/**
 * Fetch GitHub repo metadata to get website URL
 */
async function fetchGitHubRepoMeta(owner: string, repo: string): Promise<{ homepage?: string } | null> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { 'User-Agent': 'skilld/1.0' },
  }).catch(() => null)

  if (!res?.ok) return null
  const data = await res.json().catch(() => null)
  return data?.homepage ? { homepage: data.homepage } : null
}

/**
 * Check if URL is on github.com (not a docs site, we'll fetch the repo's website instead)
 */
function isGitHubRepoUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.hostname === 'github.com' || parsed.hostname === 'www.github.com'
  }
  catch {
    return false
  }
}

async function verifyUrl(url: string): Promise<boolean> {
  const res = await fetch(url, {
    method: 'HEAD',
    headers: { 'User-Agent': 'skilld/1.0' },
  }).catch(() => null)

  if (!res?.ok) return false

  const contentType = res.headers.get('content-type') || ''
  // Reject HTML (likely 404 page)
  return !contentType.includes('text/html')
}
