/**
 * Minimal LLM provider - spawns CLI directly, no AI SDK
 * Supports claude and gemini CLIs with stream-json output
 *
 * Claude: token-level streaming via --include-partial-messages
 * Gemini: turn-level streaming via -o stream-json
 */

import type { OptimizeDocsOptions, OptimizeModel, OptimizeResult } from './index'
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { buildSkillPrompt } from '../prompts'

export { buildSkillPrompt } from '../prompts'

const CACHE_DIR = join(homedir(), '.skilld', 'llm-cache')

/** CLI config per model */
const CLI_MODELS: Partial<Record<OptimizeModel, { cli: 'claude' | 'gemini', model: string }>> = {
  'opus': { cli: 'claude', model: 'opus' },
  'sonnet': { cli: 'claude', model: 'sonnet' },
  'haiku': { cli: 'claude', model: 'haiku' },
  'gemini-2.5-pro': { cli: 'gemini', model: 'gemini-2.5-pro' },
  'gemini-2.5-flash': { cli: 'gemini', model: 'gemini-2.5-flash' },
  'gemini-2.5-flash-lite': { cli: 'gemini', model: 'gemini-2.5-flash-lite' },
  'gemini-3-pro': { cli: 'gemini', model: 'gemini-3-pro-preview' },
  'gemini-3-flash': { cli: 'gemini', model: 'gemini-3-flash-preview' },
}

/** Resolve symlinks in references/ to get real paths for --add-dir */
function resolveReferenceDirs(skillDir: string): string[] {
  const refsDir = join(skillDir, 'references')
  if (!existsSync(refsDir))
    return []
  return readdirSync(refsDir)
    .map(entry => join(refsDir, entry))
    .filter(p => lstatSync(p).isSymbolicLink())
    .map(p => realpathSync(p))
}

function buildCliArgs(cli: 'claude' | 'gemini', model: string, skillDir: string): string[] {
  const symlinkDirs = resolveReferenceDirs(skillDir)

  if (cli === 'claude') {
    return [
      '-p',
      '--model',
      model,
      '--output-format',
      'stream-json',
      '--verbose',
      '--include-partial-messages', // token-level streaming
      '--allowedTools',
      'Read Glob Grep WebSearch',
      '--add-dir',
      skillDir,
      ...symlinkDirs.flatMap(d => ['--add-dir', d]),
      '--dangerously-skip-permissions',
      '--no-session-persistence',
    ]
  }
  return [
    '-o',
    'stream-json',
    '-m',
    model,
    '-y', // auto-approve tools
    '--include-directories',
    skillDir,
    ...symlinkDirs.flatMap(d => ['--include-directories', d]),
  ]
}

// ── Cache ────────────────────────────────────────────────────────────

function hashPrompt(prompt: string, model: OptimizeModel): string {
  return createHash('sha256').update(`exec:${model}:${prompt}`).digest('hex').slice(0, 16)
}

function getCached(prompt: string, model: OptimizeModel, maxAge = 7 * 24 * 60 * 60 * 1000): string | null {
  const path = join(CACHE_DIR, `${hashPrompt(prompt, model)}.json`)
  if (!existsSync(path))
    return null
  try {
    const { text, timestamp } = JSON.parse(readFileSync(path, 'utf-8'))
    return Date.now() - timestamp > maxAge ? null : text
  }
  catch { return null }
}

function setCache(prompt: string, model: OptimizeModel, text: string): void {
  mkdirSync(CACHE_DIR, { recursive: true })
  writeFileSync(
    join(CACHE_DIR, `${hashPrompt(prompt, model)}.json`),
    JSON.stringify({ text, model, timestamp: Date.now() }),
  )
}

// ── Stream event parsing ─────────────────────────────────────────────

