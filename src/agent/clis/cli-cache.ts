import type { SkillSection } from '../prompts/index.ts'
import type { OptimizeModel } from './types.ts'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'pathe'
import { LLM_CACHE_DIR } from '../../core/paths.ts'

const DEFAULT_MAX_AGE = 7 * 24 * 60 * 60 * 1000

/** Strip absolute paths from prompt so the hash is project-independent */
function normalizePromptForHash(prompt: string): string {
  return prompt.replace(/\/[^\s`]*\.(?:claude|codex|gemini)\/skills\/[^\s/`]+/g, '<SKILL_DIR>')
}

function hashPrompt(prompt: string, model: OptimizeModel, section: SkillSection): string {
  return createHash('sha256').update(`exec:${model}:${section}:${normalizePromptForHash(prompt)}`).digest('hex').slice(0, 16)
}

export function getCached(prompt: string, model: OptimizeModel, section: SkillSection, maxAge = DEFAULT_MAX_AGE): string | null {
  const path = join(LLM_CACHE_DIR, `${hashPrompt(prompt, model, section)}.json`)
  if (!existsSync(path))
    return null
  try {
    const { text, timestamp } = JSON.parse(readFileSync(path, 'utf-8'))
    return Date.now() - timestamp > maxAge ? null : text
  }
  catch { return null }
}

export function setCache(prompt: string, model: OptimizeModel, section: SkillSection, text: string): void {
  mkdirSync(LLM_CACHE_DIR, { recursive: true, mode: 0o700 })
  writeFileSync(
    join(LLM_CACHE_DIR, `${hashPrompt(prompt, model, section)}.json`),
    JSON.stringify({ text, model, section, timestamp: Date.now() }),
    { mode: 0o600 },
  )
}
