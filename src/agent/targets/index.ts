/**
 * Agent target definitions — how each coding agent discovers and loads skills.
 *
 * Each target documents the agent's skill format, frontmatter fields,
 * directory paths, and any agent-specific quirks. This serves as both
 * runtime configuration and a debuggable reference.
 *
 * Sources are linked in each target's `docs` field.
 */

import type { AgentType } from '../types.ts'
import type { AgentTarget } from './types.ts'
import { amp } from './amp.ts'
import { antigravity } from './antigravity.ts'
import { claudeCode } from './claude-code.ts'
import { cline } from './cline.ts'
import { codex } from './codex.ts'
import { cursor } from './cursor.ts'
import { geminiCli } from './gemini-cli.ts'
import { githubCopilot } from './github-copilot.ts'
import { goose } from './goose.ts'
import { opencode } from './opencode.ts'
import { roo } from './roo.ts'
import { windsurf } from './windsurf.ts'

const targets: Record<AgentType, AgentTarget> = {
  'claude-code': claudeCode,
  'cursor': cursor,
  'windsurf': windsurf,
  'cline': cline,
  'codex': codex,
  'github-copilot': githubCopilot,
  'gemini-cli': geminiCli,
  'goose': goose,
  'amp': amp,
  'opencode': opencode,
  'roo': roo,
  'antigravity': antigravity,
}

export { targets as agents }
export type { AgentTarget, FrontmatterField } from './types.ts'
