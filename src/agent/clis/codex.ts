/**
 * OpenAI Codex CLI — exec subcommand with JSON output. Prompt passed via stdin (`-` sentinel).
 *
 * Event types:
 * - turn.completed → done with usage
 * - item.started command_execution → tool-call (Bash, in progress)
 * - item.completed agent_message → text full
 * - item.completed command_execution → tool-call (with writeContent if redirected to a file)
 * - item.completed file_change → tool-call (apply_patch wrote a file)
 * - turn.failed / error → done (terminal)
 */

import type { CliAdapter, CliEvent } from './types.ts'
import { buildModels } from './model-registry.ts'

function buildArgs(model: string, _skillDir: string, _symlinkDirs: string[]): string[] {
  return [
    'exec',
    '--json',
    '--ephemeral',
    '--model',
    model,
    // --full-auto = workspace-write sandbox + on-request approval. Writes scoped to CWD
    // (.skilld/, set in spawn), reads unrestricted, network blocked. Shell remains enabled
    // for `skilld` search/validate (Codex has no per-command allowlist).
    // --ephemeral = no session persistence (mirrors Claude's --no-session-persistence).
    '--full-auto',
    '-',
  ]
}

function parseEvent(line: string): CliEvent {
  try {
    const obj = JSON.parse(line)

    if (obj.type === 'item.completed' && obj.item) {
      const item = obj.item
      if (item.type === 'agent_message' && item.text)
        return { kind: 'text', full: item.text }
      if (item.type === 'command_execution' && item.aggregated_output) {
        const cmd = item.command || ''
        const writeContent = (/^cat\s*>|>/.test(cmd)) ? item.aggregated_output : undefined
        return { kind: 'tool-call', tool: 'Bash', hint: `(${item.aggregated_output.length} chars output)`, writeContent }
      }
      if (item.type === 'file_change' && item.changes?.length) {
        const paths = item.changes.map((c: { path: string, kind: string }) => c.path).join(', ')
        return { kind: 'tool-call', tool: 'Write', hint: paths }
      }
    }

    if (obj.type === 'item.started' && obj.item?.type === 'command_execution')
      return { kind: 'tool-call', tool: 'Bash', hint: obj.item.command }

    if (obj.type === 'turn.completed' && obj.usage) {
      return {
        kind: 'done',
        usage: { input: obj.usage.input_tokens ?? 0, output: obj.usage.output_tokens ?? 0 },
      }
    }

    if (obj.type === 'turn.failed' || obj.type === 'error')
      return { kind: 'error', message: obj.message }
  }
  catch {}
  return { kind: 'noop' }
}

export const adapter: CliAdapter = {
  cli: 'codex',
  agentId: 'codex',
  providerName: 'OpenAI',
  models: buildModels([
    { provider: 'openai', prefix: 'gpt-', contains: 'codex', exclude: ['spark', 'mini', 'max'], hint: 'Latest frontier Codex model' },
    { provider: 'openai', prefix: 'gpt-', contains: 'codex-spark', hint: 'Faster Codex variant', recommended: true },
    { provider: 'openai', prefix: 'gpt-', contains: 'codex-mini', hint: 'Cheapest Codex variant' },
  ]),
  buildArgs,
  parseEvent,
}
