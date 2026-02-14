/**
 * OpenAI Codex CLI — exec subcommand with JSON output
 * Prompt passed via stdin with `-` sentinel
 *
 * Real event types observed:
 * - thread.started → session start (thread_id)
 * - turn.started / turn.completed → turn lifecycle + usage
 * - item.started → command_execution in progress
 * - item.completed → agent_message (text), reasoning, command_execution (result)
 * - error / turn.failed → errors
 */

import type { CliModelEntry, ParsedEvent } from './types.ts'
import { join } from 'pathe'

export const cli = 'codex' as const
export const agentId = 'codex' as const

export const models: Record<string, CliModelEntry> = {
  'gpt-5.2-codex': { model: 'gpt-5.2-codex', name: 'GPT-5.2 Codex', hint: 'Frontier agentic coding model' },
  'gpt-5.1-codex-max': { model: 'gpt-5.1-codex-max', name: 'GPT-5.1 Codex Max', hint: 'Codex-optimized flagship' },
  'gpt-5.2': { model: 'gpt-5.2', name: 'GPT-5.2', hint: 'Latest frontier model' },
  'gpt-5.1-codex-mini': { model: 'gpt-5.1-codex-mini', name: 'GPT-5.1 Codex Mini', hint: 'Optimized for codex, cheaper & faster', recommended: true },
}

export function buildArgs(model: string, skillDir: string, symlinkDirs: string[]): string[] {
  const skilldDir = join(skillDir, '.skilld')
  return [
    'exec',
    '--json',
    '--model',
    model,
    '--full-auto',
    '--writeable-dirs',
    skilldDir,
    '--add-dir',
    skillDir,
    ...symlinkDirs.flatMap(d => ['--add-dir', d]),
    '-',
  ]
}

export function parseLine(line: string): ParsedEvent {
  try {
    const obj = JSON.parse(line)

    if (obj.type === 'item.completed' && obj.item) {
      const item = obj.item
      // Agent message — the main text output
      if (item.type === 'agent_message' && item.text)
        return { fullText: item.text }
      // Command execution completed — log as tool progress
      // If the command writes to a file (redirect or cat >), capture output as writeContent fallback
      if (item.type === 'command_execution' && item.aggregated_output) {
        const cmd = item.command || ''
        const writeContent = (/^cat\s*>|>/.test(cmd)) ? item.aggregated_output : undefined
        return { toolName: 'Bash', toolHint: `(${item.aggregated_output.length} chars output)`, writeContent }
      }
    }

    // Command starting — show progress
    if (obj.type === 'item.started' && obj.item?.type === 'command_execution') {
      return { toolName: 'Bash', toolHint: obj.item.command }
    }

    // Turn completed — usage stats
    if (obj.type === 'turn.completed' && obj.usage) {
      return {
        done: true,
        usage: {
          input: obj.usage.input_tokens ?? 0,
          output: obj.usage.output_tokens ?? 0,
        },
      }
    }

    // Error events
    if (obj.type === 'turn.failed' || obj.type === 'error') {
      return { done: true }
    }
  }
  catch {}
  return {}
}
