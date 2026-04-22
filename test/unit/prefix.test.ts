import { describe, expect, it } from 'vitest'
import { parseSkillInput, parseSkillInputs, resolveSkillName } from '../../src/core/prefix'

describe('prefix parser', () => {
  describe('npm: prefix', () => {
    it('parses simple package name', () => {
      expect(parseSkillInput('npm:vue')).toEqual({
        type: 'npm',
        package: 'vue',
        tag: undefined,
      })
    })

    it('parses package with tag', () => {
      expect(parseSkillInput('npm:vue@3.5')).toEqual({
        type: 'npm',
        package: 'vue',
        tag: '3.5',
      })
    })

    it('parses scoped package', () => {
      expect(parseSkillInput('npm:@nuxt/ui')).toEqual({
        type: 'npm',
        package: '@nuxt/ui',
        tag: undefined,
      })
    })

    it('parses scoped package with tag', () => {
      expect(parseSkillInput('npm:@nuxt/ui@3.0.0')).toEqual({
        type: 'npm',
        package: '@nuxt/ui',
        tag: '3.0.0',
      })
    })
  })

  describe('gh: and github: prefix', () => {
    it('parses gh:owner/repo', () => {
      const result = parseSkillInput('gh:vercel-labs/skills')
      expect(result.type).toBe('git')
      if (result.type === 'git') {
        expect(result.source.owner).toBe('vercel-labs')
        expect(result.source.repo).toBe('skills')
      }
    })

    it('parses github:owner/repo', () => {
      const result = parseSkillInput('github:vercel-labs/skills')
      expect(result.type).toBe('git')
      if (result.type === 'git') {
        expect(result.source.owner).toBe('vercel-labs')
        expect(result.source.repo).toBe('skills')
      }
    })
  })

  describe('crate: prefix', () => {
    it('parses crate name', () => {
      expect(parseSkillInput('crate:serde')).toEqual({
        type: 'crate',
        package: 'serde',
        version: undefined,
      })
    })

    it('parses crate name with version', () => {
      expect(parseSkillInput('crate:serde@1.0.0')).toEqual({
        type: 'crate',
        package: 'serde',
        version: '1.0.0',
      })
    })

    it('lowercases crate name', () => {
      expect(parseSkillInput('crate:Tokio')).toEqual({
        type: 'crate',
        package: 'tokio',
        version: undefined,
      })
    })
  })

  describe('@ prefix (curator and collection)', () => {
    it('parses @handle as curator', () => {
      expect(parseSkillInput('@antfu')).toEqual({
        type: 'curator',
        handle: 'antfu',
      })
    })

    it('parses @handle/collection as collection', () => {
      expect(parseSkillInput('@antfu/vue-stack')).toEqual({
        type: 'collection',
        handle: 'antfu',
        name: 'vue-stack',
      })
    })
  })

  describe('bare names (deprecated)', () => {
    it('treats bare name as deprecated npm', () => {
      expect(parseSkillInput('vue')).toEqual({
        type: 'bare',
        package: 'vue',
        tag: undefined,
      })
    })

    it('treats bare name with tag as deprecated npm', () => {
      expect(parseSkillInput('vue@3.5')).toEqual({
        type: 'bare',
        package: 'vue',
        tag: '3.5',
      })
    })
  })

  describe('legacy git detection (no prefix)', () => {
    it('detects owner/repo shorthand as git', () => {
      const result = parseSkillInput('vercel-labs/skills')
      expect(result.type).toBe('git')
    })

    it('detects https URLs as git', () => {
      const result = parseSkillInput('https://github.com/vercel-labs/skills')
      expect(result.type).toBe('git')
    })

    it('detects SSH URLs as git', () => {
      const result = parseSkillInput('git@github.com:vercel-labs/skills')
      expect(result.type).toBe('git')
    })

    it('detects local paths as git', () => {
      const result = parseSkillInput('./my-skills')
      expect(result.type).toBe('git')
    })
  })

  describe('parseSkillInputs (batch)', () => {
    it('classifies mixed inputs', () => {
      const results = parseSkillInputs(['npm:vue', 'gh:owner/repo', '@antfu', 'nuxt'])
      expect(results.map(r => r.type)).toEqual(['npm', 'git', 'curator', 'bare'])
    })
  })

  describe('whitespace handling', () => {
    it('trims input', () => {
      expect(parseSkillInput('  npm:vue  ')).toEqual({
        type: 'npm',
        package: 'vue',
        tag: undefined,
      })
    })
  })

  describe('resolveSkillName', () => {
    it('strips npm: prefix', () => {
      expect(resolveSkillName('npm:vue')).toBe('vue')
    })

    it('strips npm: prefix from scoped package', () => {
      expect(resolveSkillName('npm:@nuxt/ui')).toBe('@nuxt/ui')
    })

    it('returns bare name unchanged', () => {
      expect(resolveSkillName('vue')).toBe('vue')
    })

    it('returns repo name for gh:owner/repo', () => {
      expect(resolveSkillName('gh:vercel-labs/skills')).toBe('skills')
    })

    it('returns null for curator', () => {
      expect(resolveSkillName('@antfu')).toBeNull()
    })

    it('returns null for collection', () => {
      expect(resolveSkillName('@antfu/utils')).toBeNull()
    })

    it('returns crate:<name> for crate inputs', () => {
      expect(resolveSkillName('crate:serde')).toBe('crate:serde')
    })
  })
})
