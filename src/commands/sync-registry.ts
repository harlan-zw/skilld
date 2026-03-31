/**
 * Registry-based skill installation
 *
 * Simplified install flow for curated skills from skilld.dev:
 * fetch SKILL.md → write to disk → update lockfile → link to agents.
 *
 * No doc resolution, no LLM, no caching. Fast path.
 */

import type { AgentType } from '../agent/index.ts'
import type { RegistrySkill } from '../registry/client.ts'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'pathe'
import { linkSkillToAgents } from '../agent/install.ts'
import { writeLock } from '../core/lockfile.ts'
import { SHARED_SKILLS_DIR } from '../core/shared.ts'
import { fetchRegistrySkill } from '../registry/client.ts'

export interface SyncRegistryOptions {
  packageName: string
  agent: AgentType
  global?: boolean
  cwd?: string
}

/**
 * Install a package skill from the skilld.dev registry.
 * Returns the installed skill, or null if no curated skill exists.
 */
export async function syncRegistrySkill(opts: SyncRegistryOptions): Promise<RegistrySkill | null> {
  const { packageName, agent, cwd = process.cwd() } = opts

  const skill = await fetchRegistrySkill(packageName)
  if (!skill)
    return null

  // Write SKILL.md to shared skills dir
  const sharedDir = join(cwd, SHARED_SKILLS_DIR)
  const skillDir = join(sharedDir, skill.name)
  mkdirSync(skillDir, { recursive: true })
  writeFileSync(join(skillDir, 'SKILL.md'), skill.content)

  // Update lockfile
  const baseDir = join(cwd, '.claude', 'skills')
  mkdirSync(baseDir, { recursive: true })
  writeLock(baseDir, skill.name, {
    packageName: skill.packageName,
    version: skill.version,
    repo: skill.repo,
    source: 'registry',
    syncedAt: new Date().toISOString().slice(0, 10),
    generator: 'curator',
  })

  // Link to agent skill directories
  linkSkillToAgents(skill.name, skillDir, cwd, agent)

  return skill
}
