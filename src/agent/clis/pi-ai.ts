/**
 * pi-ai adapter — direct LLM API calls via @mariozechner/pi-ai
 *
 * Optional alternative to CLI spawning. Supports:
 * - Env-var API keys (ANTHROPIC_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY, etc.)
 *
 * OAuth providers are blocked by default. Consumer subscription OAuth
 * impersonates official CLI clients and violates provider ToS, risking
 * account bans. Use API keys or native CLI tools (claude, gemini, codex).
 *
 * Models are enumerated dynamically from pi-ai's registry — no hardcoded list.
 * Reference content is inlined into the prompt via portabilizePrompt().
 */

import type { AssistantMessage, Message, ToolCall } from '@mariozechner/pi-ai'
import type { SkillSection } from '../prompts/index.ts'
import type { StreamProgress } from './types.ts'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { resolve } from 'node:path'
import { getEnvApiKey, getModel, getModels, getProviders, streamSimple } from '@mariozechner/pi-ai'
import { getOAuthApiKey, getOAuthProvider, getOAuthProviders } from '@mariozechner/pi-ai/oauth'
import { join } from 'pathe'
import { Type } from 'typebox'
import { sanitizeMarkdown } from '../../core/sanitize.ts'

export function isPiAiModel(model: string): boolean {
  return model.startsWith('pi:')
}

/** Parse a pi:provider/model-id string → { provider, modelId } */
export function parsePiAiModelId(model: string): { provider: string, modelId: string } | null {
  if (!model.startsWith('pi:'))
    return null
  const rest = model.slice(3)
  const slashIdx = rest.indexOf('/')
  if (slashIdx === -1)
    return null
  return { provider: rest.slice(0, slashIdx), modelId: rest.slice(slashIdx + 1) }
}

// ── Blocked OAuth providers ──────────────────────────────────────────
// These providers use consumer subscription OAuth in ways that violate
// the service's ToS and are known to result in account bans/revocations.
// API key access remains fully supported for these services.
const BLOCKED_OAUTH_PROVIDERS = new Set([
  'google-antigravity', // confirmed account bans
  'google-gemini-cli', // same enforcement posture as Antigravity
  'github-copilot', // Microsoft restricts to approved integrations only
  'anthropic', // use `claude` CLI or ANTHROPIC_API_KEY instead
  'openai-codex', // use `codex` CLI or OPENAI_API_KEY instead
])

// ── OAuth credentials ────────────────────────────────────────────────

/** pi coding agent stores auth here; env var can override */
const PI_AGENT_AUTH_PATH = join(
  process.env.PI_CODING_AGENT_DIR || join(homedir(), '.pi', 'agent'),
  'auth.json',
)
/** skilld's own auth file — used when user logs in via skilld */
const SKILLD_AUTH_PATH = join(homedir(), '.skilld', 'pi-ai-auth.json')

interface OAuthCredentials {
  type: 'oauth'
  refresh: string
  access: string
  expires: number
  [key: string]: unknown
}

function readAuthFile(path: string): Record<string, OAuthCredentials> {
  if (!existsSync(path))
    return {}
  try {
    return JSON.parse(readFileSync(path, 'utf-8'))
  }
  catch { return {} }
}

/** Load auth from pi coding agent first (~/.pi/agent/auth.json), then skilld's own */
function loadAuth(): Record<string, OAuthCredentials> {
  const piAuth = readAuthFile(PI_AGENT_AUTH_PATH)
  const skilldAuth = readAuthFile(SKILLD_AUTH_PATH)
  // pi agent credentials take precedence (user's primary auth)
  return { ...skilldAuth, ...piAuth }
}

/** Save auth to skilld's own file — never writes to pi agent's auth */
function saveAuth(auth: Record<string, OAuthCredentials>): void {
  mkdirSync(join(homedir(), '.skilld'), { recursive: true, mode: 0o700 })
  writeFileSync(SKILLD_AUTH_PATH, JSON.stringify(auth, null, 2), { mode: 0o600 })
}

/**
 * Overrides for model-provider → OAuth-provider mapping.
 * Most providers share the same ID in both systems (auto-matched).
 * Only list exceptions where the IDs diverge.
 */
const OAUTH_PROVIDER_OVERRIDES: Record<string, string> = {
  google: 'google-gemini-cli',
  openai: 'openai-codex',
}

