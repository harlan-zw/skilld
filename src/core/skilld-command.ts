import { execSync } from 'node:child_process'
import { isWindows } from 'std-env'

let cached: string | undefined

/** Resolve the skilld CLI command — `skilld` if on PATH, otherwise `npx -y skilld`. */
export function resolveSkilldCommand(): string {
  if (cached !== undefined)
    return cached
  try {
    const lookup = isWindows ? 'where' : 'which'
    execSync(`${lookup} skilld`, { stdio: 'ignore' })
    cached = 'skilld'
  }
  catch {
    cached = 'npx -y skilld'
  }
  return cached
}
