/**
 * Globs .d.ts type definition files from a package for search indexing.
 * Only types — source code is too verbose.
 */
import { existsSync, readFileSync } from 'node:fs'
import { glob } from 'node:fs/promises'
import { join } from 'pathe'

export interface EntryFile {
  path: string
  content: string
  type: 'types' | 'source'
}

const SKIP_DIRS = [
  'node_modules',
  '_vendor',
  '__tests__',
  '__mocks__',
  '__fixtures__',
  'test',
  'tests',
  'fixture',
  'fixtures',
  'locales',
  'locale',
  'i18n',
  '.git',
]

const SKIP_PATTERNS = [
  '*.min.*',
  '*.prod.*',
  '*.global.*',
  '*.browser.*',
  '*.map',
  '*.map.js',
  'CHANGELOG*',
  'LICENSE*',
  'README*',
]

const MAX_FILE_SIZE = 500 * 1024 // 500KB per file

/**
 * Glob .d.ts type definition files from a package directory, skipping junk.
 */
export async function resolveEntryFiles(packageDir: string): Promise<EntryFile[]> {
  if (!existsSync(join(packageDir, 'package.json')))
    return []

  const skipDirSet = new Set(SKIP_DIRS)
  const isSkipPattern = (name: string): boolean =>
    SKIP_PATTERNS.some((p) => {
      const star = p.indexOf('*')
      if (star === -1)
        return name === p
      const prefix = p.slice(0, star)
      const suffix = p.slice(star + 1)
      return name.startsWith(prefix) && name.endsWith(suffix)
    })

  const files: string[] = []
  for await (const file of glob(['**/*.d.{ts,mts,cts}'], {
    cwd: packageDir,
    exclude: (p: string) => {
      const segs = p.split('/')
      const last = segs[segs.length - 1]!
      if (isSkipPattern(last))
        return true
      return segs.some(s => skipDirSet.has(s))
    },
  })) {
    files.push(file)
  }

  const entries: EntryFile[] = []

  for (const file of files) {
    const absPath = join(packageDir, file)
    let content: string
    try {
      content = readFileSync(absPath, 'utf-8')
    }
    catch {
      continue
    }

    if (content.length > MAX_FILE_SIZE)
      continue

    entries.push({ path: file, content, type: 'types' })
  }

  return entries
}
