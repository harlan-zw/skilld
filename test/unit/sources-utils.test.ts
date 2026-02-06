import { describe, expect, it } from 'vitest'
import { isGitHubRepoUrl, normalizeRepoUrl, parseGitHubUrl } from '../../src/sources/utils'

describe('sources/utils', () => {
  describe('isGitHubRepoUrl', () => {
    it('returns true for github.com URLs', () => {
      expect(isGitHubRepoUrl('https://github.com/vuejs/vue')).toBe(true)
      expect(isGitHubRepoUrl('https://www.github.com/vuejs/vue')).toBe(true)
    })

    it('returns false for non-GitHub URLs', () => {
      expect(isGitHubRepoUrl('https://vuejs.org')).toBe(false)
      expect(isGitHubRepoUrl('https://gitlab.com/repo')).toBe(false)
    })

    it('handles invalid URLs gracefully', () => {
      expect(isGitHubRepoUrl('not-a-url')).toBe(false)
      expect(isGitHubRepoUrl('')).toBe(false)
    })
  })

  describe('parseGitHubUrl', () => {
    it('extracts owner and repo', () => {
      expect(parseGitHubUrl('https://github.com/vuejs/vue')).toEqual({
        owner: 'vuejs',
        repo: 'vue',
      })
      expect(parseGitHubUrl('https://github.com/nuxt/nuxt')).toEqual({
        owner: 'nuxt',
        repo: 'nuxt',
      })
    })

    it('handles URLs with extra path segments', () => {
      expect(parseGitHubUrl('https://github.com/owner/repo/tree/main')).toEqual({
        owner: 'owner',
        repo: 'repo',
      })
    })

    it('returns null for invalid URLs', () => {
      expect(parseGitHubUrl('https://gitlab.com/owner/repo')).toBeNull()
      expect(parseGitHubUrl('not-a-url')).toBeNull()
    })
  })

  describe('normalizeRepoUrl', () => {
    it('removes git+ prefix', () => {
      expect(normalizeRepoUrl('git+https://github.com/owner/repo.git'))
        .toBe('https://github.com/owner/repo')
    })

    it('removes .git suffix', () => {
      expect(normalizeRepoUrl('https://github.com/owner/repo.git'))
        .toBe('https://github.com/owner/repo')
    })

    it('converts git:// to https://', () => {
      expect(normalizeRepoUrl('git://github.com/owner/repo'))
        .toBe('https://github.com/owner/repo')
    })

    it('converts ssh URLs', () => {
      expect(normalizeRepoUrl('ssh://git@github.com/owner/repo'))
        .toBe('https://github.com/owner/repo')
    })

    it('handles already normalized URLs', () => {
      expect(normalizeRepoUrl('https://github.com/owner/repo'))
        .toBe('https://github.com/owner/repo')
    })
  })
})
