import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockFetch = vi.fn<(
  url: string,
  opts?: { responseType?: string, method?: string },
) => Promise<{ ok?: boolean, json?: () => Promise<unknown>, text?: () => Promise<string> }>>()

function createMockFetch() {
  async function $fetch(url: string, opts?: { responseType?: string, method?: string }): Promise<unknown> {
    const response = await mockFetch(url, opts)
    if (!response?.ok)
      throw new Error('fetch failed')
    if (opts?.responseType === 'text')
      return response.text?.() ?? null
    return response.json?.() ?? null
  }

  $fetch.raw = async (url: string, opts?: { responseType?: string, method?: string }) => {
    return mockFetch(url, opts)
  }

  return $fetch
}

vi.mock('ofetch', () => ({
  ofetch: { create: () => createMockFetch() },
}))

vi.mock('../../src/sources/github', () => ({
  resolveGitHubRepo: vi.fn(),
}))

vi.mock('../../src/sources/llms', () => ({
  fetchLlmsUrl: vi.fn(),
}))

const { resolveCrateDocsWithAttempts } = await import('../../src/sources/crates')

describe('sources/crates', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns error attempt for invalid crate name', async () => {
    const result = await resolveCrateDocsWithAttempts('serde!')

    expect(result.package).toBeNull()
    expect(result.attempts).toEqual([
      {
        source: 'crates',
        status: 'error',
        message: 'Invalid crate name: serde!',
      },
    ])
  })

  it('returns not-found attempt when crates.io metadata cannot be fetched', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network'))

    const result = await resolveCrateDocsWithAttempts('serde')

    expect(result.package).toBeNull()
    expect(result.attempts).toEqual([
      {
        source: 'crates',
        url: 'https://crates.io/api/v1/crates/serde',
        status: 'not-found',
        message: 'Crate not found on crates.io',
      },
    ])
  })

  it('falls back to docs.rs when documentation/homepage are missing or repo-like', async () => {
    const { fetchLlmsUrl } = await import('../../src/sources/llms')
    const { resolveGitHubRepo } = await import('../../src/sources/github')

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        crate: {
          name: 'serde',
          max_version: '1.0.217',
          repository: 'https://github.com/serde-rs/serde',
          documentation: 'https://github.com/serde-rs/serde',
          homepage: 'https://github.com/serde-rs/serde',
          updated_at: '2025-01-01T00:00:00Z',
        },
        versions: [
          {
            num: '1.0.217',
            yanked: false,
            created_at: '2024-12-20T00:00:00Z',
          },
        ],
      }),
    })

    vi.mocked(resolveGitHubRepo).mockResolvedValue(null)
    vi.mocked(fetchLlmsUrl).mockResolvedValue(null)

    const progress: string[] = []
    const result = await resolveCrateDocsWithAttempts('serde', {
      onProgress: step => progress.push(step),
    })

    expect(result.package).toMatchObject({
      name: 'serde',
      version: '1.0.217',
      docsUrl: 'https://docs.rs/serde/1.0.217',
      repoUrl: 'https://github.com/serde-rs/serde',
      releasedAt: '2024-12-20T00:00:00Z',
    })
    expect(progress).toEqual([
      'crates.io metadata',
      'GitHub enrichment',
      'llms.txt discovery',
    ])
  })

  it('selects requested non-yanked version and keeps docs.rs versioned URL', async () => {
    const { fetchLlmsUrl } = await import('../../src/sources/llms')

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        crate: {
          name: 'serde',
          max_stable_version: '1.0.220',
        },
        versions: [
          { num: '1.0.220', yanked: false, created_at: '2025-01-10T00:00:00Z' },
          { num: '1.0.0', yanked: false, created_at: '2020-01-01T00:00:00Z' },
        ],
      }),
    })

    vi.mocked(fetchLlmsUrl).mockResolvedValue(null)

    const result = await resolveCrateDocsWithAttempts('serde', { version: '1.0.0' })

    expect(result.package).toMatchObject({
      name: 'serde',
      version: '1.0.0',
      docsUrl: 'https://docs.rs/serde/1.0.0',
    })
  })

  it('falls back from requested yanked version to preferred stable version', async () => {
    const { fetchLlmsUrl } = await import('../../src/sources/llms')

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        crate: {
          name: 'serde',
          max_stable_version: '1.0.220',
          newest_version: '1.0.220',
        },
        versions: [
          { num: '1.0.220', yanked: false, created_at: '2025-01-10T00:00:00Z' },
          { num: '1.0.200', yanked: true, created_at: '2024-10-01T00:00:00Z' },
        ],
      }),
    })

    vi.mocked(fetchLlmsUrl).mockResolvedValue(null)

    const result = await resolveCrateDocsWithAttempts('serde', { version: '1.0.200' })

    expect(result.package?.version).toBe('1.0.220')
    expect(result.package?.releasedAt).toBe('2025-01-10T00:00:00Z')
  })

  it('returns error attempt when crate exists but no usable versions are available', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        crate: {
          name: 'serde',
        },
        versions: [
          { num: '1.0.220', yanked: true },
          { num: '1.0.200', yanked: true },
        ],
      }),
    })

    const result = await resolveCrateDocsWithAttempts('serde')

    expect(result.package).toBeNull()
    expect(result.attempts).toContainEqual({
      source: 'crates',
      url: 'https://crates.io/api/v1/crates/serde',
      status: 'error',
      message: 'No usable crate versions found',
    })
  })

  it('enriches metadata from GitHub when repository points to GitHub', async () => {
    const { resolveGitHubRepo } = await import('../../src/sources/github')
    const { fetchLlmsUrl } = await import('../../src/sources/llms')

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        crate: {
          name: 'serde',
          max_version: '1.0.220',
          repository: 'git+https://github.com/serde-rs/serde.git',
          description: 'serde description',
        },
        versions: [
          { num: '1.0.220', yanked: false, created_at: '2025-01-10T00:00:00Z' },
        ],
      }),
    })

    vi.mocked(resolveGitHubRepo).mockResolvedValue({
      name: 'serde',
      version: '1.0.220',
      description: 'github description',
      docsUrl: 'https://serde.rs',
      readmeUrl: 'ungh://serde-rs/serde',
      repoUrl: 'https://github.com/serde-rs/serde',
      releasedAt: '2025-01-12T00:00:00Z',
    })
    vi.mocked(fetchLlmsUrl).mockResolvedValue('https://serde.rs/llms.txt')

    const result = await resolveCrateDocsWithAttempts('serde')

    expect(result.package).toMatchObject({
      name: 'serde',
      version: '1.0.220',
      description: 'serde description',
      docsUrl: 'https://docs.rs/serde/1.0.220',
      readmeUrl: 'ungh://serde-rs/serde',
      repoUrl: 'https://github.com/serde-rs/serde',
      llmsUrl: 'https://serde.rs/llms.txt',
    })
    expect(result.attempts).toContainEqual({
      source: 'github-meta',
      url: 'https://github.com/serde-rs/serde',
      status: 'success',
      message: 'Enriched via GitHub repo metadata',
    })
    expect(result.attempts).toContainEqual({
      source: 'llms.txt',
      url: 'https://serde.rs/llms.txt',
      status: 'success',
    })
  })

  it('records github-meta not-found attempt when enrichment fails', async () => {
    const { resolveGitHubRepo } = await import('../../src/sources/github')
    const { fetchLlmsUrl } = await import('../../src/sources/llms')

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        crate: {
          name: 'serde',
          max_version: '1.0.220',
          repository: 'https://github.com/serde-rs/serde',
        },
        versions: [
          { num: '1.0.220', yanked: false },
        ],
      }),
    })

    vi.mocked(resolveGitHubRepo).mockResolvedValue(null)
    vi.mocked(fetchLlmsUrl).mockResolvedValue(null)

    const result = await resolveCrateDocsWithAttempts('serde')

    expect(result.attempts).toContainEqual({
      source: 'github-meta',
      url: 'https://github.com/serde-rs/serde',
      status: 'not-found',
      message: 'GitHub enrichment failed, using crates.io metadata',
    })
  })
})
