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
  })
})
