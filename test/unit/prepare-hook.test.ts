import { describe, expect, it } from 'vitest'
import { buildPrepareScript } from '../../src/cli-helpers.ts'
import { editJsonProperty } from '../../src/core/package-json.ts'

describe('prepare hook script building', () => {
  const buildPrepare = buildPrepareScript
  const standalone = 'skilld prepare || true'

  it('returns standalone when no existing script', () => {
    expect(buildPrepare(undefined)).toBe(standalone)
  })

  it('returns standalone when existing script is empty', () => {
    expect(buildPrepare('')).toBe(standalone)
    expect(buildPrepare('   ')).toBe(standalone)
  })

  it('appends with && and parens to existing script', () => {
    expect(buildPrepare('husky')).toBe('husky && (skilld prepare || true)')
  })

  it('handles existing script with multiple commands', () => {
    expect(buildPrepare('husky && lint-staged')).toBe('husky && lint-staged && (skilld prepare || true)')
  })

  it('strips trailing && from existing script', () => {
    expect(buildPrepare('husky &&')).toBe('husky && (skilld prepare || true)')
    expect(buildPrepare('husky && ')).toBe('husky && (skilld prepare || true)')
  })

  it('strips trailing ; from existing script', () => {
    expect(buildPrepare('husky;')).toBe('husky && (skilld prepare || true)')
  })

  it('strips trailing || from existing script', () => {
    expect(buildPrepare('husky ||')).toBe('husky && (skilld prepare || true)')
  })

  it('handles only operators as existing script', () => {
    expect(buildPrepare('&&')).toBe(standalone)
    expect(buildPrepare(';')).toBe(standalone)
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
      const result = editJsonProperty(raw, ['scripts', 'prepare'], standalone)
      expect(result).toContain(`"prepare": "${standalone}"`)
      expect(result).toContain('"build": "tsc"')
    })

    it('adds scripts object when missing', () => {
      const raw = `{
  "name": "my-pkg"
}
`
      let result = editJsonProperty(raw, ['scripts'], {})
      result = editJsonProperty(result, ['scripts', 'prepare'], standalone)
      expect(result).toContain('"scripts"')
      expect(result).toContain(`"prepare": "${standalone}"`)
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
      const result = editJsonProperty(raw, ['scripts', 'prepare'], 'husky && (skilld prepare || true)')
      expect(result).toContain('"prepare": "husky && (skilld prepare || true)"')
      expect(result).toContain('"build": "tsc"')
      expect(result).toContain('"name": "my-pkg"')
    })
  })
})
