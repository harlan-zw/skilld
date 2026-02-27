import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Walk up from current file to find package.json (works in both src/ and dist/_chunks/)
function findPackageJson(): string {
  let dir = dirname(fileURLToPath(import.meta.url))
  for (let i = 0; i < 5; i++) {
    const candidate = resolve(dir, 'package.json')
    try {
      const content = readFileSync(candidate, 'utf8')
      if (content)
        return content
    }
    catch {}
    dir = resolve(dir, '..')
  }
  return '{"version":"0.0.0"}'
}

export const version: string = JSON.parse(findPackageJson()).version
