/**
 * LLM-based documentation optimization using AI SDK
 * Uses fullStream for reasoning visibility + text extraction
 */

import { exec } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { generateText, smoothStream, stepCountIs, streamText, tool } from 'ai'
import { claudeCode } from 'ai-sdk-provider-claude-code'
import { codexCli } from 'ai-sdk-provider-codex-cli'
import { createGeminiProvider } from 'ai-sdk-provider-gemini-cli'
import { z } from 'zod'
import { detectInstalledAgents } from '../detect'
import { buildSkillPrompt } from '../prompts'
import { agents } from '../registry'

/** Response cache directory */
const CACHE_DIR = join(homedir(), '.skilld', 'llm-cache')

const execAsync = promisify(exec)

export { buildSkillPrompt } from '../prompts'

export type OptimizeModel
  // Claude Code
  = | 'opus'
    | 'sonnet'
    | 'haiku'
  // Gemini CLI
    | 'gemini-3-pro'
    | 'gemini-3-flash'
    | 'gemini-2.5-pro'
    | 'gemini-2.5-flash'
    | 'gemini-2.5-flash-lite'
  // Codex
    | 'codex'

/** Model-specific configuration */
interface ModelConfig {
  /** The AI SDK model instance */
  model: ReturnType<typeof claudeCode>
  /** Display name */
  name: string
  /** Short hint for UI */
  hint: string
  /** Recommended model */
  recommended?: boolean
  /** CLI command to check availability */
  cli: string
  /** Agent that provides this model */
  agentId: 'claude-code' | 'gemini-cli' | 'codex'
  /** Temperature (lower = more consistent) */
  temperature: number
  /** Max output tokens */
  maxOutputTokens: number
  /** Pricing per 1M tokens (input, output) in USD */
  pricing: { input: number, output: number }
}

/** Model configurations with pricing and settings */
const MODEL_CONFIG: Record<OptimizeModel, ModelConfig> = {
  // Claude Code models
  'opus': {
    model: claudeCode('opus'),
    name: 'Opus 4.5',
    hint: 'Most capable',
    cli: 'claude',
    agentId: 'claude-code',
    temperature: 0.3,
    maxOutputTokens: 8000,
    pricing: { input: 15.0, output: 75.0 },
  },
  'sonnet': {
    model: claudeCode('sonnet'),
    name: 'Sonnet 4.5',
    hint: 'Balanced',
    recommended: true,
    cli: 'claude',
    agentId: 'claude-code',
    temperature: 0.3,
    maxOutputTokens: 8000,
    pricing: { input: 3.0, output: 15.0 },
  },
  'haiku': {
    model: claudeCode('haiku'),
    name: 'Haiku 4.5',
    hint: 'Fastest',
    cli: 'claude',
    agentId: 'claude-code',
    temperature: 0.4,
    maxOutputTokens: 8000,
    pricing: { input: 0.25, output: 1.25 },
  },
  // Gemini CLI models
  'gemini-3-pro': {
    model: createGeminiProvider()('gemini-3-pro-preview'),
    name: 'Gemini 3 Pro',
    hint: 'Most capable',
    cli: 'gemini',
    agentId: 'gemini-cli',
    temperature: 0.3,
    maxOutputTokens: 8000,
    pricing: { input: 1.25, output: 5.0 },
  },
  'gemini-3-flash': {
    model: createGeminiProvider()('gemini-3-flash-preview'),
    name: 'Gemini 3 Flash',
    hint: 'Fast',
    cli: 'gemini',
    agentId: 'gemini-cli',
    temperature: 0.3,
    maxOutputTokens: 8000,
    pricing: { input: 0.075, output: 0.30 },
  },
  'gemini-2.5-pro': {
    model: createGeminiProvider()('gemini-2.5-pro'),
    name: 'Gemini 2.5 Pro',
    hint: 'Thinking model',
    cli: 'gemini',
    agentId: 'gemini-cli',
    temperature: 0.3,
    maxOutputTokens: 8000,
    pricing: { input: 1.25, output: 10.0 },
  },
  'gemini-2.5-flash': {
    model: createGeminiProvider()('gemini-2.5-flash'),
    name: 'Gemini 2.5 Flash',
    hint: 'Fast thinking',
    cli: 'gemini',
    agentId: 'gemini-cli',
    temperature: 0.3,
    maxOutputTokens: 8000,
    pricing: { input: 0.15, output: 0.60 },
  },
  'gemini-2.5-flash-lite': {
    model: createGeminiProvider()('gemini-2.5-flash-lite'),
    name: 'Gemini 2.5 Flash Lite',
    hint: 'Cheapest',
    cli: 'gemini',
    agentId: 'gemini-cli',
    temperature: 0.3,
    maxOutputTokens: 8000,
    pricing: { input: 0.075, output: 0.30 },
  },
  // Codex CLI
  'codex': {
    model: codexCli('o4-mini'),
    name: 'Codex o4-mini',
    hint: 'OpenAI reasoning',
    cli: 'codex',
    agentId: 'codex',
    temperature: 0.2,
    maxOutputTokens: 8000,
    pricing: { input: 1.10, output: 4.40 },
  },
}

