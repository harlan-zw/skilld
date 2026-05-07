/**
 * Claude Code CLI — token-level streaming via --include-partial-messages.
 *
 * Write permission: Claude Code has hardcoded .claude/ write protection and --allowedTools glob
 * patterns are broken (github.com/anthropics/claude-code/issues/6881). Instead of fighting the
 * permission system, Write is auto-denied in pipe mode and we capture the content via a
 * tool-call event's writeContent.
 */

import type { CliAdapter, CliEvent } from './types.ts'
import { buildModels } from './model-registry.ts'
import { extractToolHint } from './types.ts'

const stripClaude = (n: string): string => n.replace(/^Claude\s+/, '').replace(/\s*\(latest\)\s*$/i, '')

function buildArgs(model: string, skillDir: string, symlinkDirs: string[]): string[] {
  const allowedTools = [
    // Bare tool names — --add-dir already scopes visibility
    'Read',
    'Glob',
    'Grep',
    'Bash(*skilld search*)',
    'Bash(*skilld validate*)',
    // Write intentionally omitted — auto-denied in pipe mode, content captured via writeContent
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
    '--disallowedTools',
    'WebSearch WebFetch Task',
    '--add-dir',
    skillDir,
    ...symlinkDirs.flatMap(d => ['--add-dir', d]),
    '--no-session-persistence',
  ]
}

/**
 * Event types this parses:
 * - stream_event/content_block_delta/text_delta → text delta (token streaming)
 * - assistant message with tool_use content → tool-call (with writeContent for Write)
 * - assistant message with text content → text full (non-streaming fallback)
 * - result → done with usage/cost/turns
 */
function parseEvent(line: string): CliEvent {
  try {
    const obj = JSON.parse(line)

    if (obj.type === 'stream_event') {
      const evt = obj.event
      if (evt?.type === 'content_block_delta' && evt.delta?.type === 'text_delta')
        return { kind: 'text', delta: evt.delta.text }
      return { kind: 'noop' }
    }

    if (obj.type === 'assistant' && obj.message?.content) {
      const content = obj.message.content as any[]

      const tools = content.filter((c: any) => c.type === 'tool_use')
      if (tools.length) {
        const tool = tools.map((t: any) => t.name).join(', ')
        const hint = tools.map((t: any) => extractToolHint(t.input) ?? '').filter(Boolean).join(', ') || undefined
        const writeTool = tools.find((t: any) => t.name === 'Write' && t.input?.content)
        return { kind: 'tool-call', tool, hint, writeContent: writeTool?.input?.content }
      }

      const text = content
        .filter((c: any) => c.type === 'text')
        .map((c: any) => c.text)
        .join('')
      if (text)
        return { kind: 'text', full: text }
    }

    if (obj.type === 'result') {
      const u = obj.usage
      return {
        kind: 'done',
        usage: u ? { input: u.input_tokens ?? u.inputTokens ?? 0, output: u.output_tokens ?? u.outputTokens ?? 0 } : undefined,
        cost: obj.total_cost_usd,
        turns: obj.num_turns,
      }
    }
  }
  catch {}
  return { kind: 'noop' }
}

export const adapter: CliAdapter = {
  cli: 'claude',
  agentId: 'claude-code',
  providerName: 'Anthropic',
  models: buildModels([
    { model: 'opus', provider: 'anthropic', prefix: 'claude-opus-', nameTransform: stripClaude, hint: 'Most capable for complex work' },
    { model: 'sonnet', provider: 'anthropic', prefix: 'claude-sonnet-', nameTransform: stripClaude, hint: 'Best for everyday tasks' },
    { model: 'haiku', provider: 'anthropic', prefix: 'claude-haiku-', nameTransform: stripClaude, hint: 'Fastest for quick answers', recommended: true },
  ]),
  buildArgs,
  parseEvent,
}
