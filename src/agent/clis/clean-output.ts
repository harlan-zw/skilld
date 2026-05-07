import { sanitizeMarkdown } from '../../core/sanitize.ts'

/** Clean a single section's LLM output: strip markdown fences, frontmatter, sanitize */
export function cleanSectionOutput(content: string): string {
  let cleaned = content.trim()

  // Strip wrapping fences if output is wrapped in ```markdown, ```md, or bare ```
  // Requires matched open+close pair to avoid stripping internal code blocks
  const wrapMatch = cleaned.match(/^```(?:markdown|md)?[^\S\n]*\n([\s\S]+)\n```[^\S\n]*$/)
  if (wrapMatch) {
    const inner = wrapMatch[1]!.trim()
    // For bare ``` wrappers (no markdown/md tag), verify inner looks like section output
    const isExplicitWrapper = /^```(?:markdown|md)/.test(cleaned)
    if (isExplicitWrapper || /^##\s/m.test(inner) || /^- (?:BREAKING|DEPRECATED|NEW): /m.test(inner)) {
      cleaned = inner
    }
  }

  // Normalize h1 headers to h2 — LLMs sometimes use # instead of ##
  cleaned = cleaned.replace(/^# (?!#)/gm, '## ')

  // Strip accidental frontmatter or leading horizontal rules
  const fmMatch = cleaned.match(/^-{3,}\n/)
  if (fmMatch) {
    const afterOpen = fmMatch[0].length
    const closeMatch = cleaned.slice(afterOpen).match(/\n-{3,}/)
    if (closeMatch) {
      cleaned = cleaned.slice(afterOpen + closeMatch.index! + closeMatch[0].length).trim()
    }
    else {
      cleaned = cleaned.slice(afterOpen).trim()
    }
  }

  // Strip preamble before first section marker (LLM reasoning, fake tool calls, code dumps)
  // Section markers: ## heading, BREAKING/DEPRECATED/NEW labels
  const firstMarker = cleaned.match(/^(##\s|- (?:BREAKING|DEPRECATED|NEW): )/m)
  if (firstMarker?.index && firstMarker.index > 0) {
    cleaned = cleaned.slice(firstMarker.index).trim()
  }

  // Strip duplicate section headings (LLM echoing the format example before real content)
  // Handles headings separated by blank lines or boilerplate text
  const headingMatch = cleaned.match(/^(## .+)\n/)
  if (headingMatch) {
    const heading = headingMatch[1]!
    const afterFirst = headingMatch[0].length
    const secondIdx = cleaned.indexOf(heading, afterFirst)
    if (secondIdx !== -1) {
      // Only strip if the gap between duplicates is small (< 200 chars of boilerplate)
      if (secondIdx - afterFirst < 200)
        cleaned = cleaned.slice(secondIdx).trim()
    }
  }

  // Normalize citation link text to [source] — LLMs sometimes use the path as link text
  // e.g. [./references/docs/api.md](./references/docs/api.md) or [`./references/...`](...)
  // Also handles paren-wrapped variants: ([`path`](url))
  cleaned = cleaned.replace(
    /\(?\[`?\.\/(?:\.skilld\/|references\/)[^)\]]*\]\(([^)]+)\)\)?/g,
    (match, url: string) => {
      // Only normalize if the URL points to a reference path
      if (/^\.\/(?:\.skilld\/|references\/)/.test(url))
        return `[source](${url})`
      return match
    },
  )

  // Normalize source link paths: ensure .skilld/ prefix is present
  // LLMs sometimes emit [source](./docs/...) instead of [source](./.skilld/docs/...)
  cleaned = cleaned.replace(
    /\[source\]\(\.\/((docs|issues|discussions|releases|pkg|guide)\/)/g,
    '[source](./.skilld/$1',
  )

  cleaned = sanitizeMarkdown(cleaned)

  // Reject content that lacks any section structure — likely leaked LLM reasoning/narration
  // Valid sections contain headings (##), API change labels, or source-linked items
  if (!/^##\s/m.test(cleaned) && !/^- (?:BREAKING|DEPRECATED|NEW): /m.test(cleaned) && !/\[source\]/.test(cleaned)) {
    return ''
  }

  return cleaned
}
