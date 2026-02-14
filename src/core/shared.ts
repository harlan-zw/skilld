import { existsSync } from 'node:fs'
import { join } from 'pathe'

/** Get-or-create for Maps. Polyfill for Map.getOrInsertComputed (not yet in Node.js). */
export function mapInsert<K, V>(map: Map<K, V>, key: K, create: () => V): V {
  let val = map.get(key)
  if (val === undefined) {
    val = create()
    map.set(key, val)
  }
  return val
}

export const SHARED_SKILLS_DIR = '.skills'

/** Returns the shared skills directory path if `.skills/` exists at project root, else null */
export function getSharedSkillsDir(cwd: string = process.cwd()): string | null {
  const dir = join(cwd, SHARED_SKILLS_DIR)
  return existsSync(dir) ? dir : null
}
