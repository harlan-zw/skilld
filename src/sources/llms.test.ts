import { describe, expect, it } from 'vitest'
import { extractSections, normalizeLlmsLinks, parseMarkdownLinks } from './llms'

describe('parseMarkdownLinks', () => {
  it('extracts markdown links ending in .md', () => {
    const content = `
# Documentation

- [Getting Started](/guide/getting-started.md)
- [API Reference](/api/index.md)
- [Not a doc](/images/logo.png)
`
    const links = parseMarkdownLinks(content)
    expect(links).toHaveLength(2)
    expect(links[0]).toEqual({ title: 'Getting Started', url: '/guide/getting-started.md' })
    expect(links[1]).toEqual({ title: 'API Reference', url: '/api/index.md' })
  })

  it('deduplicates links', () => {
    const content = `
[Same Link](/guide.md)
[Same Link Again](/guide.md)
`
    const links = parseMarkdownLinks(content)
    expect(links).toHaveLength(1)
  })

  it('handles empty content', () => {
    expect(parseMarkdownLinks('')).toEqual([])
  })
})

describe('normalizeLlmsLinks', () => {
  it('converts root-relative paths to ./docs/', () => {
    const content = '[Guide](/guide/intro.md)'
    expect(normalizeLlmsLinks(content)).toBe('[Guide](./docs/guide/intro.md)')
  })

  it('converts absolute URLs to ./docs/ when baseUrl provided', () => {
    const content = '[Guide](https://example.com/docs/intro.md)'
    expect(normalizeLlmsLinks(content, 'https://example.com/docs')).toBe('[Guide](./docs/intro.md)')
  })

  it('handles mixed absolute and root-relative links', () => {
    const content = `
[A](https://example.com/a.md)
[B](/b.md)
`
    const result = normalizeLlmsLinks(content, 'https://example.com')
    expect(result).toContain('./docs/a.md')
    expect(result).toContain('./docs/b.md')
  })

  it('handles multiple links', () => {
    const content = `
[A](/a.md)
[B](/b.md)
`
    const result = normalizeLlmsLinks(content)
    expect(result).toContain('./docs/a.md')
    expect(result).toContain('./docs/b.md')
  })
})

describe('extractSections', () => {
  it('extracts sections matching patterns', () => {
    const content = `
---
url: /guide/intro.md
---
Intro content

---
url: /style-guide/naming.md
---
Naming conventions

---
url: /api/functions.md
---
API docs
`
    const result = extractSections(content, ['/style-guide/'])
    expect(result).toContain('Naming conventions')
    expect(result).not.toContain('Intro content')
    expect(result).not.toContain('API docs')
  })

  it('returns null when no sections match', () => {
    const content = `
---
url: /guide/intro.md
---
Content
`
    expect(extractSections(content, ['/nonexistent/'])).toBeNull()
  })
})
