import { describe, expect, it } from 'vitest'
import { getCacheDir, getCacheKey, getVersionKey } from './version'

describe('getVersionKey', () => {
  it('extracts major.minor from semver', () => {
    expect(getVersionKey('1.2.3')).toBe('1.2')
    expect(getVersionKey('10.20.30')).toBe('10.20')
  })

  it('handles prerelease versions', () => {
    expect(getVersionKey('1.2.3-beta.1')).toBe('1.2')
  })

  it('returns original if no match', () => {
    expect(getVersionKey('latest')).toBe('latest')
    expect(getVersionKey('next')).toBe('next')
  })
})

describe('getCacheKey', () => {
  it('combines name and version key', () => {
    expect(getCacheKey('vue', '3.4.5')).toBe('vue@3.4')
    expect(getCacheKey('@nuxt/kit', '1.2.3')).toBe('@nuxt/kit@1.2')
  })
})

describe('getCacheDir', () => {
  it('returns path under REFERENCES_DIR', () => {
    const dir = getCacheDir('vue', '3.4.5')
    expect(dir).toContain('.skilld')
    expect(dir).toContain('references')
    expect(dir).toContain('vue@3.4')
  })
})
