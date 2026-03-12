import { join } from 'pathe'
import { describe, expect, it } from 'vitest'
import { detectImportedPackages } from '../../src/agent/detect-imports'

const fixtures = join(import.meta.dirname, '../fixtures/detect-imports')

describe('detectImportedPackages', () => {
  it('detects static imports across file types', async () => {
    const { packages, error } = await detectImportedPackages(fixtures)
    expect(error).toBeUndefined()

    const names = packages.map(p => p.name)
    expect(names).toContain('vue')
    expect(names).toContain('vue-router')
    expect(names).toContain('defu')
    expect(names).toContain('@unhead/vue')
    expect(names).toContain('hono')
    expect(names).toContain('@hono/zod-validator')
  })

  it('detects dynamic imports', async () => {
    const { packages } = await detectImportedPackages(fixtures)
    const names = packages.map(p => p.name)
    expect(names).toContain('ofetch')
  })

  it('ignores node builtins', async () => {
    const { packages } = await detectImportedPackages(fixtures)
    const names = packages.map(p => p.name)
    expect(names).not.toContain('fs')
    expect(names).not.toContain('node:fs')
    expect(names).not.toContain('path')
    expect(names).not.toContain('node:path')
    expect(names).not.toContain('async_hooks')
    expect(names).not.toContain('diagnostics_channel')
    expect(names).not.toContain('http2')
    expect(names).not.toContain('inspector')
    expect(names).not.toContain('test')
    expect(names).not.toContain('trace_events')
  })

  it('ignores relative imports', async () => {
    const { packages } = await detectImportedPackages(fixtures)
    const names = packages.map(p => p.name)
    expect(names.some(n => n.startsWith('.'))).toBe(false)
  })

  it('counts usage across files', async () => {
    const { packages } = await detectImportedPackages(fixtures)
    const vue = packages.find(p => p.name === 'vue')
    // vue imported in app.ts, utils.mjs, component.vue
    expect(vue!.count).toBe(3)
  })

  it('sorts by count descending', async () => {
    const { packages } = await detectImportedPackages(fixtures)
    const imports = packages.filter(p => p.source === 'import')
    for (let i = 1; i < imports.length; i++) {
      expect(imports[i - 1]!.count).toBeGreaterThanOrEqual(imports[i]!.count)
    }
  })

  it('returns empty for nonexistent directory', async () => {
    const { packages } = await detectImportedPackages('/tmp/does-not-exist-skilld')
    expect(packages).toEqual([])
  })
})
