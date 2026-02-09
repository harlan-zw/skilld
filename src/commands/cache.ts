/**
 * Cache management commands
 */

import { existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import * as p from '@clack/prompts'
import { join } from 'pathe'
import { CACHE_DIR } from '../cache'

const LLM_CACHE_DIR = join(CACHE_DIR, 'llm-cache')
const LLM_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000

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
          const size = statSync(path).size
          rmSync(path)
          expiredLlm++
          freedBytes += size
        }
      }
      catch {
        // Corrupt cache entry — remove it
        const size = statSync(path).size
        rmSync(path)
        expiredLlm++
        freedBytes += size
      }
    }
  }

  const freedKB = Math.round(freedBytes / 1024)
  if (expiredLlm > 0) {
    p.log.success(`Removed ${expiredLlm} expired LLM cache entries (${freedKB}KB freed)`)
  }
  else {
    p.log.info('Cache is clean — no expired entries')
  }
}
