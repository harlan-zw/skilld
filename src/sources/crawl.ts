/**
 * Website crawl doc source — fetches docs by crawling a URL pattern
 */

import { rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { crawlAndGenerate } from '@mdream/crawl'
import { join } from 'pathe'

/**
 * Crawl a URL pattern and return docs as cached doc format.
 * Uses HTTP crawler (no browser needed) with sitemap discovery + glob filtering.
 *
 * @param url - URL with optional glob pattern (e.g. 'https://example.com/docs/**')
 * @param onProgress - Optional progress callback
 * @param maxPages - Max pages to crawl (default 200)
 */
export async function fetchCrawledDocs(
  url: string,
  onProgress?: (message: string) => void,
  maxPages = 200,
): Promise<Array<{ path: string, content: string }>> {
  const outputDir = join(tmpdir(), 'skilld-crawl', Date.now().toString())

  onProgress?.(`Crawling ${url}`)

  // Keep pages matching user's locale + English
  const userLang = getUserLang()
  const foreignUrls = new Set<string>()

  const doCrawl = () => crawlAndGenerate({
    urls: [url],
    outputDir,
    driver: 'http',
    generateLlmsTxt: false,
    generateIndividualMd: true,
    maxRequestsPerCrawl: maxPages,
    onPage: (page) => {
      const lang = extractHtmlLang(page.html)
      if (lang && !lang.startsWith('en') && !lang.startsWith(userLang))
        foreignUrls.add(page.url)
    },
  }, (progress) => {
    if (progress.crawling.status === 'processing' && progress.crawling.total > 0) {
      onProgress?.(`Crawling ${progress.crawling.processed}/${progress.crawling.total} pages`)
    }
  })

  let results = await doCrawl().catch((err) => {
    onProgress?.(`Crawl failed: ${err?.message || err}`)
    return []
  })
  // Retry once on transient failure (e.g. sitemap timeout)
  if (results.length === 0) {
    onProgress?.('Retrying crawl')
    results = await doCrawl().catch(() => [])
  }

  // Clean up temp dir
  rmSync(outputDir, { recursive: true, force: true })

  const docs: Array<{ path: string, content: string }> = []

  let localeFiltered = 0
  for (const result of results) {
    if (!result.success || !result.content)
      continue

    // Filter by <html lang> detected during crawl
    if (foreignUrls.has(result.url)) {
      localeFiltered++
      continue
    }

    const urlObj = new URL(result.url)
    const urlPath = urlObj.pathname.replace(/\/$/, '') || '/index'
    const segments = urlPath.split('/').filter(Boolean)

    // Fallback: filter by URL path locale prefix when no lang tag was present
    if (isForeignPathPrefix(segments[0], userLang)) {
      localeFiltered++
      continue
    }

    const path = `docs/${segments.join('/')}.md`
    docs.push({ path, content: result.content })
  }

  if (localeFiltered > 0)
    onProgress?.(`Filtered ${localeFiltered} foreign locale pages`)

  onProgress?.(`Crawled ${docs.length} pages`)

  return docs
}

const HTML_LANG_RE = /<html[^>]*\slang=["']([^"']+)["']/i

/** Extract lang attribute from <html> tag */
function extractHtmlLang(html: string): string | undefined {
  return HTML_LANG_RE.exec(html)?.[1]?.toLowerCase()
}

/** Common ISO 639-1 locale codes for i18n'd doc sites */
const LOCALE_CODES = new Set([
  'ar',
  'de',
  'es',
  'fr',
  'id',
  'it',
  'ja',
  'ko',
  'nl',
  'pl',
  'pt',
  'pt-br',
  'ru',
  'th',
  'tr',
  'uk',
  'vi',
  'zh',
  'zh-cn',
  'zh-tw',
])

/** Check if a URL path segment is a known locale prefix foreign to both English and user's locale */
function isForeignPathPrefix(segment: string | undefined, userLang: string): boolean {
  if (!segment)
    return false
  const lower = segment.toLowerCase()
  if (lower === 'en' || lower.startsWith(userLang))
    return false
  return LOCALE_CODES.has(lower)
}

/** Detect user's 2-letter language code from env (e.g. 'ja' from LANG=ja_JP.UTF-8) */
function getUserLang(): string {
  const raw = process.env.LC_ALL || process.env.LANG || process.env.LANGUAGE || ''
  const code = raw.split(/[_.:-]/)[0]?.toLowerCase() || ''
  return code.length >= 2 ? code.slice(0, 2) : 'en'
}

/** Append glob pattern to a docs URL for crawling */
export function toCrawlPattern(docsUrl: string): string {
  const cleaned = docsUrl.replace(/\/+$/, '')
  return `${cleaned}/**`
}