/** Shared stream config */
const STREAM_CONFIG = {
  maxRetries: 2,
  smoothStream: { delayInMs: 10, chunking: 'word' as const },
}

// ============================================================================
// Response Caching
// ============================================================================

interface CachedResponse {
  text: string
  model: OptimizeModel
  timestamp: number
}

/** Hash prompt for cache key */
function hashPrompt(prompt: string, model: OptimizeModel): string {
  return createHash('sha256').update(`${model}:${prompt}`).digest('hex').slice(0, 16)
}

/** Get cached response if exists and not expired */
function getCachedResponse(prompt: string, model: OptimizeModel, maxAge = 7 * 24 * 60 * 60 * 1000): CachedResponse | null {
  const hash = hashPrompt(prompt, model)
  const cachePath = join(CACHE_DIR, `${hash}.json`)

  if (!existsSync(cachePath))
    return null

  try {
    const cached = JSON.parse(readFileSync(cachePath, 'utf-8')) as CachedResponse
    // Check if cache is expired (default 7 days)
    if (Date.now() - cached.timestamp > maxAge)
      return null
    return cached
  }
  catch {
    return null
  }
}

/** Cache a response */
function cacheResponse(prompt: string, model: OptimizeModel, text: string): void {
  mkdirSync(CACHE_DIR, { recursive: true })
  const hash = hashPrompt(prompt, model)
  const cachePath = join(CACHE_DIR, `${hash}.json`)

  const cached: CachedResponse = {
    text,
    model,
    timestamp: Date.now(),
  }

  writeFileSync(cachePath, JSON.stringify(cached))
}

/** Clear the LLM response cache */
export function clearLlmCache(): void {
  const { rmSync } = require('node:fs')
  if (existsSync(CACHE_DIR)) {
    rmSync(CACHE_DIR, { recursive: true })
  }
}

export interface ModelInfo {
  id: OptimizeModel
  name: string
  hint: string
  recommended?: boolean
  /** Agent that provides this model */
  agentId: string
  /** Agent display name */
  agentName: string
}

/** Calculate estimated cost from token usage */
export function estimateCost(
  model: OptimizeModel,
  usage: { inputTokens: number, outputTokens: number },
): number {
  const config = MODEL_CONFIG[model]
  const inputCost = (usage.inputTokens / 1_000_000) * config.pricing.input
  const outputCost = (usage.outputTokens / 1_000_000) * config.pricing.output
  return inputCost + outputCost
}

/** Format cost for display */
export function formatCost(cost: number): string {
  if (cost < 0.001)
    return '<$0.001'
  if (cost < 0.01)
    return `~$${cost.toFixed(4)}`
  return `~$${cost.toFixed(3)}`
}

export function getModelName(id: OptimizeModel): string {
  return MODEL_CONFIG[id]?.name ?? id
}

/** Get available models based on installed agents (parallel CLI check) */
export async function getAvailableModels(): Promise<ModelInfo[]> {
  // Get installed agents that have CLIs
  const installedAgents = detectInstalledAgents()
  const agentsWithCli = installedAgents.filter(id => agents[id].cli)

  // Check which CLIs are actually available (parallel)
  const cliChecks = await Promise.all(
    agentsWithCli.map(async (agentId) => {
      const cli = agents[agentId].cli!
      try {
        await execAsync(`which ${cli}`)
        return agentId
      }
      catch {
        return null
      }
    }),
  )
  const availableAgentIds = new Set(cliChecks.filter(Boolean))

  // Return models from available agents
  return (Object.entries(MODEL_CONFIG) as [OptimizeModel, ModelConfig][])
    .filter(([_, config]) => availableAgentIds.has(config.agentId))
    .map(([id, config]) => ({
      id,
      name: config.name,
      hint: config.hint,
      recommended: config.recommended,
      agentId: config.agentId,
      agentName: agents[config.agentId].displayName,
    }))
}

