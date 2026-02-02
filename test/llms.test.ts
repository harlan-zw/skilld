import { describe, expect, it } from 'vitest'
import { extractSections, normalizeLlmsLinks, parseMarkdownLinks } from '../src/doc-resolver/llms'

describe('doc-resolver/llms', () => {
  describe('parseMarkdownLinks', () => {
    it('extracts markdown links to .md files', () => {
      const content = `
# Docs
- [Getting Started](/docs/getting-started.md)
- [API Reference](/docs/api.md)
- [Some HTML](/docs/page.html)
      `
      const links = parseMarkdownLinks(content)
      expect(links).toEqual([
        { title: 'Getting Started', url: '/docs/getting-started.md' },
        { title: 'API Reference', url: '/docs/api.md' },
      ])
    })

    it('deduplicates links', () => {
      const content = `
[Same](/docs/a.md)
[Same Again](/docs/a.md)
[Different](/docs/b.md)
      `
      const links = parseMarkdownLinks(content)
      expect(links).toHaveLength(2)
    })

    it('handles absolute URLs', () => {
      const content = '[Ext](https://example.com/docs/guide.md)'
      const links = parseMarkdownLinks(content)
      expect(links[0]?.url).toBe('https://example.com/docs/guide.md')
    })
  })

  describe('normalizeLlmsLinks', () => {
    it('converts absolute paths to relative', () => {
      const content = 'See [Guide](/getting-started.md) and [API](/api.md)'
      expect(normalizeLlmsLinks(content)).toBe(
        'See [Guide](./docs/getting-started.md) and [API](./docs/api.md)',
      )
    })

    it('preserves non-absolute paths', () => {
      const content = 'See [Guide](./getting-started.md)'
      expect(normalizeLlmsLinks(content)).toBe('See [Guide](./getting-started.md)')
    })
  })

  describe('extractSections', () => {
    it('extracts sections matching patterns', () => {
      // Format: parts split by \n---\n, each part has url: line followed by content
      const content = [
        'url: /docs/intro.md',
        'Intro content here',
        '',
        '---',
        'url: /api/config.md',
        'Config content',
        '',
        '---',
        'url: /docs/guide.md',
        'Guide content',
      ].join('\n')
      const result = extractSections(content, ['/docs/'])
      expect(result).toContain('Intro content')
      expect(result).toContain('Guide content')
      expect(result).not.toContain('Config content')
    })

    it('returns null when no matches', () => {
      const content = '---\nurl: /api/thing.md\n---\nContent'
      expect(extractSections(content, ['/docs/'])).toBeNull()
    })
  })
})
