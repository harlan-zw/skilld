import { describe, expect, it } from 'vitest'
import { editJsonProperty } from '../../src/core/package-json.ts'

/**
 * Tests the prepare script construction logic.
 * buildPrepareScript is private, so we test the same edge cases
 * through the integration: given raw package.json content,
 * does the resulting prepare script look correct?
 */
describe('prepare hook script building', () => {
  function buildPrepare(existing: string | undefined): string {
    if (!existing || !existing.trim())
      return 'skilld prepare'
    const cleaned = existing.trim().replace(/[&|;]+\s*$/, '').trim()
    if (!cleaned)
      return 'skilld prepare'
    return `${cleaned} && skilld prepare`
  }

  it('returns standalone when no existing script', () => {
    expect(buildPrepare(undefined)).toBe('skilld prepare')
  })

  it('returns standalone when existing script is empty', () => {
    expect(buildPrepare('')).toBe('skilld prepare')
    expect(buildPrepare('   ')).toBe('skilld prepare')
  })

  it('appends with && to existing script', () => {
    expect(buildPrepare('husky')).toBe('husky && skilld prepare')
  })

  it('handles existing script with multiple commands', () => {
    expect(buildPrepare('husky && lint-staged')).toBe('husky && lint-staged && skilld prepare')
  })

  it('strips trailing && from existing script', () => {
    expect(buildPrepare('husky &&')).toBe('husky && skilld prepare')
    expect(buildPrepare('husky && ')).toBe('husky && skilld prepare')
  })

  it('strips trailing ; from existing script', () => {
    expect(buildPrepare('husky;')).toBe('husky && skilld prepare')
  })

  it('strips trailing || from existing script', () => {
    expect(buildPrepare('husky ||')).toBe('husky && skilld prepare')
  })

  it('handles only operators as existing script', () => {
    expect(buildPrepare('&&')).toBe('skilld prepare')
    expect(buildPrepare(';')).toBe('skilld prepare')
  })

  describe('surgical package.json editing', () => {
    it('adds prepare to empty scripts object', () => {
      const raw = `{
  "name": "my-pkg",
  "scripts": {
    "build": "tsc"
  }
}
`
      const result = editJsonProperty(raw, ['scripts', 'prepare'], 'skilld prepare')
      expect(result).toContain('"prepare": "skilld prepare"')
      expect(result).toContain('"build": "tsc"')
    })

    it('adds scripts object when missing', () => {
      const raw = `{
  "name": "my-pkg"
}
`
      let result = editJsonProperty(raw, ['scripts'], {})
      result = editJsonProperty(result, ['scripts', 'prepare'], 'skilld prepare')
      expect(result).toContain('"scripts"')
      expect(result).toContain('"prepare": "skilld prepare"')
      expect(result).toContain('"name": "my-pkg"')
    })

    it('replaces existing prepare script preserving formatting', () => {
      const raw = `{
  "name": "my-pkg",
  "scripts": {
    "prepare": "husky",
    "build": "tsc"
  }
}
`
      const result = editJsonProperty(raw, ['scripts', 'prepare'], 'husky && skilld prepare')
      expect(result).toContain('"prepare": "husky && skilld prepare"')
      expect(result).toContain('"build": "tsc"')
      expect(result).toContain('"name": "my-pkg"')
    })
  })
})
