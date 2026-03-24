import { readFileSync, writeFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { appendToJsonArray, editJsonProperty, patchPackageJson, removeJsonProperty } from '../../src/core/package-json.ts'

vi.mock('node:fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(() => true),
}))

describe('package-json', () => {
  describe('editJsonProperty', () => {
    it('preserves formatting when setting a value', () => {
      const raw = `{
  "name": "my-pkg",
  "version": "1.0.0"
}
`
      const result = editJsonProperty(raw, ['version'], '2.0.0')
      expect(result).toBe(`{
  "name": "my-pkg",
  "version": "2.0.0"
}
`)
    })

    it('preserves tab indentation', () => {
      const raw = `{\n\t"name": "pkg"\n}\n`
      const result = editJsonProperty(raw, ['version'], '1.0.0', { tabSize: 1, insertSpaces: false })
      expect(result).toContain('\t"name"')
      expect(result).toContain('"version": "1.0.0"')
    })

    it('adds new property to object', () => {
      const raw = `{
  "name": "my-pkg"
}
`
      const result = editJsonProperty(raw, ['version'], '1.0.0')
      expect(result).toContain('"version": "1.0.0"')
      expect(result).toContain('"name": "my-pkg"')
    })
  })

  describe('removeJsonProperty', () => {
    it('removes a property preserving formatting', () => {
      const raw = `{
  "name": "my-pkg",
  "version": "1.0.0",
  "private": true
}
`
      const result = removeJsonProperty(raw, ['private'])
      expect(result).not.toContain('"private"')
      expect(result).toContain('"name": "my-pkg"')
      expect(result).toContain('"version": "1.0.0"')
    })
  })

  describe('appendToJsonArray', () => {
    it('appends value in sorted order', () => {
      const raw = `{
  "files": [
    "dist",
    "types"
  ]
}
`
      const result = appendToJsonArray(raw, ['files'], 'skills')
      expect(result).toContain('"skills"')
      // skills should be between dist and types (sorted)
      const skillsIdx = result.indexOf('"skills"')
      const distIdx = result.indexOf('"dist"')
      const typesIdx = result.indexOf('"types"')
      expect(skillsIdx).toBeGreaterThan(distIdx)
      expect(skillsIdx).toBeLessThan(typesIdx)
    })

    it('appends at end when value sorts last', () => {
      const raw = `{
  "files": [
    "dist",
    "src"
  ]
}
`
      const result = appendToJsonArray(raw, ['files'], 'types')
      const srcIdx = result.indexOf('"src"')
      const typesIdx = result.indexOf('"types"')
      expect(typesIdx).toBeGreaterThan(srcIdx)
    })

    it('preserves original indentation style', () => {
      const raw = `{
    "files": [
        "dist"
    ]
}
`
      const result = appendToJsonArray(raw, ['files'], 'skills', { tabSize: 4 })
      expect(result).toContain('"skills"')
    })
  })

  describe('patchPackageJson', () => {
    it('reads, edits, and writes file', () => {
      const raw = `{
  "name": "my-pkg",
  "version": "1.0.0"
}
`
      vi.mocked(readFileSync).mockReturnValue(raw)

      const result = patchPackageJson('/fake/package.json', (text, pkg) => {
        expect(pkg.name).toBe('my-pkg')
        return editJsonProperty(text, ['version'], '2.0.0')
      })

      expect(result).toBe(true)
      expect(writeFileSync).toHaveBeenCalledWith(
        '/fake/package.json',
        expect.stringContaining('"version": "2.0.0"'),
      )
    })

    it('skips writing when edit function returns null', () => {
      vi.mocked(readFileSync).mockReturnValue('{"name":"pkg"}')
      vi.mocked(writeFileSync).mockClear()

      const result = patchPackageJson('/fake/package.json', () => null)

      expect(result).toBe(false)
      expect(writeFileSync).not.toHaveBeenCalled()
    })
  })
})
