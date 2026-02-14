/**
 * llms.txt fetching and parsing
 */

import type { FetchedDoc, LlmsContent, LlmsLink } from './types.ts'
import pLimit from 'p-limit'
import { fetchText, verifyUrl } from './utils.ts'

/**
 * Check for llms.txt at a docs URL, returns the llms.txt URL if found
 */
export async function fetchLlmsUrl(docsUrl: string): Promise<string | null> {
  const origin = new URL(docsUrl).origin
  const llmsUrl = `${origin}/llms.txt`
  if (await verifyUrl(llmsUrl))
    return llmsUrl
  return null
}

/**
 * Fetch and parse llms.txt content
 */
export async function fetchLlmsTxt(url: string): Promise<LlmsContent | null> {
  const content = await fetchText(url)
  if (!content || content.length < 50)
    return null

  return {
    raw: content,
    links: parseMarkdownLinks(content),
  }
}

/**
 * Parse markdown links from llms.txt to get .md file paths
 */
export function parseMarkdownLinks(content: string): LlmsLink[] {
  const links: LlmsLink[] = []
  const seen = new Set<string>()
  const linkRegex = /\[([^\]]+)\]\(([^)]+\.md)\)/g
  for (let match = linkRegex.exec(content); match !== null; match = linkRegex.exec(content)) {
    const url = match[2]!
    if (!seen.has(url)) {
      seen.add(url)
      links.push({ title: match[1]!, url })
    }
  }

  return links
}

/**
 * Download all .md files referenced in llms.txt
 */
/** Reject non-https URLs and private/link-local IPs */
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:')
      return false
    const host = parsed.hostname
    // Reject private/link-local/loopback
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1')
      return false
    if (host === '169.254.169.254') // cloud metadata
      return false
    if (/^(?:10\.|172\.(?:1[6-9]|2\d|3[01])\.|192\.168\.)/.test(host))
      return false
    if (host.startsWith('[')) // IPv6 link-local
      return false
    return true
  }
  catch { return false }
}

export async function downloadLlmsDocs(
  llmsContent: LlmsContent,
  baseUrl: string,
  onProgress?: (url: string, index: number, total: number) => void,
): Promise<FetchedDoc[]> {
  const limit = pLimit(5)
  let completed = 0

  const results = await Promise.all(
    llmsContent.links.map(link => limit(async () => {
      const url = link.url.startsWith('http')
        ? link.url
        : `${baseUrl.replace(/\/$/, '')}${link.url.startsWith('/') ? '' : '/'}${link.url}`

      if (!isSafeUrl(url))
        return null

      onProgress?.(link.url, completed++, llmsContent.links.length)

      const content = await fetchText(url)
      if (content && content.length > 100)
        return { url: link.url, title: link.title, content } as FetchedDoc
      return null
    })),
  )

  return results.filter((d): d is FetchedDoc => d !== null)
}

/**
 * Normalize llms.txt links to relative paths for local access
 * Handles: absolute URLs, root-relative paths, and relative paths
 */
export function normalizeLlmsLinks(content: string, baseUrl?: string): string {
  let normalized = content

  // Handle absolute URLs: https://example.com/docs/foo.md → ./docs/foo.md
  if (baseUrl) {
    const base = baseUrl.replace(/\/$/, '')
    const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    normalized = normalized.replace(
      new RegExp(`\\]\\(${escaped}(/[^)]+\\.md)\\)`, 'g'),
      '](./docs$1)',
    )
  }

  // Handle root-relative paths: /foo.md → ./docs/foo.md
  normalized = normalized.replace(/\]\(\/([^)]+\.md)\)/g, '](./docs/$1)')

  return normalized
}

/**
 * Extract sections from llms-full.txt by URL patterns
 * Format: ---\nurl: /path.md\n---\n<content>\n\n---\nurl: ...
 */
export function extractSections(content: string, patterns: string[]): string | null {
  const sections: string[] = []
  const parts = content.split(/\n---\n/)

  for (const part of parts) {
    const urlMatch = part.match(/^url: *(\S.*)$/m)
    if (!urlMatch)
      continue

    const url = urlMatch[1]!
    if (patterns.some(p => url.includes(p))) {
      const contentStart = part.indexOf('\n', part.indexOf('url:'))
      if (contentStart > -1) {
        sections.push(part.slice(contentStart + 1))
      }
    }
  }

  if (sections.length === 0)
    return null
  return sections.join('\n\n---\n\n')
}
