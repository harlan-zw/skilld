/**
 * E2E tests for no-agent portable prompt flow via `skilld add` + `skilld assemble`.
 *
 * Spawns the CLI as a subprocess with SKILLD_NO_AGENT=1 — no internal API imports.
 * Uses `citty` as a small, fast package that resolves quickly.
 */

import { execFileSync } from 'node:child_process'
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'pathe'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const TEST_PKG = 'citty'
const WORK_DIR = join(tmpdir(), `skilld-prompt-test-${Date.now()}`)
const OUT_DIR = join(WORK_DIR, '.claude', 'skills', `${TEST_PKG}-skilld`)
const CLI = resolve(__dirname, '../../dist/cli.mjs')

function run(args: string[], cwd = WORK_DIR): string {
  return execFileSync('node', [CLI, ...args], {
    encoding: 'utf-8',
    timeout: 120_000,
    cwd,
    env: { ...process.env, DISABLE_TELEMETRY: '1', SKILLD_NO_AGENT: '1' },
  })
}

describe('skilld add (no agent) + assemble', () => {
  beforeAll(() => {
    mkdirSync(WORK_DIR, { recursive: true })
  })

  // ── skilld add with no agent ────────────────────────────────────

  describe('skilld add (no agent)', () => {
    beforeAll(() => {
      run(['add', TEST_PKG])
    }, 120_000)

    it('creates skill directory', () => {
      expect(existsSync(OUT_DIR)).toBe(true)
    })

    it('writes SKILL.md', () => {
      const skillMd = join(OUT_DIR, 'SKILL.md')
      expect(existsSync(skillMd)).toBe(true)
      const content = readFileSync(skillMd, 'utf-8')
      expect(content).toContain('---')
      expect(content).toContain('name:')
      expect(content).toContain(TEST_PKG)
    })

    it('writes PROMPT_best-practices.md', () => {
      const promptFile = join(OUT_DIR, 'PROMPT_best-practices.md')
      expect(existsSync(promptFile)).toBe(true)
      const content = readFileSync(promptFile, 'utf-8')
      expect(content).toContain('## Task')
      expect(content).toContain('## Rules')
    })

    it('writes PROMPT_api-changes.md', () => {
      const promptFile = join(OUT_DIR, 'PROMPT_api-changes.md')
      expect(existsSync(promptFile)).toBe(true)
      const content = readFileSync(promptFile, 'utf-8')
      expect(content).toContain('## Task')
    })

    it('prompts contain no absolute paths', () => {
      for (const file of readdirSync(OUT_DIR)) {
        if (!file.startsWith('PROMPT_'))
          continue
        const content = readFileSync(join(OUT_DIR, file), 'utf-8')
        expect(content).not.toMatch(/`\/(?:home|Users|tmp|var)\/[^`]+`/)
      }
    })

    it('prompts use ./references/ paths', () => {
      const promptFile = join(OUT_DIR, 'PROMPT_best-practices.md')
      const content = readFileSync(promptFile, 'utf-8')
      expect(content).not.toContain('.skilld/')
    })

    it('prompts have no agent-specific instructions', () => {
      for (const file of readdirSync(OUT_DIR)) {
        if (!file.startsWith('PROMPT_'))
          continue
        const content = readFileSync(join(OUT_DIR, file), 'utf-8')
        expect(content).not.toContain('Task tool')
        expect(content).not.toContain('spawn subagents')
        expect(content).not.toContain('Write tool')
        expect(content).not.toContain('skilld validate')
      }
    })

    it('prompts have portable output instruction with assemble command', () => {
      for (const file of readdirSync(OUT_DIR)) {
        if (!file.startsWith('PROMPT_'))
          continue
        const content = readFileSync(join(OUT_DIR, file), 'utf-8')
        expect(content).toContain('Output the section content as plain markdown')
        expect(content).toContain('skilld assemble')
      }
    })

    it('creates references/ directory with docs', () => {
      const refsDir = join(OUT_DIR, 'references')
      expect(existsSync(refsDir)).toBe(true)
      const entries = readdirSync(refsDir)
      expect(entries.length).toBeGreaterThan(0)
    })

    it('references/ contains real files not symlinks', () => {
      const refsDir = join(OUT_DIR, 'references')
      if (!existsSync(refsDir))
        return
      for (const entry of readdirSync(refsDir)) {
        const stat = lstatSync(join(refsDir, entry))
        expect(stat.isSymbolicLink()).toBe(false)
      }
    })

    it('does not leave .skilld/ directory behind', () => {
      expect(existsSync(join(OUT_DIR, '.skilld'))).toBe(false)
    })

    it('skill md uses ./references/ paths (eject mode)', () => {
      const content = readFileSync(join(OUT_DIR, 'SKILL.md'), 'utf-8')
      if (content.includes('References:')) {
        expect(content).toContain('./references/')
        expect(content).not.toContain('./.skilld/')
      }
    })
  })

  // ── assemble command ────────────────────────────────────────────

  describe('skilld assemble', () => {
    const ASSEMBLE_DIR = join(WORK_DIR, 'assemble-test')

    beforeAll(() => {
      mkdirSync(ASSEMBLE_DIR, { recursive: true })

      // Copy SKILL.md from prompt output
      const skillMd = readFileSync(join(OUT_DIR, 'SKILL.md'), 'utf-8')
      writeFileSync(join(ASSEMBLE_DIR, 'SKILL.md'), skillMd)

      // Simulate pasting LLM output as _BEST_PRACTICES.md
      writeFileSync(join(ASSEMBLE_DIR, '_BEST_PRACTICES.md'), `## Best Practices

- Use \`defineCommand()\` to define CLI commands with typed args
- Always provide \`meta.name\` and \`meta.description\` for help text
- Use \`type: 'positional'\` for required args, named args for optional flags
`)

      // Simulate _API_CHANGES.md
      writeFileSync(join(ASSEMBLE_DIR, '_API_CHANGES.md'), `## API Changes (v1.x)

- NEW: \`defineCommand()\` now supports \`subCommands\` for nested CLI structures
- DEPRECATED: Old \`createCommand()\` removed in v1.0
`)
    })

    it('merges section outputs into SKILL.md', () => {
      run(['assemble', ASSEMBLE_DIR])

      const result = readFileSync(join(ASSEMBLE_DIR, 'SKILL.md'), 'utf-8')
      expect(result).toContain('## Best Practices')
      expect(result).toContain('defineCommand()')
      expect(result).toContain('## API Changes')
      expect(result).toContain('subCommands')
    })

    it('preserves frontmatter from original SKILL.md', () => {
      const result = readFileSync(join(ASSEMBLE_DIR, 'SKILL.md'), 'utf-8')
      expect(result).toMatch(/^---\n/)
      expect(result).toContain('name:')
    })

    it('merges in correct order (api-changes before best-practices)', () => {
      const result = readFileSync(join(ASSEMBLE_DIR, 'SKILL.md'), 'utf-8')
      const apiIdx = result.indexOf('## API Changes')
      const bpIdx = result.indexOf('## Best Practices')
      expect(apiIdx).toBeGreaterThan(-1)
      expect(bpIdx).toBeGreaterThan(-1)
      expect(apiIdx).toBeLessThan(bpIdx)
    })
  })

  // ── assemble with no outputs ────────────────────────────────────

  describe('skilld assemble (no output files)', () => {
    const EMPTY_DIR = join(WORK_DIR, 'empty-assemble')

    beforeAll(() => {
      mkdirSync(EMPTY_DIR, { recursive: true })
      writeFileSync(join(EMPTY_DIR, 'SKILL.md'), '---\nname: test\n---\n\n# Test\n')
    })

    it('does not crash with no section files', () => {
      run(['assemble', EMPTY_DIR])
      const result = readFileSync(join(EMPTY_DIR, 'SKILL.md'), 'utf-8')
      expect(result).toContain('name: test')
    })
  })

  // ── assemble rejects invalid content ────────────────────────────

  describe('skilld assemble (invalid content)', () => {
    const BAD_DIR = join(WORK_DIR, 'bad-assemble')

    beforeAll(() => {
      mkdirSync(BAD_DIR, { recursive: true })
      writeFileSync(join(BAD_DIR, 'SKILL.md'), '---\nname: test\n---\n\n# Test\n')
      writeFileSync(join(BAD_DIR, '_BEST_PRACTICES.md'), 'This is just plain text with no headings or structure at all.')
    })

    it('rejects content without section structure', () => {
      run(['assemble', BAD_DIR])
      const result = readFileSync(join(BAD_DIR, 'SKILL.md'), 'utf-8')
      expect(result).not.toContain('plain text with no headings')
    })
  })

  // ── cleanup ─────────────────────────────────────────────────────

  afterAll(() => {
    try {
      rmSync(WORK_DIR, { recursive: true, force: true })
    }
    catch {}
  })
})
