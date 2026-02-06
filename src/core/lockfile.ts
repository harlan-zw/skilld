import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export interface SkillInfo {
  packageName?: string
  version?: string
  source?: string
  syncedAt?: string
  generator?: string
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
  const lines = match[1].split('\n')
  for (const line of lines) {
    const [key, ...rest] = line.split(':')
    const value = rest.join(':').trim().replace(/^["']|["']$/g, '')
    if (key === 'packageName')
      info.packageName = value
    if (key === 'version')
      info.version = value
    if (key === 'source')
      info.source = value
    if (key === 'syncedAt')
      info.syncedAt = value
    if (key === 'generator')
      info.generator = value
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
      const [key, ...rest] = line.trim().split(':')
      const value = rest.join(':').trim().replace(/^["']|["']$/g, '')
      if (key && value)
        (skills[currentSkill] as any)[key] = value
    }
  }
  return { skills }
}

export function writeLock(skillsDir: string, skillName: string, info: SkillInfo): void {
  const lockPath = join(skillsDir, 'skilld-lock.yaml')
  let lock: SkilldLock = { skills: {} }
  if (existsSync(lockPath)) {
    lock = readLock(skillsDir) || { skills: {} }
  }
  lock.skills[skillName] = info

  let yaml = 'skills:\n'
  for (const [name, skill] of Object.entries(lock.skills)) {
    yaml += `  ${name}:\n`
    if (skill.packageName)
      yaml += `    packageName: "${skill.packageName}"\n`
    if (skill.version)
      yaml += `    version: "${skill.version}"\n`
    if (skill.source)
      yaml += `    source: "${skill.source}"\n`
    if (skill.syncedAt)
      yaml += `    syncedAt: "${skill.syncedAt}"\n`
    if (skill.generator)
      yaml += `    generator: "${skill.generator}"\n`
  }
  writeFileSync(lockPath, yaml)
}

export function removeLockEntry(skillsDir: string, skillName: string): void {
  const lockPath = join(skillsDir, 'skilld-lock.yaml')
  const lock = readLock(skillsDir)
  if (!lock)
    return

  delete lock.skills[skillName]

  if (Object.keys(lock.skills).length === 0) {
    // Remove empty lock file
    unlinkSync(lockPath)
    return
  }

  let yaml = 'skills:\n'
  for (const [name, skill] of Object.entries(lock.skills)) {
    yaml += `  ${name}:\n`
    if (skill.packageName)
      yaml += `    packageName: "${skill.packageName}"\n`
    if (skill.version)
      yaml += `    version: "${skill.version}"\n`
    if (skill.source)
      yaml += `    source: "${skill.source}"\n`
    if (skill.syncedAt)
      yaml += `    syncedAt: "${skill.syncedAt}"\n`
    if (skill.generator)
      yaml += `    generator: "${skill.generator}"\n`
  }
  writeFileSync(lockPath, yaml)
}
