import { existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cacheCleanCommand } from '../../src/commands/cache.ts'

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
  log: { success: vi.fn(), info: vi.fn() },
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
