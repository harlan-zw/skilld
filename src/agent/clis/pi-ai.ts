/**
 * pi-ai adapter — direct LLM API calls via @mariozechner/pi-ai
 *
 * Optional alternative to CLI spawning. Supports:
 * - Env-var API keys (ANTHROPIC_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY, etc.)
 * - OAuth login to piggyback on existing subscriptions (Claude Pro, ChatGPT Plus, Copilot)
 *
 * Models are enumerated dynamically from pi-ai's registry — no hardcoded list.
 * Reference content is inlined into the prompt via portabilizePrompt().
 */

import type { SkillSection } from '../prompts/index.ts'
import type { StreamProgress } from './types.ts'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { getEnvApiKey, getModel, getModels, getProviders, streamSimple } from '@mariozechner/pi-ai'
import { getOAuthApiKey, getOAuthProvider, getOAuthProviders } from '@mariozechner/pi-ai/oauth'
import { join } from 'pathe'
import { sanitizeMarkdown } from '../../core/sanitize.ts'
import { portabilizePrompt } from '../prompts/index.ts'

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

/** Resolve model provider ID → OAuth provider ID */
function resolveOAuthProviderId(modelProvider: string): string | null {
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

/** Get available OAuth providers for login */
export function getOAuthProviderList(): Array<{ id: string, name: string, loggedIn: boolean }> {
  const auth = loadAuth()
  const providers = getOAuthProviders() as Array<{ id: string, name: string }>
  return providers.map((p: any) => ({
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

// ── Reference inlining ───────────────────────────────────────────────

const REFERENCE_SUBDIRS = ['docs', 'issues', 'discussions', 'releases']
const MAX_REFERENCE_CHARS = 150_000 // ~37k tokens

/** Read reference files from .skilld/ and format as inline context */
function collectReferenceContent(skillDir: string): string {
  const skilldDir = join(skillDir, '.skilld')
  if (!existsSync(skilldDir))
    return ''

  const files: Array<{ path: string, content: string }> = []
  let totalChars = 0

  for (const subdir of REFERENCE_SUBDIRS) {
    const dirPath = join(skilldDir, subdir)
    if (!existsSync(dirPath))
      continue

    const indexPath = join(dirPath, '_INDEX.md')
    if (existsSync(indexPath) && totalChars < MAX_REFERENCE_CHARS) {
      const content = sanitizeMarkdown(readFileSync(indexPath, 'utf-8'))
      if (totalChars + content.length <= MAX_REFERENCE_CHARS) {
        files.push({ path: `references/${subdir}/_INDEX.md`, content })
        totalChars += content.length
      }
    }

    const entries = readdirSync(dirPath, { recursive: true })
    for (const entry of entries) {
      if (totalChars >= MAX_REFERENCE_CHARS)
        break
      const entryStr = String(entry)
      if (!entryStr.endsWith('.md') || entryStr === '_INDEX.md')
        continue
      const fullPath = join(dirPath, entryStr)
      if (!existsSync(fullPath))
        continue
      try {
        const content = sanitizeMarkdown(readFileSync(fullPath, 'utf-8'))
        if (totalChars + content.length > MAX_REFERENCE_CHARS)
          continue
        files.push({ path: `references/${subdir}/${entryStr}`, content })
        totalChars += content.length
      }
      catch {}
    }
  }

  // Read pkg/README.md if available and within budget
  const readmePath = join(skilldDir, 'pkg', 'README.md')
  if (existsSync(readmePath) && totalChars < MAX_REFERENCE_CHARS) {
    const content = sanitizeMarkdown(readFileSync(readmePath, 'utf-8'))
    if (totalChars + content.length <= MAX_REFERENCE_CHARS) {
      files.push({ path: 'references/pkg/README.md', content })
      totalChars += content.length
    }
  }

  // Read type definitions if present
  const pkgDir = join(skilldDir, 'pkg')
  if (existsSync(pkgDir) && totalChars < MAX_REFERENCE_CHARS) {
    try {
      const pkgEntries = readdirSync(pkgDir, { recursive: true })
      for (const entry of pkgEntries) {
        const entryStr = String(entry)
        if (!entryStr.endsWith('.d.ts'))
          continue
        const fullPath = join(pkgDir, entryStr)
        if (!existsSync(fullPath))
          continue
        const content = sanitizeMarkdown(readFileSync(fullPath, 'utf-8'))
        if (totalChars + content.length <= MAX_REFERENCE_CHARS) {
          files.push({ path: `references/pkg/${entryStr}`, content })
          totalChars += content.length
        }
        break // only first .d.ts
      }
    }
    catch {}
  }

  if (files.length === 0)
    return ''

  const blocks = files.map(f => `<file path="${f.path}">\n${f.content.replaceAll('</file>', '&lt;/file&gt;').replaceAll('</reference-files>', '&lt;/reference-files&gt;')}\n</file>`)
  return `<reference-files>\n${blocks.join('\n')}\n</reference-files>`
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
  usage?: { input: number, output: number }
  cost?: number
}

/** Optimize a single section using pi-ai direct API */
export async function optimizeSectionPiAi(opts: PiAiSectionOptions): Promise<PiAiSectionResult> {
  const parsed = parsePiAiModelId(opts.model)
  if (!parsed)
    throw new Error(`Invalid pi-ai model ID: ${opts.model}. Expected format: pi:provider/model-id`)

  const model = getModel(parsed.provider as any, parsed.modelId as any)
  const apiKey = await resolveApiKey(parsed.provider)

  // Build non-agentic prompt with inlined references
  const portablePrompt = portabilizePrompt(opts.prompt, opts.section)
  const references = collectReferenceContent(opts.skillDir)
  const fullPrompt = references
    ? `${portablePrompt}\n\n## Reference Content\n\nThe following files are provided inline for your reference:\n\n${references}`
    : portablePrompt

  opts.onProgress?.({ chunk: '[starting...]', type: 'reasoning', text: '', reasoning: '', section: opts.section })

  const stream = streamSimple(model, {
    systemPrompt: 'You are a technical documentation expert generating SKILL.md sections for AI agent skills. Output clean, structured markdown following the format instructions exactly.',
    messages: [{
      role: 'user' as const,
      content: [{ type: 'text' as const, text: fullPrompt }],
      timestamp: Date.now(),
    }],
  }, {
    reasoning: 'medium',
    maxTokens: 16_384,
    ...(apiKey ? { apiKey } : {}),
  })

  let text = ''
  let usage: { input: number, output: number } | undefined
  let cost: number | undefined

  for await (const event of stream) {
    if (opts.signal?.aborted)
      throw new Error('pi-ai request timed out')
    switch (event.type) {
      case 'text_delta':
        text += event.delta
        opts.onProgress?.({ chunk: event.delta, type: 'text', text, reasoning: '', section: opts.section })
        break
      case 'done':
        if (event.message?.usage) {
          usage = { input: event.message.usage.input, output: event.message.usage.output }
          cost = event.message.usage.cost?.total
        }
        break
      case 'error':
        throw new Error(event.error?.errorMessage ?? 'pi-ai stream error')
    }
  }

  return { text, usage, cost }
}
