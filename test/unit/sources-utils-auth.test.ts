import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockFetchRaw = vi.fn()
const mockGetGitHubToken = vi.fn<() => string | null>(() => null)
const mockIsKnownPrivateRepo = vi.fn<(owner: string, repo: string) => boolean>(() => false)

function createMockFetch() {
  const $fetch = (async () => null) as unknown as ((url: string, opts?: unknown) => Promise<unknown>) & {
    raw: (url: string, opts?: unknown) => Promise<unknown>
  }
  $fetch.raw = async (url: string, opts?: unknown) => mockFetchRaw(url, opts)
  return $fetch
}

vi.mock('ofetch', () => ({
  ofetch: { create: () => createMockFetch() },
}))

vi.mock('../../src/sources/github-common', () => ({
  getGitHubToken: mockGetGitHubToken,
  isKnownPrivateRepo: mockIsKnownPrivateRepo,
}))

const { fetchGitHubRaw } = await import('../../src/sources/utils')

describe('sources/utils auth', () => {
  beforeEach(() => {
    mockFetchRaw.mockReset()
    mockGetGitHubToken.mockReset()
    mockIsKnownPrivateRepo.mockReset()
    mockGetGitHubToken.mockReturnValue(null)
    mockIsKnownPrivateRepo.mockReturnValue(false)
  })

  it('returns unauthenticated content for public repos', async () => {
    mockFetchRaw.mockResolvedValueOnce({ ok: true, status: 200, _data: 'public content' })

    const result = await fetchGitHubRaw('https://raw.githubusercontent.com/owner/repo/main/README.md')

    expect(result).toBe('public content')
    expect(mockFetchRaw).toHaveBeenCalledTimes(1)
    expect(mockFetchRaw).toHaveBeenCalledWith('https://raw.githubusercontent.com/owner/repo/main/README.md', undefined)
  })

  it('falls back to authenticated request when unauthenticated request fails', async () => {
    mockFetchRaw
      .mockResolvedValueOnce({ ok: false, status: 403, _data: '' })
      .mockResolvedValueOnce({ ok: true, status: 200, _data: 'private content' })
    mockGetGitHubToken.mockReturnValue('ghs_test')

    const result = await fetchGitHubRaw('https://raw.githubusercontent.com/owner/repo/main/docs.md')

    expect(result).toBe('private content')
    expect(mockFetchRaw).toHaveBeenCalledTimes(2)
    expect(mockFetchRaw).toHaveBeenNthCalledWith(
      2,
      'https://raw.githubusercontent.com/owner/repo/main/docs.md',
      { headers: { Authorization: 'token ghs_test' } },
    )
  })

  it('returns null on unauthenticated 404 without auth retry', async () => {
    mockFetchRaw.mockResolvedValueOnce({ ok: false, status: 404, _data: '' })
    mockGetGitHubToken.mockReturnValue('ghs_test')

    const result = await fetchGitHubRaw('https://raw.githubusercontent.com/owner/repo/main/missing.md')

    expect(result).toBeNull()
    expect(mockFetchRaw).toHaveBeenCalledTimes(1)
  })

  it('skips unauthenticated request for known private repos', async () => {
    mockIsKnownPrivateRepo.mockReturnValue(true)
    mockGetGitHubToken.mockReturnValue('ghs_private')
    mockFetchRaw.mockResolvedValueOnce({ ok: true, status: 200, _data: 'secret docs' })

    const result = await fetchGitHubRaw('https://raw.githubusercontent.com/private/repo/main/docs.md')

    expect(result).toBe('secret docs')
    expect(mockFetchRaw).toHaveBeenCalledTimes(1)
    expect(mockFetchRaw).toHaveBeenCalledWith(
      'https://raw.githubusercontent.com/private/repo/main/docs.md',
      { headers: { Authorization: 'token ghs_private' } },
    )
  })

  it('returns null for known private repos when token is unavailable', async () => {
    mockIsKnownPrivateRepo.mockReturnValue(true)
    mockGetGitHubToken.mockReturnValue(null)

    const result = await fetchGitHubRaw('https://raw.githubusercontent.com/private/repo/main/docs.md')

    expect(result).toBeNull()
    expect(mockFetchRaw).not.toHaveBeenCalled()
  })
})
