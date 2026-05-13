/**
 * Detect directly-used npm packages by scanning source files
 */

import { glob, readFile } from 'node:fs/promises'
import { join } from 'pathe'
import { detectPresetPackages } from './detect-presets.ts'

// Static: import x from '...' | export ... from '...'
const FROM_STATIC_IMPORT_RE = /\bfrom\s*['"]([^'"\n]+)['"]/g
// Side-effect: import '...'
const SIDE_EFFECT_IMPORT_RE = /\bimport\s*['"]([^'"\n]+)['"]/g
// Dynamic: import('...')
const DYNAMIC_IMPORT_RE = /\bimport\s*\(\s*['"]([^'"\n]+)['"]\s*\)/g

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
const IGNORE_DIRS = ['node_modules', 'dist', '.nuxt', '.output', 'coverage']

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

    const files: string[] = []
    for await (const file of glob(PATTERNS, {
      cwd,
      exclude: (p: string) => IGNORE_DIRS.some(dir => p === dir || p.endsWith(`/${dir}`)),
    })) {
      files.push(join(cwd, file))
    }

    await Promise.all(files.map(async (file) => {
      const content = await readFile(file, 'utf8')

      for (const m of content.matchAll(FROM_STATIC_IMPORT_RE))
        addPackage(counts, m[1])

      for (const m of content.matchAll(SIDE_EFFECT_IMPORT_RE))
        addPackage(counts, m[1])

      for (const m of content.matchAll(DYNAMIC_IMPORT_RE))
        addPackage(counts, m[1])
    }))

    // Sort by usage count (descending), then alphabetically
    const packages: PackageUsage[] = Array.from(counts.entries(), ([name, count]) => ({ name, count, source: 'import' as const }))
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
  'async_hooks',
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'diagnostics_channel',
  'dns',
  'domain',
  'events',
  'fs',
  'http',
  'http2',
  'https',
  'inspector',
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
  'sea',
  'sqlite',
  'stream',
  'string_decoder',
  'sys',
  'test',
  'timers',
  'tls',
  'trace_events',
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
