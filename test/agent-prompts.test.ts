import { describe, expect, it } from 'vitest'
import {
  buildPrompt,
  defaultPreset,
  detailedPreset,
  getPreset,
  minimalPreset,
  presets,
  simplePreset,
} from '../src/agent/prompts'

describe('agent/prompts', () => {
  describe('presets', () => {
    it('exports all preset objects', () => {
      expect(detailedPreset.id).toBe('detailed')
      expect(simplePreset.id).toBe('simple')
      expect(minimalPreset.id).toBe('minimal')
    })

    it('presets record contains all presets', () => {
      expect(Object.keys(presets)).toEqual(['detailed', 'simple', 'minimal'])
    })

    it('defaultPreset is simple', () => {
      expect(defaultPreset.id).toBe('simple')
    })
  })

  describe('getPreset', () => {
    it('returns preset by id', () => {
      expect(getPreset('simple')).toBe(simplePreset)
      expect(getPreset('detailed')).toBe(detailedPreset)
      expect(getPreset('minimal')).toBe(minimalPreset)
    })

    it('returns undefined for unknown id', () => {
      expect(getPreset('unknown')).toBeUndefined()
    })
  })

  describe('buildPrompt', () => {
    it('builds prompt with simple preset by default', () => {
      const prompt = buildPrompt('vue', '# Vue docs')

      expect(prompt).toContain('vue')
      expect(prompt).toContain('# Vue docs')
    })

    it('uses specified preset', () => {
      const simple = buildPrompt('pkg', 'docs', 'simple')
      const detailed = buildPrompt('pkg', 'docs', 'detailed')

      // Detailed is longer
      expect(detailed.length).toBeGreaterThan(simple.length)
    })

    it('falls back to default for unknown preset', () => {
      const prompt = buildPrompt('pkg', 'docs', 'nonexistent')

      // Should still produce a valid prompt using default
      expect(prompt).toContain('pkg')
      expect(prompt).toContain('docs')
    })
  })

  describe('preset build functions', () => {
    it('simple preset includes package name and docs', () => {
      const prompt = simplePreset.build('lodash', '# Lodash API')

      expect(prompt).toContain('lodash')
      expect(prompt).toContain('# Lodash API')
      expect(prompt).toContain('SKILL.md')
    })

    it('minimal preset produces shorter output', () => {
      const simple = simplePreset.build('pkg', 'docs')
      const minimal = minimalPreset.build('pkg', 'docs')

      expect(minimal.length).toBeLessThan(simple.length)
    })

    it('detailed preset includes more structure', () => {
      const detailed = detailedPreset.build('pkg', 'docs')

      expect(detailed).toContain('pkg')
      expect(detailed.length).toBeGreaterThan(500)
    })
  })
})
