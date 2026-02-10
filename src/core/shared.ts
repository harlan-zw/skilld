import { existsSync } from 'node:fs'
import { join } from 'pathe'

export const SHARED_SKILLS_DIR = '.skills'

/** Returns the shared skills directory path if `.skills/` exists at project root, else null */
export function getSharedSkillsDir(cwd: string = process.cwd()): string | null {
  const dir = join(cwd, SHARED_SKILLS_DIR)
  return existsSync(dir) ? dir : null
}
