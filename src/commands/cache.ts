/**
 * Cache management commands
 */

import type { Dirent } from 'node:fs'
import { existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import * as p from '@clack/prompts'
import { defineCommand } from 'citty'
import { join } from 'pathe'
import { CACHE_DIR, REFERENCES_DIR, REPOS_DIR } from '../cache/index.ts'
import { clearEmbeddingCache } from '../retriv/embedding-cache.ts'

const LLM_CACHE_DIR = join(CACHE_DIR, 'llm-cache')
const LLM_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000

function safeRemove(path: string): number {
  try {
    const size = statSync(path).size
    rmSync(path)
    return size
  }
  catch {
    try {
      rmSync(path)
    }
    catch {}
    return 0
  }
}

export async function cacheCleanCommand(): Promise<void> {
  let expiredLlm = 0
  let freedBytes = 0

  // Clean expired LLM cache entries
  if (existsSync(LLM_CACHE_DIR)) {
    const now = Date.now()
    for (const entry of readdirSync(LLM_CACHE_DIR)) {
      const path = join(LLM_CACHE_DIR, entry)
      try {
        const { timestamp } = JSON.parse(readFileSync(path, 'utf-8'))
        if (now - timestamp > LLM_CACHE_MAX_AGE) {
          freedBytes += safeRemove(path)
          expiredLlm++
        }
      }
      catch {
        // Corrupt cache entry — remove it
        freedBytes += safeRemove(path)
        expiredLlm++
      }
    }
  }

  // Clear embedding cache
  const embeddingDbPath = join(CACHE_DIR, 'embeddings.db')
  let embeddingCleared = false
  if (existsSync(embeddingDbPath)) {
    const size = statSync(embeddingDbPath).size
    clearEmbeddingCache()
    freedBytes += size
    embeddingCleared = true
  }

  const freedKB = Math.round(freedBytes / 1024)
  if (expiredLlm > 0 || embeddingCleared) {
    const parts: string[] = []
    if (expiredLlm > 0)
      parts.push(`${expiredLlm} expired enhancement cache entries`)
    if (embeddingCleared)
      parts.push('embedding cache')
    p.log.success(`Removed ${parts.join(' + ')} (${freedKB}KB freed)`)
  }
  else {
    p.log.info('Cache is clean — no expired entries')
  }
}

function dirEntries(dir: string): Dirent[] {
  if (!existsSync(dir))
    return []
  return readdirSync(dir, { withFileTypes: true, recursive: true })
}

function sumFileBytes(entries: Dirent[]): number {
  return entries
    .filter(e => e.isFile())
    .reduce((sum, e) => {
      try {
        return sum + statSync(join(e.parentPath, e.name)).size
      }
      catch { return sum }
    }, 0)
}

function fmtBytes(n: number): string {
  const units = ['B', 'KB', 'MB', 'GB'] as const
  let i = 0
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i++
  }
  return i === 0 ? `${n}${units[i]}` : `${n.toFixed(1)}${units[i]}`
}

export function cacheStatsCommand(): void {
  const dim = (s: string) => `\x1B[90m${s}\x1B[0m`

  const refs = dirEntries(REFERENCES_DIR)
  const repos = dirEntries(REPOS_DIR)
  const llm = dirEntries(LLM_CACHE_DIR)
  const embPath = join(CACHE_DIR, 'embeddings.db')
  const embSize = existsSync(embPath) ? statSync(embPath).size : 0

  // Count packages: top-level non-scoped dirs + dirs inside @scope/ dirs
  const packages = refs.filter(e =>
    e.isDirectory()
    && (e.parentPath === REFERENCES_DIR
      ? !e.name.startsWith('@')
      : e.parentPath.startsWith(REFERENCES_DIR)),
  ).length

  const llmFiles = llm.filter(e => e.isFile())
  const sizes = { refs: sumFileBytes(refs), repos: sumFileBytes(repos), llm: sumFileBytes(llmFiles), emb: embSize }
  const total = sizes.refs + sizes.repos + sizes.llm + sizes.emb

  const lines = [
    `References  ${fmtBytes(sizes.refs)}  ${dim(`${packages} packages`)}`,
    ...(sizes.repos > 0 ? [`Repos       ${fmtBytes(sizes.repos)}`] : []),
    `LLM cache   ${fmtBytes(sizes.llm)}  ${dim(`${llmFiles.length} entries`)}`,
    ...(sizes.emb > 0 ? [`Embeddings  ${fmtBytes(sizes.emb)}`] : []),
    '',
    `Total       ${fmtBytes(total)}  ${dim(CACHE_DIR)}`,
  ]
  p.log.message(lines.join('\n'))
}

export const cacheCommandDef = defineCommand({
  meta: { name: 'cache', description: 'Cache management', hidden: true },
  args: {
    clean: {
      type: 'boolean',
      alias: 'c',
      description: 'Remove expired enhancement cache entries',
      default: false,
    },
    stats: {
      type: 'boolean',
      alias: 's',
      description: 'Show cache disk usage',
      default: false,
    },
  },
  async run({ args }) {
    if (args.stats) {
      p.intro(`\x1B[1m\x1B[35mskilld\x1B[0m cache stats`)
      cacheStatsCommand()
      return
    }
    if (args.clean) {
      p.intro(`\x1B[1m\x1B[35mskilld\x1B[0m cache clean`)
      await cacheCleanCommand()
      return
    }
    // No flag: show usage
    p.intro(`\x1B[1m\x1B[35mskilld\x1B[0m cache`)
    p.log.message('Usage:\n  skilld cache --clean   Remove expired cache entries\n  skilld cache --stats   Show cache disk usage')
  },
})
