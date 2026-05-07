/**
 * Monorepo detection — discovers public packages in a workspace root.
 * Used by author flow to drive multi-package skill generation.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'pathe'
import { readPackageJsonSafe } from './package-json.ts'

const QUOTE_PREFIX_RE = /^['"]/
const QUOTE_SUFFIX_RE = /['"]$/

export interface MonorepoPackage {
  name: string
  version: string
  description?: string
  repoUrl?: string
  dir: string
}

function readRepoUrl(pkg: Record<string, any>): string | undefined {
  return typeof pkg.repository === 'string'
    ? pkg.repository
    : pkg.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, '')
}

function readWorkspacePatterns(cwd: string, pkg: Record<string, any>): string[] {
  let patterns: string[] = []

  if (Array.isArray(pkg.workspaces))
    patterns = pkg.workspaces
  else if (pkg.workspaces?.packages)
    patterns = pkg.workspaces.packages

  if (patterns.length === 0) {
    const pnpmWs = join(cwd, 'pnpm-workspace.yaml')
    if (existsSync(pnpmWs)) {
      const lines = readFileSync(pnpmWs, 'utf-8').split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('-'))
          continue
        const value = trimmed.slice(1).trim().replace(QUOTE_PREFIX_RE, '').replace(QUOTE_SUFFIX_RE, '')
        if (value)
          patterns.push(value)
      }
    }
  }

  return patterns
}

/**
 * Detect public (non-private) packages declared by a workspace root.
 * Returns null if `cwd` is not a private workspace root or has no public
 * packages. Supports `package.json#workspaces` (array or `{ packages }`)
 * and `pnpm-workspace.yaml`.
 */
export function detectMonorepoPackages(cwd: string): MonorepoPackage[] | null {
  const rootResult = readPackageJsonSafe(join(cwd, 'package.json'))
  if (!rootResult)
    return null

  const pkg = rootResult.parsed as Record<string, any>
  if (!pkg.private)
    return null

  const patterns = readWorkspacePatterns(cwd, pkg)
  if (patterns.length === 0)
    return null

  const packages: MonorepoPackage[] = []

  for (const pattern of patterns) {
    const base = pattern.replace(/\/?\*+$/, '')
    const scanDir = resolve(cwd, base)
    if (!existsSync(scanDir))
      continue

    const directResult = readPackageJsonSafe(join(scanDir, 'package.json'))
    if (directResult) {
      const directPkg = directResult.parsed as Record<string, any>
      if (!directPkg.private && directPkg.name) {
        packages.push({
          name: directPkg.name,
          version: directPkg.version || '0.0.0',
          description: directPkg.description,
          repoUrl: readRepoUrl(directPkg),
          dir: scanDir,
        })
        continue
      }
    }

    for (const entry of readdirSync(scanDir, { withFileTypes: true })) {
      if (!entry.isDirectory())
        continue
      const childResult = readPackageJsonSafe(join(scanDir, entry.name, 'package.json'))
      if (!childResult)
        continue

      const childPkg = childResult.parsed as Record<string, any>
      if (childPkg.private || !childPkg.name)
        continue

      packages.push({
        name: childPkg.name,
        version: childPkg.version || '0.0.0',
        description: childPkg.description,
        repoUrl: readRepoUrl(childPkg),
        dir: join(scanDir, entry.name),
      })
    }
  }

  return packages.length > 0 ? packages : null
}
