/**
 * CLI provider factory - shared logic for CLI-based LLM providers
 */

import { execSync, spawnSync } from 'node:child_process'
import type { LLMProvider, ModelInfo } from './types'

export interface CliProviderConfig {
  id: string
  name: string
  /** CLI command name (e.g., 'claude', 'gemini') */
  command: string
  /** Available models */
  models: ModelInfo[]
  /** Map model ID to CLI model argument */
  modelMap: Record<string, string>
  /** Build CLI args from model. Default: ['--model', modelArg] */
  buildArgs?: (modelArg: string) => string[]
  /** Timeout in ms. Default: 180000 */
  timeout?: number
}

/**
 * Check if a CLI command is available
 */
export function hasCli(command: string): boolean {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' })
    return true
  }
  catch {
    return false
  }
}

/**
 * Run a CLI command with prompt input
 */
export function runCli(
  command: string,
  args: string[],
  prompt: string,
  timeout = 180_000,
): string | null {
  try {
    const result = spawnSync(command, args, {
      input: prompt,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'inherit'],
      maxBuffer: 10 * 1024 * 1024,
      timeout,
    })

    if (result.error || result.status !== 0) return null
    return result.stdout.trim()
  }
  catch {
    return null
  }
}

/**
 * Create a CLI-based LLM provider
 */
export function createCliProvider(config: CliProviderConfig): LLMProvider {
  const {
    id,
    name,
    command,
    models,
    modelMap,
    buildArgs = modelArg => ['--model', modelArg],
    timeout = 180_000,
  } = config

  return {
    id,
    name,

    isAvailable: () => hasCli(command),

    getModels: () => models,

    async generate(prompt, model) {
      const modelArg = modelMap[model] || Object.values(modelMap)[0]!
      const args = buildArgs(modelArg)
      return runCli(command, args, prompt, timeout)
    },
  }
}
