import { describe, expect, it } from 'vitest'
import { sanitizeName } from '../src/agent/install'

describe('agent/install', () => {
  describe('sanitizeName', () => {
    it('lowercases names', () => {
      expect(sanitizeName('Vue')).toBe('vue')
      expect(sanitizeName('NUXT')).toBe('nuxt')
    })

    it('replaces invalid chars with dashes', () => {
      expect(sanitizeName('@nuxt/kit')).toBe('nuxt-kit')
      expect(sanitizeName('vue router')).toBe('vue-router')
    })

    it('trims leading/trailing dots and dashes', () => {
      expect(sanitizeName('.hidden')).toBe('hidden')
      expect(sanitizeName('-prefix')).toBe('prefix')
      expect(sanitizeName('suffix-')).toBe('suffix')
    })

    it('preserves dots and underscores in middle', () => {
      expect(sanitizeName('vue.config')).toBe('vue.config')
      expect(sanitizeName('my_package')).toBe('my_package')
    })

    it('handles empty/invalid input', () => {
      expect(sanitizeName('')).toBe('unnamed-skill')
      expect(sanitizeName('...')).toBe('unnamed-skill')
    })
  })
})