export interface StreamProgress {
  /** Current chunk (reasoning or text) */
  chunk: string
  /** Type: 'reasoning' for thinking, 'text' for output */
  type: 'reasoning' | 'text'
  /** Accumulated text so far (text-only, not reasoning) */
  text: string
  /** Accumulated reasoning so far */
  reasoning: string
}

export interface OptimizeDocsOptions {
  packageName: string
  /** Absolute path to skill directory with ./references/ */
  skillDir: string
  /** Path to package's search.db */
  dbPath: string
  model?: OptimizeModel
  /** Package version for version-specific guidance */
  version?: string
  /** Has issues indexed */
  hasIssues?: boolean
  /** Has release notes */
  hasReleases?: boolean
  /** Has CHANGELOG.md in package */
  hasChangelog?: boolean
  /** Resolved absolute paths to .md doc files */
  docFiles?: string[]
  /** Called with each streaming chunk - includes reasoning for progress display */
  onProgress?: (progress: StreamProgress) => void
  /** Timeout in ms (default: 180000 for agentic) */
  timeout?: number
  /** Include reasoning in result (for debugging) */
  verbose?: boolean
  /** Skip cache and force fresh generation */
  noCache?: boolean
}

export interface OptimizeResult {
  optimized: string
  wasOptimized: boolean
  error?: string
  /** Raw reasoning/thinking content (only if verbose: true) */
  reasoning?: string
  /** Why generation stopped */
  finishReason?: string
  /** Token usage for debugging/billing */
  usage?: { inputTokens: number, outputTokens: number, totalTokens: number }
  /** Estimated cost in USD */
  cost?: number
}

/** Create tools for agentic exploration */
function createAgentTools(skillDir: string, dbPath: string) {
  return {
    read: tool({
      description: 'Read a file from the references directory',
      inputSchema: z.object({
        path: z.string().describe('File path relative to skill dir or absolute'),
      }),
      execute: async ({ path }) => {
        const { readFileSync, existsSync } = await import('node:fs')
        const { resolve } = await import('node:path')
        const fullPath = path.startsWith('/') ? path : resolve(skillDir, path)
        if (!existsSync(fullPath))
          return `File not found: ${path}`
        return readFileSync(fullPath, 'utf-8').slice(0, 50000) // Limit size
      },
    }),
    ls: tool({
      description: 'List files in a directory',
      inputSchema: z.object({
        path: z.string().describe('Directory path relative to skill dir or absolute'),
      }),
      execute: async ({ path }) => {
        const { readdirSync, existsSync, statSync } = await import('node:fs')
        const { resolve, join } = await import('node:path')
        const fullPath = path.startsWith('/') ? path : resolve(skillDir, path)
        if (!existsSync(fullPath))
          return `Directory not found: ${path}`
        const entries = readdirSync(fullPath)
        return entries.map((e) => {
          const stat = statSync(join(fullPath, e))
          return stat.isDirectory() ? `${e}/` : e
        }).join('\n')
      },
    }),
    search: tool({
      description: 'Search indexed docs for the package',
      inputSchema: z.object({
        query: z.string().describe('Search query'),
      }),
      execute: async ({ query }) => {
        const { searchSnippets } = await import('../../retriv')
        const results = await searchSnippets(query, { dbPath }, { limit: 10 })
        return results.map(r => `[${r.score.toFixed(2)}] ${r.source}:\n${r.content.slice(0, 500)}`).join('\n\n')
      },
    }),
    webSearch: tool({
      description: 'Search the web for additional context',
      inputSchema: z.object({
        query: z.string().describe('Search query'),
      }),
      execute: async ({ query }) => {
        // Use a simple fetch to DuckDuckGo HTML (no API key needed)
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
        const res = await fetch(url, { headers: { 'User-Agent': 'skilld/1.0' } })
        const html = await res.text()
        // Extract result snippets (rough parsing)
        const snippets = html.match(/<a class="result__snippet"[^>]*>([^<]+)</g) || []
        return snippets.slice(0, 5).map(s => s.replace(/<[^>]+>/g, '')).join('\n\n') || 'No results'
      },
    }),
  }
}

