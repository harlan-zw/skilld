/**
 * Detect directly-used npm packages by scanning source files
 * Uses mlly for proper ES module parsing + globby for gitignore support
 */

import { readFile } from 'node:fs/promises'
import { globby } from 'globby'
import { findDynamicImports, findStaticImports } from 'mlly'
import { detectPresetPackages } from './detect-presets'

export interface PackageUsage {
  name: string
  count: number
  source?: 'import' | 'preset'
}

export interface DetectResult {
  packages: PackageUsage[]
  error?: string
}

const PATTERNS = ['**/*.{ts,js,vue,mjs,cjs,tsx,jsx,mts,cts}']
const IGNORE = ['**/node_modules/**', '**/dist/**', '**/.nuxt/**', '**/.output/**', '**/coverage/**']

function addPackage(counts: Map<string, number>, specifier: string | undefined) {
  if (!specifier || specifier.startsWith('.') || specifier.startsWith('/'))
    return

  // Extract package name (handle subpaths like 'pkg/subpath')
  const name = specifier.startsWith('@')
    ? specifier.split('/').slice(0, 2).join('/')
    : specifier.split('/')[0]!

  if (!isNodeBuiltin(name)) {
    counts.set(name, (counts.get(name) || 0) + 1)
  }
}

/**
 * Scan source files to detect all directly-imported npm packages
 * Async with gitignore support for proper spinner animation
 */
export async function detectImportedPackages(cwd: string = process.cwd()): Promise<DetectResult> {
  try {
    const counts = new Map<string, number>()

    const files = await globby(PATTERNS, {
      cwd,
      ignore: IGNORE,
      gitignore: true,
      absolute: true,
    })

    await Promise.all(files.map(async (file) => {
      const content = await readFile(file, 'utf8')

      // Static: import x from 'pkg'
      for (const imp of findStaticImports(content)) {
        addPackage(counts, imp.specifier)
      }

      // Dynamic: import('pkg') - expression is the string literal
      for (const imp of findDynamicImports(content)) {
        // expression includes quotes, extract string value
        const match = imp.expression.match(/^['"]([^'"]+)['"]$/)
        if (match)
          addPackage(counts, match[1]!)
      }
    }))

    // Sort by usage count (descending), then alphabetically
    const packages: PackageUsage[] = [...counts.entries()]
      .map(([name, count]) => ({ name, count, source: 'import' as const }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

    // Merge preset-detected packages (imports take priority)
    const presets = await detectPresetPackages(cwd)
    const importNames = new Set(packages.map(p => p.name))
    for (const preset of presets) {
      if (!importNames.has(preset.name))
        packages.push(preset)
    }

    return { packages }
  }
  catch (err) {
    return { packages: [], error: String(err) }
  }
}

const NODE_BUILTINS = new Set([
  'assert',
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'dns',
  'domain',
  'events',
  'fs',
  'http',
  'https',
  'module',
  'net',
  'os',
  'path',
  'perf_hooks',
  'process',
  'punycode',
  'querystring',
  'readline',
  'repl',
  'stream',
  'string_decoder',
  'sys',
  'timers',
  'tls',
  'tty',
  'url',
  'util',
  'v8',
  'vm',
  'wasi',
  'worker_threads',
  'zlib',
])

function isNodeBuiltin(pkg: string): boolean {
  const base = pkg.startsWith('node:') ? pkg.slice(5) : pkg
  return NODE_BUILTINS.has(base.split('/')[0]!)
}
