import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchGitHubRepoMeta, fetchReadmeContent } from '../src/doc-resolver/github'

// Mock global fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('doc-resolver/github', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('fetchGitHubRepoMeta', () => {
    it('returns homepage when available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ homepage: 'https://vuejs.org' }),
      })

      const result = await fetchGitHubRepoMeta('vuejs', 'vue')

      expect(result).toEqual({ homepage: 'https://vuejs.org' })
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/vuejs/vue',
        expect.objectContaining({ headers: { 'User-Agent': 'skilld/1.0' } }),
      )
    })

    it('returns null when no homepage', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ name: 'repo', homepage: '' }),
      })

      const result = await fetchGitHubRepoMeta('owner', 'repo')
      expect(result).toBeNull()
    })

    it('returns null on fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await fetchGitHubRepoMeta('owner', 'repo')
      expect(result).toBeNull()
    })

    it('returns null on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false })

      const result = await fetchGitHubRepoMeta('owner', 'repo')
      expect(result).toBeNull()
    })
  })

  describe('fetchReadmeContent', () => {
    it('fetches from ungh:// pseudo-URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ markdown: '# Hello' })),
      })

      const result = await fetchReadmeContent('ungh://vuejs/vue')

      expect(result).toBe('# Hello')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://ungh.cc/repos/vuejs/vue/readme',
        expect.any(Object),
      )
    })

    it('handles ungh:// with subdir', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ file: { contents: '# Subpkg' } })),
      })

      const result = await fetchReadmeContent('ungh://nuxt/nuxt/packages/kit')

      expect(result).toBe('# Subpkg')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://ungh.cc/repos/nuxt/nuxt/files/main/packages/kit/README.md',
        expect.any(Object),
      )
    })

    it('returns raw text if JSON parse fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('# Plain markdown'),
      })

      const result = await fetchReadmeContent('ungh://owner/repo')
      expect(result).toBe('# Plain markdown')
    })

    it('fetches regular URLs via fetchText', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('# README'),
      })

      const result = await fetchReadmeContent('https://raw.githubusercontent.com/o/r/main/README.md')

      expect(result).toBe('# README')
    })

    it('returns null on failed ungh fetch', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false })

      const result = await fetchReadmeContent('ungh://owner/repo')
      expect(result).toBeNull()
    })
  })
})
