import type { SearchFilter } from '../retriv'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import * as p from '@clack/prompts'
import { REFERENCES_DIR } from '../cache'
import { formatSnippet } from '../core'
import { searchSnippets } from '../retriv'

/** Find all per-package search DBs, optionally filtered by package name */
function findPackageDbs(packageFilter?: string): string[] {
  if (!existsSync(REFERENCES_DIR))
    return []

  const normalize = (s: string) => s.toLowerCase().replace(/[-_]/g, '')

  return readdirSync(REFERENCES_DIR)
    .filter(name => name.includes('@'))
    .filter((name) => {
      if (!packageFilter)
        return true
      const pkg = name.split('@')[0]
      const filter = normalize(packageFilter)
      return normalize(pkg).includes(filter) || pkg.startsWith(packageFilter)
    })
    .map(dir => join(REFERENCES_DIR, dir, 'search.db'))
    .filter(db => existsSync(db))
}

export async function searchCommand(rawQuery: string, packageFilter?: string): Promise<void> {
  const dbs = findPackageDbs(packageFilter)

  if (dbs.length === 0) {
    if (packageFilter)
      p.log.warn(`No docs indexed for "${packageFilter}". Run \`skilld add ${packageFilter}\` first.`)
    else
      p.log.warn('No docs indexed yet. Run `skilld add <package>` first.')
    return
  }

  // Parse filter prefix (e.g., "issues:bug" -> filter by type=issue, query="bug")
  let query = rawQuery
  let filter: SearchFilter | undefined

  const prefixMatch = rawQuery.match(/^(issues?|docs?|releases?):(.+)$/i)
  if (prefixMatch) {
    const prefix = prefixMatch[1]!.toLowerCase()
    query = prefixMatch[2]!
    if (prefix.startsWith('issue'))
      filter = { type: 'issue' }
    else if (prefix.startsWith('release'))
      filter = { type: 'release' }
    else
      filter = { type: { $in: ['doc', 'docs'] } }
  }

  const start = performance.now()

  // Query all package DBs in parallel with native filtering
  const allResults = await Promise.all(
    dbs.map(dbPath => searchSnippets(query, { dbPath }, { limit: filter ? 10 : 5, filter })),
  )

  // Merge and sort by score
  const merged = allResults.flat().sort((a, b) => b.score - a.score).slice(0, 5)

  const elapsed = ((performance.now() - start) / 1000).toFixed(2)

  if (merged.length === 0) {
    p.log.warn(`No results for "${query}"`)
    return
  }

  const output = merged.map(r => formatSnippet(r)).join('\n\n')
  p.log.message(`${output}\n\n${merged.length} results (${elapsed}s)`)
}
