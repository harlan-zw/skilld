/**
 * Lightweight regex-based markdown utilities.
 * Operations needed (frontmatter, title, description, links, headings) are
 * simple enough that a full AST stack would be overkill.
 */

import { yamlParseKV } from './yaml.ts'

export interface MdLink {
  title: string
  url: string
}

export interface Heading {
  depth: number
  text: string
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/
const HEADING_LINE_RE = /^(#{1,6})[ \t]+([^ \t\r\n][^\r\n]*)$/gm
const ANCHOR_RE = /\s*\{#[^}]+\}\s*$/
const BACKSLASH_PREFIX_RE = /^\\+\s*/
const INLINE_CODE_RE = /`([^`]+)`/g
const LINK_RE = /(?<!!)\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
const HEADING_START_RE = /^#{1,6}\s/
const BLOCKQUOTE_START_RE = /^>\s?/
const LIST_ITEM_START_RE = /^[-*+]\s/
const ORDERED_LIST_ITEM_START_RE = /^\d+\.\s/
const TABLE_ROW_START_RE = /^\|/
const INDENTED_CODE_START_RE = /^ {4}/
const FENCE_START_RE = /^\s*```/
const MARKDOWN_LINK_RE = /\[([^\]]+)\]\([^)]+\)/g
const MARKDOWN_FORMATTING_RE = /[`*_~]/g
const FENCED_CODE_BLOCK_RE = /```[\s\S]*?```/g
const INLINE_CODE_SPAN_RE = /`[^`\n]*`/g

/** Strip frontmatter block, return body only. */
export function stripFrontmatter(content: string): string {
  const m = content.match(FRONTMATTER_RE)
  return m ? content.slice(m[0].length).trim() : content
}

/** Extract frontmatter key-value pairs. */
export function parseFrontmatter(content: string): Record<string, string> {
  const m = content.match(FRONTMATTER_RE)
  if (!m)
    return {}
  const fm: Record<string, string> = {}
  for (const line of m[1]!.split('\n')) {
    const kv = yamlParseKV(line)
    if (kv)
      fm[kv[0]] = kv[1]
  }
  return fm
}

function cleanHeadingText(raw: string): string {
  return raw
    .replace(ANCHOR_RE, '')
    .replace(BACKSLASH_PREFIX_RE, '')
    .replace(INLINE_CODE_RE, '$1')
    .trim()
}

/** Extract all headings in document order. */
export function extractHeadings(content: string): Heading[] {
  const body = stripFrontmatter(content)
  const headings: Heading[] = []
  for (const m of body.matchAll(HEADING_LINE_RE)) {
    const text = cleanHeadingText(m[2]!)
    if (text)
      headings.push({ depth: m[1]!.length, text })
  }
  return headings
}

/** Extract title: frontmatter title > first h1 > null. */
export function extractTitle(content: string): string | null {
  const fm = parseFrontmatter(content)
  if (fm.title)
    return fm.title
  const body = stripFrontmatter(content)
  for (const m of body.matchAll(HEADING_LINE_RE)) {
    if (m[1] === '#') {
      const text = cleanHeadingText(m[2]!)
      if (text)
        return text
    }
  }
  return null
}

function isBlockStarter(trimmed: string, raw: string): boolean {
  return HEADING_START_RE.test(trimmed)
    || BLOCKQUOTE_START_RE.test(trimmed)
    || LIST_ITEM_START_RE.test(trimmed)
    || ORDERED_LIST_ITEM_START_RE.test(trimmed)
    || TABLE_ROW_START_RE.test(trimmed)
    || trimmed.startsWith('<')
    || INDENTED_CODE_START_RE.test(raw)
}

/** Extract first top-level paragraph, stripped of formatting, max 150 chars. */
export function extractDescription(content: string): string | null {
  const body = stripFrontmatter(content)
  const lines = body.split('\n')
  let inFence = false
  let inHtml = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (FENCE_START_RE.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence)
      continue

    const trimmed = line.trim()

    if (inHtml) {
      if (!trimmed)
        inHtml = false
      continue
    }
    if (trimmed.startsWith('<')) {
      inHtml = true
      continue
    }

    if (!trimmed || isBlockStarter(trimmed, line))
      continue

    let para = trimmed
    for (let j = i + 1; j < lines.length; j++) {
      const next = lines[j]!
      const nextTrim = next.trim()
      if (!nextTrim || isBlockStarter(nextTrim, next))
        break
      para += ` ${nextTrim}`
    }

    let clean = para.replace(MARKDOWN_LINK_RE, '$1').replace(MARKDOWN_FORMATTING_RE, '')
    if (clean.length > 150)
      clean = `${clean.slice(0, 147)}...`
    return clean
  }

  return null
}

/** Extract all links (deduped by url), excluding images and links in code. */
export function extractLinks(content: string): MdLink[] {
  const body = stripFrontmatter(content)
  const sanitized = body
    .replace(FENCED_CODE_BLOCK_RE, '')
    .replace(INLINE_CODE_SPAN_RE, '')

  const links: MdLink[] = []
  const seen = new Set<string>()
  for (const m of sanitized.matchAll(LINK_RE)) {
    const url = m[2]!
    if (!seen.has(url)) {
      seen.add(url)
      links.push({ title: m[1]!, url })
    }
  }
  return links
}
