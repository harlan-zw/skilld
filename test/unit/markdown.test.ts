import { describe, expect, it } from 'vitest'
import {
  extractDescription,
  extractHeadings,
  extractLinks,
  extractTitle,
  parseFrontmatter,
  parseMd,
  stripFrontmatter,
} from '../../src/core/markdown.ts'

describe('parseMd', () => {
  it('parses empty string', () => {
    const { tree, frontmatter } = parseMd('')
    expect(tree.type).toBe('root')
    expect(frontmatter).toEqual({})
  })

  it('parses frontmatter + body', () => {
    const { frontmatter } = parseMd('---\ntitle: Hello\nversion: 1.0\n---\n\n# Hello')
    expect(frontmatter).toEqual({ title: 'Hello', version: '1.0' })
  })

  it('handles quoted frontmatter values', () => {
    const { frontmatter } = parseMd('---\ntitle: "Hello: World"\n---\n\nBody')
    expect(frontmatter.title).toBe('Hello: World')
  })

  it('handles no frontmatter', () => {
    const { frontmatter } = parseMd('# Just a heading')
    expect(frontmatter).toEqual({})
  })
})

describe('parseFrontmatter', () => {
  it('returns key-value pairs', () => {
    expect(parseFrontmatter('---\nfoo: bar\nbaz: qux\n---\n')).toEqual({ foo: 'bar', baz: 'qux' })
  })

  it('returns empty for no frontmatter', () => {
    expect(parseFrontmatter('# Hello')).toEqual({})
  })
})

describe('extractTitle', () => {
  it('returns frontmatter title first', () => {
    expect(extractTitle('---\ntitle: FM Title\n---\n\n# Heading Title')).toBe('FM Title')
  })

  it('returns first h1 when no frontmatter title', () => {
    expect(extractTitle('# My Heading')).toBe('My Heading')
  })

  it('returns null when no title', () => {
    expect(extractTitle('Just some text.')).toBeNull()
  })

  it('returns null for empty content', () => {
    expect(extractTitle('')).toBeNull()
  })

  it('handles heading with {#id} anchors', () => {
    expect(extractTitle('# Reactivity {#reactivity}')).toBe('Reactivity')
  })

  it('prefers first h1 over h2', () => {
    expect(extractTitle('## Not This\n\n# This One')).toBe('This One')
  })

  it('handles heading with inline code', () => {
    expect(extractTitle('# The `setup` function')).toBe('The setup function')
  })

  it('handles frontmatter with quoted title', () => {
    expect(extractTitle('---\ntitle: "Introduction"\n---\n')).toBe('Introduction')
  })
})

describe('extractDescription', () => {
  it('returns first paragraph', () => {
    expect(extractDescription('# Title\n\nFirst paragraph here.')).toBe('First paragraph here.')
  })

  it('returns null for no paragraphs', () => {
    expect(extractDescription('# Just a heading')).toBeNull()
  })

  it('returns null for empty content', () => {
    expect(extractDescription('')).toBeNull()
  })

  it('truncates at 150 chars', () => {
    const long = `# Title\n\n${'A'.repeat(200)}`
    const desc = extractDescription(long)
    expect(desc).toBeTruthy()
    expect(desc!.length).toBeLessThanOrEqual(150)
    expect(desc!.endsWith('...')).toBe(true)
  })

  it('strips markdown links', () => {
    expect(extractDescription('# T\n\nSee the [docs](https://example.com) for info.'))
      .toBe('See the docs for info.')
  })

  it('strips formatting chars', () => {
    expect(extractDescription('# T\n\nThis is **bold** and `code`.'))
      .toBe('This is bold and code.')
  })

  it('skips paragraphs inside blockquotes', () => {
    const md = '# Title\n\n> Quoted text\n\nActual description.'
    expect(extractDescription(md)).toBe('Actual description.')
  })

  it('skips paragraphs inside list items', () => {
    const md = '# Title\n\n- List item paragraph\n\nReal paragraph.'
    expect(extractDescription(md)).toBe('Real paragraph.')
  })

  it('handles frontmatter before paragraph', () => {
    expect(extractDescription('---\ntitle: T\n---\n\nThe description.'))
      .toBe('The description.')
  })
})

describe('extractHeadings', () => {
  it('returns all headings', () => {
    const md = '# H1\n\n## H2\n\n### H3\n\n## Another H2'
    const headings = extractHeadings(md)
    expect(headings).toEqual([
      { depth: 1, text: 'H1' },
      { depth: 2, text: 'H2' },
      { depth: 3, text: 'H3' },
      { depth: 2, text: 'Another H2' },
    ])
  })

  it('returns empty for no headings', () => {
    expect(extractHeadings('Just text.')).toEqual([])
  })

  it('strips {#id} anchors from headings', () => {
    const headings = extractHeadings('# Reactivity {#reactivity}')
    expect(headings[0]).toEqual({ depth: 1, text: 'Reactivity' })
  })
})

describe('extractLinks', () => {
  it('extracts all links', () => {
    const md = 'See [docs](https://example.com/docs.md) and [api](https://example.com/api.md).'
    const links = extractLinks(md)
    expect(links).toEqual([
      { title: 'docs', url: 'https://example.com/docs.md' },
      { title: 'api', url: 'https://example.com/api.md' },
    ])
  })

  it('deduplicates by url', () => {
    const md = '[A](https://a.com) and [B](https://a.com)'
    const links = extractLinks(md)
    expect(links).toHaveLength(1)
    expect(links[0].title).toBe('A')
  })

  it('returns empty for no links', () => {
    expect(extractLinks('No links here.')).toEqual([])
  })

  it('extracts links from lists', () => {
    const md = '- [Page 1](/page1.md)\n- [Page 2](/page2.md)'
    const links = extractLinks(md)
    expect(links).toHaveLength(2)
  })

  it('filters .md links when needed by caller', () => {
    const md = '[Doc](/doc.md) and [Site](https://example.com)'
    const links = extractLinks(md).filter(l => l.url.endsWith('.md'))
    expect(links).toHaveLength(1)
    expect(links[0].url).toBe('/doc.md')
  })
})

describe('stripFrontmatter', () => {
  it('strips frontmatter', () => {
    expect(stripFrontmatter('---\ntitle: T\n---\n\nBody')).toBe('Body')
  })

  it('returns content as-is without frontmatter', () => {
    expect(stripFrontmatter('# Hello')).toBe('# Hello')
  })

  it('handles CRLF', () => {
    expect(stripFrontmatter('---\r\ntitle: T\r\n---\r\nBody')).toBe('Body')
  })

  it('handles empty content', () => {
    expect(stripFrontmatter('')).toBe('')
  })
})