/** Resolve model provider ID → OAuth provider ID (returns null for blocked providers) */
function resolveOAuthProviderId(modelProvider: string): string | null {
  const oauthId = OAUTH_PROVIDER_OVERRIDES[modelProvider] ?? modelProvider
  // Block providers known to ban accounts for unauthorized OAuth usage
  if (BLOCKED_OAUTH_PROVIDERS.has(oauthId))
    return null
  if (OAUTH_PROVIDER_OVERRIDES[modelProvider])
    return OAUTH_PROVIDER_OVERRIDES[modelProvider]
  // Auto-match: if the model provider ID is also an OAuth provider, use it directly
  const oauthIds = new Set(getOAuthProviders().map((p: any) => p.id))
  if (oauthIds.has(modelProvider))
    return modelProvider
  return null
}

// ── Auth resolution ──────────────────────────────────────────────────

/** Resolve API key for a provider — checks env vars first, then OAuth credentials */
async function resolveApiKey(provider: string): Promise<string | null> {
  // 1. Check env vars via pi-ai's own resolver
  const envKey = getEnvApiKey(provider)
  if (envKey)
    return envKey

  // 2. Check stored OAuth credentials
  const oauthProviderId = resolveOAuthProviderId(provider)
  if (!oauthProviderId)
    return null

  const auth = loadAuth()
  if (!auth[oauthProviderId])
    return null

  const result = await getOAuthApiKey(oauthProviderId, auth)
  if (!result)
    return null

  // Save refreshed credentials to skilld's own file only (never leak pi-agent tokens)
  const skilldAuth = readAuthFile(SKILLD_AUTH_PATH)
  skilldAuth[oauthProviderId] = { type: 'oauth', ...result.newCredentials }
  saveAuth(skilldAuth)
  return result.apiKey
}

// ── OAuth login flow ─────────────────────────────────────────────────

export interface LoginCallbacks {
  /** Called with the URL the user needs to open in their browser */
  onAuth: (url: string, instructions?: string) => void
  /** Called when pi-ai needs text input from the user */
  onPrompt: (message: string, placeholder?: string) => Promise<string>
  /** Status updates during the login flow */
  onProgress?: (message: string) => void
}

/** Get available OAuth providers for login (excludes blocked providers) */
export function getOAuthProviderList(): Array<{ id: string, name: string, loggedIn: boolean }> {
  const auth = loadAuth()
  const providers = getOAuthProviders() as Array<{ id: string, name: string }>
  return providers
    .filter((p: any) => !BLOCKED_OAUTH_PROVIDERS.has(p.id))
    .map((p: any) => ({
      id: p.id,
      name: p.name ?? p.id,
      loggedIn: !!auth[p.id],
    }))
}

/** Run OAuth login for a provider, saving credentials to ~/.skilld/ */
export async function loginOAuthProvider(providerId: string, callbacks: LoginCallbacks): Promise<boolean> {
  const provider = getOAuthProvider(providerId)
  if (!provider)
    return false

  const credentials = await provider.login({
    onAuth: (info: any) => callbacks.onAuth(info.url, info.instructions),
    onPrompt: async (prompt: any) => callbacks.onPrompt(prompt.message, prompt.placeholder),
    onProgress: (msg: string) => callbacks.onProgress?.(msg),
  })

  const auth = loadAuth()
  auth[providerId] = { type: 'oauth', ...credentials }
  saveAuth(auth)
  return true
}

/** Remove OAuth credentials for a provider */
export function logoutOAuthProvider(providerId: string): void {
  const auth = loadAuth()
  delete auth[providerId]
  saveAuth(auth)
}

// ── Dynamic model enumeration ────────────────────────────────────────

const MIN_CONTEXT_WINDOW = 32_000

/** Legacy model patterns — old generations that clutter the model list */
const LEGACY_MODEL_PATTERNS = [
  // Anthropic: claude 3.x family
  /^claude-3-/,
  /^claude-3\.5-/,
  /^claude-3\.7-/,
  // OpenAI: pre-gpt-5
  /^gpt-4(?!\.\d)/, // gpt-4, gpt-4-turbo, gpt-4o but not gpt-4.1
  /^o1/,
  /^o3-mini/,
  // Google: old gemini generations + non-text models
  /^gemini-1\./,
  /^gemini-2\.0/,
  /^gemini-live-/,
  // Preview snapshots with date suffixes (e.g. -preview-04-17, -preview-05-06)
  /-preview-\d{2}-\d{2,4}$/,
  // Dated model snapshots (e.g. -20240307, -20241022)
  /-\d{8}$/,
]

