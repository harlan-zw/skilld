import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { detectTargetAgent } from '../../src/agent/detect'

describe('agent/detect', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('detectTargetAgent', () => {
    it('detects claude-code from CLAUDE_CODE env', () => {
      process.env.CLAUDE_CODE = '1'
      expect(detectTargetAgent()).toBe('claude-code')
    })

    it('detects claude-code from CLAUDE_CONFIG_DIR env', () => {
      process.env.CLAUDE_CONFIG_DIR = '/home/user/.claude'
      expect(detectTargetAgent()).toBe('claude-code')
    })

    it('detects cursor from CURSOR_SESSION env', () => {
      process.env.CURSOR_SESSION = 'abc123'
      expect(detectTargetAgent()).toBe('cursor')
    })

    it('detects cursor from CURSOR_TRACE_ID env', () => {
      process.env.CURSOR_TRACE_ID = 'trace-123'
      expect(detectTargetAgent()).toBe('cursor')
    })

    it('detects windsurf from WINDSURF_SESSION env', () => {
      process.env.WINDSURF_SESSION = 'ws-123'
      expect(detectTargetAgent()).toBe('windsurf')
    })

    it('detects cline from CLINE_TASK_ID env', () => {
      process.env.CLINE_TASK_ID = 'task-123'
      expect(detectTargetAgent()).toBe('cline')
    })

    it('detects codex from CODEX_HOME env', () => {
      process.env.CODEX_HOME = '/home/user/.codex'
      expect(detectTargetAgent()).toBe('codex')
    })

    it('detects github-copilot from GITHUB_COPILOT_SESSION', () => {
      process.env.GITHUB_COPILOT_SESSION = 'gh-123'
      expect(detectTargetAgent()).toBe('github-copilot')
    })

    it('detects gemini-cli from GEMINI_API_KEY + GEMINI_SESSION', () => {
      process.env.GEMINI_API_KEY = 'key'
      process.env.GEMINI_SESSION = 'session'
      expect(detectTargetAgent()).toBe('gemini-cli')
    })

    it('does not detect gemini-cli from GEMINI_API_KEY alone', () => {
      process.env.GEMINI_API_KEY = 'key'
      expect(detectTargetAgent()).not.toBe('gemini-cli')
    })

    it('detects goose from GOOSE_SESSION', () => {
      process.env.GOOSE_SESSION = 'goose-123'
      expect(detectTargetAgent()).toBe('goose')
    })

    it('detects amp from AMP_SESSION', () => {
      process.env.AMP_SESSION = 'amp-123'
      expect(detectTargetAgent()).toBe('amp')
    })

    it('detects opencode from OPENCODE_SESSION', () => {
      process.env.OPENCODE_SESSION = 'oc-123'
      expect(detectTargetAgent()).toBe('opencode')
    })

    it('detects roo from ROO_SESSION', () => {
      process.env.ROO_SESSION = 'roo-123'
      expect(detectTargetAgent()).toBe('roo')
    })

    it('prioritizes env vars over directory detection', () => {
      process.env.CURSOR_SESSION = 'cursor'
      // Even if .claude exists, env var takes precedence
      expect(detectTargetAgent()).toBe('cursor')
    })
  })
})
