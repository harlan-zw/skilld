/**
 * `PackageResolver` implementations for the unified sync runner.
 *
 * Each resolver turns a spec string into a `ResolvedSpec` (or `UnresolvedSpec`
 * with attempts / shipped fallback). The resolver owns source-specific
 * concerns (npm vs crate vs github metadata fetching, version negotiation),
 * so the runner stays source-agnostic.
 */

import type { PackageResolver, ResolverResult } from './sync-runner.ts'
import { handleShippedSkills } from '../agent/skill-installer.ts'
import { resolveGitHubRepo } from '../sources/github.ts'
import { resolvePackageOrCrate } from '../sources/index.ts'

/**
 * npm + crate resolver. Wraps `resolvePackageOrCrate` and falls back to
 * shipped-skill detection when no docs are found.
 *
 * Returns:
 *   - `ResolvedSpec` on success
 *   - `UnresolvedSpec` with `shipped` populated when docs are missing but the
 *     package ships its own SKILL.md (caller short-circuits)
 *   - `UnresolvedSpec` with attempts only on hard failure
 */
export const npmResolver: PackageResolver = async (spec, opts) => {
  const resolution = await resolvePackageOrCrate(spec, {
    cwd: opts.cwd,
    onProgress: msg => opts.onProgress(`${spec}: ${msg}`),
  })
  const { isCrate, packageName, identityPackageName, storagePackageName, requestedTag, localVersion, attempts, registryVersion } = resolution

  if (!resolution.resolved) {
    const result: ResolverResult = {
      identityName: identityPackageName,
      attempts,
      registryVersion,
    }
    // Even without docs, the package may ship its own skills.
    if (!isCrate) {
      const shippedVersion = localVersion || registryVersion || 'latest'
      const shipped = handleShippedSkills(packageName, shippedVersion, opts.cwd, opts.agent, opts.global)
      if (shipped)
        result.shipped = shipped.shipped
    }
    return result
  }

  const resolved = resolution.resolved
  const version = isCrate
    ? (resolved.version || requestedTag || 'latest')
    : (localVersion || resolved.version || 'latest')

  return {
    identityName: identityPackageName,
    storageName: storagePackageName,
    version,
    resolved,
    kind: isCrate ? 'crate' : 'npm',
    requestedTag,
    localVersion,
  }
}

/**
 * GitHub-repo resolver. Used when `gh:owner/repo` has no pre-authored skills
 * and we fall back to generating one from the repo's docs.
 *
 * `spec` is `${owner}/${repo}`. Identity / storage names use `${owner}-${repo}`
 * to match the on-disk skill dir naming.
 */
export function createGithubResolver(owner: string, repo: string): PackageResolver {
  return async (_spec, opts) => {
    const resolved = await resolveGitHubRepo(owner, repo, msg => opts.onProgress(msg))
    if (!resolved) {
      return {
        identityName: `${owner}-${repo}`,
        attempts: [{ source: 'github-meta', status: 'not-found', message: `Could not find docs for ${owner}/${repo}` }],
      }
    }
    const repoUrl = `https://github.com/${owner}/${repo}`
    const name = `${owner}-${repo}`
    return {
      identityName: name,
      storageName: name,
      version: resolved.version || 'main',
      // Inject repoUrl so downstream `parseGitHubRepoSlug(resolved.repoUrl)`
      // and the generated SKILL.md frontmatter both have it.
      resolved: { ...resolved, repoUrl },
      kind: 'github',
    }
  }
}
