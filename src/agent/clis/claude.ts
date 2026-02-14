/**
 * Claude Code CLI — token-level streaming via --include-partial-messages
 */

import type { CliModelEntry, ParsedEvent } from './types.ts'
import { join } from 'pathe'

export const cli = 'claude' as const
export const agentId = 'claude-code' as const

export const models: Record<string, CliModelEntry> = {
  opus: { model: 'opus', name: 'Opus 4.6', hint: 'Most capable for complex work' },
  sonnet: { model: 'sonnet', name: 'Sonnet 4.5', hint: 'Best for everyday tasks', recommended: true },
  haiku: { model: 'haiku', name: 'Haiku 4.5', hint: 'Fastest for quick answers' },
}

export function buildArgs(model: string, skillDir: string, symlinkDirs: string[]): string[] {
  const skilldDir = join(skillDir, '.skilld')
  const readDirs = [skillDir, ...symlinkDirs]
  const allowedTools = [
    ...readDirs.flatMap(d => [`Read(${d}/**)`, `Glob(${d}/**)`, `Grep(${d}/**)`]),
    `Write(${skilldDir}/**)`,
    `Bash(*skilld search*)`,
  ].join(' ')
  return [
    '-p',
    '--model',
    model,
    '--output-format',
    'stream-json',
    '--verbose',
    '--include-partial-messages',
    '--allowedTools',
    allowedTools,
    '--add-dir',
    skillDir,
    ...symlinkDirs.flatMap(d => ['--add-dir', d]),
    '--no-session-persistence',
  ]
}

/**
 * Parse claude stream-json events
 *
 * Event types:
 * - stream_event/content_block_delta/text_delta → token streaming
 * - stream_event/content_block_start/tool_use → tool invocation starting
 * - assistant message with tool_use content → tool name + input
 * - assistant message with text content → full text (non-streaming fallback)
 * - result → usage, cost, turns
 */
export function parseLine(line: string): ParsedEvent {
  try {
    const obj = JSON.parse(line)

    // Token-level streaming (--include-partial-messages)
    if (obj.type === 'stream_event') {
      const evt = obj.event
      if (!evt)
        return {}

      // Text delta — the main streaming path
      if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
        return { textDelta: evt.delta.text }
      }

      return {}
    }

    // Full assistant message (complete turn, after streaming)
    if (obj.type === 'assistant' && obj.message?.content) {
      const content = obj.message.content as any[]

      // Extract tool uses with inputs for progress hints
      const tools = content.filter((c: any) => c.type === 'tool_use')
      if (tools.length) {
        const names = tools.map((t: any) => t.name)
        // Extract useful hint from tool input (file path, query, etc)
        const hint = tools.map((t: any) => {
          const input = t.input || {}
          return input.file_path || input.path || input.pattern || input.query || input.command || ''
        }).filter(Boolean).join(', ')
        // Capture Write content as fallback if permission is denied
        const writeTool = tools.find((t: any) => t.name === 'Write' && t.input?.content)
        return { toolName: names.join(', '), toolHint: hint || undefined, writeContent: writeTool?.input?.content }
      }

      // Text content (fallback for non-partial mode)
      const text = content
        .filter((c: any) => c.type === 'text')
        .map((c: any) => c.text)
        .join('')
      if (text)
        return { fullText: text }
    }

    // Final result
    if (obj.type === 'result') {
      const u = obj.usage
      return {
        done: true,
        usage: u ? { input: u.input_tokens ?? u.inputTokens ?? 0, output: u.output_tokens ?? u.outputTokens ?? 0 } : undefined,
        cost: obj.total_cost_usd,
        turns: obj.num_turns,
      }
    }
  }
  catch {}
  return {}
}
