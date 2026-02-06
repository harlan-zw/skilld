import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchNpmPackage, getInstalledSkillVersion, readLocalDependencies, resolvePackageDocs } from '../src/sources/npm'

// Mock the github and llms modules
vi.mock('../src/sources/github', () => ({
  fetchGitHubRepoMeta: vi.fn(),
  fetchReadme: vi.fn(),
  fetchGitDocs: vi.fn(),
}))

vi.mock('../src/sources/llms', () => ({
  fetchLlmsUrl: vi.fn(),
}))

// Mock fs module
vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs')
  return {
    ...actual,
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
  }
})

// Mock global fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('sources/npm', () => {
  describe('readLocalDependencies', () => {
    beforeEach(() => {
      vi.resetAllMocks()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('reads and combines dependencies and devDependencies', async () => {
      const { existsSync, readFileSync } = await import('node:fs')
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        dependencies: { vue: '^3.4.0', pinia: '~2.1.0' },
        devDependencies: { vitest: '^1.0.0' },
      }))

      const deps = await readLocalDependencies('/test')

      expect(deps).toContainEqual({ name: 'vue', version: '3.4.0' })
      expect(deps).toContainEqual({ name: 'pinia', version: '2.1.0' })
    })

    it('strips single-char version prefixes (^, ~)', async () => {
      const { existsSync, readFileSync } = await import('node:fs')
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        dependencies: {
          'pkg-caret': '^1.0.0',
          'pkg-tilde': '~2.0.0',
          'pkg-exact': '4.0.0',
        },
      }))

      const deps = await readLocalDependencies('/test')

      expect(deps).toContainEqual({ name: 'pkg-caret', version: '1.0.0' })
      expect(deps).toContainEqual({ name: 'pkg-tilde', version: '2.0.0' })
      expect(deps).toContainEqual({ name: 'pkg-exact', version: '4.0.0' })
    })

    it('filters out @types packages', async () => {
      const { existsSync, readFileSync } = await import('node:fs')
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        dependencies: { vue: '3.0.0' },
        devDependencies: { '@types/node': '20.0.0' },
      }))

      const deps = await readLocalDependencies('/test')

      expect(deps.find(d => d.name === '@types/node')).toBeUndefined()
      expect(deps.find(d => d.name === 'vue')).toBeDefined()
    })

    it('filters out common dev tools', async () => {
      const { existsSync, readFileSync } = await import('node:fs')
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        devDependencies: {
          typescript: '5.0.0',
          eslint: '8.0.0',
          prettier: '3.0.0',
          vitest: '1.0.0',
          jest: '29.0.0',
        },
      }))

      const deps = await readLocalDependencies('/test')

      expect(deps).toHaveLength(0)
    })

    it('throws if package.json not found', async () => {
      const { existsSync } = await import('node:fs')
      vi.mocked(existsSync).mockReturnValue(false)

      await expect(readLocalDependencies('/test'))
        .rejects
        .toThrow('No package.json found')
    })
  })

  describe('fetchNpmPackage', () => {
    beforeEach(() => {
      vi.resetAllMocks()
    })

    it('fetches package info from npm registry', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          name: 'vue',
          version: '3.4.21',
          description: 'Progressive framework',
        }),
      })

      const result = await fetchNpmPackage('vue')

      expect(result).toEqual({
        name: 'vue',
        version: '3.4.21',
        description: 'Progressive framework',
      })
      expect(mockFetch).toHaveBeenCalledWith(
        'https://unpkg.com/vue/package.json',
        expect.objectContaining({ headers: { 'User-Agent': 'skilld/1.0' } }),
      )
    })

    it('returns null on fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await fetchNpmPackage('nonexistent')

      expect(result).toBeNull()
    })

    it('returns null on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false })

      const result = await fetchNpmPackage('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('getInstalledSkillVersion', () => {
    beforeEach(() => {
      vi.resetAllMocks()
    })

    it('returns null when SKILL.md does not exist', async () => {
      const { existsSync } = await import('node:fs')
      vi.mocked(existsSync).mockReturnValue(false)

      const result = await getInstalledSkillVersion('/skills/vue')

      expect(result).toBeNull()
    })

    it('extracts version from SKILL.md frontmatter', async () => {
      const { existsSync, readFileSync } = await import('node:fs')
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(`---
name: vue
version: "3.4.21"
description: Vue skill
---

# Vue`)

      const result = await getInstalledSkillVersion('/skills/vue')

      expect(result).toBe('3.4.21')
    })

    it('handles version without quotes', async () => {
      const { existsSync, readFileSync } = await import('node:fs')
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(`---
name: vue
version: 3.4.21
---`)

      const result = await getInstalledSkillVersion('/skills/vue')

      expect(result).toBe('3.4.21')
    })

    it('returns null when no version field', async () => {
      const { existsSync, readFileSync } = await import('node:fs')
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(`---
name: vue
description: Vue skill
---`)

      const result = await getInstalledSkillVersion('/skills/vue')

      expect(result).toBeNull()
    })
  })

  describe('resolvePackageDocs', () => {
    beforeEach(() => {
      vi.resetAllMocks()
    })

    it('returns null when package not found', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Not found'))

      const result = await resolvePackageDocs('nonexistent')

      expect(result).toBeNull()
    })

    it('extracts basic info from npm package', async () => {
      const { fetchGitHubRepoMeta, fetchReadme } = await import('../src/sources/github')
      const { fetchLlmsUrl } = await import('../src/sources/llms')

      // First fetch: package info
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          name: 'vue',
          version: '3.4.21',
          description: 'Progressive framework',
          homepage: 'https://vuejs.org',
          repository: { url: 'git+https://github.com/vuejs/core.git' },
        }),
      })
      // Second fetch: package time info for release date
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ time: { '3.4.21': '2024-02-01T12:00:00Z' } }),
      })

      vi.mocked(fetchLlmsUrl).mockResolvedValue('https://vuejs.org/llms.txt')
      vi.mocked(fetchGitHubRepoMeta).mockResolvedValue(null)
      vi.mocked(fetchReadme).mockResolvedValue(null)

      const result = await resolvePackageDocs('vue')

      expect(result).toMatchObject({
        name: 'vue',
        version: '3.4.21',
        releasedAt: '2024-02-01T12:00:00Z',
        description: 'Progressive framework',
        docsUrl: 'https://vuejs.org',
        repoUrl: 'https://github.com/vuejs/core',
        llmsUrl: 'https://vuejs.org/llms.txt',
      })
    })

    it('skips homepage if its a GitHub URL', async () => {
      const { fetchGitHubRepoMeta, fetchReadme } = await import('../src/sources/github')
      const { fetchLlmsUrl } = await import('../src/sources/llms')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          name: 'pkg',
          version: '1.0.0',
          homepage: 'https://github.com/owner/repo',
          repository: { url: 'https://github.com/owner/repo' },
        }),
      })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ time: { '1.0.0': '2024-01-01T00:00:00Z' } }),
      })

      vi.mocked(fetchGitHubRepoMeta).mockResolvedValue({ homepage: 'https://docs.example.com' })
      vi.mocked(fetchReadme).mockResolvedValue('ungh://owner/repo')
      vi.mocked(fetchLlmsUrl).mockResolvedValue(null)

      const result = await resolvePackageDocs('pkg')

      expect(result?.docsUrl).toBe('https://docs.example.com')
      expect(result?.readmeUrl).toBe('ungh://owner/repo')
    })

    it('falls back to README when no docs URL', async () => {
      const { fetchGitHubRepoMeta, fetchReadme } = await import('../src/sources/github')
      const { fetchLlmsUrl } = await import('../src/sources/llms')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          name: 'simple-pkg',
          version: '1.0.0',
          repository: { url: 'https://github.com/owner/repo' },
        }),
      })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ time: { '1.0.0': '2024-01-01T00:00:00Z' } }),
      })

      vi.mocked(fetchGitHubRepoMeta).mockResolvedValue(null)
      vi.mocked(fetchReadme).mockResolvedValue('https://raw.githubusercontent.com/owner/repo/main/README.md')
      vi.mocked(fetchLlmsUrl).mockResolvedValue(null)

      const result = await resolvePackageDocs('simple-pkg')

      expect(result?.readmeUrl).toBe('https://raw.githubusercontent.com/owner/repo/main/README.md')
    })

    it('returns null when no docs sources found', async () => {
      const { fetchGitHubRepoMeta, fetchReadme } = await import('../src/sources/github')
      const { fetchLlmsUrl } = await import('../src/sources/llms')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          name: 'bare-pkg',
          version: '1.0.0',
          // No homepage, no repository
        }),
      })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ time: { '1.0.0': '2024-01-01T00:00:00Z' } }),
      })

      vi.mocked(fetchGitHubRepoMeta).mockResolvedValue(null)
      vi.mocked(fetchReadme).mockResolvedValue(null)
      vi.mocked(fetchLlmsUrl).mockResolvedValue(null)

      const result = await resolvePackageDocs('bare-pkg')

      expect(result).toBeNull()
    })

    it('handles repository subdirectory', async () => {
      const { fetchGitHubRepoMeta, fetchReadme } = await import('../src/sources/github')
      const { fetchLlmsUrl } = await import('../src/sources/llms')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          name: '@nuxt/kit',
          version: '3.10.0',
          repository: {
            url: 'https://github.com/nuxt/nuxt',
            directory: 'packages/kit',
          },
        }),
      })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ time: { '3.10.0': '2024-01-01T00:00:00Z' } }),
      })

      vi.mocked(fetchGitHubRepoMeta).mockResolvedValue(null)
      vi.mocked(fetchReadme).mockResolvedValue('ungh://nuxt/nuxt/packages/kit')
      vi.mocked(fetchLlmsUrl).mockResolvedValue(null)

      const result = await resolvePackageDocs('@nuxt/kit')

      expect(result?.readmeUrl).toBe('ungh://nuxt/nuxt/packages/kit')
      expect(fetchReadme).toHaveBeenCalledWith('nuxt', 'nuxt', 'packages/kit')
    })
  })
})
