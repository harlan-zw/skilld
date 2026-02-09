import type { SearchFilter, SearchSnippet } from '../retriv'
import { formatCompactSnippet, highlightTerms, sanitizeMarkdown } from '../core'
import { closePool, openPool, searchPooled } from '../retriv'
import { findPackageDbs, parseFilterPrefix } from './search'

const FILTER_CYCLE = [undefined, 'docs', 'issues', 'releases'] as const
type FilterLabel = typeof FILTER_CYCLE[number]

function filterToSearchFilter(label: FilterLabel): SearchFilter | undefined {
  if (!label)
    return undefined
  if (label === 'issues')
    return { type: 'issue' }
  if (label === 'releases')
    return { type: 'release' }
  return { type: { $in: ['doc', 'docs'] } }
}

function scoreColor(score: number): string {
  if (score >= 0.7)
    return '\x1B[32m' // green
  if (score >= 0.4)
    return '\x1B[33m' // yellow
  return '\x1B[90m' // dim
}

const SPINNER_FRAMES = ['◐', '◓', '◑', '◒']

export async function interactiveSearch(packageFilter?: string): Promise<void> {
  const dbs = findPackageDbs(packageFilter)
  if (dbs.length === 0) {
    const msg = packageFilter
      ? `No docs indexed for "${packageFilter}". Run \`skilld add ${packageFilter}\` first.`
      : 'No docs indexed yet. Run `skilld add <package>` first.'
    process.stderr.write(`\x1B[33m${msg}\x1B[0m\n`)
    return
  }

  const logUpdate = (await import('log-update')).default
  const pool = await openPool(dbs)

  // State
  let query = ''
  let results: SearchSnippet[] = []
  let selectedIndex = 0
  let isSearching = false
  let searchId = 0
  let filterIndex = 0
  let error = ''
  let elapsed = 0
  let spinFrame = 0
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const cols = process.stdout.columns || 80
  const maxResults = 7
  const titleLabel = packageFilter ? `Search ${packageFilter} docs` : 'Search docs'

  function getFilterLabel(): string {
    const f = FILTER_CYCLE[filterIndex]
    if (!f)
      return ''
    return `\x1B[36m${f}:\x1B[0m`
  }

  function render() {
    const lines: string[] = []

    // Title
    lines.push('')
    lines.push(`  \x1B[1m${titleLabel}\x1B[0m`)
    lines.push('')

    // Input line
    const filterPrefix = getFilterLabel()
    const prefix = filterPrefix ? `${filterPrefix}` : ''
    lines.push(`  \x1B[36m❯\x1B[0m ${prefix}${query}\x1B[7m \x1B[0m`)

    // Separator / spinner
    if (isSearching) {
      const frame = SPINNER_FRAMES[spinFrame % SPINNER_FRAMES.length]
      lines.push(`  \x1B[36m${frame}\x1B[0m \x1B[90mSearching…\x1B[0m`)
    }
    else {
      lines.push(`  \x1B[90m${'─'.repeat(Math.min(cols - 4, 40))}\x1B[0m`)
    }

    // Results or empty state
    if (error) {
      lines.push('')
      lines.push(`  \x1B[31m${error}\x1B[0m`)
    }
    else if (query.length === 0) {
      lines.push('')
      lines.push('  \x1B[90mType to search…\x1B[0m')
    }
    else if (query.length < 2 && !isSearching) {
      lines.push('')
      lines.push('  \x1B[90mKeep typing…\x1B[0m')
    }
    else if (results.length === 0 && !isSearching) {
      lines.push('')
      lines.push('  \x1B[90mNo results\x1B[0m')
    }
    else {
      lines.push('')
      const shown = results.slice(0, maxResults)
      for (let i = 0; i < shown.length; i++) {
        const r = shown[i]!
        const selected = i === selectedIndex
        const bullet = selected ? '\x1B[36m●\x1B[0m' : '\x1B[90m○\x1B[0m'
        const sc = scoreColor(r.score)
        const { title, path, preview } = formatCompactSnippet(r, cols)
        const highlighted = highlightTerms(preview, r.highlights)

        if (selected) {
          lines.push(`  ${bullet} \x1B[1m${r.package}\x1B[0m ${sc}${r.score.toFixed(2)}\x1B[0m  \x1B[36m${title}\x1B[0m`)
          lines.push(`    \x1B[90m${path}\x1B[0m`)
          lines.push(`    ${highlighted}`)
        }
        else {
          lines.push(`  ${bullet} \x1B[90m${r.package}\x1B[0m ${sc}${r.score.toFixed(2)}\x1B[0m  \x1B[90m${title}\x1B[0m`)
        }
      }
    }

    // Footer
    lines.push('')
    const parts: string[] = []
    if (results.length > 0)
      parts.push(`${results.length} results`)
    if (elapsed > 0 && !isSearching)
      parts.push(`${elapsed.toFixed(2)}s`)
    const footer = parts.length > 0 ? `${parts.join(' · ')}    ` : ''
    lines.push(`  \x1B[90m${footer}↑↓ navigate  ↵ select  tab filter  esc quit\x1B[0m`)
    lines.push('')

    logUpdate(lines.join('\n'))
  }

  async function doSearch() {
    const id = ++searchId
    const fullQuery = query.trim()
    if (fullQuery.length < 2) {
      results = []
      isSearching = false
      render()
      return
    }

    isSearching = true
    error = ''
    render()

    // Spin animation
    const spinInterval = setInterval(() => {
      spinFrame++
      if (isSearching)
        render()
    }, 80)

    const { query: parsed, filter: parsedFilter } = parseFilterPrefix(fullQuery)
    const filter = parsedFilter || filterToSearchFilter(FILTER_CYCLE[filterIndex])
    const start = performance.now()

    const res = await searchPooled(parsed, pool, { limit: maxResults, filter }).catch((e) => {
      if (id === searchId)
        error = e instanceof Error ? e.message : String(e)
      return [] as SearchSnippet[]
    })

    clearInterval(spinInterval)

    // Discard stale results
    if (id !== searchId)
      return

    results = res
    elapsed = (performance.now() - start) / 1000
    selectedIndex = 0
    isSearching = false
    render()
  }

  function scheduleSearch() {
    if (debounceTimer)
      clearTimeout(debounceTimer)
    debounceTimer = setTimeout(doSearch, 100)
  }

  // Show initial state
  render()

  // Raw stdin for keystroke handling
  const { stdin } = process
  if (stdin.isTTY)
    stdin.setRawMode(true)
  stdin.resume()
  stdin.setEncoding('utf-8')

  return new Promise<void>((resolve) => {
    function cleanup() {
      if (debounceTimer)
        clearTimeout(debounceTimer)
      if (stdin.isTTY)
        stdin.setRawMode(false)
      stdin.removeListener('data', onData)
      stdin.pause()
      closePool(pool)
    }

    function exit() {
      cleanup()
      logUpdate.clear()
      resolve()
    }

    function selectResult() {
      if (results.length === 0 || selectedIndex >= results.length)
        return
      const r = results[selectedIndex]!
      cleanup()
      logUpdate.clear()

      // Print full result
      const refPath = `.claude/skills/${r.package}/.skilld/${r.source}`
      const lineRange = r.lineStart === r.lineEnd ? `L${r.lineStart}` : `L${r.lineStart}-${r.lineEnd}`
      const highlighted = highlightTerms(sanitizeMarkdown(r.content), r.highlights)
      const out = [
        '',
        `  \x1B[1m${r.package}\x1B[0m ${scoreColor(r.score)}${r.score.toFixed(2)}\x1B[0m`,
        `  \x1B[90m${refPath}:${lineRange}\x1B[0m`,
        '',
        `  ${highlighted.replace(/\n/g, '\n  ')}`,
        '',
      ].join('\n')
      process.stdout.write(`${out}\n`)
      resolve()
    }

    function onData(data: string) {
      // Ctrl+C
      if (data === '\x03') {
        exit()
        return
      }

      // Escape
      if (data === '\x1B' || data === '\x1B\x1B') {
        exit()
        return
      }

      // Enter
      if (data === '\r' || data === '\n') {
        selectResult()
        return
      }

      // Tab — cycle filter
      if (data === '\t') {
        filterIndex = (filterIndex + 1) % FILTER_CYCLE.length
        if (query.length >= 2)
          scheduleSearch()
        render()
        return
      }

      // Backspace
      if (data === '\x7F' || data === '\b') {
        if (query.length > 0) {
          query = query.slice(0, -1)
          scheduleSearch()
          render()
        }
        return
      }

      // Arrow keys (escape sequences)
      if (data === '\x1B[A' || data === '\x1BOA') {
        // Up
        if (selectedIndex > 0) {
          selectedIndex--
          render()
        }
        return
      }
      if (data === '\x1B[B' || data === '\x1BOB') {
        // Down
        if (selectedIndex < results.length - 1) {
          selectedIndex++
          render()
        }
        return
      }

      // Ignore other escape sequences
      if (data.startsWith('\x1B'))
        return

      // Printable characters
      query += data
      scheduleSearch()
      render()
    }

    stdin.on('data', onData)
  })
}
