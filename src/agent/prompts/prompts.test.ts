import { describe, expect, it } from 'vitest'
import { buildPrompt, detailedPreset, getPreset, minimalPreset, presets, simplePreset } from './index'

describe('presets', () => {
  it('has all expected presets', () => {
    expect(Object.keys(presets)).toEqual(['detailed', 'simple', 'minimal'])
  })

  it('detailed preset has correct metadata', () => {
    expect(detailedPreset.id).toBe('detailed')
    expect(detailedPreset.name).toBe('Detailed')
  })

  it('simple preset has correct metadata', () => {
    expect(simplePreset.id).toBe('simple')
    expect(simplePreset.name).toBe('Simple')
  })

  it('minimal preset has correct metadata', () => {
    expect(minimalPreset.id).toBe('minimal')
    expect(minimalPreset.name).toBe('Minimal')
  })
})

describe('getPreset', () => {
  it('returns preset by id', () => {
    expect(getPreset('simple')).toBe(simplePreset)
    expect(getPreset('detailed')).toBe(detailedPreset)
    expect(getPreset('minimal')).toBe(minimalPreset)
  })

  it('returns undefined for unknown preset', () => {
    expect(getPreset('unknown')).toBeUndefined()
  })
})

describe('buildPrompt', () => {
  const packageName = 'test-pkg'
  const packageDocs = '# Test Package\n\nSome docs'

  it('uses simple preset by default', () => {
    const prompt = buildPrompt(packageName, packageDocs)
    expect(prompt).toContain('test-pkg')
    expect(prompt).toContain('Some docs')
  })

  it('uses specified preset', () => {
    const detailed = buildPrompt(packageName, packageDocs, 'detailed')
    expect(detailed).toContain('API signatures')

    const minimal = buildPrompt(packageName, packageDocs, 'minimal')
    expect(minimal).toContain('under 50 lines')
  })

  it('falls back to simple for unknown preset', () => {
    const prompt = buildPrompt(packageName, packageDocs, 'nonexistent')
    expect(prompt).toContain('test-pkg')
  })
})
