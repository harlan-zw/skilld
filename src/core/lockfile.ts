import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'pathe'
import { yamlEscape, yamlParseKV } from './yaml'

export interface SkillInfo {
  packageName?: string
  version?: string
  /** All tracked packages as comma-separated "name@version" pairs (multi-package skills) */
  packages?: string
  repo?: string
  source?: string
  syncedAt?: string
  generator?: string
  /** Skill path within repo (git-sourced skills) */
  path?: string
  /** Git ref tracked for updates */
  ref?: string
  /** Git commit SHA at install time */
  commit?: string
}

export function parsePackages(packages?: string): Array<{ name: string, version: string }> {
  if (!packages)
    return []
  return packages.split(',').map((s) => {
    const trimmed = s.trim()
    const atIdx = trimmed.lastIndexOf('@')
    if (atIdx <= 0)
      return { name: trimmed, version: '' }
    return { name: trimmed.slice(0, atIdx), version: trimmed.slice(atIdx + 1) }
  }).filter(p => p.name)
}

export function serializePackages(pkgs: Array<{ name: string, version: string }>): string {
  return pkgs.map(p => `${p.name}@${p.version}`).join(', ')
}

export interface SkilldLock {
  skills: Record<string, SkillInfo>
}

export function parseSkillFrontmatter(skillPath: string): SkillInfo | null {
  if (!existsSync(skillPath))
    return null
  const content = readFileSync(skillPath, 'utf-8')
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match)
    return null

  const info: SkillInfo = {}
  for (const line of match[1].split('\n')) {
    const kv = yamlParseKV(line)
    if (!kv)
      continue
    const [key, value] = kv
    if (key === 'packageName')
      info.packageName = value
    if (key === 'version')
      info.version = value
    if (key === 'packages')
      info.packages = value
    if (key === 'repo')
      info.repo = value
    if (key === 'source')
      info.source = value
    if (key === 'syncedAt')
      info.syncedAt = value
    if (key === 'generator')
      info.generator = value
    if (key === 'path')
      info.path = value
    if (key === 'ref')
      info.ref = value
    if (key === 'commit')
      info.commit = value
  }
  return info
}

export function readLock(skillsDir: string): SkilldLock | null {
  const lockPath = join(skillsDir, 'skilld-lock.yaml')
  if (!existsSync(lockPath))
    return null
  const content = readFileSync(lockPath, 'utf-8')

  const skills: Record<string, SkillInfo> = {}
  let currentSkill: string | null = null

  for (const line of content.split('\n')) {
    const skillMatch = line.match(/^ {2}(\S+):$/)
    if (skillMatch) {
      currentSkill = skillMatch[1]
      skills[currentSkill] = {}
      continue
    }
    if (currentSkill && line.startsWith('    ')) {
      const kv = yamlParseKV(line)
      if (kv)
        (skills[currentSkill] as any)[kv[0]] = kv[1]
    }
  }
  return { skills }
}

function serializeLock(lock: SkilldLock): string {
  let yaml = 'skills:\n'
  for (const [name, skill] of Object.entries(lock.skills)) {
    yaml += `  ${name}:\n`
    if (skill.packageName)
      yaml += `    packageName: ${yamlEscape(skill.packageName)}\n`
    if (skill.version)
      yaml += `    version: ${yamlEscape(skill.version)}\n`
    if (skill.packages)
      yaml += `    packages: ${yamlEscape(skill.packages)}\n`
    if (skill.repo)
      yaml += `    repo: ${yamlEscape(skill.repo)}\n`
    if (skill.source)
      yaml += `    source: ${yamlEscape(skill.source)}\n`
    if (skill.syncedAt)
      yaml += `    syncedAt: ${yamlEscape(skill.syncedAt)}\n`
    if (skill.generator)
      yaml += `    generator: ${yamlEscape(skill.generator)}\n`
    if (skill.path)
      yaml += `    path: ${yamlEscape(skill.path)}\n`
    if (skill.ref)
      yaml += `    ref: ${yamlEscape(skill.ref)}\n`
    if (skill.commit)
      yaml += `    commit: ${yamlEscape(skill.commit)}\n`
  }
  return yaml
}

export function writeLock(skillsDir: string, skillName: string, info: SkillInfo): void {
  const lockPath = join(skillsDir, 'skilld-lock.yaml')
  let lock: SkilldLock = { skills: {} }
  if (existsSync(lockPath)) {
    lock = readLock(skillsDir) || { skills: {} }
  }

  const existing = lock.skills[skillName]
  if (existing && info.packageName) {
    // Merge packages list
    const existingPkgs = parsePackages(existing.packages)
    // Also include existing primary if not yet in packages list
    if (existing.packageName && !existingPkgs.some(p => p.name === existing.packageName)) {
      existingPkgs.unshift({ name: existing.packageName, version: existing.version || '' })
    }
    // Add/update new package
    const idx = existingPkgs.findIndex(p => p.name === info.packageName)
    if (idx >= 0) {
      existingPkgs[idx]!.version = info.version || ''
    }
    else {
      existingPkgs.push({ name: info.packageName, version: info.version || '' })
    }
    info.packages = serializePackages(existingPkgs)
    // Keep primary as first package
    info.packageName = existingPkgs[0]!.name
    info.version = existingPkgs[0]!.version
    // Preserve fields from existing entry that aren't in new info
    if (!info.repo && existing.repo)
      info.repo = existing.repo
    if (!info.source && existing.source)
      info.source = existing.source
    if (!info.generator && existing.generator)
      info.generator = existing.generator
  }

  lock.skills[skillName] = info
  writeFileSync(lockPath, serializeLock(lock))
}

/**
 * Merge multiple lockfiles, preferring the most recently synced entry per skill.
 */
export function mergeLocks(locks: SkilldLock[]): SkilldLock {
  const merged: Record<string, SkillInfo> = {}
  for (const lock of locks) {
    for (const [name, info] of Object.entries(lock.skills)) {
      const existing = merged[name]
      if (!existing || (info.syncedAt && (!existing.syncedAt || info.syncedAt > existing.syncedAt)))
        merged[name] = info
    }
  }
  return { skills: merged }
}

/**
 * Sync a lockfile to all other dirs that already have a skilld-lock.yaml.
 * Only updates existing lockfiles — does not create new ones.
 */
export function syncLockfilesToDirs(sourceLock: SkilldLock, dirs: string[]): void {
  for (const dir of dirs) {
    const lockPath = join(dir, 'skilld-lock.yaml')
    if (!existsSync(lockPath))
      continue
    const existing = readLock(dir)
    if (!existing)
      continue
    // Merge source into existing
    const merged = mergeLocks([existing, sourceLock])
    writeFileSync(lockPath, serializeLock(merged))
  }
}

export function removeLockEntry(skillsDir: string, skillName: string): void {
  const lockPath = join(skillsDir, 'skilld-lock.yaml')
  const lock = readLock(skillsDir)
  if (!lock)
    return

  delete lock.skills[skillName]

  if (Object.keys(lock.skills).length === 0) {
    unlinkSync(lockPath)
    return
  }

  writeFileSync(lockPath, serializeLock(lock))
}