function isLegacyModel(modelId: string): boolean {
  return LEGACY_MODEL_PATTERNS.some(p => p.test(modelId))
}

/** Preferred model per provider for auto-selection (cheapest reliable option) */
const RECOMMENDED_MODELS: Record<string, RegExp> = {
  anthropic: /haiku/,
  google: /flash/,
  openai: /gpt-4\.1-mini/,
}

export interface PiAiModelInfo {
  /** Full model ID: pi:provider/model-id */
  id: string
  /** Human-readable name */
  name: string
  /** Provider + context info */
  hint: string
  /** Auth source: 'env', 'oauth', or 'none' */
  authSource: 'env' | 'oauth' | 'none'
  /** Whether this is the recommended model for its provider */
  recommended: boolean
}

/** Get all pi-ai models for providers with auth configured */
export function getAvailablePiAiModels(): PiAiModelInfo[] {
  const providers: string[] = getProviders()
  const auth = loadAuth()
  const available: PiAiModelInfo[] = []
  const recommendedPicked = new Set<string>()

  for (const provider of providers) {
    let authSource: 'env' | 'oauth' | 'none' = 'none'
    if (getEnvApiKey(provider)) {
      authSource = 'env'
    }
    else {
      const oauthId = resolveOAuthProviderId(provider)
      if (oauthId && auth[oauthId])
        authSource = 'oauth'
    }

    if (authSource === 'none')
      continue

    const models: any[] = getModels(provider as any)
    // First pass: find the recommended model for this provider
    const recPattern = RECOMMENDED_MODELS[provider]
    let recModelId: string | null = null
    if (recPattern) {
      for (const model of models) {
        if (!isLegacyModel(model.id) && recPattern.test(model.id)) {
          recModelId = model.id
          break
        }
      }
    }

    for (const model of models) {
      if (model.contextWindow && model.contextWindow < MIN_CONTEXT_WINDOW)
        continue
      if (isLegacyModel(model.id))
        continue

      const id = `pi:${provider}/${model.id}`
      const ctx = model.contextWindow ? ` · ${Math.round(model.contextWindow / 1000)}k ctx` : ''
      const cost = model.cost?.input ? ` · $${model.cost.input}/Mtok` : ''
      const isRecommended = model.id === recModelId && !recommendedPicked.has(provider)

      if (isRecommended)
        recommendedPicked.add(provider)

      available.push({
        id,
        name: model.name || model.id,
        hint: `${authSource === 'oauth' ? 'OAuth' : 'API key'}${ctx}${cost}`,
        authSource,
        recommended: isRecommended,
      })
    }
  }

  return available
}

// ── Tool definitions for agentic mode ────────────────────────────────

const TOOLS = [
  {
    name: 'Read',
    description: 'Read a file. Path is relative to the working directory (e.g. "./.skilld/docs/api.md").',
    parameters: Type.Object({ path: Type.String({ description: 'File path to read' }) }),
  },
  {
    name: 'Glob',
    description: 'List files matching a glob pattern (e.g. "./.skilld/docs/*.md"). Returns newline-separated paths.',
    parameters: Type.Object({
      pattern: Type.String({ description: 'Glob pattern' }),
      no_ignore: Type.Optional(Type.Boolean({ description: 'Include gitignored files' })),
    }),
  },
  {
    name: 'Write',
    description: 'Write content to a file.',
    parameters: Type.Object({
      path: Type.String({ description: 'File path to write' }),
      content: Type.String({ description: 'File content' }),
    }),
  },
  {
    name: 'Bash',
    description: 'Run a shell command. Use for `skilld search`, `skilld validate`, etc.',
    parameters: Type.Object({ command: Type.String({ description: 'Shell command to run' }) }),
  },
]

