import type { AgentType } from '../agent'
import type { SkillInfo } from './lockfile'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { agents, detectInstalledAgents } from '../agent'
import { readLocalDependencies } from '../doc-resolver'
import { parseSkillFrontmatter, readLock } from './lockfile'

export interface SkillEntry {
  name: string
  dir: string
  agent: AgentType
  info: SkillInfo | null
  scope: 'local' | 'global'
  /** Original package name from package.json (e.g., @scope/pkg) */
  packageName?: string
  /** Latest version from package.json deps */
  latestVersion?: string
}

export interface ProjectState {
  skills: SkillEntry[]
  deps: Map<string, string>
  missing: string[]
  outdated: SkillEntry[]
  synced: SkillEntry[]
}

export interface IterateSkillsOptions {
  scope?: 'local' | 'global' | 'all'
  agents?: AgentType[]
  cwd?: string
}

export function* iterateSkills(opts: IterateSkillsOptions = {}): Generator<SkillEntry> {
  const { scope = 'all', cwd = process.cwd() } = opts
  const agentTypes = opts.agents ?? detectInstalledAgents()

  for (const agentType of agentTypes) {
    const agent = agents[agentType]

    // Local skills
    if (scope === 'local' || scope === 'all') {
      const localDir = join(cwd, agent.skillsDir)
      if (existsSync(localDir)) {
        const lock = readLock(localDir)
        const entries = readdirSync(localDir).filter(f => !f.startsWith('.') && f !== 'skilld-lock.yaml')
        for (const name of entries) {
          const dir = join(localDir, name)
          // Only track skills in lockfile OR with generator: "skilld"
          if (lock?.skills[name]) {
            yield { name, dir, agent: agentType, info: lock.skills[name], scope: 'local' }
          }
          else {
            const info = parseSkillFrontmatter(join(dir, 'SKILL.md'))
            if (info?.generator === 'skilld') {
              yield { name, dir, agent: agentType, info, scope: 'local' }
            }
          }
        }
      }
    }

    // Global skills
    if ((scope === 'global' || scope === 'all') && agent.globalSkillsDir) {
      const globalDir = agent.globalSkillsDir
      if (existsSync(globalDir)) {
        const lock = readLock(globalDir)
        const entries = readdirSync(globalDir).filter(f => !f.startsWith('.') && f !== 'skilld-lock.yaml')
        for (const name of entries) {
          const dir = join(globalDir, name)
          // Only track skills in lockfile OR with generator: "skilld"
          if (lock?.skills[name]) {
            yield { name, dir, agent: agentType, info: lock.skills[name], scope: 'global' }
          }
          else {
            const info = parseSkillFrontmatter(join(dir, 'SKILL.md'))
            if (info?.generator === 'skilld') {
              yield { name, dir, agent: agentType, info, scope: 'global' }
            }
          }
        }
      }
    }
  }
}

export function isOutdated(skill: SkillEntry, depVersion: string): boolean {
  if (!skill.info?.version)
    return true

  const skillMajorMinor = skill.info.version.split('.').slice(0, 2).join('.')
  const depMajorMinor = depVersion.replace(/^[\^~]/, '').split('.').slice(0, 2).join('.')

  return skillMajorMinor !== depMajorMinor
}

export async function getProjectState(cwd: string = process.cwd()): Promise<ProjectState> {
  const skills = [...iterateSkills({ scope: 'local', cwd })]

  // Get package.json deps
  const localDeps = await readLocalDependencies(cwd).catch(() => [])
  const deps = new Map(localDeps.map(d => [d.name, d.version]))

  // Build skill name -> entry map (for lookup by package name)
  const skillByName = new Map(skills.map(s => [s.name, s]))

  // Secondary lookup: packageName from lockfile (shipped skills have different names)
  const skillByPkgName = new Map<string, SkillEntry>()
  for (const s of skills) {
    if (s.info?.packageName)
      skillByPkgName.set(s.info.packageName, s)
  }

  const missing: string[] = []
  const outdated: SkillEntry[] = []
  const synced: SkillEntry[] = []

  for (const [pkgName, version] of deps) {
    // Normalize package name (e.g., @scope/pkg -> scope-pkg)
    const normalizedName = pkgName.replace(/^@/, '').replace(/\//g, '-')
    const skill = skillByName.get(normalizedName) || skillByName.get(pkgName) || skillByPkgName.get(pkgName)

    if (!skill) {
      missing.push(pkgName)
    }
    else if (isOutdated(skill, version)) {
      outdated.push({ ...skill, packageName: pkgName, latestVersion: version })
    }
    else {
      synced.push({ ...skill, packageName: pkgName, latestVersion: version })
    }
  }

  return { skills, deps, missing, outdated, synced }
}

export function getSkillsDir(agent: AgentType, scope: 'local' | 'global', cwd: string = process.cwd()): string {
  const agentConfig = agents[agent]
  if (scope === 'global') {
    if (!agentConfig.globalSkillsDir) {
      throw new Error(`Agent ${agent} does not support global skills`)
    }
    return agentConfig.globalSkillsDir
  }
  return join(cwd, agentConfig.skillsDir)
}
