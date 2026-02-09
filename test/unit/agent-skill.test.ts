import { describe, expect, it } from 'vitest'
import { computeSkillDirName, generateSkillMd } from '../../src/agent'

describe('agent/skill', () => {
  describe('generateSkillMd', () => {
    it('generates frontmatter with consistent description format', () => {
      const result = generateSkillMd({
        name: 'vue',
        version: '3.4.0',
        description: 'Progressive JavaScript framework',
        body: '# Vue\n\nContent here',
        relatedSkills: [],
      })

      expect(result).toContain('---')
      expect(result).toContain('name: vue-skilld')
      expect(result).toContain('version: 3.4.0')
      expect(result).toContain('Using code importing from \\"vue\\" or working with *.vue files. Researching or debugging vue. (Progressive JavaScript framework)')
      expect(result).toContain('# Vue')
    })

    it('uses dirName in frontmatter name when provided', () => {
      const result = generateSkillMd({
        name: 'vue',
        version: '3.4.0',
        dirName: 'vuejs-core',
        relatedSkills: [],
      })

      expect(result).toContain('name: vuejs-core-skilld')
      // description still uses npm package name for import matching
      expect(result).toContain('importing from \\"vue\\"')
    })

    it('generates fallback description when no globs', () => {
      const result = generateSkillMd({
        name: 'test-pkg',
        relatedSkills: [],
      })

      expect(result).toContain('Using code importing from \\"test-pkg\\". Researching or debugging test-pkg, test pkg.')
    })

    it('generates multi-package description when packages provided', () => {
      const result = generateSkillMd({
        name: 'vue',
        version: '3.5.0',
        dirName: 'vuejs-core',
        relatedSkills: [],
        packages: [{ name: 'vue' }, { name: '@vue/reactivity' }],
      })

      expect(result).toContain('importing from \\"vue\\", \\"@vue/reactivity\\"')
      expect(result).toContain('vue/reactivity')
      expect(result).toContain('vue reactivity')
      // Should list named package references
      expect(result).toContain('pkg-vue')
      expect(result).toContain('pkg-reactivity')
    })

    it('does not add multi-package refs for single package', () => {
      const result = generateSkillMd({
        name: 'vue',
        version: '3.5.0',
        relatedSkills: [],
        packages: [{ name: 'vue' }],
      })

      // Single package: no pkg-<name> references
      expect(result).not.toContain('pkg-vue')
    })

    it('omits version if not provided', () => {
      const result = generateSkillMd({ name: 'pkg', relatedSkills: [] })
      expect(result).not.toContain('version:')
    })

    it('includes releasedAt as relative date in version line', () => {
      const result = generateSkillMd({
        name: 'pkg',
        version: '1.0.0',
        releasedAt: '2024-02-01T12:00:00Z',
        relatedSkills: [],
      })
      expect(result).toContain('**Version:** 1.0.0 (')
      expect(result).toContain('ago)')
    })

    it('omits relative date if releasedAt not provided', () => {
      const result = generateSkillMd({ name: 'pkg', version: '1.0.0', relatedSkills: [] })
      expect(result).toContain('**Version:** 1.0.0')
      expect(result).not.toContain('ago)')
    })
  })

  describe('computeSkillDirName', () => {
    it('uses GitHub owner/repo when repoUrl provided', () => {
      expect(computeSkillDirName('vue', 'https://github.com/vuejs/core')).toBe('vuejs-core')
    })

    it('handles .git suffix', () => {
      expect(computeSkillDirName('vue', 'https://github.com/vuejs/core.git')).toBe('vuejs-core')
    })

    it('handles URL with hash fragment', () => {
      expect(computeSkillDirName('vue', 'https://github.com/vuejs/core#main')).toBe('vuejs-core')
    })

    it('handles scoped packages — same result as owner/repo', () => {
      expect(computeSkillDirName('@nuxt/ui', 'https://github.com/nuxt/ui')).toBe('nuxt-ui')
    })

    it('deduplicates monorepo packages', () => {
      const repo = 'https://github.com/vuejs/core'
      expect(computeSkillDirName('vue', repo)).toBe(computeSkillDirName('@vue/reactivity', repo))
    })

    it('falls back to sanitized package name without repoUrl', () => {
      expect(computeSkillDirName('vue')).toBe('vue')
      expect(computeSkillDirName('@nuxt/ui')).toBe('nuxt-ui')
    })

    it('falls back for non-GitHub URLs', () => {
      expect(computeSkillDirName('some-pkg', 'https://gitlab.com/org/repo')).toBe('some-pkg')
    })
  })
})
