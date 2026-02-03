/**
 * Agent detection - identify installed and active agents
 */

import type { AgentType } from './types'
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
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
 * Detect which agent is currently running this command
 * Returns the active agent based on environment variables and context
 */
export function detectCurrentAgent(): AgentType | null {
  // Check environment variables set by agents
  if (process.env.CLAUDE_CODE || process.env.CLAUDE_CONFIG_DIR) {
    return 'claude-code'
  }
  if (process.env.CURSOR_SESSION || process.env.CURSOR_TRACE_ID) {
    return 'cursor'
  }
  if (process.env.WINDSURF_SESSION) {
    return 'windsurf'
  }
  if (process.env.CLINE_TASK_ID) {
    return 'cline'
  }
  if (process.env.CODEX_HOME || process.env.CODEX_SESSION) {
    return 'codex'
  }
  if (process.env.GITHUB_COPILOT_SESSION) {
    return 'github-copilot'
  }
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_SESSION) {
    return 'gemini-cli'
  }
  if (process.env.GOOSE_SESSION) {
    return 'goose'
  }
  if (process.env.AMP_SESSION) {
    return 'amp'
  }
  if (process.env.OPENCODE_SESSION) {
    return 'opencode'
  }
  if (process.env.ROO_SESSION) {
    return 'roo'
  }

  // Check for project-level agent config directories
  const cwd = process.cwd()
  if (existsSync(join(cwd, '.claude'))) {
    return 'claude-code'
  }
  if (existsSync(join(cwd, '.cursor'))) {
    return 'cursor'
  }
  if (existsSync(join(cwd, '.windsurf'))) {
    return 'windsurf'
  }
  if (existsSync(join(cwd, '.cline'))) {
    return 'cline'
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
    const output = execSync(`${agent.cli} --version`, {
      encoding: 'utf-8',
      timeout: 3000,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim()

    // Extract version number from output
    // Common formats: "v1.2.3", "1.2.3", "cli 1.2.3", "name v1.2.3"
    const match = output.match(/v?(\d+\.\d+\.\d+(?:-[a-z0-9.]+)?)/)
    return match ? match[1] : output.split('\n')[0]
  }
  catch {
    return null
  }
}
