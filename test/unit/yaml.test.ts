import { describe, expect, it } from 'vitest'
import { yamlEscape, yamlParseKV, yamlUnescape } from '../../src/core/yaml'

describe('yaml', () => {
  describe('yamlEscape', () => {
    it('returns simple values unquoted', () => {
      expect(yamlEscape('hello')).toBe('hello')
      expect(yamlEscape('3.4.0')).toBe('3.4.0')
      expect(yamlEscape('skilld')).toBe('skilld')
    })

    it('quotes values with colons', () => {
      expect(yamlEscape('key: value')).toBe('"key: value"')
      expect(yamlEscape('C:\\Users\\foo')).toBe('"C:\\\\Users\\\\foo"')
    })

    it('quotes values with double quotes', () => {
      expect(yamlEscape('say "hello"')).toBe('"say \\"hello\\""')
    })

    it('quotes values with newlines', () => {
      expect(yamlEscape('line1\nline2')).toBe('"line1\\nline2"')
    })

    it('handles combined special chars', () => {
      expect(yamlEscape('a: "b"\nc')).toBe('"a: \\"b\\"\\nc"')
    })

    it('quotes values with yaml-special characters', () => {
      expect(yamlEscape('#comment')).toBe('"#comment"')
      expect(yamlEscape('{obj}')).toBe('"{obj}"')
      expect(yamlEscape('[arr]')).toBe('"[arr]"')
      expect(yamlEscape('it\'s')).toBe('"it\'s"')
    })
  })

  describe('yamlUnescape', () => {
    it('returns unquoted values trimmed', () => {
      expect(yamlUnescape('  hello  ')).toBe('hello')
      expect(yamlUnescape('3.4.0')).toBe('3.4.0')
    })

    it('strips single quotes without processing escapes', () => {
      expect(yamlUnescape('\'hello\'')).toBe('hello')
      expect(yamlUnescape('\'has\\nslash\'')).toBe('has\\nslash')
    })

    it('strips double quotes and processes escapes', () => {
      expect(yamlUnescape('"hello"')).toBe('hello')
      expect(yamlUnescape('"line1\\nline2"')).toBe('line1\nline2')
      expect(yamlUnescape('"say \\"hi\\""')).toBe('say "hi"')
      expect(yamlUnescape('"C:\\\\Users"')).toBe('C:\\Users')
    })

    it('returns empty for empty/whitespace', () => {
      expect(yamlUnescape('')).toBe('')
      expect(yamlUnescape('   ')).toBe('')
    })
  })

  describe('yamlParseKV', () => {
    it('parses simple key-value', () => {
      expect(yamlParseKV('name: vue')).toEqual(['name', 'vue'])
    })

    it('parses quoted values', () => {
      expect(yamlParseKV('version: "3.4.0"')).toEqual(['version', '3.4.0'])
    })

    it('handles values with colons', () => {
      expect(yamlParseKV('source: "https://example.com"')).toEqual(['source', 'https://example.com'])
    })

    it('handles unquoted values with colons (first colon wins)', () => {
      expect(yamlParseKV('key: a:b:c')).toEqual(['key', 'a:b:c'])
    })

    it('handles indented lines', () => {
      expect(yamlParseKV('    packageName: vue')).toEqual(['packageName', 'vue'])
    })

    it('returns null for no-colon lines', () => {
      expect(yamlParseKV('no colon here')).toBeNull()
    })

    it('returns null for empty key', () => {
      expect(yamlParseKV(': value')).toBeNull()
    })

    it('handles values with escaped quotes', () => {
      expect(yamlParseKV('desc: "say \\"hello\\""')).toEqual(['desc', 'say "hello"'])
    })

    it('handles npm package descriptions with special chars', () => {
      // Real-world: "The Progressive JavaScript Framework" is fine
      expect(yamlParseKV('description: The Progressive JavaScript Framework')).toEqual(
        ['description', 'The Progressive JavaScript Framework'],
      )
      // Description with colon: "Vue.js: The Progressive JavaScript Framework"
      expect(yamlParseKV('description: "Vue.js: The Progressive JavaScript Framework"')).toEqual(
        ['description', 'Vue.js: The Progressive JavaScript Framework'],
      )
    })
  })

  describe('roundtrip', () => {
    it('escape → unescape preserves values', () => {
      const cases = [
        'simple',
        'has: colon',
        'has "quotes"',
        'line1\nline2',
        'C:\\Users\\path',
        'mix: "all"\nchars',
        '#comment-like',
        '{object}',
        'it\'s a test',
      ]
      for (const val of cases) {
        expect(yamlUnescape(yamlEscape(val))).toBe(val)
      }
    })

    it('escape → parseKV roundtrips', () => {
      const cases = [
        'simple',
        'has: colon',
        'Vue.js: The Progressive JavaScript Framework',
        'say "hello"',
      ]
      for (const val of cases) {
        const line = `key: ${yamlEscape(val)}`
        const result = yamlParseKV(line)
        expect(result).toEqual(['key', val])
      }
    })
  })
})
