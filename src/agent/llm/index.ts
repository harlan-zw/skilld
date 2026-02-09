/**
 * Minimal LLM provider - spawns CLI directly, no AI SDK
 * Supports claude and gemini CLIs with stream-json output
 *
 * Claude: token-level streaming via --include-partial-messages
 * Gemini: turn-level streaming via -o stream-json
 */

import type { CustomPrompt, SkillSection } from '../prompts'
import type { AgentType } from '../types'
import { exec, spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, realpathSync, unlinkSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'pathe'
import { readCachedSection, writeSections } from '../../cache'
import { sanitizeMarkdown } from '../../core/sanitize'
import { detectInstalledAgents } from '../detect'
import { buildAllSectionPrompts, SECTION_MERGE_ORDER, SECTION_OUTPUT_FILES } from '../prompts'
import { agents } from '../registry'

export { buildAllSectionPrompts, buildSectionPrompt, SECTION_MERGE_ORDER, SECTION_OUTPUT_FILES } from '../prompts'
export type { CustomPrompt, SkillSection } from '../prompts'

export type OptimizeModel
  = | 'opus'
    | 'sonnet'
    | 'haiku'
    | 'gemini-3-pro'
    | 'gemini-3-flash'
    | 'gpt-5.2-codex'
    | 'gpt-5.1-codex-max'
    | 'gpt-5.2'
    | 'gpt-5.1-codex-mini'

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
  section?: SkillSection
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
  docsType?: 'llms.txt' | 'readme' | 'docs'
  hasShippedDocs?: boolean
  onProgress?: (progress: StreamProgress) => void
  timeout?: number
  verbose?: boolean
  debug?: boolean
  noCache?: boolean
  /** Which sections to generate */
  sections?: SkillSection[]
  /** Custom instructions from the user */
  customPrompt?: CustomPrompt
}

export interface OptimizeResult {
  optimized: string
  wasOptimized: boolean
  error?: string
  warnings?: string[]
  reasoning?: string
  finishReason?: string
  usage?: { inputTokens: number, outputTokens: number, totalTokens: number }
  cost?: number
  debugLogsDir?: string
}

interface SectionResult {
  section: SkillSection
  content: string
  wasOptimized: boolean
  error?: string
  warnings?: ValidationWarning[]
  usage?: { input: number, output: number }
  cost?: number
}

const CACHE_DIR = join(homedir(), '.skilld', 'llm-cache')

interface CliModelConfig {
  cli: 'claude' | 'gemini' | 'codex'
  model: string
  name: string
  hint: string
  recommended?: boolean
  agentId: AgentType
}

