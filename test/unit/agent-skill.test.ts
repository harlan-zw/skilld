import { describe, expect, it } from 'vitest'
import { generateSkillMd } from '../../src/agent'

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
      expect(result).toContain('version: "3.4.0"')
      expect(result).toContain('working with *.vue files or importing from "vue"')
      expect(result).toContain('# Vue')
    })

    it('generates fallback description when no globs', () => {
      const result = generateSkillMd({
        name: 'test-pkg',
        relatedSkills: [],
      })

      expect(result).toContain('using anything from the package "test-pkg"')
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
})
