#!/usr/bin/env node
/**
 * Ultra-fast prepare entry point for package.json "prepare" hook.
 *
 * Avoids loading the full CLI (citty, clack, agent registry, etc.) which adds ~200ms.
 * Fast path: read lockfile, verify skill dirs exist, exit. Typically <20ms.
 * Falls back to full CLI for shipped skill discovery and symlink restoration.
 */

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { readLock } from './core/lockfile.ts'
import { getShippedSkills, linkShippedSkill, restorePkgSymlink } from './core/prepare.ts'

// Inlined from core/shared.ts to avoid pulling in semver/std-env via shared chunk
const SHARED_SKILLS_DIR = '.skills'

// ── Lightweight agent resolution (avoids importing full agent registry) ──

const AGENT_DIRS = [
  '.claude/skills',
  '.cursor/skills',
  '.agents/skills',
  '.windsurf/skills',
  '.cline/skills',
  '.github/skills',
  '.gemini/skills',
  '.goose/skills',
  '.roo/skills',
  '.opencode/skills',
  '.agent/skills',
]

const AGENT_DIR_MAP: Record<string, string> = {
  'claude-code': '.claude/skills',
  'cursor': '.cursor/skills',
  'codex': '.agents/skills',
  'windsurf': '.windsurf/skills',
  'cline': '.cline/skills',
  'github-copilot': '.github/skills',
  'gemini-cli': '.gemini/skills',
  'goose': '.goose/skills',
  'roo': '.roo/skills',
  'opencode': '.opencode/skills',
  'amp': '.agents/skills',
  'antigravity': '.agent/skills',
}

function findSkillsDir(cwd: string): string | null {
  const shared = join(cwd, SHARED_SKILLS_DIR)
  if (existsSync(shared))
    return shared

  for (const dir of AGENT_DIRS) {
    const full = join(cwd, dir)
    if (existsSync(join(full, 'skilld-lock.yaml')))
      return full
  }

  const configPath = join(homedir(), '.skilld', 'config.yaml')
  if (existsSync(configPath)) {
    const content = readFileSync(configPath, 'utf-8')
    const match = content.match(/^agent:\s*(.+)/m)
    if (match) {
      const dir = AGENT_DIR_MAP[match[1]!.trim()]
      if (dir)
        return join(cwd, dir)
    }
  }

  return null
}

// ── Main ──

const cwd = process.cwd()

if (process.env.CI || process.env.SKILLD_NO_AGENT)
  process.exit(0)

const skillsDir = findSkillsDir(cwd)
if (!skillsDir)
  process.exit(0)

const lock = readLock(skillsDir)
if (!lock || Object.keys(lock.skills).length === 0)
  process.exit(0)

let allIntact = true

for (const [name, info] of Object.entries(lock.skills)) {
  const skillDir = join(skillsDir, name)
  if (existsSync(skillDir)) {
    if (info.source !== 'shipped')
      restorePkgSymlink(skillsDir, name, info, cwd)
    continue
  }

  allIntact = false

  if (info.source === 'shipped') {
    const pkgName = info.packageName || name
    const shipped = getShippedSkills(pkgName, cwd, info.version)
    const match = shipped.find(s => s.skillName === name)
    if (match)
      linkShippedSkill(skillsDir, name, match.skillDir)
  }
}

if (allIntact)
  process.exit(0)

// Something was broken; fall back to full CLI for shipped discovery + outdated reporting
const cliPath = resolve(import.meta.dirname, 'cli.mjs')
if (existsSync(cliPath)) {
  try {
    execFileSync(process.execPath, [cliPath, 'prepare'], { stdio: 'inherit', cwd })
  }
  catch {}
}