/**
 * Generate skill using agentic exploration
 * - Agent explores references via tools (Read, Search, WebSearch)
 * - Response caching by prompt hash
 * - Cost estimation based on token usage
 */
export async function optimizeDocs(opts: OptimizeDocsOptions): Promise<OptimizeResult> {
  const { packageName, skillDir, dbPath, model = 'sonnet', version, hasIssues, hasReleases, hasChangelog, docFiles, onProgress, timeout = 180000, verbose, noCache } = opts
  const prompt = buildSkillPrompt({ packageName, skillDir, version, hasIssues, hasReleases, hasChangelog, docFiles })
  const config = MODEL_CONFIG[model]

  // Check cache first (unless noCache is set)
  if (!noCache) {
    const cached = getCachedResponse(prompt, model)
    if (cached) {
      onProgress?.({ chunk: '[cached]', type: 'text', text: cached.text, reasoning: '' })
      return {
        optimized: cached.text,
        wasOptimized: true,
        finishReason: 'cached',
      }
    }
  }

  const tools = createAgentTools(skillDir, dbPath)

  // Emit prompt for debugging
  const { writeFileSync } = await import('node:fs')
  const { join } = await import('node:path')
  writeFileSync(join(skillDir, 'PROMPT.md'), prompt)

  // Create abort controller for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    onProgress?.({ chunk: '[exploring...]', type: 'reasoning', text: '', reasoning: '' })

    const result = await generateText({
      model: config.model,
      prompt,
      tools,
      stopWhen: stepCountIs(20), // Allow up to 20 tool calls
      abortSignal: controller.signal,
      maxRetries: STREAM_CONFIG.maxRetries,
      maxOutputTokens: config.maxOutputTokens,
      temperature: config.temperature,
      onStepFinish: ({ toolCalls }) => {
        if (toolCalls?.length) {
          const names = toolCalls.map(t => t.toolName).join(', ')
          onProgress?.({ chunk: `[${names}]`, type: 'reasoning', text: '', reasoning: names })
        }
      },
    })

    clearTimeout(timeoutId)

    const text = result.text
    const optimized = cleanOutput(text)

    const usage = result.usage
      ? {
          inputTokens: result.usage.inputTokens ?? 0,
          outputTokens: result.usage.outputTokens ?? 0,
          totalTokens: result.usage.totalTokens ?? 0,
        }
      : undefined
    const cost = usage ? estimateCost(model, { inputTokens: usage.inputTokens, outputTokens: usage.outputTokens }) : undefined

    // Cache successful response
    if (!noCache && optimized) {
      cacheResponse(prompt, model, optimized)
    }

    return {
      optimized,
      wasOptimized: !!optimized,
      finishReason: result.finishReason,
      usage,
      cost,
    }
  }
  catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof Error && err.name === 'AbortError') {
      return { optimized: '', wasOptimized: false, error: `Timeout after ${timeout / 1000}s` }
    }
    const msg = err instanceof Error ? err.message : String(err)
    return { optimized: '', wasOptimized: false, error: msg }
  }
}

interface StreamOptions {
  onProgress?: (progress: StreamProgress) => void
  timeout?: number
}

interface StreamResult {
  text: string
  reasoning: string
  error?: string
  /** Why generation stopped (stop, length, tool-calls, etc) */
  finishReason?: string
  /** Token usage stats */
  usage?: { inputTokens: number, outputTokens: number, totalTokens: number }
}

/**
 * Stream with fullStream for reasoning + text visibility
 * Uses model-specific temperature and token limits
 */
