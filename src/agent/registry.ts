/**
 * Agent registry - definitions for all supported agents
 */

import type { AgentConfig, AgentType } from './types'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const home = homedir()
const configHome = process.env.XDG_CONFIG_HOME || join(home, '.config')
const claudeHome = process.env.CLAUDE_CONFIG_DIR || join(home, '.claude')
const codexHome = process.env.CODEX_HOME || join(home, '.codex')

export const agents: Record<AgentType, AgentConfig> = {
  'claude-code': {
    name: 'claude-code',
    displayName: 'Claude Code',
    skillsDir: '.claude/skills',
    globalSkillsDir: join(claudeHome, 'skills'),
    detectInstalled: () => existsSync(claudeHome),
    cli: 'claude',
  },
  'cursor': {
    name: 'cursor',
    displayName: 'Cursor',
    skillsDir: '.cursor/skills',
    globalSkillsDir: join(home, '.cursor/skills'),
    detectInstalled: () => existsSync(join(home, '.cursor')),
  },
  'windsurf': {
    name: 'windsurf',
    displayName: 'Windsurf',
    skillsDir: '.windsurf/skills',
    globalSkillsDir: join(home, '.codeium/windsurf/skills'),
    detectInstalled: () => existsSync(join(home, '.codeium/windsurf')),
  },
  'cline': {
    name: 'cline',
    displayName: 'Cline',
    skillsDir: '.cline/skills',
    globalSkillsDir: join(home, '.cline/skills'),
    detectInstalled: () => existsSync(join(home, '.cline')),
  },
  'codex': {
    name: 'codex',
    displayName: 'Codex',
    skillsDir: '.codex/skills',
    globalSkillsDir: join(codexHome, 'skills'),
    detectInstalled: () => existsSync(codexHome),
    cli: 'codex',
  },
  'github-copilot': {
    name: 'github-copilot',
    displayName: 'GitHub Copilot',
    skillsDir: '.github/skills',
    globalSkillsDir: join(home, '.copilot/skills'),
    detectInstalled: () => existsSync(join(home, '.copilot')),
  },
  'gemini-cli': {
    name: 'gemini-cli',
    displayName: 'Gemini CLI',
    skillsDir: '.gemini/skills',
    globalSkillsDir: join(home, '.gemini/skills'),
    detectInstalled: () => existsSync(join(home, '.gemini')),
    cli: 'gemini',
  },
  'goose': {
    name: 'goose',
    displayName: 'Goose',
    skillsDir: '.goose/skills',
    globalSkillsDir: join(configHome, 'goose/skills'),
    detectInstalled: () => existsSync(join(configHome, 'goose')),
    cli: 'goose',
  },
  'amp': {
    name: 'amp',
    displayName: 'Amp',
    skillsDir: '.agents/skills',
    globalSkillsDir: join(configHome, 'agents/skills'),
    detectInstalled: () => existsSync(join(configHome, 'amp')),
  },
  'opencode': {
    name: 'opencode',
    displayName: 'OpenCode',
    skillsDir: '.opencode/skills',
    globalSkillsDir: join(configHome, 'opencode/skills'),
    detectInstalled: () => existsSync(join(configHome, 'opencode')),
  },
  'roo': {
    name: 'roo',
    displayName: 'Roo Code',
    skillsDir: '.roo/skills',
    globalSkillsDir: join(home, '.roo/skills'),
    detectInstalled: () => existsSync(join(home, '.roo')),
  },
}
