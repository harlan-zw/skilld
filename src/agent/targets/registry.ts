/**
 * Agent targets registry — all supported agents and their skill conventions
 */

import type { AgentType } from '../types'
import type { AgentTarget } from './types'
import { amp } from './amp'
import { claudeCode } from './claude-code'
import { cline } from './cline'
import { codex } from './codex'
import { cursor } from './cursor'
import { geminiCli } from './gemini-cli'
import { githubCopilot } from './github-copilot'
import { goose } from './goose'
import { opencode } from './opencode'
import { roo } from './roo'
import { windsurf } from './windsurf'

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