async function streamWithFullStream(
  config: ModelConfig,
  prompt: string,
  opts: StreamOptions,
): Promise<StreamResult> {
  const { onProgress, timeout = 120000 } = opts

  // Create abort controller for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  let text = ''
  let reasoning = ''
  let streamError: string | undefined

  try {
    const stream = streamText({
      model: config.model,
      prompt,
      abortSignal: controller.signal,
      // AI SDK best practices
      maxRetries: STREAM_CONFIG.maxRetries,
      // Model-specific settings
      maxOutputTokens: config.maxOutputTokens,
      temperature: config.temperature,
      // Smooth streaming for better progress display
      experimental_transform: smoothStream(STREAM_CONFIG.smoothStream),
      onError: ({ error }) => {
        streamError = error instanceof Error ? error.message : String(error)
      },
    })

    // Use fullStream to capture both reasoning and text
    for await (const part of stream.fullStream) {
      if (part.type === 'reasoning-delta') {
        // Reasoning/thinking content
        const chunk = (part as any).delta ?? (part as any).reasoningDelta ?? ''
        reasoning += chunk
        onProgress?.({ chunk, type: 'reasoning', text, reasoning })
      }
      else if (part.type === 'text-delta') {
        // Actual output text - AI SDK 5 uses 'text' not 'textDelta'
        const chunk = (part as any).text ?? (part as any).textDelta ?? ''
        text += chunk
        onProgress?.({ chunk, type: 'text', text, reasoning })
      }
      else if (part.type === 'error') {
        streamError = (part as any).error?.message ?? 'Stream error'
      }
    }

    clearTimeout(timeoutId)

    // Get finish metadata (these await the stream completion)
    let finishReason: string | undefined
    let usage: { inputTokens: number, outputTokens: number, totalTokens: number } | undefined
    try {
      finishReason = await stream.finishReason
      const rawUsage = await stream.usage
      if (rawUsage?.inputTokens != null && rawUsage?.outputTokens != null) {
        usage = {
          inputTokens: rawUsage.inputTokens,
          outputTokens: rawUsage.outputTokens,
          totalTokens: rawUsage.totalTokens ?? (rawUsage.inputTokens + rawUsage.outputTokens),
        }
      }
    }
    catch {
      // Ignore - metadata not available
    }

    if (streamError) {
      return { text: '', reasoning: '', error: streamError }
    }

    // Check if we hit token limit
    if (finishReason === 'length' && !text.trim()) {
      return { text: '', reasoning, error: 'Output truncated (hit token limit)' }
    }

    if (!text.trim()) {
      return { text: '', reasoning, error: 'Empty response from model' }
    }

    return { text, reasoning, finishReason, usage }
  }
  catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof Error && err.name === 'AbortError') {
      return { text: '', reasoning, error: `Timeout after ${timeout / 1000}s` }
    }
    const msg = err instanceof Error ? err.message : String(err)
    return { text: '', reasoning, error: msg }
  }
}

/**
 * Clean LLM output - extract content between markers, strip artifacts
 * Returns empty string if markers missing or outline-mode detected
 */
function cleanOutput(text: string): string {
  // Strip markdown code block wrappers
  let cleaned = text.replace(/^```markdown\n?/m, '').replace(/\n?```$/m, '')

  // Strip <think>...</think> tags (DeepSeek style)
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/g, '')

  // Extract content between BEGIN/END markers
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
    // No BEGIN marker - strip any frontmatter LLM might have included (fallback)
    cleaned = cleaned.replace(/^---[\s\S]*?---\n*/m, '')
  }

  // Detect outline-mode failures (LLM summarized instead of writing)
  const outlinePatterns = [
    /Would you like me to (?:write|create|generate)/i,
    /The document is \*{0,2}\d+ lines\*{0,2}/i,
    /\*\*\d+ (?:Pitfalls?|Best Practices?):\*\*[\t\v\f\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*\n\s*\d+\./i, // Numbered list without code
    /^## Key Content\s*$/m,
    /\*\*Additional sections:\*\*/i,
    /focuses (?:on|exclusively on) (?:non-obvious|expert)/i,
  ]

  for (const pattern of outlinePatterns) {
    if (pattern.test(cleaned)) {
      return '' // Signal failure - will trigger "Empty response" error
    }
  }

  // Strip leaked thinking at start
  const contentStart = cleaned.search(/^\*\*PITFALL|^\*\*BEST PRACTICE|^```/m)
  if (contentStart > 0) {
    const prefix = cleaned.slice(0, contentStart)
    if (/Let me|I'll|I will|Now |First,|Looking at|Examining|Perfect!|Here's|I've/i.test(prefix)) {
      cleaned = cleaned.slice(contentStart)
    }
  }

  return cleaned.trim()
}
