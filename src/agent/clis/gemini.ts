/**
 * Gemini CLI — turn-level streaming via -o stream-json.
 * Write scoping: relies on cwd being set to .skilld/ (no native --writeable-dirs).
 */

import type { CliAdapter, CliEvent } from './types.ts'
import { resolveSkilldCommand } from '../../core/skilld-command.ts'
import { buildModels } from './model-registry.ts'
import { extractToolHint } from './types.ts'

function buildArgs(model: string, skillDir: string, symlinkDirs: string[]): string[] {
  return [
    '-o',
    'stream-json',
    '-m',
    model,
    '--allowed-tools',
    `read_file,write_file,glob_tool,list_directory,search_file_content,run_shell_command(${resolveSkilldCommand()}),run_shell_command(grep),run_shell_command(head)`,
    '--include-directories',
    skillDir,
    ...symlinkDirs.flatMap(d => ['--include-directories', d]),
  ]
}

function parseEvent(line: string): CliEvent {
  try {
    const obj = JSON.parse(line)

    if (obj.type === 'message' && obj.role === 'assistant' && obj.content) {
      return obj.delta ? { kind: 'text', delta: obj.content } : { kind: 'text', full: obj.content }
    }

    if (obj.type === 'tool_use' || obj.type === 'tool_call') {
      const tool = obj.tool_name || obj.name || obj.tool || 'tool'
      const params = obj.parameters || obj.args || obj.input || {}
      const hint = extractToolHint(params)
      const writeContent = tool === 'write_file' && typeof params.content === 'string' ? params.content : undefined
      return { kind: 'tool-call', tool, hint, writeContent }
    }

    if (obj.type === 'result') {
      const s = obj.stats
      return {
        kind: 'done',
        usage: s ? { input: s.input_tokens ?? s.input ?? 0, output: s.output_tokens ?? s.output ?? 0 } : undefined,
        turns: s?.tool_calls,
      }
    }
  }
  catch {}
  return { kind: 'noop' }
}

export const adapter: CliAdapter = {
  cli: 'gemini',
  agentId: 'gemini-cli',
  providerName: 'Google',
  models: buildModels([
    { provider: 'google', prefix: 'gemini-', contains: 'pro', exclude: ['flash', 'live', 'gemma'], hint: 'Most capable' },
    { provider: 'google', prefix: 'gemini-', contains: 'flash', exclude: ['lite', 'live', 'preview'], hint: 'Balanced', recommended: true },
  ]),
  buildArgs,
  parseEvent,
}
