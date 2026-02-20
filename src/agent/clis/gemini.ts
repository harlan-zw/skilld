/**
 * Gemini CLI — turn-level streaming via -o stream-json
 * Write scoping: relies on cwd being set to .skilld/ (no native --writeable-dirs)
 */

import type { CliModelEntry, ParsedEvent } from './types.ts'
import { resolveSkilldCommand } from '../../core/shared.ts'

export const cli = 'gemini' as const
export const agentId = 'gemini-cli' as const

export const models: Record<string, CliModelEntry> = {
  'gemini-3-pro': { model: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', hint: 'Most capable' },
  'gemini-3-flash': { model: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', hint: 'Balanced', recommended: true },
}

export function buildArgs(model: string, skillDir: string, symlinkDirs: string[]): string[] {
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

/** Parse gemini stream-json events — turn level (full message per event) */
export function parseLine(line: string): ParsedEvent {
  try {
    const obj = JSON.parse(line)

    // Text message (delta or full)
    if (obj.type === 'message' && obj.role === 'assistant' && obj.content) {
      return obj.delta ? { textDelta: obj.content } : { fullText: obj.content }
    }

    // Tool invocation
    if (obj.type === 'tool_use' || obj.type === 'tool_call') {
      const name = obj.tool_name || obj.name || obj.tool || 'tool'
      const params = obj.parameters || obj.args || obj.input || {}
      const hint = params.file_path || params.path || params.dir_path || params.pattern || params.query || params.command || ''
      // Capture write_file content as fallback (matches Claude's Write tool behavior)
      if (name === 'write_file' && params.content) {
        return { toolName: name, toolHint: hint || undefined, writeContent: params.content }
      }
      return { toolName: name, toolHint: hint || undefined }
    }

    // Final result
    if (obj.type === 'result') {
      const s = obj.stats
      return {
        done: true,
        usage: s ? { input: s.input_tokens ?? s.input ?? 0, output: s.output_tokens ?? s.output ?? 0 } : undefined,
        turns: s?.tool_calls,
      }
    }
  }
  catch {}
  return {}
}
