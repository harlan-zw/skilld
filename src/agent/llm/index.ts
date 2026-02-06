/**
 * Minimal LLM provider - spawns CLI directly, no AI SDK
 * Supports claude and gemini CLIs with stream-json output
 *
 * Claude: token-level streaming via --include-partial-messages
 * Gemini: turn-level streaming via -o stream-json
 */

import type { SkillSection } from '../prompts'
import type { AgentType } from '../types'
import { exec, spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { detectInstalledAgents } from '../detect'
import { buildSkillPrompt } from '../prompts'
import { agents } from '../registry'

export { buildSkillPrompt } from '../prompts'
export type { SkillSection } from '../prompts'

export type OptimizeModel
  = | 'opus'
    | 'sonnet'
    | 'haiku'
    | 'gemini-3-pro'
    | 'gemini-3-flash'
    | 'gemini-2.5-pro'
    | 'gemini-2.5-flash'
    | 'gemini-2.5-flash-lite'
    | 'codex'

export interface ModelInfo {
  id: OptimizeModel
  name: string
  hint: string
  recommended?: boolean
  agentId: string
  agentName: string
}

export interface StreamProgress {
  chunk: string
  type: 'reasoning' | 'text'
  text: string
  reasoning: string
}

export interface OptimizeDocsOptions {
  packageName: string
  skillDir: string
  model?: OptimizeModel
  version?: string
  hasGithub?: boolean
  hasReleases?: boolean
  hasChangelog?: string | false
  docFiles?: string[]
  onProgress?: (progress: StreamProgress) => void
  timeout?: number
  verbose?: boolean
  noCache?: boolean
  /** Which sections to generate */
  sections?: SkillSection[]
  /** Custom instructions from the user */
  customPrompt?: string
}

export interface OptimizeResult {
  optimized: string
  wasOptimized: boolean
  error?: string
  reasoning?: string
  finishReason?: string
  usage?: { inputTokens: number, outputTokens: number, totalTokens: number }
  cost?: number
}

const CACHE_DIR = join(homedir(), '.skilld', 'llm-cache')

interface CliModelConfig {
  cli: 'claude' | 'gemini'
  model: string
  name: string
  hint: string
  recommended?: boolean
  agentId: AgentType
}

/** CLI config per model */
const CLI_MODELS: Partial<Record<OptimizeModel, CliModelConfig>> = {
  'opus': { cli: 'claude', model: 'opus', name: 'Opus 4.5', hint: 'Most capable', agentId: 'claude-code' },
  'sonnet': { cli: 'claude', model: 'sonnet', name: 'Sonnet 4.5', hint: 'Balanced', recommended: true, agentId: 'claude-code' },
  'haiku': { cli: 'claude', model: 'haiku', name: 'Haiku 4.5', hint: 'Fastest', agentId: 'claude-code' },
  'gemini-2.5-pro': { cli: 'gemini', model: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', hint: 'Most capable', agentId: 'gemini-cli' },
  'gemini-2.5-flash': { cli: 'gemini', model: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', hint: 'Balanced', agentId: 'gemini-cli' },
  'gemini-2.5-flash-lite': { cli: 'gemini', model: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', hint: 'Fastest', agentId: 'gemini-cli' },
  'gemini-3-pro': { cli: 'gemini', model: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', hint: 'Most capable', agentId: 'gemini-cli' },
  'gemini-3-flash': { cli: 'gemini', model: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', hint: 'Balanced', agentId: 'gemini-cli' },
}

export function getModelName(id: OptimizeModel): string {
  return CLI_MODELS[id]?.name ?? id
}

export async function getAvailableModels(): Promise<ModelInfo[]> {
  const { promisify } = await import('node:util')
  const execAsync = promisify(exec)

  const installedAgents = detectInstalledAgents()
  const agentsWithCli = installedAgents.filter(id => agents[id].cli)

  const cliChecks = await Promise.all(
    agentsWithCli.map(async (agentId) => {
      const cli = agents[agentId].cli!
      try {
        await execAsync(`which ${cli}`)
        return agentId
      }
      catch { return null }
    }),
  )
  const availableAgentIds = new Set(cliChecks.filter((id): id is AgentType => id != null))

  return (Object.entries(CLI_MODELS) as [OptimizeModel, CliModelConfig][])
    .filter(([_, config]) => availableAgentIds.has(config.agentId))
    .map(([id, config]) => ({
      id,
      name: config.name,
      hint: config.hint,
      recommended: config.recommended,
      agentId: config.agentId,
      agentName: agents[config.agentId]?.displayName ?? config.agentId,
    }))
}

/** Resolve symlinks in .skilld/ to get real paths for --add-dir */
function resolveReferenceDirs(skillDir: string): string[] {
  const refsDir = join(skillDir, '.skilld')
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
      'Read Glob Grep Write',
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
  const { packageName, skillDir, model = 'sonnet', version, hasGithub, docFiles, onProgress, timeout = 180000, noCache, sections, customPrompt } = opts
  const prompt = buildSkillPrompt({ packageName, skillDir, version, hasGithub, docFiles, sections, customPrompt })

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

  // Write prompt for debugging
  writeFileSync(join(skillDir, 'PROMPT.md'), prompt)

  const outputPath = join(skillDir, '__SKILL.md')

  return new Promise<OptimizeResult>((resolve) => {
    const proc = spawn(cli, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout,
      env: { ...process.env, NO_COLOR: '1' },
    })

    let buffer = ''
    let usage: { input: number, output: number } | undefined
    let cost: number | undefined

    onProgress?.({ chunk: '[starting...]', type: 'reasoning', text: '', reasoning: '' })

    proc.stdin.write(prompt)
    proc.stdin.end()

    proc.stdout.on('data', (chunk: Buffer) => {
      buffer += chunk.toString()
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.trim())
          continue
        const evt = parseLine(line)

        if (evt.toolName) {
          const hint = evt.toolHint
            ? `[${evt.toolName}: ${shortenPath(evt.toolHint)}]`
            : `[${evt.toolName}]`
          onProgress?.({ chunk: hint, type: 'reasoning', text: '', reasoning: hint })
        }

        if (evt.usage)
          usage = evt.usage
        if (evt.cost != null)
          cost = evt.cost
      }
    })

    let stderr = ''
    proc.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
    })

    proc.on('close', (code) => {
      // Drain remaining buffer for metadata
      if (buffer.trim()) {
        const evt = parseLine(buffer)
        if (evt.usage)
          usage = evt.usage
        if (evt.cost != null)
          cost = evt.cost
      }

      // Read agent output from __SKILL.md
      const optimized = existsSync(outputPath)
        ? readFileSync(outputPath, 'utf-8').trim()
        : ''

      if (!optimized && code !== 0) {
        resolve({ optimized: '', wasOptimized: false, error: stderr.trim() || `CLI exited with code ${code}` })
        return
      }

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

/** Shorten absolute paths for display: /home/.../.skilld/docs/guide.md → docs/guide.md */
function shortenPath(p: string): string {
  const refIdx = p.indexOf('.skilld/')
  if (refIdx !== -1)
    return p.slice(refIdx + '.skilld/'.length)
  // Keep just filename for other paths
  const parts = p.split('/')
  return parts.length > 2 ? `.../${parts.slice(-2).join('/')}` : p
}
