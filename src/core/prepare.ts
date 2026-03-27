/**
 * Shared prepare utilities used by both the fast entry (src/prepare.ts)
 * and the full CLI command (src/commands/prepare.ts).
 *
 * Keep this module lightweight: no imports from agent/, cache/storage.ts,
 * or any module that pulls in sanitize/clack/citty.
 */

import type { SkillInfo } from './lockfile.ts'
import { existsSync, lstatSync, mkdirSync, readdirSync, rmSync, symlinkSync, unlinkSync } from 'node:fs'
import { join } from 'pathe'
import { getCacheDir } from '../cache/version.ts'

/** Resolve package directory: node_modules first, then global cache */
export function resolvePkgDir(name: string, cwd: string, version?: string): string | null {
  const nodeModulesPath = join(cwd, 'node_modules', name)
  if (existsSync(nodeModulesPath))
    return nodeModulesPath

  if (version) {
    const cachedPkgDir = join(getCacheDir(name, version), 'pkg')
    if (existsSync(join(cachedPkgDir, 'package.json')))
      return cachedPkgDir
  }

  return null
}

/** Restore .skilld/pkg symlink to node_modules if broken */
export function restorePkgSymlink(skillsDir: string, name: string, info: SkillInfo, cwd: string): void {
  const refsDir = join(skillsDir, name, '.skilld')
  const pkgLink = join(refsDir, 'pkg')

  if (!existsSync(join(skillsDir, name)))
    return

  // Use lstatSync to detect dangling symlinks — existsSync follows symlinks
  // and returns false for dangling ones, causing symlinkSync to throw EEXIST
  try {
    const stat = lstatSync(pkgLink)
    if (stat.isSymbolicLink()) {
      if (existsSync(pkgLink))
        return // symlink exists and target is valid
      unlinkSync(pkgLink) // dangling symlink — remove before re-creating
    }
    else {
      return // real file/dir exists at this path
    }
  }
  catch {
    // path doesn't exist — continue to create symlink
  }

  const pkgName = info.packageName || name
  const pkgDir = resolvePkgDir(pkgName, cwd, info.version)
  if (!pkgDir)
    return

  mkdirSync(refsDir, { recursive: true })
  symlinkSync(pkgDir, pkgLink)
}

export interface ShippedSkill {
  skillName: string
  skillDir: string
}

/** Check if package ships a skills/ directory with SKILL.md or _SKILL.md subdirs */
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

/** Create symlink from skills dir to shipped skill dir */
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
