import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock fs
vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs')
  return {
    ...actual,
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    readFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    rmSync: vi.fn(),
  }
})

vi.mock('../../src/cache', () => ({
  CACHE_DIR: '/mock-cache',
  getCacheDir: vi.fn(() => '/mock-cache/references/test-pkg@1.0.0'),
  getPackageDbPath: vi.fn(() => '/mock-cache/references/test-pkg@1.0.0/db'),
  readCachedDocs: vi.fn(() => []),
  writeToCache: vi.fn(),
  clearCache: vi.fn(),
  getShippedSkills: vi.fn(() => []),
  hasShippedDocs: vi.fn(() => false),
  linkDiscussions: vi.fn(),
  linkIssues: vi.fn(),
  linkPkg: vi.fn(),
  linkReferences: vi.fn(),
  linkReleases: vi.fn(),
  linkShippedSkill: vi.fn(),
  resolvePkgDir: vi.fn(),
}))

vi.mock('../../src/sources', () => ({
  $fetch: vi.fn(),
  fetchGitDocs: vi.fn(),
  fetchGitHubDiscussions: vi.fn(),
  fetchGitHubIssues: vi.fn(),
  fetchLlmsTxt: vi.fn(),
  fetchNpmPackage: vi.fn(),
  fetchReadmeContent: vi.fn(),
  fetchReleaseNotes: vi.fn(),
  downloadLlmsDocs: vi.fn(),
  normalizeLlmsLinks: vi.fn((raw: string) => raw),
  formatDiscussionAsMarkdown: vi.fn((d: any) => `# ${d.title}`),
  formatIssueAsMarkdown: vi.fn((i: any) => `# ${i.title}`),
  generateDiscussionIndex: vi.fn(() => '# Discussions'),
  generateIssueIndex: vi.fn(() => '# Issues'),
  isGhAvailable: vi.fn(() => true),
  isShallowGitDocs: vi.fn(() => false),
  parseGitHubUrl: vi.fn((url: string) => {
    const m = url.match(/github\.com\/([^/]+)\/([^/]+)/)
    return m ? { owner: m[1], repo: m[2] } : null
  }),
  resolveEntryFiles: vi.fn(() => []),
  resolveLocalPackageDocs: vi.fn(),
}))

vi.mock('../../src/core/config', () => ({
  readConfig: vi.fn(() => ({ features: { search: true, issues: false, discussions: false, releases: true } })),
  defaultFeatures: { search: true, issues: false, discussions: false, releases: true },
  registerProject: vi.fn(),
}))

vi.mock('../../src/core/sanitize', () => ({
  sanitizeMarkdown: vi.fn((s: string) => s),
}))

vi.mock('../../src/core/lockfile', () => ({
  readLock: vi.fn(() => null),
  writeLock: vi.fn(),
}))

vi.mock('../../src/retriv', () => ({
  createIndex: vi.fn(),
}))

vi.mock('../../src/agent', () => ({
  agents: {
    'claude-code': { name: 'claude-code', displayName: 'Claude Code', skillsDir: '.claude/skills' },
  },
}))

const { existsSync, readFileSync, rmSync } = await import('node:fs')
const { getCacheDir, getPackageDbPath, readCachedDocs, writeToCache, clearCache } = await import('../../src/cache')
const { $fetch, fetchGitDocs, fetchGitHubIssues, fetchGitHubDiscussions, fetchLlmsTxt, fetchReadmeContent, fetchReleaseNotes, downloadLlmsDocs, isGhAvailable, isShallowGitDocs, resolveEntryFiles, resolveLocalPackageDocs } = await import('../../src/sources')
const { registerProject } = await import('../../src/core/config')
const { writeLock } = await import('../../src/core/lockfile')
const { createIndex } = await import('../../src/retriv')
const { getShippedSkills, linkShippedSkill, resolvePkgDir } = await import('../../src/cache')