const MAX_TOOL_TURNS = 30
const SAFE_COMMANDS = new Set(['skilld', 'ls', 'cat', 'find'])
const SHELL_META_RE = /[;&|`$()<>]/

/** Resolve a path safely within skilldDir, blocking traversal */
function resolveSandboxedPath(p: string, skilldDir: string): string {
  const cleaned = String(p).replace(/^\.\/\.skilld\//, './').replace(/^\.skilld\//, './').replace(/^\.\//, '')
  const resolved = resolve(skilldDir, cleaned)
  if (!resolved.startsWith(`${skilldDir}/`) && resolved !== skilldDir)
    throw new Error(`Path traversal blocked: ${p}`)
  return resolved
}

/** Match a file path against a glob pattern using simple segment matching (no regex from user input) */
function globMatch(filePath: string, pattern: string): boolean {
  const segments = pattern.split('**')
  if (segments.length === 1) {
    // No **, simple wildcard match: split on * and check containment in order
    const parts = pattern.split('*')
    if (parts.length === 1)
      return filePath === pattern
    let pos = 0
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!
      if (!part)
        continue
      const idx = filePath.indexOf(part, pos)
      if (idx === -1)
        return false
      if (i === 0 && idx !== 0)
        return false // first segment must match from start
      pos = idx + part.length
    }
    if (parts.at(-1) !== '')
      return pos === filePath.length // last segment must match to end
    return true
  }
  // ** present: match any depth between segments
  let remaining = filePath
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!
    if (!seg)
      continue
    // Replace single * within each segment for matching
    const segParts = seg.split('*')
    let pos = 0
    let matched = false
    for (let attempt = remaining.indexOf(segParts[0]!, 0); attempt !== -1; attempt = remaining.indexOf(segParts[0]!, attempt + 1)) {
      pos = attempt
      matched = true
      for (const sp of segParts) {
        if (!sp)
          continue
        const idx = remaining.indexOf(sp, pos)
        if (idx === -1) {
          matched = false
          break
        }
        pos = idx + sp.length
      }
      if (matched)
        break
    }
    if (!matched)
      return false
    remaining = remaining.slice(pos)
  }
  return true
}

/** Execute a tool call against the .skilld/ directory */
function executeTool(toolCall: ToolCall, skilldDir: string): string {
  const args = toolCall.arguments as Record<string, unknown>

  switch (toolCall.name) {
    case 'Read': {
      const filePath = resolveSandboxedPath(args.path as string, skilldDir)
      if (!existsSync(filePath))
        return `Error: file not found: ${args.path}`
      return sanitizeMarkdown(readFileSync(filePath, 'utf-8'))
    }
    case 'Glob': {
      const pattern = String(args.pattern).replace(/^\.\/\.skilld\//, './').replace(/^\.skilld\//, './').replace(/^\.\//, '')
      const results: string[] = []
      const walkDir = (dir: string, prefix: string) => {
        if (!existsSync(dir))
          return
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          const relPath = prefix ? `${prefix}/${entry.name}` : entry.name
          if (entry.isDirectory())
            walkDir(join(dir, entry.name), relPath)
          else results.push(`./.skilld/${relPath}`)
        }
      }
      const baseDir = pattern.split('*')[0]?.replace(/\/$/, '') ?? ''
      walkDir(join(skilldDir, baseDir), baseDir)
      const matched = results.filter(r => globMatch(r.replace(/^\.\/\.skilld\//, ''), pattern))
      return matched.length > 0 ? matched.join('\n') : `No files matching: ${args.pattern}`
    }
    case 'Write': {
      const filePath = resolveSandboxedPath(args.path as string, skilldDir)
      writeFileSync(filePath, sanitizeMarkdown(String(args.content)))
      return 'File written successfully.'
    }
    case 'Bash': {
      const cmd = String(args.command).trim()
      const parts = cmd.split(/\s+/)
      const bin = parts[0] ?? ''
      if (!SAFE_COMMANDS.has(bin) || SHELL_META_RE.test(cmd))
        return `Error: command not allowed. Only skilld, ls, cat, find commands are permitted.`
      try {
        return execFileSync(bin, parts.slice(1), { cwd: skilldDir, timeout: 15_000, encoding: 'utf-8', maxBuffer: 512 * 1024 }).trim()
      }
      catch (err) {
        return `Error: ${(err as Error).message}`
      }
    }
    default:
      return `Unknown tool: ${toolCall.name}`
  }
}

// ── Section optimization ─────────────────────────────────────────────

export interface PiAiSectionOptions {
  section: SkillSection
  prompt: string
  skillDir: string
  model: string
  onProgress?: (progress: StreamProgress) => void
  signal?: AbortSignal
}

export interface PiAiSectionResult {
  text: string
  /** The raw prompt sent to the model */
  fullPrompt: string
  usage?: { input: number, output: number }
  cost?: number
}

/** Optimize a single section using pi-ai agentic API with tool use */
export async function optimizeSectionPiAi(opts: PiAiSectionOptions): Promise<PiAiSectionResult> {
  const parsed = parsePiAiModelId(opts.model)
  if (!parsed)
    throw new Error(`Invalid pi-ai model ID: ${opts.model}. Expected format: pi:provider/model-id`)

  const model = getModel(parsed.provider as any, parsed.modelId as any)
  const apiKey = await resolveApiKey(parsed.provider)
  const skilldDir = join(opts.skillDir, '.skilld')

  // Use the raw prompt (references tool names like Read, Glob, Write, Bash)
  const fullPrompt = opts.prompt

  opts.onProgress?.({ chunk: '[starting...]', type: 'reasoning', text: '', reasoning: '', section: opts.section })

  const messages: Message[] = [{
    role: 'user' as const,
    content: [{ type: 'text' as const, text: fullPrompt }],
    timestamp: Date.now(),
  }]

  let text = ''
  let completed = false
  let totalUsage: { input: number, output: number } | undefined
  let totalCost: number | undefined
  let lastWriteContent = ''

  for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
    if (opts.signal?.aborted)
      throw new Error('pi-ai request timed out')

    const eventStream = streamSimple(model, {
      systemPrompt: 'You are a technical documentation expert generating SKILL.md sections for AI agent skills. Follow the format instructions exactly. Use the provided tools to explore reference files in ./.skilld/ before writing your output.',
      messages,
      tools: TOOLS,
    }, {
      reasoning: turn === 0 ? 'medium' : undefined,
      maxTokens: 16_384,
      ...(apiKey ? { apiKey } : {}),
    })

    let assistantMessage: AssistantMessage | undefined
    let turnText = ''

    for await (const event of eventStream) {
      if (opts.signal?.aborted)
        throw new Error('pi-ai request timed out')

      switch (event.type) {
        case 'text_delta':
          turnText += event.delta
          opts.onProgress?.({ chunk: event.delta, type: 'text', text: turnText, reasoning: '', section: opts.section })
          break
        case 'toolcall_end': {
          const tc = event.toolCall
          const hint = tc.name === 'Read' || tc.name === 'Write'
            ? `[${tc.name}: ${tc.arguments.path}]`
            : tc.name === 'Bash'
              ? `[${tc.name}: ${tc.arguments.command}]`
              : `[${tc.name}: ${tc.arguments.pattern}]`
          opts.onProgress?.({ chunk: hint, type: 'reasoning', text: '', reasoning: hint, section: opts.section })
          break
        }
        case 'done':
          assistantMessage = event.message
          break
        case 'error':
          throw new Error(event.error?.errorMessage ?? 'pi-ai stream error')
      }
    }

    if (!assistantMessage)
      throw new Error('pi-ai stream ended without a message')

    // Accumulate usage across turns
    if (assistantMessage.usage) {
      if (totalUsage) {
        totalUsage.input += assistantMessage.usage.input
        totalUsage.output += assistantMessage.usage.output
      }
      else {
        totalUsage = { input: assistantMessage.usage.input, output: assistantMessage.usage.output }
      }
      totalCost = (totalCost ?? 0) + (assistantMessage.usage.cost?.total ?? 0)
    }

    // Add assistant message to conversation
    messages.push(assistantMessage)

    // Check if there are tool calls to execute
    const toolCalls = assistantMessage.content.filter((c): c is ToolCall => c.type === 'toolCall')
    if (toolCalls.length === 0) {
      text = turnText
      completed = true
      break
    }

    // Execute tool calls and add results
    for (const tc of toolCalls) {
      const result = executeTool(tc, skilldDir)
      // Track Write tool content for output fallback
      if (tc.name === 'Write')
        lastWriteContent = String(tc.arguments.content)
      messages.push({
        role: 'toolResult' as const,
        toolCallId: tc.id,
        toolName: tc.name,
        content: [{ type: 'text' as const, text: result }],
        isError: result.startsWith('Error:'),
        timestamp: Date.now(),
      })
    }
  }

  if (!completed)
    throw new Error(`pi-ai exceeded ${MAX_TOOL_TURNS} tool turns without completing`)

  // Prefer text output, fall back to last Write content
  const finalText = text || lastWriteContent

  return { text: finalText, fullPrompt, usage: totalUsage, cost: totalCost }
}
