import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockFetchRaw = vi.fn()
const mockFetch = vi.fn()

vi.mock('ofetch', () => ({
  ofetch: {
    create: () => Object.assign(mockFetch, { raw: mockFetchRaw }),
  },
}))

// Mock spawnSync to control getGitHubToken's return value
const mockSpawnSync = vi.fn(() => ({ stdout: '', status: 1 }))
vi.mock('node:child_process', () => ({
  spawnSync: (...args: any[]) => mockSpawnSync(...args),
}))

// Force fresh module load — _ghToken cache is module-level
let mod: typeof import('../../src/sources/github-common')

function setToken(token: string | null) {
  // getGitHubToken caches in _ghToken; reset by reloading module
  // Instead, mock spawnSync to return the desired token
  mockSpawnSync.mockReturnValue({ stdout: token ?? '', status: token ? 0 : 1 })
  // Force cache reset by re-importing (vitest dedupes, so we access internal state via side effect)
}

beforeEach(async () => {
  mockFetch.mockReset()
  mockFetchRaw.mockReset()
  mockSpawnSync.mockReset()
  mockSpawnSync.mockReturnValue({ stdout: '', status: 1 })
  // Re-import to reset _ghToken cache
  vi.resetModules()
  // Re-mock after resetModules
  vi.doMock('ofetch', () => ({
    ofetch: {
      create: () => Object.assign(mockFetch, { raw: mockFetchRaw }),
    },
  }))
  vi.doMock('node:child_process', () => ({
    spawnSync: (...args: any[]) => mockSpawnSync(...args),
  }))
  mod = await import('../../src/sources/github-common')
})

describe('ghApi', () => {
  it('returns null when no token available', async () => {
    const result = await mod.ghApi('repos/owner/repo')
    expect(result).toBeNull()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('fetches with auth header when token available', async () => {
    mockSpawnSync.mockReturnValue({ stdout: 'ghs_abc\n' })
    mockFetch.mockResolvedValueOnce({ homepage: 'https://example.com' })

    const result = await mod.ghApi<{ homepage: string }>('repos/owner/repo')

    expect(result).toEqual({ homepage: 'https://example.com' })
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/owner/repo',
      { headers: { Authorization: 'token ghs_abc' } },
    )
  })

  it('returns null on fetch error', async () => {
    mockSpawnSync.mockReturnValue({ stdout: 'ghs_abc\n' })
    mockFetch.mockRejectedValueOnce(new Error('500'))

    const result = await mod.ghApi('repos/owner/repo')
    expect(result).toBeNull()
  })
})

describe('ghApiPaginated', () => {
  it('returns empty array when no token available', async () => {
    const result = await mod.ghApiPaginated('repos/owner/repo/releases')
    expect(result).toEqual([])
    expect(mockFetchRaw).not.toHaveBeenCalled()
  })

  it('fetches single page', async () => {
    mockSpawnSync.mockReturnValue({ stdout: 'ghs_abc\n' })
    mockFetchRaw.mockResolvedValueOnce({
      ok: true,
      _data: [{ id: 1 }, { id: 2 }],
      headers: new Headers(),
    })

    const result = await mod.ghApiPaginated<{ id: number }>('repos/o/r/releases')

    expect(result).toEqual([{ id: 1 }, { id: 2 }])
    expect(mockFetchRaw).toHaveBeenCalledTimes(1)
  })

  it('follows Link next header across pages', async () => {
    mockSpawnSync.mockReturnValue({ stdout: 'ghs_abc\n' })
    mockFetchRaw
      .mockResolvedValueOnce({
        ok: true,
        _data: [{ id: 1 }],
        headers: new Headers({
          link: '<https://api.github.com/repos/o/r/releases?page=2>; rel="next", <https://api.github.com/repos/o/r/releases?page=3>; rel="last"',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        _data: [{ id: 2 }],
        headers: new Headers({
          link: '<https://api.github.com/repos/o/r/releases?page=3>; rel="next"',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        _data: [{ id: 3 }],
        headers: new Headers(),
      })

    const result = await mod.ghApiPaginated<{ id: number }>('repos/o/r/releases')

    expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
    expect(mockFetchRaw).toHaveBeenCalledTimes(3)
    expect(mockFetchRaw).toHaveBeenNthCalledWith(
      2,
      'https://api.github.com/repos/o/r/releases?page=2',
      expect.objectContaining({ headers: { Authorization: 'token ghs_abc' } }),
    )
  })

  it('stops on fetch error mid-pagination and returns partial results', async () => {
    mockSpawnSync.mockReturnValue({ stdout: 'ghs_abc\n' })
    mockFetchRaw
      .mockResolvedValueOnce({
        ok: true,
        _data: [{ id: 1 }],
        headers: new Headers({
          link: '<https://api.github.com/repos/o/r/releases?page=2>; rel="next"',
        }),
      })
      .mockRejectedValueOnce(new Error('network error'))

    const result = await mod.ghApiPaginated<{ id: number }>('repos/o/r/releases')

    expect(result).toEqual([{ id: 1 }])
  })

  it('stops when response data is not an array', async () => {
    mockSpawnSync.mockReturnValue({ stdout: 'ghs_abc\n' })
    mockFetchRaw.mockResolvedValueOnce({
      ok: true,
      _data: { message: 'not found' },
      headers: new Headers(),
    })

    const result = await mod.ghApiPaginated('repos/o/r/releases')
    expect(result).toEqual([])
  })
})
