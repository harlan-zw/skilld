import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { REFERENCES_DIR } from '../cache'
import { formatSnippet } from '../core'
import { type SearchSnippet, searchSnippets } from '../retriv'

/** Find all per-package search DBs */
function findPackageDbs(): string[] {
  if (!existsSync(REFERENCES_DIR)) return []

  return readdirSync(REFERENCES_DIR)
    .filter(name => name.includes('@'))
    .map(dir => join(REFERENCES_DIR, dir, 'search.db'))
    .filter(db => existsSync(db))
}

export async function searchCommand(query: string): Promise<void> {
  const dbs = findPackageDbs()

  if (dbs.length === 0) {
    console.log('No docs indexed yet. Run `skilld <package>` first.')
    return
  }

  const start = performance.now()

  // Query all package DBs in parallel
  const allResults = await Promise.all(
    dbs.map(dbPath => searchSnippets(query, { dbPath }, { limit: 5 })),
  )

  // Merge and sort by score
  const merged: SearchSnippet[] = allResults.flat().sort((a, b) => b.score - a.score).slice(0, 5)

  const elapsed = ((performance.now() - start) / 1000).toFixed(2)

  if (merged.length === 0) {
    console.log(`No results for "${query}"`)
    return
  }

  console.log()
  for (const r of merged) {
    formatSnippet(r)
  }
  console.log(`${merged.length} results (${elapsed}s)`)
}