interface ParsedEvent {
  /** Token-level text delta */
  textDelta?: string
  /** Complete text from a full message (non-partial) */
  fullText?: string
  /** Tool name being invoked */
  toolName?: string
  /** Tool input hint (file path, query, etc) */
  toolHint?: string
  /** Stream finished */
  done?: boolean
  /** Token usage */
  usage?: { input: number, output: number }
  /** Cost in USD */
  cost?: number
  /** Number of agentic turns */
  turns?: number
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
function parseClaudeLine(line: string): ParsedEvent {
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

      // Tool use starting — get tool name early
      if (evt.type === 'content_block_start' && evt.content_block?.type === 'tool_use') {
        return { toolName: evt.content_block.name }
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
        return { toolName: names.join(', '), toolHint: hint || undefined }
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

/**
 * Parse gemini stream-json events
 * Gemini streams at turn level (full message per event)
 */
function parseGeminiLine(line: string): ParsedEvent {
  try {
    const obj = JSON.parse(line)

    // Text message (delta or full)
    if (obj.type === 'message' && obj.role === 'assistant' && obj.content) {
      return obj.delta ? { textDelta: obj.content } : { fullText: obj.content }
    }

    // Tool invocation
    if (obj.type === 'tool_use' || obj.type === 'tool_call') {
      return { toolName: obj.name || obj.tool || 'tool' }
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

// ── Main ─────────────────────────────────────────────────────────────

export async function optimizeDocs(opts: OptimizeDocsOptions): Promise<OptimizeResult> {
  const { packageName, skillDir, dbPath, model = 'sonnet', version, hasIssues, docFiles, onProgress, timeout = 180000, noCache } = opts
  const prompt = buildSkillPrompt({ packageName, skillDir, version, hasIssues, docFiles })

  // Cache check
  if (!noCache) {
    const cached = getCached(prompt, model)
    if (cached) {
      onProgress?.({ chunk: '[cached]', type: 'text', text: cached, reasoning: '' })
      return { optimized: cached, wasOptimized: true, finishReason: 'cached' }
    }
  }

  const cliConfig = CLI_MODELS[model]
  if (!cliConfig) {
    return { optimized: '', wasOptimized: false, error: `No CLI mapping for model: ${model}` }
  }

  const { cli, model: cliModel } = cliConfig
  const args = buildCliArgs(cli, cliModel, skillDir)
  const parseLine = cli === 'claude' ? parseClaudeLine : parseGeminiLine

  return new Promise<OptimizeResult>((resolve) => {
    const proc = spawn(cli, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout,
      env: { ...process.env, NO_COLOR: '1' },
    })

    let fullText = ''
    let buffer = ''
    let usage: { input: number, output: number } | undefined
    let cost: number | undefined
    let turns: number | undefined
    let lastToolHint = ''

    onProgress?.({ chunk: '[starting...]', type: 'reasoning', text: '', reasoning: '' })

    // Both CLIs read prompt from stdin
    proc.stdin.write(prompt)
    proc.stdin.end()

    proc.stdout.on('data', (chunk: Buffer) => {
      buffer += chunk.toString()
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // keep incomplete last line

      for (const line of lines) {
        if (!line.trim())
          continue
        const evt = parseLine(line)

        // Tool invocation → reasoning progress
        if (evt.toolName) {
          const hint = evt.toolHint
            ? `[${evt.toolName}: ${shortenPath(evt.toolHint)}]`
            : `[${evt.toolName}]`
          lastToolHint = hint
          onProgress?.({ chunk: hint, type: 'reasoning', text: fullText, reasoning: hint })
        }

        // Token-level text delta → streaming text
        if (evt.textDelta) {
          fullText += evt.textDelta
          onProgress?.({ chunk: evt.textDelta, type: 'text', text: fullText, reasoning: '' })
        }

        // Full text (non-partial fallback)
        if (evt.fullText) {
          fullText = evt.fullText // replace, not append — this is the complete message
          onProgress?.({ chunk: evt.fullText, type: 'text', text: fullText, reasoning: '' })
        }

        // Metadata
        if (evt.usage)
          usage = evt.usage
        if (evt.cost != null)
          cost = evt.cost
        if (evt.turns != null)
          turns = evt.turns
      }
    })

    let stderr = ''
    proc.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString() })

    proc.on('close', (code) => {
      // Drain remaining buffer
      if (buffer.trim()) {
        const evt = parseLine(buffer)
        if (evt.textDelta)
          fullText += evt.textDelta
        if (evt.fullText)
          fullText = evt.fullText
        if (evt.usage)
          usage = evt.usage
        if (evt.cost != null)
          cost = evt.cost
      }

      if (code !== 0 && !fullText.trim()) {
        resolve({ optimized: '', wasOptimized: false, error: stderr.trim() || `CLI exited with code ${code}` })
        return
      }

      const optimized = cleanOutput(fullText)

      if (!noCache && optimized) {
        setCache(prompt, model, optimized)
      }

      const usageResult = usage
        ? { inputTokens: usage.input, outputTokens: usage.output, totalTokens: usage.input + usage.output }
        : undefined

      resolve({
        optimized,
        wasOptimized: !!optimized,
        finishReason: code === 0 ? 'stop' : 'error',
        usage: usageResult,
        cost,
      })
    })

    proc.on('error', (err) => {
      resolve({ optimized: '', wasOptimized: false, error: err.message })
    })
  })
}

// ── Helpers ──────────────────────────────────────────────────────────

/** Shorten absolute paths for display: /home/.../references/docs/guide.md → docs/guide.md */
function shortenPath(p: string): string {
  const refIdx = p.indexOf('references/')
  if (refIdx !== -1)
    return p.slice(refIdx + 'references/'.length)
  // Keep just filename for other paths
  const parts = p.split('/')
  return parts.length > 2 ? `.../${parts.slice(-2).join('/')}` : p
}

/** Clean LLM output - extract between markers, strip artifacts */
function cleanOutput(text: string): string {
  let cleaned = text.replace(/^```markdown\n?/m, '').replace(/\n?```$/m, '')
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/g, '')

  const beginMatch = cleaned.match(/<!--\s*BEGIN\s*-->/)
  const endMatch = cleaned.match(/<!--\s*END\s*-->/)

  if (beginMatch && endMatch) {
    const startIdx = beginMatch.index! + beginMatch[0].length
    const endIdx = cleaned.lastIndexOf(endMatch[0])
    if (endIdx > startIdx) {
      cleaned = cleaned.slice(startIdx, endIdx).trim()
    }
  }
  else if (!beginMatch) {
    cleaned = cleaned.replace(/^---[\s\S]*?---\n*/m, '')
  }

  // Detect outline-mode failures
  const outlinePatterns = [
    /Would you like me to (?:write|create|generate)/i,
    /The document is \*{0,2}\d+ lines\*{0,2}/i,
    /^## Key Content\s*$/m,
    /focuses (?:on|exclusively on) (?:non-obvious|expert)/i,
  ]
  for (const pattern of outlinePatterns) {
    if (pattern.test(cleaned))
      return ''
  }

  // Strip leaked thinking
  const contentStart = cleaned.search(/^\*\*PITFALL|^\*\*BEST PRACTICE|^```/m)
  if (contentStart > 0) {
    const prefix = cleaned.slice(0, contentStart)
    if (/Let me|I'll|I will|Now |First,|Looking at|Examining|Perfect!|Here's|I've/i.test(prefix)) {
      cleaned = cleaned.slice(contentStart)
    }
  }

  return cleaned.trim()
}
