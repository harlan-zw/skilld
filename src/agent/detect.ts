/**
 * Agent detection - identify installed and active agents
 */

import type { AgentType } from './types'
import { spawnSync } from 'node:child_process'
import { agents } from './registry'

/**
 * Detect which agents are installed on the system
 */
export function detectInstalledAgents(): AgentType[] {
  return Object.entries(agents)
    .filter(([_, config]) => config.detectInstalled())
    .map(([type]) => type as AgentType)
}

/**
 * Detect the target agent (where skills are installed) from env vars and cwd.
 * This is NOT the generator LLM — it determines the skills directory.
 *
 * Priority: env vars first (running inside agent), then project dirs.
 * Iteration order of the agents record determines priority.
 */
export function detectTargetAgent(): AgentType | null {
  for (const [type, target] of Object.entries(agents)) {
    if (target.detectEnv())
      return type as AgentType
  }

  const cwd = process.cwd()
  for (const [type, target] of Object.entries(agents)) {
    if (target.detectProject(cwd))
      return type as AgentType
  }

  return null
}

/**
 * Get the version of an agent's CLI (if available)
 */
export function getAgentVersion(agentType: AgentType): string | null {
  const agent = agents[agentType]
  if (!agent.cli)
    return null

  try {
    const result = spawnSync(agent.cli, ['--version'], {
      encoding: 'utf-8',
      timeout: 3000,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    if (result.status !== 0)
      return null
    const output = (result.stdout || '').trim()

    // Extract version number from output
    // Common formats: "v1.2.3", "1.2.3", "cli 1.2.3", "name v1.2.3"
    const match = output.match(/v?(\d+\.\d+\.\d+(?:-[a-z0-9.]+)?)/)
    return match ? match[1] : output.split('\n')[0]
  }
  catch {
    return null
  }
}
