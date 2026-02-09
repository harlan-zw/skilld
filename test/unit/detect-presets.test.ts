import { parseSync } from 'oxc-parser'
import { join } from 'pathe'
import { describe, expect, it } from 'vitest'
import { detectNuxtModules, extractModuleStrings } from '../../src/agent/detect-presets'

const fixtures = join(import.meta.dirname, '../fixtures')

function parseModules(code: string): string[] {
  return extractModuleStrings(parseSync('test.ts', code).program)
}

describe('detectNuxtModules', () => {
  it('detects modules and ecosystem packages from fixture', async () => {
    const result = await detectNuxtModules(join(fixtures, 'nuxt'))
    const names = result.map(p => p.name)
    expect(names).toContain('@nuxtjs/tailwindcss')
    expect(names).toContain('@pinia/nuxt')
    expect(names).toContain('nuxt-icon')
    expect(names).toContain('vue')
    expect(names).toContain('nitro')
    expect(names).toContain('h3')
    expect(result.every(p => p.source === 'preset')).toBe(true)
    expect(result.every(p => p.count === 0)).toBe(true)
  })

  it('returns empty when no nuxt.config exists', async () => {
    const result = await detectNuxtModules(join(fixtures, 'no-nuxt'))
    expect(result).toEqual([])
  })
})

describe('extractModuleStrings', () => {
  it('handles plain export default object', () => {
    expect(parseModules(`export default { modules: ['@nuxt/content'] }`))
      .toEqual(['@nuxt/content'])
  })

  it('ignores non-string elements', () => {
    const mods = parseModules(`export default defineNuxtConfig({
      modules: ['@nuxtjs/tailwindcss', ['@nuxtjs/i18n', {}], someVar],
    })`)
    expect(mods).toEqual(['@nuxtjs/tailwindcss'])
  })

  it('returns empty for empty modules array', () => {
    expect(parseModules(`export default { modules: [] }`)).toEqual([])
  })

  it('extracts duplicates (dedup is caller responsibility)', () => {
    const mods = parseModules(`export default { modules: ['a', 'a'] }`)
    expect(mods).toEqual(['a', 'a'])
  })
})
