/**
 * LLM-based documentation optimization using AI SDK
 */

import { execSync } from 'node:child_process'
import { generateText } from 'ai'
import { claudeCode } from 'ai-sdk-provider-claude-code'
import { createGeminiProvider } from 'ai-sdk-provider-gemini-cli'
import { codexCli } from 'ai-sdk-provider-codex-cli'
import { buildPrompt } from '../prompts'

export type { PromptPreset } from '../prompts'
export { buildPrompt, defaultPreset, detailedPreset, getPreset, minimalPreset, presets, simplePreset } from '../prompts'

export type OptimizeModel = 'haiku' | 'sonnet' | 'gemini-flash' | 'codex'
export type PromptPresetId = 'detailed' | 'simple' | 'minimal'

export interface ModelInfo {
  id: OptimizeModel
  name: string
  hint: string
  recommended?: boolean
}

const models = {
  haiku: claudeCode('haiku'),
  sonnet: claudeCode('sonnet'),
  'gemini-flash': createGeminiProvider()('gemini-2.0-flash'),
  codex: codexCli('o4-mini'),
}

const modelInfo: ModelInfo[] = [
  { id: 'haiku', name: 'Claude Haiku', hint: 'Fast, cheap', recommended: true },
  { id: 'sonnet', name: 'Claude Sonnet', hint: 'Balanced' },
  { id: 'gemini-flash', name: 'Gemini Flash', hint: 'Fast, free' },
  { id: 'codex', name: 'Codex CLI', hint: 'OpenAI o4-mini' },
]

const cliCommands: Record<OptimizeModel, string> = {
  haiku: 'claude',
  sonnet: 'claude',
  'gemini-flash': 'gemini',
  codex: 'codex',
}

function hasCli(command: string): boolean {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' })
    return true
  }
  catch {
    return false
  }
}

/** Get available models based on installed CLIs */
export function getAvailableModels(): ModelInfo[] {
  const checked = new Set<string>()
  return modelInfo.filter((m) => {
    const cmd = cliCommands[m.id]
    if (checked.has(cmd)) return checked.has(cmd) && hasCli(cmd)
    checked.add(cmd)
    return hasCli(cmd)
  })
}

/**
 * Optimize documentation using AI SDK providers
 * Falls back gracefully if LLM unavailable
 */
export async function optimizeDocs(
  content: string,
  packageName: string,
  model: OptimizeModel = 'haiku',
  preset: PromptPresetId = 'simple',
): Promise<{ optimized: string, wasOptimized: boolean }> {
  const prompt = buildPrompt(packageName, content, preset)

  try {
    const { text } = await generateText({
      model: models[model],
      prompt,
    })
    return { optimized: text, wasOptimized: true }
  }
  catch {
    // Fallback to haiku if other model fails
    if (model !== 'haiku') {
      try {
        const { text } = await generateText({
          model: models.haiku,
          prompt,
        })
        return { optimized: text, wasOptimized: true }
      }
      catch {
        return { optimized: content, wasOptimized: false }
      }
    }
    return { optimized: content, wasOptimized: false }
  }
}
