/**
 * LLM-based documentation optimization
 * Extracts non-obvious best practices and public APIs from raw docs
 */

import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { AgentType } from './agents'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SKILL_CREATOR_PATH = join(__dirname, '../skills/skill-creator/SKILL.md')

export interface AvailableModel {
  id: 'haiku' | 'sonnet' | 'opus' | 'gemini-flash' | 'gemini-pro'
  name: string
  description: string
  available: boolean
  recommended?: boolean
}

/**
 * Get available optimization models
 */
export async function getAvailableModels(): Promise<AvailableModel[]> {
  const models: AvailableModel[] = []

  // Check if claude CLI is available
  const hasClaude = (() => {
    try {
      execSync('which claude', { stdio: 'ignore' })
      return true
    }
    catch {
      return false
    }
  })()

  // Check if gemini CLI is available
  const hasGemini = (() => {
    try {
      execSync('which gemini', { stdio: 'ignore' })
      return true
    }
    catch {
      return false
    }
  })()

  if (hasClaude) {
    models.push(
      { id: 'haiku', name: 'Claude Haiku', description: 'Fast, cheap', available: true, recommended: true },
      { id: 'sonnet', name: 'Claude Sonnet', description: 'Balanced', available: true },
      { id: 'opus', name: 'Claude Opus', description: 'Most capable', available: true },
    )
  }

  if (hasGemini) {
    models.push(
      { id: 'gemini-flash', name: 'Gemini 3 Flash', description: 'Fast', available: true, recommended: true },
      { id: 'gemini-pro', name: 'Gemini 3 Pro', description: 'Most capable', available: true },
    )
  }

  // Check Anthropic SDK
  if (process.env.ANTHROPIC_API_KEY) {
    if (!hasClaude) {
      models.push(
        { id: 'haiku', name: 'Claude Haiku (API)', description: 'Fast, cheap', available: true, recommended: true },
        { id: 'sonnet', name: 'Claude Sonnet (API)', description: 'Balanced', available: true },
      )
    }
  }

  return models
}

function buildPrompt(packageName: string, packageDocs: string): string {
  return `IMPORTANT: YOU MUST USE THIS SKILL: ${SKILL_CREATOR_PATH}

Generate a SKILL.md for the "${packageName}" package.

## Focus Areas (CRITICAL - in priority order)

1. **API signatures and syntax** - Exact function signatures, parameter types, return types. "How do I call X?" not "remember to use X"
2. **Version-specific APIs** - What's new in recent versions (e.g., "3.5+"). Modern patterns that replace old ones
3. **Non-obvious gotchas** - Edge cases, common mistakes, things that silently fail
4. **Package-specific patterns** - Patterns unique to THIS package, not general programming advice

## Anti-patterns to AVOID

- Generic web dev advice (accessibility basics, "use semantic HTML", general security)
- Advice any senior dev already knows ("virtualize large lists", "avoid N+1 queries")
- Style guide rules that aren't API-specific
- Marketing language or feature lists without syntax

## Documentation Index

If the package has local docs (llms.txt or similar), include a table at the end:

\`\`\`markdown
## Documentation

| Topic | Path | Description |
|-------|------|-------------|
| API Reference | ./docs/api/ | Function signatures |
| Composables | ./docs/composables/ | Reactive utilities |
| ... | ... | ... |
\`\`\`

Reinterpret vague llms.txt entries into actionable categories. Group by what a developer would search for.

## Rules

- Output ONLY the markdown content, no explanations
- Prioritize "what's the syntax for X" over "remember to do Y"
- Skip installation, badges, marketing
- Keep under 400 lines
- Code examples > prose explanations

Package docs:

${packageDocs}
`
}

export type OptimizeModel = AvailableModel['id']

/**
 * Optimize documentation using the detected LLM agent
 * Falls back gracefully if no LLM available
 */
export async function optimizeDocs(
  content: string,
  packageName: string,
  agent: AgentType | null,
  model: OptimizeModel = 'haiku',
): Promise<{ optimized: string, wasOptimized: boolean }> {
  // Handle Gemini models
  if (model.startsWith('gemini-')) {
    const result = await tryGemini(content, packageName, model)
    if (result) return { optimized: result, wasOptimized: true }
    return { optimized: content, wasOptimized: false }
  }

  // Try Claude Code first (most common)
  if (agent === 'claude-code' || !agent) {
    const result = await tryClaudeCode(content, packageName, model)
    if (result) return { optimized: result, wasOptimized: true }
  }

  // Fallback: try Anthropic SDK if API key available
  if (process.env.ANTHROPIC_API_KEY) {
    const result = await tryAnthropicSDK(content, packageName, model)
    if (result) return { optimized: result, wasOptimized: true }
  }

  // No LLM available, return original
  return { optimized: content, wasOptimized: false }
}

async function tryClaudeCode(content: string, packageName: string, model: OptimizeModel): Promise<string | null> {
  try {
    execSync('which claude', { stdio: 'ignore' })

    const prompt = buildPrompt(packageName, content)
    const { spawnSync } = await import('node:child_process')

    const result = spawnSync('claude', ['--model', model, '--print'], {
      input: prompt,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'inherit'], // inherit stderr for progress
      maxBuffer: 10 * 1024 * 1024,
      timeout: 180_000,
    })

    if (result.error || result.status !== 0) return null
    return result.stdout.trim()
  }
  catch {
    return null
  }
}

async function tryGemini(content: string, packageName: string, model: OptimizeModel): Promise<string | null> {
  try {
    execSync('which gemini', { stdio: 'ignore' })

    const prompt = buildPrompt(packageName, content)
    const geminiModel = GEMINI_MODEL_MAP[model] || 'gemini-3-flash-preview'

    const { spawnSync } = await import('node:child_process')
    const result = spawnSync('gemini', ['--model', geminiModel], {
      input: prompt,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'inherit'], // inherit stderr for progress
      maxBuffer: 10 * 1024 * 1024,
      timeout: 180_000,
    })

    if (result.error || result.status !== 0) return null
    return result.stdout.trim()
  }
  catch {
    return null
  }
}

const CLAUDE_MODEL_MAP: Record<string, string> = {
  haiku: 'claude-3-5-haiku-latest',
  sonnet: 'claude-sonnet-4-20250514',
  opus: 'claude-opus-4-20250514',
}

const GEMINI_MODEL_MAP: Record<string, string> = {
  'gemini-flash': 'gemini-3-flash-preview',
  'gemini-pro': 'gemini-3-pro-preview',
}

async function tryAnthropicSDK(content: string, packageName: string, model: OptimizeModel): Promise<string | null> {
  try {
    // Dynamic import to avoid requiring the SDK if not used
    // @ts-expect-error - optional dependency
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic()

    const response = await client.messages.create({
      model: CLAUDE_MODEL_MAP[model] || 'claude-3-5-haiku-latest',
      max_tokens: 8192,
      messages: [{
        role: 'user',
        content: buildPrompt(packageName, content),
      }],
    })

    const textBlock = response.content.find((b: { type: string, text?: string }) => b.type === 'text') as { type: 'text', text: string } | undefined
    return textBlock?.text || null
  }
  catch {
    return null
  }
}
