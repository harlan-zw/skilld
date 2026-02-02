/**
 * LLM-based documentation optimization using AI SDK
 * Uses fullStream for reasoning visibility + text extraction
 */

import { createHash } from 'node:crypto'
import { exec } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { smoothStream, streamText } from 'ai'
import { claudeCode } from 'ai-sdk-provider-claude-code'
import { createGeminiProvider } from 'ai-sdk-provider-gemini-cli'
import { codexCli } from 'ai-sdk-provider-codex-cli'
import { buildPrompt } from '../prompts'

/** Response cache directory */
const CACHE_DIR = join(homedir(), '.skilld', 'llm-cache')

const execAsync = promisify(exec)

export { buildPrompt } from '../prompts'

export type OptimizeModel = 'haiku' | 'sonnet' | 'gemini-flash' | 'codex'

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
  /** Temperature (lower = more consistent) */
  temperature: number
  /** Max output tokens */
  maxOutputTokens: number
  /** Pricing per 1M tokens (input, output) in USD */
  pricing: { input: number, output: number }
}

/** Model configurations with pricing and settings */
const MODEL_CONFIG: Record<OptimizeModel, ModelConfig> = {
  haiku: {
    model: claudeCode('haiku'),
    name: 'Claude Haiku',
    hint: 'Fast',
    recommended: true,
    cli: 'claude',
    temperature: 0.4, // Slightly higher - haiku is already concise
    maxOutputTokens: 8000,
    pricing: { input: 0.25, output: 1.25 }, // $0.25/1M in, $1.25/1M out
  },
  sonnet: {
    model: claudeCode('sonnet'),
    name: 'Claude Sonnet',
    hint: 'Balanced',
    cli: 'claude',
    temperature: 0.3, // Lower for consistency
    maxOutputTokens: 8000,
    pricing: { input: 3.0, output: 15.0 }, // $3/1M in, $15/1M out
  },
  'gemini-flash': {
    model: createGeminiProvider()('gemini-3-flash-preview'),
    name: 'Gemini 3 Flash',
    hint: 'Fast',
    cli: 'gemini',
    temperature: 0.3,
    maxOutputTokens: 8000,
    pricing: { input: 0.075, output: 0.30 }, // Very cheap
  },
  codex: {
    model: codexCli('o4-mini'),
    name: 'Codex CLI',
    hint: 'OpenAI o4-mini',
    cli: 'codex',
    temperature: 0.2, // Lower - reasoning model
    maxOutputTokens: 8000,
    pricing: { input: 1.10, output: 4.40 }, // o4-mini pricing
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

  if (!existsSync(cachePath)) return null

  try {
    const cached = JSON.parse(readFileSync(cachePath, 'utf-8')) as CachedResponse
    // Check if cache is expired (default 7 days)
    if (Date.now() - cached.timestamp > maxAge) return null
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
  if (cost < 0.001) return '<$0.001'
  if (cost < 0.01) return `~$${cost.toFixed(4)}`
  return `~$${cost.toFixed(3)}`
}

export function getModelName(id: OptimizeModel): string {
  return MODEL_CONFIG[id]?.name ?? id
}

/** Get available models based on installed CLIs (parallel check) */
export async function getAvailableModels(): Promise<ModelInfo[]> {
  const uniqueCmds = [...new Set(Object.values(MODEL_CONFIG).map(c => c.cli))]
  const results = await Promise.all(
    uniqueCmds.map(cmd => execAsync(`which ${cmd}`).then(() => cmd).catch(() => null)),
  )
  const available = new Set(results.filter(Boolean))

  return (Object.entries(MODEL_CONFIG) as [OptimizeModel, ModelConfig][])
    .filter(([_, config]) => available.has(config.cli))
    .map(([id, config]) => ({
      id,
      name: config.name,
      hint: config.hint,
      recommended: config.recommended,
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
  content: string
  packageName: string
  model?: OptimizeModel
  referenceFiles?: string[]
  /** Called with each streaming chunk - includes reasoning for progress display */
  onProgress?: (progress: StreamProgress) => void
  /** Timeout in ms (default: 120000) */
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

/**
 * Optimize documentation using AI SDK with full streaming support
 * - Response caching (hash prompt → cache result)
 * - Streams reasoning chunks for progress visibility
 * - Separates reasoning from final text output
 * - Model-specific temperature and token limits
 * - Cost estimation based on token usage
 */
export async function optimizeDocs(opts: OptimizeDocsOptions): Promise<OptimizeResult> {
  const { content, packageName, model = 'haiku', referenceFiles, onProgress, timeout = 120000, verbose, noCache } = opts
  const prompt = buildPrompt({ packageName, packageDocs: content, referenceFiles })
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

  const result = await streamWithFullStream(config, prompt, { onProgress, timeout })

  if (result.error && model !== 'haiku') {
    // Fallback to haiku if other model fails
    onProgress?.({ chunk: '[fallback to haiku]', type: 'text', text: '', reasoning: '' })
    const fallbackConfig = MODEL_CONFIG.haiku
    const fallback = await streamWithFullStream(fallbackConfig, prompt, { onProgress, timeout })
    if (!fallback.error) {
      const optimized = cleanOutput(fallback.text)
      const cost = fallback.usage ? estimateCost('haiku', fallback.usage) : undefined
      // Cache with original model key (so retry uses cache)
      if (!noCache && optimized) {
        cacheResponse(prompt, model, optimized)
      }
      return {
        optimized,
        wasOptimized: true,
        reasoning: verbose ? fallback.reasoning : undefined,
        finishReason: fallback.finishReason,
        usage: fallback.usage,
        cost,
      }
    }
    return { optimized: content, wasOptimized: false, error: result.error }
  }

  if (result.error) {
    return { optimized: content, wasOptimized: false, error: result.error }
  }

  const optimized = cleanOutput(result.text)
  const cost = result.usage ? estimateCost(model, result.usage) : undefined

  // Cache successful response
  if (!noCache && optimized) {
    cacheResponse(prompt, model, optimized)
  }

  return {
    optimized,
    wasOptimized: true,
    reasoning: verbose ? result.reasoning : undefined,
    finishReason: result.finishReason,
    usage: result.usage,
    cost,
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
 * Clean LLM output - strip leaked thinking and formatting artifacts
 */
function cleanOutput(text: string): string {
  let cleaned = text

  // Strip markdown code block wrappers
  cleaned = cleaned.replace(/^```markdown\n?/m, '').replace(/\n?```$/m, '')

  // Strip <think>...</think> tags (DeepSeek style)
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/g, '')

  // Find first markdown heading or code block - that's where real content starts
  const contentStart = cleaned.search(/^#|^```|^>/m)
  if (contentStart > 0) {
    const prefix = cleaned.slice(0, contentStart)
    // Check if text before heading looks like leaked thinking
    if (/(?:Let me|I'll|I will|Now |First,|Looking at|Examining|Perfect!|Here's|I've)/i.test(prefix)) {
      cleaned = cleaned.slice(contentStart)
    }
  }

  return cleaned.trim()
}
