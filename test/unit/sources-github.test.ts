import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock ofetch — simulates ofetch behavior using mockFetch
const mockFetch = vi.fn()

function createMockFetch() {
  async function $fetch(url: string, opts?: any): Promise<any> {
    const mockRes = await mockFetch(url, opts)
    if (!mockRes?.ok)
      throw new Error('fetch failed')
    if (opts?.responseType === 'text')
      return mockRes.text()
    return mockRes.json()
  }
  $fetch.raw = async (url: string, opts?: any) => {
    return mockFetch(url, opts)
  }
  return $fetch
}

vi.mock('ofetch', () => ({
  ofetch: { create: () => createMockFetch() },
}))

// Must import after vi.mock
const { fetchGitDocs, fetchGitHubRepoMeta, fetchGitSource, fetchReadmeContent, isShallowGitDocs, MIN_GIT_DOCS, validateGitDocsWithLlms } = await import('../../src/sources/github')

// Mock gh CLI as unavailable by default so tests exercise fetch path
vi.mock('../../src/sources/issues', () => ({
  isGhAvailable: () => false,
}))

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
        undefined,
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
      // allFiles should be set when discoverDocFiles heuristic was used
      expect(result!.allFiles).toBeDefined()
      expect(result!.allFiles!.length).toBeGreaterThan(0)
    })

    it('does not set allFiles when standard docs/ prefix matched', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({
        meta: { sha: 'abc' },
        files: [
          { path: 'docs/intro.md', mode: '100644', sha: 'a', size: 100 },
          { path: 'docs/api.mdx', mode: '100644', sha: 'b', size: 200 },
        ],
      }) })

      const result = await fetchGitDocs('owner', 'repo', '2.0.0')

      expect(result).not.toBeNull()
      expect(result!.allFiles).toBeUndefined()
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
        'https://ungh.cc/repos/vuejs/vue/readme?ref=main',
        expect.any(Object),
      )
    })

    it('handles ungh:// with ref', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ markdown: '# Hello v1' })),
      })

      const result = await fetchReadmeContent('ungh://vuejs/vue@v1.0.0')

      expect(result).toBe('# Hello v1')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://ungh.cc/repos/vuejs/vue/readme?ref=v1.0.0',
        expect.any(Object),
      )
    })

    it('handles ungh:// with subdir and ref', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ file: { contents: '# Subpkg v1' } })),
      })

      const result = await fetchReadmeContent('ungh://nuxt/nuxt/packages/kit@v1.0.0')

      expect(result).toBe('# Subpkg v1')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://ungh.cc/repos/nuxt/nuxt/files/v1.0.0/packages/kit/README.md',
        expect.any(Object),
      )
    })

    it('handles ungh:// with subdir (no ref)', async () => {
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

  describe('validateGitDocsWithLlms', () => {
    it('returns valid when links match repo files', () => {
      const links = [
        { title: 'Guide', url: '/docs/guide/intro.md' },
        { title: 'API', url: '/docs/api/core.md' },
        { title: 'Config', url: '/docs/config.md' },
      ]
      const repoFiles = [
        'website/content/docs/guide/intro.md',
        'website/content/docs/api/core.md',
        'website/content/docs/config.md',
        'src/index.ts',
      ]

      const result = validateGitDocsWithLlms(links, repoFiles)
      expect(result.isValid).toBe(true)
      expect(result.matchRatio).toBe(1)
    })

    it('returns invalid when links do not match repo files', () => {
      const links = [
        { title: 'Parser Guide', url: '/docs/guide/parser.md' },
        { title: 'Parser API', url: '/docs/api/parser.md' },
        { title: 'Config', url: '/docs/config.md' },
      ]
      const repoFiles = [
        'website/content/docs/guide/minifier.md',
        'website/content/docs/api/minifier.md',
        'website/content/docs/minifier-config.md',
        'src/index.ts',
      ]

      const result = validateGitDocsWithLlms(links, repoFiles)
      expect(result.isValid).toBe(false)
      expect(result.matchRatio).toBe(0)
    })

    it('handles absolute URL links by stripping to pathname', () => {
      const links = [
        { title: 'Guide', url: 'https://oxc.rs/docs/guide/intro.md' },
        { title: 'API', url: 'https://oxc.rs/docs/api/core.md' },
      ]
      const repoFiles = [
        'website/docs/guide/intro.md',
        'website/docs/api/core.md',
      ]

      const result = validateGitDocsWithLlms(links, repoFiles)
      expect(result.isValid).toBe(true)
      expect(result.matchRatio).toBe(1)
    })

    it('uses extensionless suffix matching across .md and .mdx', () => {
      const links = [
        { title: 'Guide', url: '/guide/intro.md' },
        { title: 'Setup', url: '/guide/setup.md' },
      ]
      const repoFiles = [
        'apps/docs/src/content/guide/intro.mdx',
        'apps/docs/src/content/guide/setup.mdx',
      ]

      const result = validateGitDocsWithLlms(links, repoFiles)
      expect(result.isValid).toBe(true)
      expect(result.matchRatio).toBe(1)
    })

    it('calculates correct ratio for partial matches', () => {
      const links = [
        { title: 'A', url: '/docs/a.md' },
        { title: 'B', url: '/docs/b.md' },
        { title: 'C', url: '/docs/c.md' },
        { title: 'D', url: '/docs/d.md' },
        { title: 'E', url: '/docs/e.md' },
      ]
      const repoFiles = [
        'content/docs/a.md',
        'content/docs/b.md',
        'content/docs/x.md',
        'content/docs/y.md',
      ]

      const result = validateGitDocsWithLlms(links, repoFiles)
      expect(result.matchRatio).toBe(0.4) // 2/5
      expect(result.isValid).toBe(true) // >= 0.3
    })

    it('returns valid for empty links array', () => {
      const result = validateGitDocsWithLlms([], ['some/file.md'])
      expect(result.isValid).toBe(true)
      expect(result.matchRatio).toBe(1)
    })

    it('samples at most 10 links', () => {
      const links = Array.from({ length: 20 }, (_, i) => ({
        title: `Doc ${i}`,
        url: `/docs/page-${i}.md`,
      }))
      // Only first 10 links are checked, match first 3
      const repoFiles = Array.from({ length: 3 }, (_, i) => `content/docs/page-${i}.md`)

      const result = validateGitDocsWithLlms(links, repoFiles)
      expect(result.matchRatio).toBe(0.3) // 3/10
      expect(result.isValid).toBe(true) // exactly 0.3
    })
  })

  describe('isShallowGitDocs', () => {
    it('returns true for 1-4 files (below MIN_GIT_DOCS)', () => {
      expect(isShallowGitDocs(1)).toBe(true)
      expect(isShallowGitDocs(2)).toBe(true)
      expect(isShallowGitDocs(4)).toBe(true)
    })

    it('returns false for 0 files', () => {
      expect(isShallowGitDocs(0)).toBe(false)
    })

    it('returns false for >= MIN_GIT_DOCS files', () => {
      expect(isShallowGitDocs(MIN_GIT_DOCS)).toBe(false)
      expect(isShallowGitDocs(10)).toBe(false)
      expect(isShallowGitDocs(100)).toBe(false)
    })

    it('has MIN_GIT_DOCS = 5', () => {
      expect(MIN_GIT_DOCS).toBe(5)
    })
  })
})