const {
  classifyCachedDoc,
  detectDocsType,
  detectChangelog,
  resolveLocalDep,
  fetchAndCacheResources,
  indexResources,
  forceClearCache,
  handleShippedSkills,
  resolveBaseDir,
} = await import('../../src/commands/sync-shared')

describe('sync-shared', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // Restore defaults after reset
    vi.mocked(getCacheDir).mockReturnValue('/mock-cache/references/test-pkg@1.0.0')
    vi.mocked(getPackageDbPath).mockReturnValue('/mock-cache/references/test-pkg@1.0.0/db')
    vi.mocked(readCachedDocs).mockReturnValue([])
    vi.mocked(isGhAvailable).mockReturnValue(true)
    vi.mocked(isShallowGitDocs).mockReturnValue(false)
    vi.mocked(resolveEntryFiles).mockResolvedValue([])
    vi.mocked(fetchReleaseNotes).mockResolvedValue([])
  })

  // ── 1. classifyCachedDoc ──

  describe('classifyCachedDoc', () => {
    it('classifies issue path', () => {
      expect(classifyCachedDoc('issues/issue-123.md')).toEqual({ type: 'issue', number: 123 })
    })

    it('classifies discussion path', () => {
      expect(classifyCachedDoc('discussions/discussion-42.md')).toEqual({ type: 'discussion', number: 42 })
    })

    it('classifies release path', () => {
      expect(classifyCachedDoc('releases/v3.4.0.md')).toEqual({ type: 'release' })
    })

    it('classifies nested release path', () => {
      expect(classifyCachedDoc('releases/notes/v1.md')).toEqual({ type: 'release' })
    })

    it('classifies doc path', () => {
      expect(classifyCachedDoc('docs/guide/intro.md')).toEqual({ type: 'doc' })
    })

    it('classifies root file as doc', () => {
      expect(classifyCachedDoc('llms.txt')).toEqual({ type: 'doc' })
    })

    it('treats issue without number as doc', () => {
      expect(classifyCachedDoc('issues/issue-.md')).toEqual({ type: 'doc' })
    })

    it('treats issue wrong format as doc', () => {
      expect(classifyCachedDoc('issues/bug-123.md')).toEqual({ type: 'doc' })
    })

    it('treats nested discussion as doc', () => {
      expect(classifyCachedDoc('discussions/old/discussion-1.md')).toEqual({ type: 'doc' })
    })
  })

  // ── 2. detectDocsType ──

  describe('detectDocsType', () => {
    it('returns docs when index.md exists', () => {
      vi.mocked(existsSync).mockImplementation((p: any) =>
        String(p).endsWith('docs/index.md'),
      )
      const result = detectDocsType('pkg', '1.0.0', 'https://github.com/org/repo')
      expect(result.docsType).toBe('docs')
      expect(result.docSource).toContain('tree/v1.0.0/docs')
    })

    it('returns docs when guide dir exists', () => {
      vi.mocked(existsSync).mockImplementation((p: any) =>
        String(p).endsWith('docs/guide'),
      )
      const result = detectDocsType('pkg', '1.0.0')
      expect(result.docsType).toBe('docs')
      expect(result.docSource).toBe('git')
    })

    it('returns llms.txt when llms.txt exists', () => {
      vi.mocked(existsSync).mockImplementation((p: any) =>
        String(p).endsWith('/llms.txt'),
      )
      const result = detectDocsType('pkg', '1.0.0', undefined, 'https://example.com/llms.txt')
      expect(result.docsType).toBe('llms.txt')
      expect(result.docSource).toBe('https://example.com/llms.txt')
    })

    it('returns llms.txt with fallback source', () => {
      vi.mocked(existsSync).mockImplementation((p: any) =>
        String(p).endsWith('/llms.txt'),
      )
      const result = detectDocsType('pkg', '1.0.0')
      expect(result.docsType).toBe('llms.txt')
      expect(result.docSource).toBe('llms.txt')
    })

    it('returns readme when README.md exists', () => {
      vi.mocked(existsSync).mockImplementation((p: any) =>
        String(p).endsWith('docs/README.md'),
      )
      const result = detectDocsType('pkg', '1.0.0')
      expect(result.docsType).toBe('readme')
      expect(result.docSource).toBeUndefined()
    })

    it('returns readme when nothing exists', () => {
      vi.mocked(existsSync).mockReturnValue(false)
      const result = detectDocsType('pkg', '1.0.0')
      expect(result.docsType).toBe('readme')
    })

    it('docs wins over llms.txt when both exist', () => {
      vi.mocked(existsSync).mockImplementation((p: any) => {
        const s = String(p)
        return s.endsWith('docs/index.md') || s.endsWith('/llms.txt')
      })
      const result = detectDocsType('pkg', '1.0.0', 'https://github.com/org/repo', 'https://example.com/llms.txt')
      expect(result.docsType).toBe('docs')
    })
  })

  // ── 3. detectChangelog ──

  describe('detectChangelog', () => {
    it('returns false for null pkgDir', () => {
      expect(detectChangelog(null)).toBe(false)
    })

    it('returns CHANGELOG.md when it exists', () => {
      vi.mocked(existsSync).mockImplementation((p: any) =>
        String(p).endsWith('CHANGELOG.md'),
      )
      expect(detectChangelog('/pkg')).toBe('CHANGELOG.md')
    })

    it('returns changelog.md when only lowercase exists', () => {
      vi.mocked(existsSync).mockImplementation((p: any) =>
        String(p).endsWith('changelog.md') && !String(p).endsWith('CHANGELOG.md'),
      )
      expect(detectChangelog('/pkg')).toBe('changelog.md')
    })

    it('returns false when neither exists', () => {
      vi.mocked(existsSync).mockReturnValue(false)
      expect(detectChangelog('/pkg')).toBe(false)
    })
  })

  // ── 4. resolveLocalDep ──

  describe('resolveLocalDep', () => {
    it('returns null when no package.json', async () => {
      vi.mocked(existsSync).mockReturnValue(false)
      expect(await resolveLocalDep('foo', '/cwd')).toBeNull()
    })

    it('returns null for non-link dep', async () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ dependencies: { foo: '^1.0.0' } }))
      expect(await resolveLocalDep('foo', '/cwd')).toBeNull()
    })

    it('returns null when dep not found', async () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ dependencies: {} }))
      expect(await resolveLocalDep('foo', '/cwd')).toBeNull()
    })

    it('resolves link dependency', async () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ dependencies: { foo: 'link:../foo' } }))
      vi.mocked(resolveLocalPackageDocs).mockResolvedValue({ name: 'foo', version: '1.0.0' } as any)
      const result = await resolveLocalDep('foo', '/cwd')
      expect(resolveLocalPackageDocs).toHaveBeenCalled()
      expect(result).toEqual({ name: 'foo', version: '1.0.0' })
    })

    it('resolves link devDependency', async () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ devDependencies: { foo: 'link:../foo' } }))
      vi.mocked(resolveLocalPackageDocs).mockResolvedValue({ name: 'foo', version: '2.0.0' } as any)
      const result = await resolveLocalDep('foo', '/cwd')
      expect(result).toEqual({ name: 'foo', version: '2.0.0' })
    })
  })

  // ── 5. fetchAndCacheResources ──

  describe('fetchAndCacheResources', () => {
    const baseOpts = {
      packageName: 'test-pkg',
      version: '1.0.0',
      useCache: false,
      onProgress: vi.fn(),
    }

    // 5a: Git docs success
    it('fetches git docs successfully', async () => {
      const resolved = {
        name: 'test-pkg',
        repoUrl: 'https://github.com/org/repo',
        gitDocsUrl: 'https://github.com/org/repo/tree/v1.0.0/docs',
      }
      vi.mocked(fetchGitDocs).mockResolvedValue({
        files: ['guide.md', 'api.md'],
        baseUrl: 'https://raw.githubusercontent.com/org/repo/v1.0',
        ref: 'v1.0',
        docsPrefix: '',
      })
      vi.mocked($fetch).mockResolvedValue('doc content')

      const result = await fetchAndCacheResources({ ...baseOpts, resolved })

      expect(result.docsType).toBe('docs')
      expect(result.docSource).toContain('tree/v1.0/docs')
      expect(writeToCache).toHaveBeenCalled()
      expect(result.docsToIndex).toHaveLength(2)
      expect(result.docsToIndex[0].metadata.type).toBe('doc')
    })

    // 5b: Shallow git docs → llms.txt fallback
    it('falls back to llms.txt when git docs are shallow', async () => {
      const resolved = {
        name: 'test-pkg',
        repoUrl: 'https://github.com/org/repo',
        gitDocsUrl: 'https://github.com/org/repo/tree/v1.0.0/docs',
        llmsUrl: 'https://example.com/llms.txt',
        docsUrl: 'https://example.com',
      }
      vi.mocked(fetchGitDocs).mockResolvedValue({
        files: ['readme.md'],
        baseUrl: 'https://raw.githubusercontent.com/org/repo/v1.0',
        ref: 'v1.0',
        docsPrefix: '',
      })
      vi.mocked($fetch).mockResolvedValue('content')
      vi.mocked(isShallowGitDocs).mockReturnValue(true)
      vi.mocked(fetchLlmsTxt).mockResolvedValue({ raw: 'llms content', links: [] })

      const result = await fetchAndCacheResources({ ...baseOpts, resolved })

      expect(result.docsType).toBe('llms.txt')
      expect(result.docSource).toBe('https://example.com/llms.txt')
    })

    // 5c: Git docs + supplementary llms.txt
    it('caches supplementary llms.txt alongside good git docs', async () => {
      const resolved = {
        name: 'test-pkg',
        repoUrl: 'https://github.com/org/repo',
        gitDocsUrl: 'https://github.com/org/repo/tree/v1.0.0/docs',
        llmsUrl: 'https://example.com/llms.txt',
        docsUrl: 'https://example.com',
      }
      const files = Array.from({ length: 10 }, (_, i) => `doc-${i}.md`)
      vi.mocked(fetchGitDocs).mockResolvedValue({
        files,
        baseUrl: 'https://raw.githubusercontent.com/org/repo/v1.0',
        ref: 'v1.0',
        docsPrefix: '',
      })
      vi.mocked($fetch).mockResolvedValue('content')
      vi.mocked(fetchLlmsTxt).mockResolvedValue({ raw: 'llms', links: ['/guide'] })
      vi.mocked(downloadLlmsDocs).mockResolvedValue([{ url: '/guide', content: 'guide content' }])

      const result = await fetchAndCacheResources({ ...baseOpts, resolved })

      expect(result.docsType).toBe('docs')
      // writeToCache called for git docs + supplementary
      expect(writeToCache).toHaveBeenCalledTimes(2)
    })

    // 5d: llms.txt with linked docs
    it('fetches llms.txt with linked docs', async () => {
      const resolved = {
        name: 'test-pkg',
        llmsUrl: 'https://example.com/llms.txt',
        docsUrl: 'https://example.com',
      }
      vi.mocked(fetchLlmsTxt).mockResolvedValue({ raw: 'content', links: ['/api', '/guide'] })
      vi.mocked(downloadLlmsDocs).mockResolvedValue([
        { url: '/api', content: 'api docs' },
        { url: '/guide', content: 'guide docs' },
      ])

      const result = await fetchAndCacheResources({ ...baseOpts, resolved })

      expect(result.docsType).toBe('llms.txt')
      expect(result.docSource).toBe('https://example.com/llms.txt')
      expect(result.docsToIndex).toHaveLength(2)
      expect(writeToCache).toHaveBeenCalled()
    })

    // 5e: README fallback
    it('falls back to README', async () => {
      const resolved = {
        name: 'test-pkg',
        readmeUrl: 'https://example.com/readme',
      }
      vi.mocked(fetchReadmeContent).mockResolvedValue('# README')

      const result = await fetchAndCacheResources({ ...baseOpts, resolved })

      expect(result.docsType).toBe('readme')
      expect(result.docsToIndex).toHaveLength(1)
      expect(result.docsToIndex[0].id).toBe('README.md')
    })

    // 5f: Nothing resolves
    it('returns empty when nothing resolves', async () => {
      const resolved = { name: 'test-pkg' }

      const result = await fetchAndCacheResources({ ...baseOpts, resolved })

      expect(result.docsType).toBe('readme')
      expect(result.docsToIndex).toHaveLength(0)
      expect(writeToCache).not.toHaveBeenCalled()
    })

    // 5g: useCache=true, db exists
    it('skips fetch when useCache and db exists', async () => {
      vi.mocked(existsSync).mockReturnValue(true)
      const resolved = { name: 'test-pkg', repoUrl: 'https://github.com/org/repo', llmsUrl: 'https://example.com/llms.txt' }

      const result = await fetchAndCacheResources({
        ...baseOpts,
        resolved,
        useCache: true,
        features: { search: true, issues: false, discussions: false, releases: false },
      })

      expect(readCachedDocs).not.toHaveBeenCalled()
      expect(result.docsToIndex).toHaveLength(0)
    })

    // 5h: useCache=true, db missing
    it('loads cached docs when useCache and db missing', async () => {
      vi.mocked(existsSync).mockReturnValue(false)
      vi.mocked(readCachedDocs).mockReturnValue([
        { path: 'docs/guide.md', content: 'cached guide' },
      ])
      const resolved = { name: 'test-pkg' }

      const result = await fetchAndCacheResources({
        ...baseOpts,
        resolved,
        useCache: true,
        features: { search: true, issues: false, discussions: false, releases: false },
      })

      expect(readCachedDocs).toHaveBeenCalled()
      expect(result.docsToIndex).toHaveLength(1)
      expect(result.docsToIndex[0].metadata.type).toBe('doc')
    })

    // 5i: Issues fetched successfully
    it('fetches issues when enabled', async () => {
      vi.mocked(existsSync).mockReturnValue(false)
      const resolved = { name: 'test-pkg', repoUrl: 'https://github.com/org/repo' }
      vi.mocked(fetchGitHubIssues).mockResolvedValue([
        { number: 1, title: 'Bug', body: 'bug body', labels: [], createdAt: '', commentsCount: 0 },
      ])

      const result = await fetchAndCacheResources({
        ...baseOpts,
        resolved,
        features: { search: true, issues: true, discussions: false, releases: false },
      })

      expect(fetchGitHubIssues).toHaveBeenCalled()
      expect(writeToCache).toHaveBeenCalled()
      expect(result.docsToIndex.some(d => d.metadata.type === 'issue')).toBe(true)
    })

    // 5j: Issues skipped — dir already exists
    it('skips issues when dir exists', async () => {
      vi.mocked(existsSync).mockImplementation((p: any) =>
        String(p).includes('issues'),
      )
      const resolved = { name: 'test-pkg', repoUrl: 'https://github.com/org/repo' }

      const result = await fetchAndCacheResources({
        ...baseOpts,
        resolved,
        features: { search: true, issues: true, discussions: false, releases: false },
      })

      expect(fetchGitHubIssues).not.toHaveBeenCalled()
      expect(result.hasIssues).toBe(true)
    })

    // 5k: Issues fetch error — graceful
    it('handles issue fetch errors gracefully', async () => {
      vi.mocked(existsSync).mockReturnValue(false)
      const resolved = { name: 'test-pkg', repoUrl: 'https://github.com/org/repo' }
      vi.mocked(fetchGitHubIssues).mockRejectedValue(new Error('API error'))

      const result = await fetchAndCacheResources({
        ...baseOpts,
        resolved,
        features: { search: true, issues: true, discussions: false, releases: false },
      })

      expect(result.hasIssues).toBe(false)
    })

    // 5l: Discussions fetched
    it('fetches discussions when enabled', async () => {
      vi.mocked(existsSync).mockReturnValue(false)
      const resolved = { name: 'test-pkg', repoUrl: 'https://github.com/org/repo' }
      vi.mocked(fetchGitHubDiscussions).mockResolvedValue([
        { number: 1, title: 'Q', body: 'question', category: 'Q&A', labels: [], createdAt: '', commentsCount: 0, upvoteCount: 0, answerBody: null },
      ])

      const result = await fetchAndCacheResources({
        ...baseOpts,
        resolved,
        features: { search: true, issues: false, discussions: true, releases: false },
      })

      expect(fetchGitHubDiscussions).toHaveBeenCalled()
      expect(result.docsToIndex.some(d => d.metadata.type === 'discussion')).toBe(true)
    })

    // 5m: Releases fetched
    it('fetches releases when enabled', async () => {
      vi.mocked(existsSync).mockReturnValue(false)
      const resolved = { name: 'test-pkg', repoUrl: 'https://github.com/org/repo' }
      vi.mocked(fetchReleaseNotes).mockResolvedValue([
        { path: 'releases/v1.md', content: '# v1.0' },
      ])

      const result = await fetchAndCacheResources({
        ...baseOpts,
        resolved,
        features: { search: true, issues: false, discussions: false, releases: true },
      })

      expect(fetchReleaseNotes).toHaveBeenCalled()
      expect(writeToCache).toHaveBeenCalled()
      expect(result.docsToIndex.some(d => d.metadata.type === 'release')).toBe(true)
    })

    // 5n: Releases fetch error — graceful
    it('handles release fetch errors gracefully', async () => {
      vi.mocked(existsSync).mockReturnValue(false)
      const resolved = { name: 'test-pkg', repoUrl: 'https://github.com/org/repo' }
      vi.mocked(fetchReleaseNotes).mockRejectedValue(new Error('fail'))

      const result = await fetchAndCacheResources({
        ...baseOpts,
        resolved,
        features: { search: true, issues: false, discussions: false, releases: true },
      })

      expect(result.hasReleases).toBe(false)
    })

    // 5o: gh not available — skips issues/discussions
    it('skips issues and discussions when gh unavailable', async () => {
      vi.mocked(existsSync).mockReturnValue(false)
      vi.mocked(isGhAvailable).mockReturnValue(false)
      const resolved = { name: 'test-pkg', repoUrl: 'https://github.com/org/repo' }

      await fetchAndCacheResources({
        ...baseOpts,
        resolved,
        features: { search: true, issues: true, discussions: true, releases: false },
      })

      expect(fetchGitHubIssues).not.toHaveBeenCalled()
      expect(fetchGitHubDiscussions).not.toHaveBeenCalled()
    })
  })

  // ── 6. indexResources ──

  describe('indexResources', () => {
    const baseOpts = {
      packageName: 'test-pkg',
      version: '1.0.0',
      cwd: '/cwd',
      onProgress: vi.fn(),
    }

    // 6a: db already exists → skips
    it('skips when db exists', async () => {
      vi.mocked(existsSync).mockReturnValue(true)
      await indexResources({ ...baseOpts, docsToIndex: [{ id: 'a.md', content: 'x', metadata: {} }] })
      expect(createIndex).not.toHaveBeenCalled()
    })

    // 6b: empty docs + no entry files → skips
    it('skips when no docs and no entry files', async () => {
      vi.mocked(existsSync).mockReturnValue(false)
      vi.mocked(resolvePkgDir).mockReturnValue('/pkg')
      await indexResources({ ...baseOpts, docsToIndex: [] })
      expect(createIndex).not.toHaveBeenCalled()
    })

    // 6c: indexes docs
    it('indexes docs', async () => {
      vi.mocked(existsSync).mockReturnValue(false)
      vi.mocked(resolvePkgDir).mockReturnValue(null)
      const docs = [{ id: 'a.md', content: 'content', metadata: { type: 'doc' } }]
      await indexResources({ ...baseOpts, docsToIndex: docs })
      expect(createIndex).toHaveBeenCalledWith(docs, expect.objectContaining({ dbPath: expect.any(String) }))
    })

    // 6d: merges entry files
    it('merges entry files with docs', async () => {
      vi.mocked(existsSync).mockReturnValue(false)
      vi.mocked(resolvePkgDir).mockReturnValue('/pkg')
      vi.mocked(resolveEntryFiles).mockResolvedValue([{ path: 'index.d.ts', content: 'types', type: 'types' }])
      const docs = [{ id: 'a.md', content: 'content', metadata: { type: 'doc' } }]

      await indexResources({ ...baseOpts, docsToIndex: docs })

      expect(createIndex).toHaveBeenCalled()
      const call = vi.mocked(createIndex).mock.calls[0]
      expect(call[0]).toHaveLength(2)
      expect(call[0][1].metadata.source).toBe('pkg/index.d.ts')
    })

    // 6e: features.search=false — skips indexing entirely
    it('skips indexing entirely when search disabled', async () => {
      vi.mocked(existsSync).mockReturnValue(false)
      vi.mocked(resolvePkgDir).mockReturnValue('/pkg')
      const docs = [{ id: 'a.md', content: 'content', metadata: {} }]

      await indexResources({
        ...baseOpts,
        docsToIndex: docs,
        features: { search: false, issues: false, discussions: false, releases: false },
      })

      expect(resolveEntryFiles).not.toHaveBeenCalled()
      expect(createIndex).not.toHaveBeenCalled()
    })
  })

  // ── 7. forceClearCache ──

  describe('forceClearCache', () => {
    it('clears cache and removes db when it exists', () => {
      vi.mocked(existsSync).mockReturnValue(true)
      forceClearCache('pkg', '1.0.0')
      expect(clearCache).toHaveBeenCalledWith('pkg', '1.0.0')
      expect(rmSync).toHaveBeenCalled()
    })

    it('clears cache but skips rmSync when db missing', () => {
      vi.mocked(existsSync).mockReturnValue(false)
      forceClearCache('pkg', '1.0.0')
      expect(clearCache).toHaveBeenCalledWith('pkg', '1.0.0')
      expect(rmSync).not.toHaveBeenCalled()
    })
  })

  // ── 8. handleShippedSkills ──

  describe('handleShippedSkills', () => {
    it('returns null when no shipped skills', () => {
      vi.mocked(getShippedSkills).mockReturnValue([])
      expect(handleShippedSkills('pkg', '1.0.0', '/cwd', 'claude-code', false)).toBeNull()
    })

    it('links shipped skills and registers project', () => {
      vi.mocked(getShippedSkills).mockReturnValue([{ skillName: 'my-skill', skillDir: '/shipped' }])
      const result = handleShippedSkills('pkg', '1.0.0', '/cwd', 'claude-code', false)
      expect(result).not.toBeNull()
      expect(linkShippedSkill).toHaveBeenCalled()
      expect(writeLock).toHaveBeenCalled()
      expect(registerProject).toHaveBeenCalledWith('/cwd')
    })

    it('does not register project when global', () => {
      vi.mocked(getShippedSkills).mockReturnValue([{ skillName: 'my-skill', skillDir: '/shipped' }])
      handleShippedSkills('pkg', '1.0.0', '/cwd', 'claude-code', true)
      expect(registerProject).not.toHaveBeenCalled()
    })
  })

  // ── 9. resolveBaseDir ──

  describe('resolveBaseDir', () => {
    it('returns project skills dir when not global', () => {
      expect(resolveBaseDir('/cwd', 'claude-code', false)).toContain('.claude/skills')
    })

    it('returns cache skills dir when global', () => {
      expect(resolveBaseDir('/cwd', 'claude-code', true)).toContain('skills')
    })
  })
})
