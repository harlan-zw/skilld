/**
 * Agent targets registry — all supported agents and their skill conventions
 */

import type { AgentType } from '../types.ts'
import type { AgentTarget } from './types.ts'
import { amp } from './amp.ts'
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

export const targets: Record<AgentType, AgentTarget> = {
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
}
