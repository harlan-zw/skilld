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

  const results = await crawlAndGenerate({
    urls: [url],
    outputDir,
    driver: 'http',
    generateLlmsTxt: false,
    generateIndividualMd: false,
    maxRequestsPerCrawl: maxPages,
  }, (progress) => {
    if (progress.crawling.status === 'processing' && progress.crawling.total > 0) {
      onProgress?.(`Crawling ${progress.crawling.processed}/${progress.crawling.total} pages`)
    }
  })

  // Clean up temp dir
  rmSync(outputDir, { recursive: true, force: true })

  const docs: Array<{ path: string, content: string }> = []

  for (const result of results) {
    if (!result.success || !result.content)
      continue

    const urlObj = new URL(result.url)
    const urlPath = urlObj.pathname.replace(/\/$/, '') || '/index'
    const segments = urlPath.split('/').filter(Boolean)
    const path = `docs/${segments.join('/')}.md`

    docs.push({ path, content: result.content })
  }

  onProgress?.(`Crawled ${docs.length} pages`)

  return docs
}

/** Append glob pattern to a docs URL for crawling */
export function toCrawlPattern(docsUrl: string): string {
  const cleaned = docsUrl.replace(/\/+$/, '')
  return `${cleaned}/**`
}
