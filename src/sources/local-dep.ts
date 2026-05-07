/**
 * `link:` dependency resolution — turn a `link:../foo` package.json
 * dependency into resolved local docs. Lives in `sources/` so the
 * unified package resolver can call it without crossing into `commands/`.
 */
import type { ResolvedPackage } from './index.ts'
import { join, resolve } from 'pathe'
import { readPackageJsonSafe } from '../core/package-json.ts'
import { resolveLocalPackageDocs } from './index.ts'

/** Try resolving a `link:` dependency to local package docs. Returns null if not a link dep or resolution fails. */
export async function resolveLocalDep(packageName: string, cwd: string): Promise<ResolvedPackage | null> {
  const result = readPackageJsonSafe(join(cwd, 'package.json'))
  if (!result)
    return null

  const pkg = result.parsed
  const deps = { ...pkg.dependencies as Record<string, string>, ...pkg.devDependencies as Record<string, string> }
  const depVersion = deps[packageName]

  if (!depVersion?.startsWith('link:'))
    return null

  const localPath = resolve(cwd, depVersion.slice(5))
  return resolveLocalPackageDocs(localPath)
}
