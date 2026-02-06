import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchGitDocs, fetchGitHubRepoMeta, fetchGitSource, fetchReadmeContent } from '../../src/sources/github'

// Mock gh CLI as unavailable by default so tests exercise fetch path
vi.mock('../../src/sources/issues', () => ({
  isGhAvailable: () => false,
}))

// Mock global fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('sources/github', () => {
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

  describe('fetchGitDocs', () => {
    it('finds docs with monorepo-style tag (pkg@version)', async () => {
      // v1.0.0 fails, 1.0.0 fails, mypkg@1.0.0 succeeds
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ files: [] }) }) // v1.0.0
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ files: [] }) }) // 1.0.0
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({
          meta: { sha: 'abc' },
          files: [
            { path: 'docs/guide.md', mode: '100644', sha: 'a', size: 100 },
            { path: 'README.md', mode: '100644', sha: 'b', size: 50 },
          ],
        }) }) // mypkg@1.0.0

      const result = await fetchGitDocs('owner', 'repo', '1.0.0', 'mypkg')

      expect(result).not.toBeNull()
      expect(result!.ref).toBe('mypkg@1.0.0')
      expect(result!.files).toEqual(['docs/guide.md'])
    })

    it('finds docs with standard v-prefixed tag', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({
        meta: { sha: 'abc' },
        files: [
          { path: 'docs/intro.md', mode: '100644', sha: 'a', size: 100 },
          { path: 'docs/api.mdx', mode: '100644', sha: 'b', size: 200 },
          { path: 'src/index.ts', mode: '100644', sha: 'c', size: 50 },
        ],
      }) })

      const result = await fetchGitDocs('owner', 'repo', '2.0.0')

      expect(result).not.toBeNull()
      expect(result!.ref).toBe('v2.0.0')
      expect(result!.files).toEqual(['docs/intro.md', 'docs/api.mdx'])
    })

    it('discovers docs in nested content paths when docs/ is empty', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({
        meta: { sha: 'abc' },
        files: [
          { path: 'README.md', mode: '100644', sha: 'a', size: 50 },
          { path: 'apps/my-docs/src/content/docs/index.mdx', mode: '100644', sha: 'b', size: 200 },
          { path: 'apps/my-docs/src/content/docs/guides/setup.md', mode: '100644', sha: 'c', size: 300 },
          { path: 'apps/my-docs/src/content/docs/guides/config.mdx', mode: '100644', sha: 'd', size: 250 },
          { path: '.changeset/README.md', mode: '100644', sha: 'e', size: 10 },
          { path: 'packages/core/CHANGELOG.md', mode: '100644', sha: 'f', size: 500 },
        ],
      }) })

      const result = await fetchGitDocs('owner', 'repo', '1.0.0')

      expect(result).not.toBeNull()
      expect(result!.files).toEqual([
        'apps/my-docs/src/content/docs/index.mdx',
        'apps/my-docs/src/content/docs/guides/setup.md',
        'apps/my-docs/src/content/docs/guides/config.mdx',
      ])
    })

    it('returns null when no doc-like paths found', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({
        meta: { sha: 'abc' },
        files: [
          { path: 'src/index.ts', mode: '100644', sha: 'a', size: 100 },
          { path: 'README.md', mode: '100644', sha: 'b', size: 50 },
        ],
      }) })

      const result = await fetchGitDocs('owner', 'repo', '1.0.0')
      expect(result).toBeNull()
    })

    it('returns null when tag not found', async () => {
      // findGitTag tries: v1.0.0, 1.0.0, then fallback branches main, master
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ files: [] }) }) // v1.0.0
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ files: [] }) }) // 1.0.0
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ files: [] }) }) // main
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ files: [] }) }) // master

      const result = await fetchGitDocs('owner', 'repo', '1.0.0')
      expect(result).toBeNull()
    })
  })

  describe('fetchGitSource', () => {
    it('reuses file list from findGitTag (no duplicate fetch)', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({
        meta: { sha: 'abc' },
        files: [
          { path: 'src/index.ts', mode: '100644', sha: 'a', size: 100 },
          { path: 'src/utils.ts', mode: '100644', sha: 'b', size: 200 },
          { path: 'src/index.test.ts', mode: '100644', sha: 'c', size: 150 },
          { path: 'README.md', mode: '100644', sha: 'd', size: 50 },
        ],
      }) })

      const result = await fetchGitSource('owner', 'repo', '1.0.0')

      expect(result).not.toBeNull()
      expect(result!.ref).toBe('v1.0.0')
      expect(result!.files).toEqual(['src/index.ts', 'src/utils.ts'])
      // Only 1 fetch call — no duplicate for listSourceAtRef
      expect(mockFetch).toHaveBeenCalledTimes(1)
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
