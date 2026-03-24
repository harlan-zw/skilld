import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs')
  return {
    ...actual,
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    rmSync: vi.fn(),
  }
})

vi.mock('@clack/prompts', () => ({
  log: { success: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

describe('author', () => {
  beforeEach(async () => {
    vi.resetAllMocks()
    const { clearPackageJsonCache } = await import('../../src/core/package-json')
    clearPackageJsonCache()
  })

  describe('detectMonorepoPackages', () => {
    it('returns null when no package.json exists', async () => {
      const { existsSync } = await import('node:fs')
      vi.mocked(existsSync).mockReturnValue(false)

      const { detectMonorepoPackages } = await import('../../src/commands/author')
      expect(detectMonorepoPackages('/project')).toBeNull()
    })

    it('returns null for non-private packages', async () => {
      const { existsSync, readFileSync } = await import('node:fs')
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ name: 'my-pkg', version: '1.0.0' }))

      const { detectMonorepoPackages } = await import('../../src/commands/author')
      expect(detectMonorepoPackages('/project')).toBeNull()
    })

    it('detects npm workspaces array', async () => {
      const { existsSync, readFileSync, readdirSync } = await import('node:fs')

      vi.mocked(existsSync).mockImplementation((p: any) => {
        const s = String(p)
        if (s === '/project/package.json')
          return true
        if (s === '/project/packages')
          return true
        if (s === '/project/packages/foo/package.json')
          return true
        return false
      })

      vi.mocked(readFileSync).mockImplementation((p: any) => {
        const s = String(p)
        if (s === '/project/package.json')
          return JSON.stringify({ private: true, workspaces: ['packages/*'] })
        if (s === '/project/packages/foo/package.json')
          return JSON.stringify({ name: '@scope/foo', version: '2.0.0', description: 'Foo package' })
        return ''
      })

      vi.mocked(readdirSync).mockReturnValue([
        { name: 'foo', isDirectory: () => true, isFile: () => false } as any,
      ])

      const { detectMonorepoPackages } = await import('../../src/commands/author')
      const result = detectMonorepoPackages('/project')

      expect(result).toHaveLength(1)
      expect(result![0]).toMatchObject({
        name: '@scope/foo',
        version: '2.0.0',
        description: 'Foo package',
      })
    })

    it('detects pnpm-workspace.yaml', async () => {
      const { existsSync, readFileSync, readdirSync } = await import('node:fs')

      vi.mocked(existsSync).mockImplementation((p: any) => {
        const s = String(p)
        if (s === '/project/package.json')
          return true
        if (s === '/project/pnpm-workspace.yaml')
          return true
        if (s === '/project/packages')
          return true
        if (s === '/project/packages/bar/package.json')
          return true
        return false
      })

      vi.mocked(readFileSync).mockImplementation((p: any) => {
        const s = String(p)
        if (s === '/project/package.json')
          return JSON.stringify({ private: true })
        if (s === '/project/pnpm-workspace.yaml')
          return 'packages:\n  - packages/*\n'
        if (s === '/project/packages/bar/package.json')
          return JSON.stringify({ name: 'bar', version: '1.0.0' })
        return ''
      })

      vi.mocked(readdirSync).mockReturnValue([
        { name: 'bar', isDirectory: () => true, isFile: () => false } as any,
      ])

      const { detectMonorepoPackages } = await import('../../src/commands/author')
      const result = detectMonorepoPackages('/project')

      expect(result).toHaveLength(1)
      expect(result![0].name).toBe('bar')
    })

    it('skips private child packages', async () => {
      const { existsSync, readFileSync, readdirSync } = await import('node:fs')

      vi.mocked(existsSync).mockImplementation((p: any) => {
        const s = String(p)
        if (s === '/project/package.json')
          return true
        if (s === '/project/packages')
          return true
        if (s === '/project/packages/internal/package.json')
          return true
        if (s === '/project/packages/public/package.json')
          return true
        return false
      })

      vi.mocked(readFileSync).mockImplementation((p: any) => {
        const s = String(p)
        if (s === '/project/package.json')
          return JSON.stringify({ private: true, workspaces: ['packages/*'] })
        if (s === '/project/packages/internal/package.json')
          return JSON.stringify({ name: 'internal', private: true })
        if (s === '/project/packages/public/package.json')
          return JSON.stringify({ name: 'public-pkg', version: '1.0.0' })
        return ''
      })

      vi.mocked(readdirSync).mockReturnValue([
        { name: 'internal', isDirectory: () => true, isFile: () => false } as any,
        { name: 'public', isDirectory: () => true, isFile: () => false } as any,
      ])

      const { detectMonorepoPackages } = await import('../../src/commands/author')
      const result = detectMonorepoPackages('/project')

      expect(result).toHaveLength(1)
      expect(result![0].name).toBe('public-pkg')
    })

    it('handles pnpm-workspace.yaml with quoted entries', async () => {
      const { existsSync, readFileSync, readdirSync } = await import('node:fs')

      vi.mocked(existsSync).mockImplementation((p: any) => {
        const s = String(p)
        if (s === '/project/package.json')
          return true
        if (s === '/project/pnpm-workspace.yaml')
          return true
        if (s === '/project/libs')
          return true
        if (s === '/project/libs/a/package.json')
          return true
        return false
      })

      vi.mocked(readFileSync).mockImplementation((p: any) => {
        const s = String(p)
        if (s === '/project/package.json')
          return JSON.stringify({ private: true })
        if (s === '/project/pnpm-workspace.yaml')
          return 'packages:\n  - \'libs/*\'\n'
        if (s === '/project/libs/a/package.json')
          return JSON.stringify({ name: 'lib-a', version: '0.1.0' })
        return ''
      })

      vi.mocked(readdirSync).mockReturnValue([
        { name: 'a', isDirectory: () => true, isFile: () => false } as any,
      ])

      const { detectMonorepoPackages } = await import('../../src/commands/author')
      const result = detectMonorepoPackages('/project')

      expect(result).toHaveLength(1)
      expect(result![0].name).toBe('lib-a')
    })

    it('detects workspace entries that point to a package directory directly', async () => {
      const { existsSync, readFileSync, readdirSync } = await import('node:fs')

      vi.mocked(existsSync).mockImplementation((p: any) => {
        const s = String(p)
        if (s === '/project/package.json')
          return true
        if (s === '/project/packages/foo')
          return true
        if (s === '/project/packages/foo/package.json')
          return true
        return false
      })

      vi.mocked(readFileSync).mockImplementation((p: any) => {
        const s = String(p)
        if (s === '/project/package.json')
          return JSON.stringify({ private: true, workspaces: ['packages/foo'] })
        if (s === '/project/packages/foo/package.json')
          return JSON.stringify({ name: 'foo', version: '1.2.3' })
        return ''
      })

      vi.mocked(readdirSync).mockReturnValue([])

      const { detectMonorepoPackages } = await import('../../src/commands/author')
      const result = detectMonorepoPackages('/project')

      expect(result).toHaveLength(1)
      expect(result![0]).toMatchObject({
        name: 'foo',
        version: '1.2.3',
        dir: '/project/packages/foo',
      })
    })

    it('resolves repository URL from object form', async () => {
      const { existsSync, readFileSync, readdirSync } = await import('node:fs')

      vi.mocked(existsSync).mockImplementation((p: any) => {
        const s = String(p)
        if (s === '/project/package.json')
          return true
        if (s === '/project/packages')
          return true
        if (s === '/project/packages/x/package.json')
          return true
        return false
      })

      vi.mocked(readFileSync).mockImplementation((p: any) => {
        const s = String(p)
        if (s === '/project/package.json')
          return JSON.stringify({ private: true, workspaces: ['packages/*'] })
        if (s === '/project/packages/x/package.json') {
          return JSON.stringify({
            name: 'x-pkg',
            version: '1.0.0',
            repository: { type: 'git', url: 'git+https://github.com/org/x.git' },
          })
        }
        return ''
      })

      vi.mocked(readdirSync).mockReturnValue([
        { name: 'x', isDirectory: () => true, isFile: () => false } as any,
      ])

      const { detectMonorepoPackages } = await import('../../src/commands/author')
      const result = detectMonorepoPackages('/project')

      expect(result![0].repoUrl).toBe('https://github.com/org/x')
    })
  })

  describe('patchPackageJsonFiles', () => {
    it('warns when no files array exists', async () => {
      const { existsSync, readFileSync } = await import('node:fs')
      const { log } = await import('@clack/prompts')

      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ name: 'test' }))

      const { patchPackageJsonFiles } = await import('../../src/commands/author')
      patchPackageJsonFiles('/pkg')

      expect(log.warn).toHaveBeenCalledWith(expect.stringContaining('No `files` array'))
    })

    it('adds skills to files array preserving formatting', async () => {
      const { existsSync, readFileSync, writeFileSync } = await import('node:fs')

      vi.mocked(existsSync).mockReturnValue(true)
      const original = `{
  "name": "test",
  "files": [
    "dist"
  ]
}`
      vi.mocked(readFileSync).mockReturnValue(original)

      const { patchPackageJsonFiles } = await import('../../src/commands/author')
      patchPackageJsonFiles('/pkg')

      const written = vi.mocked(writeFileSync).mock.calls[0][1] as string
      expect(written).toContain('"skills"')
      expect(written).toContain('"dist"')
      // Should not have been reformatted by JSON.stringify (no double-space after "name")
      expect(JSON.parse(written).files).toContain('skills')
    })

    it('skips if skills already in files array', async () => {
      const { existsSync, readFileSync, writeFileSync } = await import('node:fs')

      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ files: ['dist', 'skills'] }))

      const { patchPackageJsonFiles } = await import('../../src/commands/author')
      patchPackageJsonFiles('/pkg')

      expect(writeFileSync).not.toHaveBeenCalled()
    })

    it('skips if skills/ variant already in files array', async () => {
      const { existsSync, readFileSync, writeFileSync } = await import('node:fs')

      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ files: ['dist', 'skills/'] }))

      const { patchPackageJsonFiles } = await import('../../src/commands/author')
      patchPackageJsonFiles('/pkg')

      expect(writeFileSync).not.toHaveBeenCalled()
    })

    it('does nothing when no package.json exists', async () => {
      const { existsSync, writeFileSync } = await import('node:fs')

      vi.mocked(existsSync).mockReturnValue(false)

      const { patchPackageJsonFiles } = await import('../../src/commands/author')
      patchPackageJsonFiles('/pkg')

      expect(writeFileSync).not.toHaveBeenCalled()
    })
  })
})
