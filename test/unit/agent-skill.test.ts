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
      expect(result).toContain('name: vue')
      expect(result).not.toContain('name: vue-skilld')
      expect(result).toContain('metadata:')
      expect(result).toContain('  version: 3.4.0')
      expect(result).toContain('Progressive JavaScript framework. ALWAYS use when editing or working with *.vue files or code importing \\"vue\\". Consult for debugging, best practices, or modifying vue.')
      expect(result).toContain('# Vue')
    })

    it('uses dirName in frontmatter name when provided', () => {
      const result = generateSkillMd({
        name: 'vue',
        version: '3.4.0',
        dirName: 'vuejs-core',
        relatedSkills: [],
      })

      expect(result).toContain('name: vuejs-core')
      expect(result).not.toContain('name: vuejs-core-skilld')
      // description still uses npm package name for import matching
      expect(result).toContain('code importing \\"vue\\"')
    })

    it('generates fallback description when no globs', () => {
      const result = generateSkillMd({
        name: 'test-pkg',
        relatedSkills: [],
      })

      expect(result).toContain('ALWAYS use when writing code importing \\"test-pkg\\". Consult for debugging, best practices, or modifying test-pkg, test pkg')
    })

    it('generates multi-package description when packages provided', () => {
      const result = generateSkillMd({
        name: 'vue',
        version: '3.5.0',
        dirName: 'vuejs-core',
        relatedSkills: [],
        packages: [{ name: 'vue' }, { name: '@vue/reactivity' }],
      })

      expect(result).toContain('code importing \\"vue\\", \\"@vue/reactivity\\"')
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

    it('strips angle brackets from description (security)', () => {
      const result = generateSkillMd({
        name: 'some-lib',
        description: 'A <b>bold</b> library for <React> apps',
        relatedSkills: [],
      })

      // No angle brackets in frontmatter (Agent Skills spec security restriction)
      const frontmatter = result.split('---')[1]
      expect(frontmatter).not.toContain('<')
      expect(frontmatter).not.toContain('>')
      // Description content preserved without tags
      expect(result).toContain('bold')
      expect(result).toContain('React')
    })

    it('enforces 1024 char limit on description', () => {
      const result = generateSkillMd({
        name: 'pkg',
        description: 'A '.repeat(600),
        relatedSkills: [],
      })

      const frontmatter = result.split('---')[1]
      const descLine = frontmatter.split('\n').find(l => l.startsWith('description:'))!
      // yamlEscape wraps in quotes, so strip those
      const desc = descLine.replace('description: ', '').replace(/^"|"$/g, '')
      expect(desc.length).toBeLessThanOrEqual(1024)
    })

    it('leads description with what-it-does before when-to-use', () => {
      const result = generateSkillMd({
        name: 'vue',
        description: 'Progressive JavaScript Framework',
        relatedSkills: [],
      })

      const frontmatter = result.split('---')[1]
      const descLine = frontmatter.split('\n').find(l => l.startsWith('description:'))!
      // Description should start with the package description, not "ALWAYS use when"
      expect(descLine).toMatch(/description:.*Progressive JavaScript Framework.*ALWAYS use when/)
    })

    // ── Eject mode tests ──

    it('uses ./references/ paths when eject is true', () => {
      const result = generateSkillMd({
        name: 'vue',
        version: '3.4.0',
        relatedSkills: [],
        hasIssues: true,
        hasReleases: true,
        eject: true,
      })

      expect(result).toContain('./references/issues/_INDEX.md')
      expect(result).toContain('./references/releases/_INDEX.md')
      expect(result).not.toContain('.skilld')
    })

    it('uses ./.skilld/ paths when eject is false', () => {
      const result = generateSkillMd({
        name: 'vue',
        version: '3.4.0',
        relatedSkills: [],
        hasIssues: true,
        hasReleases: true,
      })

      expect(result).toContain('./.skilld/issues/_INDEX.md')
      expect(result).toContain('./.skilld/releases/_INDEX.md')
    })

    it('omits pkg references in eject mode', () => {
      const result = generateSkillMd({
        name: 'vue',
        version: '3.4.0',
        relatedSkills: [],
        pkgFiles: ['README.md'],
        eject: true,
      })

      expect(result).not.toContain('package.json')
      expect(result).not.toContain('pkg/README.md')
    })

    it('omits search block in eject mode', () => {
      const result = generateSkillMd({
        name: 'vue',
        version: '3.4.0',
        relatedSkills: [],
        features: { search: true, issues: false, discussions: false, releases: false },
        eject: true,
      })

      expect(result).not.toContain('skilld search')
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
