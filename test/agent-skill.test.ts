import { describe, expect, it } from 'vitest'
import { generateSkillMd } from '../src/agent/skill'

describe('agent/skill', () => {
  describe('generateSkillMd', () => {
    it('generates frontmatter with consistent description format', () => {
      const result = generateSkillMd(
        { name: 'vue', version: '3.4.0', description: 'Progressive JavaScript framework' },
        '# Vue\n\nContent here',
      )

      expect(result).toContain('---')
      expect(result).toContain('name: vue')
      expect(result).toContain('version: "3.4.0"')
      expect(result).toContain('Documentation for vue')
      expect(result).toContain('Use this skill when working with vue')
      expect(result).toContain('importing from "vue"')
      expect(result).toContain('# Vue')
    })

    it('generates fallback description when none provided', () => {
      const result = generateSkillMd(
        { name: 'test-pkg' },
        'Body',
      )

      expect(result).toContain('Documentation for test-pkg')
      expect(result).toContain('Use this skill when working with test-pkg')
    })

    it('omits version if not provided', () => {
      const result = generateSkillMd({ name: 'pkg' }, 'Body')
      expect(result).not.toContain('version:')
    })

    it('includes releasedAt when provided', () => {
      const result = generateSkillMd(
        { name: 'pkg', version: '1.0.0', releasedAt: '2024-02-01T12:00:00Z' },
        'Body',
      )
      expect(result).toContain('releasedAt: "2024-02-01"')
    })

    it('omits releasedAt if not provided', () => {
      const result = generateSkillMd({ name: 'pkg', version: '1.0.0' }, 'Body')
      expect(result).not.toContain('releasedAt:')
    })
  })
})
