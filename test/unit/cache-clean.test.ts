import { existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cacheCleanCommand, cacheStatsCommand } from '../../src/commands/cache.ts'

vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs')
  return {
    ...actual,
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    readFileSync: vi.fn(),
    statSync: vi.fn(),
    rmSync: vi.fn(),
  }
})

vi.mock('@clack/prompts', () => ({
  log: { success: vi.fn(), info: vi.fn(), message: vi.fn() },
}))

vi.mock('../../src/retriv/embedding-cache.ts', () => ({
  clearEmbeddingCache: vi.fn(),
}))

describe('cacheCleanCommand', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('removes expired entries', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readdirSync).mockReturnValue(['old.json'] as any)
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ timestamp: 0 }))
    vi.mocked(statSync).mockReturnValue({ size: 1024 } as any)

    await cacheCleanCommand()

    expect(rmSync).toHaveBeenCalledWith(expect.stringContaining('old.json'))
  })

  it('survives unreadable cache entries', async () => {
    vi.mocked(existsSync).mockImplementation((p: any) =>
      String(p).includes('llm-cache'),
    )
    vi.mocked(readdirSync).mockReturnValue(['corrupt.json'] as any)
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error('EACCES')
    })
    // statSync also fails (broken symlink, gone, permissions)
    vi.mocked(statSync).mockImplementation(() => {
      throw new Error('ENOENT')
    })

    // Should not throw, and should still attempt removal
    await expect(cacheCleanCommand()).resolves.toBeUndefined()
    expect(rmSync).toHaveBeenCalledWith(expect.stringContaining('corrupt.json'))
  })

  it('removes corrupt entries when stat succeeds', async () => {
    vi.mocked(existsSync).mockImplementation((p: any) =>
      String(p).includes('llm-cache'),
    )
    vi.mocked(readdirSync).mockReturnValue(['bad.json'] as any)
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error('invalid json')
    })
    vi.mocked(statSync).mockReturnValue({ size: 512 } as any)

    await cacheCleanCommand()

    expect(rmSync).toHaveBeenCalledWith(expect.stringContaining('bad.json'))
  })
})

describe('cacheStatsCommand', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('runs without error on empty cache', () => {
    vi.mocked(existsSync).mockReturnValue(false)
    vi.mocked(readdirSync).mockReturnValue([] as any)

    expect(() => cacheStatsCommand()).not.toThrow()
  })

  it('reports total and sections in output', async () => {
    const { log } = await import('@clack/prompts')
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readdirSync).mockReturnValue([] as any)
    vi.mocked(statSync).mockReturnValue({ size: 0 } as any)

    cacheStatsCommand()

    const output = vi.mocked(log.message).mock.calls[0]![0] as string
    expect(output).toContain('References')
    expect(output).toContain('LLM cache')
    expect(output).toContain('Total')
    expect(output).toContain('0 packages')
  })

  it('counts scoped packages correctly', async () => {
    const { log } = await import('@clack/prompts')

    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(statSync).mockReturnValue({ size: 100 } as any)

    // Simulate: references/ contains vue@3.5.0 (unscoped) and @vue/ scope dir
    // @vue/ contains runtime-core@3.5.0 and shared@3.5.0
    // Total packages = 3 (vue, runtime-core, shared)
    vi.mocked(readdirSync).mockImplementation(((dir: string, _opts?: any) => {
      if (dir.includes('references')) {
        return [
          { name: 'vue@3.5.0', isFile: () => false, isDirectory: () => true, parentPath: dir },
          { name: '@vue', isFile: () => false, isDirectory: () => true, parentPath: dir },
          { name: 'runtime-core@3.5.0', isFile: () => false, isDirectory: () => true, parentPath: `${dir}/@vue` },
          { name: 'shared@3.5.0', isFile: () => false, isDirectory: () => true, parentPath: `${dir}/@vue` },
        ] as any
      }
      return [] as any
    }) as any)

    cacheStatsCommand()

    const output = vi.mocked(log.message).mock.calls[0]![0] as string
    expect(output).toContain('3 packages')
  })
})
