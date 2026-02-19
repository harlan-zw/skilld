/**
 * OpenAI Codex CLI — exec subcommand with JSON output
 * Prompt passed via stdin with `-` sentinel
 *
 * Event types:
 * - turn.started / turn.completed → turn lifecycle + usage
 * - item.started → command_execution in progress
 * - item.completed → agent_message (text), command_execution (result), file_change (apply_patch)
 * - error / turn.failed → errors
 */

import type { CliModelEntry, ParsedEvent } from './types.ts'

export const cli = 'codex' as const
export const agentId = 'codex' as const

export const models: Record<string, CliModelEntry> = {
  'gpt-5.3-codex': { model: 'gpt-5.3-codex', name: 'GPT-5.3 Codex', hint: 'Latest frontier Codex model' },
  'gpt-5.3-codex-spark': { model: 'gpt-5.3-codex-spark', name: 'GPT-5.3 Codex Spark', hint: 'Faster GPT-5.3 Codex variant', recommended: true },
  'gpt-5.2-codex': { model: 'gpt-5.2-codex', name: 'GPT-5.2 Codex', hint: 'Frontier agentic coding model' },
}

export function buildArgs(model: string, _skillDir: string, _symlinkDirs: string[]): string[] {
  return [
    'exec',
    '--json',
    '--ephemeral',
    '--model',
    model,
    // Permissions aligned with Claude's scoped model:
    // --full-auto = --sandbox workspace-write + --ask-for-approval on-request
    //   → writes scoped to CWD (.skilld/, set in spawn), reads unrestricted, network blocked
    // Shell remains enabled for `npx -y skilld search/validate` (no per-command allowlist in Codex)
    // --ephemeral → no session persistence (equivalent to Claude's --no-session-persistence)
    '--full-auto',
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
      // apply_patch completed — file written directly to disk
      if (item.type === 'file_change' && item.changes?.length) {
        const paths = item.changes.map((c: { path: string, kind: string }) => c.path).join(', ')
        return { toolName: 'Write', toolHint: paths }
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
