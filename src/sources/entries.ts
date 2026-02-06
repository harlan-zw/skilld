/**
 * Globs .d.ts type definition files from a package for search indexing.
 * Only types — source code is too verbose.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { globby } from 'globby'

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

  const ignore = [
    ...SKIP_DIRS.map(d => `**/${d}/**`),
    ...SKIP_PATTERNS,
  ]

  const files = await globby(['**/*.d.{ts,mts,cts}'], {
    cwd: packageDir,
    ignore,
    absolute: false,
  })

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
