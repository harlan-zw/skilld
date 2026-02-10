import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs')
  return {
    ...actual,
    existsSync: vi.fn(),
    lstatSync: vi.fn(),
    mkdirSync: vi.fn(),
    symlinkSync: vi.fn(),
    unlinkSync: vi.fn(),
  }
})

vi.mock('../../src/agent/registry', () => ({
  agents: {
    'claude-code': {
      skillsDir: '.claude/skills',
      detectInstalled: () => true,
      detectEnv: () => false,
      detectProject: () => true,
    },
    'cursor': {
      skillsDir: '.cursor/skills',
      detectInstalled: () => true,
      detectEnv: () => false,
      detectProject: () => false,
    },
  },
}))

vi.mock('../../src/core/sanitize', () => ({
  repairMarkdown: (s: string) => s,
  sanitizeMarkdown: (s: string) => s,
}))

vi.mock('../../src/agent/detect', () => ({
  detectInstalledAgents: () => ['claude-code', 'cursor'],
}))

const { existsSync, lstatSync, mkdirSync, symlinkSync, unlinkSync } = await import('node:fs')

describe('shared skills', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('getSharedSkillsDir', () => {
    it('returns path when .skills/ exists', async () => {
      vi.mocked(existsSync).mockImplementation((p: any) =>
        String(p).endsWith('.skills'),
      )
      const { getSharedSkillsDir } = await import('../../src/core/shared')
      expect(getSharedSkillsDir('/project')).toBe('/project/.skills')
    })

    it('returns null when .skills/ does not exist', async () => {
      vi.mocked(existsSync).mockReturnValue(false)
      const { getSharedSkillsDir } = await import('../../src/core/shared')
      expect(getSharedSkillsDir('/project')).toBeNull()
    })
  })

  describe('linkSkillToAgents', () => {
    it('creates symlinks for agents with existing config dirs', async () => {
      vi.mocked(existsSync).mockImplementation((p: any) => {
        const s = String(p)
        // .claude/ exists, .cursor/ does not
        return s === '/project/.claude'
      })
      vi.mocked(lstatSync).mockImplementation(() => {
        throw new Error('ENOENT')
      })

      const { linkSkillToAgents } = await import('../../src/agent/install')
      linkSkillToAgents('vue', '/project/.skills', '/project')

      expect(mkdirSync).toHaveBeenCalledWith('/project/.claude/skills', { recursive: true })
      expect(symlinkSync).toHaveBeenCalledWith('../../.skills/vue', '/project/.claude/skills/vue')
      // .cursor/ doesn't exist, so no symlink for it
      expect(symlinkSync).toHaveBeenCalledTimes(1)
    })

    it('replaces existing symlinks', async () => {
      vi.mocked(existsSync).mockImplementation((p: any) => {
        const s = String(p)
        return s === '/project/.claude' || s === '/project/.claude/skills/vue'
      })
      vi.mocked(lstatSync).mockReturnValue({ isSymbolicLink: () => true } as any)

      const { linkSkillToAgents } = await import('../../src/agent/install')
      linkSkillToAgents('vue', '/project/.skills', '/project')

      expect(unlinkSync).toHaveBeenCalledWith('/project/.claude/skills/vue')
      expect(symlinkSync).toHaveBeenCalled()
    })

    it('skips real directories', async () => {
      vi.mocked(existsSync).mockImplementation((p: any) => {
        const s = String(p)
        return s === '/project/.claude' || s === '/project/.claude/skills/vue'
      })
      vi.mocked(lstatSync).mockReturnValue({ isSymbolicLink: () => false } as any)

      const { linkSkillToAgents } = await import('../../src/agent/install')
      linkSkillToAgents('vue', '/project/.skills', '/project')

      expect(symlinkSync).not.toHaveBeenCalled()
    })
  })

  describe('unlinkSkillFromAgents', () => {
    it('removes symlinks from agent dirs', async () => {
      vi.mocked(lstatSync).mockReturnValue({ isSymbolicLink: () => true } as any)

      const { unlinkSkillFromAgents } = await import('../../src/agent/install')
      unlinkSkillFromAgents('vue', '/project')

      expect(unlinkSync).toHaveBeenCalledWith('/project/.claude/skills/vue')
    })

    it('skips non-symlinks', async () => {
      vi.mocked(lstatSync).mockReturnValue({ isSymbolicLink: () => false } as any)

      const { unlinkSkillFromAgents } = await import('../../src/agent/install')
      unlinkSkillFromAgents('vue', '/project')

      expect(unlinkSync).not.toHaveBeenCalled()
    })

    it('handles missing paths gracefully', async () => {
      vi.mocked(lstatSync).mockImplementation(() => {
        throw new Error('ENOENT')
      })

      const { unlinkSkillFromAgents } = await import('../../src/agent/install')
      expect(() => unlinkSkillFromAgents('vue', '/project')).not.toThrow()
    })
  })
})