/** CLI config per model */
const CLI_MODELS: Partial<Record<OptimizeModel, CliModelConfig>> = {
  'opus': { cli: 'claude', model: 'opus', name: 'Opus 4.6', hint: 'Most capable for complex work', agentId: 'claude-code' },
  'sonnet': { cli: 'claude', model: 'sonnet', name: 'Sonnet 4.5', hint: 'Best for everyday tasks', recommended: true, agentId: 'claude-code' },
  'haiku': { cli: 'claude', model: 'haiku', name: 'Haiku 4.5', hint: 'Fastest for quick answers', agentId: 'claude-code' },
  'gemini-3-pro': { cli: 'gemini', model: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', hint: 'Most capable', agentId: 'gemini-cli' },
  'gemini-3-flash': { cli: 'gemini', model: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', hint: 'Balanced', recommended: true, agentId: 'gemini-cli' },
  'gpt-5.2-codex': { cli: 'codex', model: 'gpt-5.2-codex', name: 'GPT-5.2 Codex', hint: 'Frontier agentic coding model', agentId: 'codex' },
  'gpt-5.1-codex-max': { cli: 'codex', model: 'gpt-5.1-codex-max', name: 'GPT-5.1 Codex Max', hint: 'Codex-optimized flagship', agentId: 'codex' },
  'gpt-5.2': { cli: 'codex', model: 'gpt-5.2', name: 'GPT-5.2', hint: 'Latest frontier model', agentId: 'codex' },
  'gpt-5.1-codex-mini': { cli: 'codex', model: 'gpt-5.1-codex-mini', name: 'GPT-5.1 Codex Mini', hint: 'Optimized for codex, cheaper & faster', recommended: true, agentId: 'codex' },
}

export function getModelName(id: OptimizeModel): string {
  return CLI_MODELS[id]?.name ?? id
}

export function getModelLabel(id: OptimizeModel): string {
  const config = CLI_MODELS[id]
  if (!config)
    return id
  const agentName = agents[config.agentId]?.displayName ?? config.cli
  return `${agentName} · ${config.name}`
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

function buildCliArgs(cli: 'claude' | 'gemini' | 'codex', model: string, skillDir: string, _outputFile: string): string[] {
  const symlinkDirs = resolveReferenceDirs(skillDir)

  if (cli === 'claude') {
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
      '--include-partial-messages', // token-level streaming
      '--allowedTools',
      allowedTools,
      '--add-dir',
      skillDir,
      ...symlinkDirs.flatMap(d => ['--add-dir', d]),
      '--no-session-persistence',
    ]
  }

  if (cli === 'codex') {
    // OpenAI Codex CLI — exec subcommand with JSON output
    // Prompt passed via stdin with `-` sentinel
    return [
      'exec',
      '--json',
      '--model',
      model,
      '--full-auto',
      ...symlinkDirs.flatMap(d => ['--add-dir', d]),
      '-',
    ]
  }

  // gemini
  return [
    '-o',
    'stream-json',
    '-m',
    model,
    '--allowed-tools',
    'read_file,write_file,list_directory,glob_tool',
    '--include-directories',
    skillDir,
    ...symlinkDirs.flatMap(d => ['--include-directories', d]),
  ]
}

// ── Cache ────────────────────────────────────────────────────────────

/** Strip absolute paths from prompt so the hash is project-independent */
function normalizePromptForHash(prompt: string): string {
  // Replace absolute skill dir paths with placeholder
  // e.g. /home/user/project/.claude/skills/vue → <SKILL_DIR>
  return prompt.replace(/\/[^\s`]*\.claude\/skills\/[^\s/`]+/g, '<SKILL_DIR>')
}

function hashPrompt(prompt: string, model: OptimizeModel, section: SkillSection): string {
  return createHash('sha256').update(`exec:${model}:${section}:${normalizePromptForHash(prompt)}`).digest('hex').slice(0, 16)
}

function getCached(prompt: string, model: OptimizeModel, section: SkillSection, maxAge = 7 * 24 * 60 * 60 * 1000): string | null {
  const path = join(CACHE_DIR, `${hashPrompt(prompt, model, section)}.json`)
  if (!existsSync(path))
    return null
  try {
    const { text, timestamp } = JSON.parse(readFileSync(path, 'utf-8'))
    return Date.now() - timestamp > maxAge ? null : text
  }
  catch { return null }
}

function setCache(prompt: string, model: OptimizeModel, section: SkillSection, text: string): void {
  mkdirSync(CACHE_DIR, { recursive: true, mode: 0o700 })
  writeFileSync(
    join(CACHE_DIR, `${hashPrompt(prompt, model, section)}.json`),
    JSON.stringify({ text, model, section, timestamp: Date.now() }),
    { mode: 0o600 },
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
  /** Content from a Write tool call (fallback if Write is denied) */
  writeContent?: string
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
      return { toolName: obj.tool_name || obj.name || obj.tool || 'tool' }
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

/**
 * Parse codex CLI exec --json output
 *
 * Real event types observed:
 * - thread.started → session start (thread_id)
 * - turn.started / turn.completed → turn lifecycle + usage
 * - item.started → command_execution in progress
 * - item.completed → agent_message (text), reasoning, command_execution (result)
 * - error / turn.failed → errors
 */
function parseCodexLine(line: string): ParsedEvent {
  try {
    const obj = JSON.parse(line)

    if (obj.type === 'item.completed' && obj.item) {
      const item = obj.item
      // Agent message — the main text output
      if (item.type === 'agent_message' && item.text)
        return { fullText: item.text }
      // Command execution completed — log as tool progress, NOT writeContent
      // (aggregated_output is bash stdout, not the section content to write)
      if (item.type === 'command_execution' && item.aggregated_output)
        return { toolName: 'Bash', toolHint: `(${item.aggregated_output.length} chars output)` }
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

// ── Per-section spawn ────────────────────────────────────────────────

interface OptimizeSectionOptions {
  section: SkillSection
  prompt: string
  outputFile: string
  skillDir: string
  model: OptimizeModel
  packageName: string
  onProgress?: (progress: StreamProgress) => void
  timeout: number
  debug?: boolean
  preExistingFiles: Set<string>
}

/** Spawn a single CLI process for one section */
function optimizeSection(opts: OptimizeSectionOptions): Promise<SectionResult> {
  const { section, prompt, outputFile, skillDir, model, onProgress, timeout, debug, preExistingFiles } = opts

  const cliConfig = CLI_MODELS[model]
  if (!cliConfig) {
    return Promise.resolve({ section, content: '', wasOptimized: false, error: `No CLI mapping for model: ${model}` })
  }

  const { cli, model: cliModel } = cliConfig
  const args = buildCliArgs(cli, cliModel, skillDir, outputFile)
  const parseLine = cli === 'claude' ? parseClaudeLine : cli === 'codex' ? parseCodexLine : parseGeminiLine

  const skilldDir = join(skillDir, '.skilld')
  const outputPath = join(skilldDir, outputFile)

  // Remove stale output so we don't read a leftover from a previous run
  if (existsSync(outputPath))
    unlinkSync(outputPath)

  // Write prompt for debugging
  writeFileSync(join(skilldDir, `PROMPT_${section}.md`), prompt)

  return new Promise<SectionResult>((resolve) => {
    const proc = spawn(cli, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout,
      env: { ...process.env, NO_COLOR: '1' },
    })

    let buffer = ''
    let accumulatedText = ''
    let lastWriteContent = ''
    let usage: { input: number, output: number } | undefined
    let cost: number | undefined
    const rawLines: string[] = []

    onProgress?.({ chunk: '[starting...]', type: 'reasoning', text: '', reasoning: '', section })

    proc.stdin.write(prompt)
    proc.stdin.end()

    proc.stdout.on('data', (chunk: Buffer) => {
      buffer += chunk.toString()
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.trim())
          continue
        if (debug)
          rawLines.push(line)
        const evt = parseLine(line)

        if (evt.textDelta)
          accumulatedText += evt.textDelta
        if (evt.fullText)
          accumulatedText = evt.fullText

        if (evt.writeContent)
          lastWriteContent = evt.writeContent

        if (evt.toolName) {
          const hint = evt.toolHint
            ? `[${evt.toolName}: ${shortenPath(evt.toolHint)}]`
            : `[${evt.toolName}]`
          onProgress?.({ chunk: hint, type: 'reasoning', text: '', reasoning: hint, section })
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
        if (evt.textDelta)
          accumulatedText += evt.textDelta
        if (evt.fullText)
          accumulatedText = evt.fullText
        if (evt.writeContent)
          lastWriteContent = evt.writeContent
        if (evt.usage)
          usage = evt.usage
        if (evt.cost != null)
          cost = evt.cost
      }

      // Remove unexpected files the LLM may have written (prompt injection defense)
      // Only clean files not in the pre-existing snapshot and not our expected output
      for (const entry of readdirSync(skilldDir)) {
        if (entry !== outputFile && !preExistingFiles.has(entry)) {
          // Allow other section output files and debug prompts
          if (Object.values(SECTION_OUTPUT_FILES).includes(entry))
            continue
          if (entry.startsWith('PROMPT_') || entry === 'logs')
            continue
          try {
            unlinkSync(join(skilldDir, entry))
          }
          catch {}
        }
      }

      // Prefer file written by LLM, fall back to Write tool content (if denied), then accumulated stdout
      const raw = (existsSync(outputPath) ? readFileSync(outputPath, 'utf-8') : lastWriteContent || accumulatedText).trim()

      // Write debug logs: raw stream + raw text output
      if (debug) {
        const logsDir = join(skilldDir, 'logs')
        mkdirSync(logsDir, { recursive: true })
        const logName = section.toUpperCase().replace(/-/g, '_')
        if (rawLines.length)
          writeFileSync(join(logsDir, `${logName}.jsonl`), rawLines.join('\n'))
        if (raw)
          writeFileSync(join(logsDir, `${logName}.md`), raw)
        if (stderr)
          writeFileSync(join(logsDir, `${logName}.stderr.log`), stderr)
      }

      if (!raw && code !== 0) {
        resolve({ section, content: '', wasOptimized: false, error: stderr.trim() || `CLI exited with code ${code}` })
        return
      }

      // Clean the section output (strip markdown fences, frontmatter, sanitize)
      const content = raw ? cleanSectionOutput(raw) : ''

      if (content) {
        // Write cleaned content back to the output file for debugging
        writeFileSync(outputPath, content)
      }

      const warnings = content ? validateSectionOutput(content, section) : undefined

      resolve({
        section,
        content,
        wasOptimized: !!content,
        warnings: warnings?.length ? warnings : undefined,
        usage,
        cost,
      })
    })

    proc.on('error', (err) => {
      resolve({ section, content: '', wasOptimized: false, error: err.message })
    })
  })
}

// ── Main orchestrator ────────────────────────────────────────────────

export async function optimizeDocs(opts: OptimizeDocsOptions): Promise<OptimizeResult> {
  const { packageName, skillDir, model = 'sonnet', version, hasGithub, hasReleases, hasChangelog, docFiles, docsType, hasShippedDocs, onProgress, timeout = 180000, debug, noCache, sections, customPrompt } = opts

  const selectedSections = sections ?? ['llm-gaps', 'best-practices', 'api'] as SkillSection[]

  // Build all section prompts
  const sectionPrompts = buildAllSectionPrompts({
    packageName,
    skillDir,
    version,
    hasIssues: hasGithub,
    hasDiscussions: hasGithub,
    hasReleases,
    hasChangelog,
    docFiles,
    docsType,
    hasShippedDocs,
    customPrompt,
    sections: selectedSections,
  })

  if (sectionPrompts.size === 0) {
    return { optimized: '', wasOptimized: false, error: 'No valid sections to generate' }
  }

  const cliConfig = CLI_MODELS[model]
  if (!cliConfig) {
    return { optimized: '', wasOptimized: false, error: `No CLI mapping for model: ${model}` }
  }

  // Check per-section cache: references dir first (version-keyed), then LLM cache (prompt-hashed)
  const cachedResults: SectionResult[] = []
  const uncachedSections: Array<{ section: SkillSection, prompt: string }> = []

  for (const [section, prompt] of sectionPrompts) {
    if (!noCache) {
      // Check global references dir (cross-project, version-keyed)
      if (version) {
        const outputFile = SECTION_OUTPUT_FILES[section]
        const refCached = readCachedSection(packageName, version, outputFile)
        if (refCached) {
          onProgress?.({ chunk: `[${section}: cached]`, type: 'text', text: refCached, reasoning: '', section })
          cachedResults.push({ section, content: refCached, wasOptimized: true })
          continue
        }
      }

      // Check LLM prompt-hash cache
      const cached = getCached(prompt, model, section)
      if (cached) {
        onProgress?.({ chunk: `[${section}: cached]`, type: 'text', text: cached, reasoning: '', section })
        cachedResults.push({ section, content: cached, wasOptimized: true })
        continue
      }
    }
    uncachedSections.push({ section, prompt })
  }

  // Prepare .skilld/ dir and snapshot before spawns
  const skilldDir = join(skillDir, '.skilld')
  mkdirSync(skilldDir, { recursive: true })
  const preExistingFiles = new Set(readdirSync(skilldDir))

  // Spawn uncached sections in parallel
  const spawnResults = uncachedSections.length > 0
    ? await Promise.allSettled(
        uncachedSections.map(({ section, prompt }) => {
          const outputFile = SECTION_OUTPUT_FILES[section]
          return optimizeSection({
            section,
            prompt,
            outputFile,
            skillDir,
            model,
            packageName,
            onProgress,
            timeout,
            debug,
            preExistingFiles,
          })
        }),
      )
    : []

  // Collect all results
  const allResults: SectionResult[] = [...cachedResults]
  let totalUsage: { input: number, output: number } | undefined
  let totalCost = 0

  for (let i = 0; i < spawnResults.length; i++) {
    const r = spawnResults[i]!
    const { section, prompt } = uncachedSections[i]!
    if (r.status === 'fulfilled') {
      const result = r.value
      allResults.push(result)
      // Cache successful results
      if (result.wasOptimized && !noCache) {
        setCache(prompt, model, section, result.content)
      }
      if (result.usage) {
        totalUsage = totalUsage ?? { input: 0, output: 0 }
        totalUsage.input += result.usage.input
        totalUsage.output += result.usage.output
      }
      if (result.cost != null) {
        totalCost += result.cost
      }
    }
    else {
      allResults.push({ section, content: '', wasOptimized: false, error: String(r.reason) })
    }
  }

  // Write successful sections to global references dir for cross-project reuse
  if (version) {
    const sectionFiles = allResults
      .filter(r => r.wasOptimized && r.content)
      .map(r => ({ file: SECTION_OUTPUT_FILES[r.section], content: r.content }))
    if (sectionFiles.length > 0) {
      writeSections(packageName, version, sectionFiles)
    }
  }

  // Merge results in SECTION_MERGE_ORDER
  const mergedParts: string[] = []
  for (const section of SECTION_MERGE_ORDER) {
    const result = allResults.find(r => r.section === section)
    if (result?.wasOptimized && result.content) {
      mergedParts.push(result.content)
    }
  }

  const optimized = mergedParts.join('\n\n')
  const wasOptimized = mergedParts.length > 0

  const usageResult = totalUsage
    ? { inputTokens: totalUsage.input, outputTokens: totalUsage.output, totalTokens: totalUsage.input + totalUsage.output }
    : undefined

  // Collect errors and warnings from sections
  const errors = allResults.filter(r => r.error).map(r => `${r.section}: ${r.error}`)
  const warnings = allResults.flatMap(r => r.warnings ?? []).map(w => `${w.section}: ${w.warning}`)

  const debugLogsDir = debug && uncachedSections.length > 0
    ? join(skillDir, '.skilld', 'logs')
    : undefined

  return {
    optimized,
    wasOptimized,
    error: errors.length > 0 ? errors.join('; ') : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    finishReason: wasOptimized ? 'stop' : 'error',
    usage: usageResult,
    cost: totalCost || undefined,
    debugLogsDir,
  }
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

// ── Validation ───────────────────────────────────────────────────────

/** Max lines per section — generous thresholds (2x prompt guidance) to flag only egregious overruns */
const SECTION_MAX_LINES: Record<string, number> = {
  'llm-gaps': 160,
  'best-practices': 300,
  'api': 160,
  'custom': 160,
}

interface ValidationWarning {
  section: string
  warning: string
}

/** Validate a section's output against heuristic quality checks */
function validateSectionOutput(content: string, section: SkillSection): ValidationWarning[] {
  const warnings: ValidationWarning[] = []
  const lines = content.split('\n').length
  const maxLines = SECTION_MAX_LINES[section]

  if (maxLines && lines > maxLines * 1.5) {
    warnings.push({ section, warning: `Output ${lines} lines exceeds ${maxLines} max by >50%` })
  }

  if (lines < 3) {
    warnings.push({ section, warning: `Output only ${lines} lines — likely too sparse` })
  }

  return warnings
}

/** Clean a single section's LLM output: strip markdown fences, frontmatter, sanitize */
function cleanSectionOutput(content: string): string {
  let cleaned = content
    .replace(/^```markdown\n?/m, '')
    .replace(/\n?```$/m, '')
    .trim()

  // Strip accidental frontmatter or leading horizontal rules
  const fmMatch = cleaned.match(/^-{3,}\n/)
  if (fmMatch) {
    const afterOpen = fmMatch[0].length
    const closeMatch = cleaned.slice(afterOpen).match(/\n-{3,}/)
    if (closeMatch) {
      cleaned = cleaned.slice(afterOpen + closeMatch.index! + closeMatch[0].length).trim()
    }
    else {
      cleaned = cleaned.slice(afterOpen).trim()
    }
  }

  // Strip raw code preamble before first section marker (defense against LLMs dumping source)
  // Section markers: ## heading, ⚠️ warning, ✅ best practice
  const firstMarker = cleaned.match(/^(##\s|⚠️|✅)/m)
  if (firstMarker?.index && firstMarker.index > 0) {
    const preamble = cleaned.slice(0, firstMarker.index)
    // Only strip if preamble looks like code (contains function/const/export/return patterns)
    if (/\b(?:function|const |let |var |export |return |import |async |class )\b/.test(preamble)) {
      cleaned = cleaned.slice(firstMarker.index).trim()
    }
  }

  cleaned = sanitizeMarkdown(cleaned)

  return cleaned
}
