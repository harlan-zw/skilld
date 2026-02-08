/**
 * Resolution-only crosscheck — tests resolvePackageDocsWithAttempts() across 200+ packages.
 *
 * Much faster than the full crosscheck (no downloads, no cache, no search index).
 * Categorizes results into quality tiers with actionable output.
 *
 * Usage:
 *   npx tsx test/e2e/crosscheck-resolve.ts                    # all packages, table
 *   npx tsx test/e2e/crosscheck-resolve.ts --json             # JSON output
 *   npx tsx test/e2e/crosscheck-resolve.ts --md               # markdown table
 *   npx tsx test/e2e/crosscheck-resolve.ts express lodash zod # specific packages
 */

import type { ResolveAttempt } from '../../src/sources/types'
import pLimit from 'p-limit'
import { resolvePackageDocsWithAttempts } from '../../src/sources/npm'
import { isUselessDocsUrl } from '../../src/sources/utils'
import { TOP_PACKAGES } from './top-packages'

// ── Types ──────────────────────────────────────────────────────────

export type ResolveTier = 'git-docs' | 'llms-txt' | 'readme' | 'no-docs' | 'error'

export interface ResolveRow {
  name: string
  status: 'ok' | 'error'
  error?: string

  // resolution fields
  version: string | null
  repoUrl: string | null
  docsUrl: string | null
  gitDocsUrl: string | null
  gitRef: string | null
  gitDocsFiles: number
  llmsUrl: string | null
  readmeUrl: string | null

  // quality classification
  tier: ResolveTier

  // issue flags
  issues: string[]
}

// ── Helpers ─────────────────────────────────────────────────────────

function parseGitDocsCount(attempts: ResolveAttempt[]): number {
  const attempt = attempts.find(a => a.source === 'github-docs' && a.status === 'success')
  const match = attempt?.message?.match(/Found (\d+) docs/)
  return match ? Number(match[1]) : 0
}

function classifyTier(row: ResolveRow): ResolveTier {
  if (row.status === 'error')
    return 'error'
  if (row.gitDocsUrl && row.gitDocsFiles > 0)
    return 'git-docs'
  if (row.llmsUrl)
    return 'llms-txt'
  if (row.readmeUrl)
    return 'readme'
  return 'no-docs'
}

function detectIssues(row: ResolveRow, attempts: ResolveAttempt[]): string[] {
  const issues: string[] = []

  if (row.docsUrl && isUselessDocsUrl(row.docsUrl)) {
    // distinguish social media from registry
    try {
      const host = new URL(row.docsUrl).hostname
      if (host.includes('npmjs.com') || host.includes('yarnpkg.com'))
        issues.push('registry-homepage')
      else
        issues.push('social-media-homepage')
    }
    catch {
      issues.push('social-media-homepage')
    }
  }

  if (!row.repoUrl)
    issues.push('no-repo-url')

  if (attempts.some(a => a.source === 'github-search' && a.status === 'success'))
    issues.push('github-search-fallback')

  if (row.gitDocsUrl && row.gitDocsFiles > 0 && row.gitDocsFiles < 5)
    issues.push('shallow-git-docs')

  if (row.repoUrl && !row.gitDocsUrl)
    issues.push('no-git-docs')

  if (row.docsUrl && !row.llmsUrl)
    issues.push('no-llms-txt')

  if (!row.readmeUrl)
    issues.push('no-readme')

  return issues
}

// ── Collect ─────────────────────────────────────────────────────────

async function collectRow(name: string): Promise<ResolveRow> {
  const row: ResolveRow = {
    name,
    status: 'ok',
    version: null,
    repoUrl: null,
    docsUrl: null,
    gitDocsUrl: null,
    gitRef: null,
    gitDocsFiles: 0,
    llmsUrl: null,
    readmeUrl: null,
    tier: 'no-docs',
    issues: [],
  }

  let attempts: ResolveAttempt[]
  try {
    const result = await resolvePackageDocsWithAttempts(name)
    attempts = result.attempts

    if (!result.package) {
      row.status = 'error'
      row.error = 'Package not found'
      row.tier = 'error'
      return row
    }

    const pkg = result.package
    row.version = pkg.version || null
    row.repoUrl = pkg.repoUrl || null
    row.docsUrl = pkg.docsUrl || null
    row.gitDocsUrl = pkg.gitDocsUrl || null
    row.gitRef = pkg.gitRef || null
    row.gitDocsFiles = parseGitDocsCount(attempts)
    row.llmsUrl = pkg.llmsUrl || null
    row.readmeUrl = pkg.readmeUrl || null
  }
  catch (err) {
    row.status = 'error'
    row.error = (err as Error).message
    row.tier = 'error'
    return row
  }

  row.tier = classifyTier(row)
  row.issues = detectIssues(row, attempts)
  return row
}

export async function crosscheckResolve(packages: string[]): Promise<ResolveRow[]> {
  const limit = pLimit(10)
  const total = packages.length
  let done = 0

  const results = await Promise.all(
    packages.map(name => limit(async () => {
      const row = await collectRow(name)
      done++
      const pct = Math.round((done / total) * 100)
      process.stderr.write(`\r  [${pct}%] ${done}/${total} — ${name}`)
      return row
    })),
  )

  process.stderr.write('\n')
  return results
}

// ── Format ──────────────────────────────────────────────────────────

const TIER_SYMBOLS: Record<ResolveTier, string> = {
  'git-docs': '📚',
  'llms-txt': '📄',
  'readme': '📝',
  'no-docs': '⚠️',
  'error': '✗',
}

function formatSummary(rows: ResolveRow[]): string {
  const tiers: Record<ResolveTier, number> = { 'git-docs': 0, 'llms-txt': 0, 'readme': 0, 'no-docs': 0, 'error': 0 }
  for (const r of rows) tiers[r.tier]++

  const lines = [
    `\nResolution Summary (${rows.length} packages)`,
    '─'.repeat(50),
    `  ${TIER_SYMBOLS['git-docs']} git-docs   ${tiers['git-docs']}`,
    `  ${TIER_SYMBOLS['llms-txt']} llms-txt   ${tiers['llms-txt']}`,
    `  ${TIER_SYMBOLS.readme} readme     ${tiers.readme}`,
    `  ${TIER_SYMBOLS['no-docs']} no-docs    ${tiers['no-docs']}`,
    `  ${TIER_SYMBOLS.error} error      ${tiers.error}`,
  ]
  return lines.join('\n')
}

function formatIssuesSummary(rows: ResolveRow[]): string {
  const counts: Record<string, number> = {}
  for (const r of rows) {
    for (const issue of r.issues)
      counts[issue] = (counts[issue] || 0) + 1
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  if (!sorted.length)
    return ''

  const lines = [
    '\nIssue Breakdown',
    '─'.repeat(50),
    ...sorted.map(([issue, count]) => `  ${String(count).padStart(4)}  ${issue}`),
  ]
  return lines.join('\n')
}

function formatActionable(rows: ResolveRow[]): string {
  // packages that could benefit from overrides: has docsUrl, no git docs, no llms.txt
  const candidates = rows.filter(r =>
    r.status === 'ok'
    && r.docsUrl
    && !r.gitDocsUrl
    && !r.llmsUrl
    && r.tier === 'readme',
  )

  if (!candidates.length)
    return ''

  const lines = [
    `\nActionable: ${candidates.length} packages with docsUrl but only readme`,
    '─'.repeat(50),
    ...candidates.map(r => `  ${r.name.padEnd(30)} ${r.docsUrl}`),
  ]
  return lines.join('\n')
}

export function formatTable(rows: ResolveRow[]): string {
  const headers = ['Package', 'Tier', 'Ver', 'Repo', 'Docs', 'Git', 'Files', 'LLMS', 'README', 'Issues']

  const B = (v: string | null) => v ? '✓' : '-'

  const data = rows.map(r => [
    r.status === 'error' ? `${r.name} ✗` : r.name,
    r.tier,
    r.version || '-',
    B(r.repoUrl),
    B(r.docsUrl),
    B(r.gitDocsUrl),
    r.gitDocsFiles > 0 ? String(r.gitDocsFiles) : '-',
    B(r.llmsUrl),
    B(r.readmeUrl),
    r.issues.length > 0 ? r.issues.join(', ') : '-',
  ])

  // compute column widths
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...data.map(row => row[i]!.length)),
  )

  const pad = (s: string, w: number) => s + ' '.repeat(Math.max(0, w - s.length))
  const sep = widths.map(w => '-'.repeat(w))

  const lines = [
    headers.map((h, i) => pad(h, widths[i]!)).join('  '),
    sep.join('  '),
    ...data.map(row => row.map((cell, i) => pad(cell, widths[i]!)).join('  ')),
  ]

  return [
    formatSummary(rows),
    formatIssuesSummary(rows),
    '',
    lines.join('\n'),
    formatActionable(rows),
  ].join('\n')
}

export function formatMarkdown(rows: ResolveRow[]): string {
  const headers = ['Package', 'Tier', 'Version', 'Repo', 'Docs', 'Git Docs', 'Files', 'LLMS', 'README', 'Issues']

  const B = (v: string | null) => v ? '✓' : '-'

  const data = rows.map(r => [
    r.status === 'error' ? `\`${r.name}\` ✗` : `\`${r.name}\``,
    r.tier,
    r.version ? `\`${r.version}\`` : '-',
    B(r.repoUrl),
    B(r.docsUrl),
    B(r.gitDocsUrl),
    r.gitDocsFiles > 0 ? String(r.gitDocsFiles) : '-',
    B(r.llmsUrl),
    B(r.readmeUrl),
    r.issues.length > 0 ? r.issues.join(', ') : '-',
  ])

  const row = (cells: string[]) => `| ${cells.join(' | ')} |`
  const divider = `| ${headers.map(h => '-'.repeat(h.length)).join(' | ')} |`

  return [row(headers), divider, ...data.map(row)].join('\n')
}

export function formatJson(rows: ResolveRow[]): string {
  return JSON.stringify(rows, null, 2)
}

// ── CLI ─────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const flags = args.filter(a => a.startsWith('--'))
  const names = args.filter(a => !a.startsWith('--'))

  const packages = names.length > 0 ? names : TOP_PACKAGES
  console.log(`Resolving ${packages.length} packages...\n`)

  const start = Date.now()
  const rows = await crosscheckResolve(packages)
  const elapsed = ((Date.now() - start) / 1000).toFixed(1)

  if (flags.includes('--json'))
    console.log(formatJson(rows))
  else if (flags.includes('--md'))
    console.log(formatMarkdown(rows))
  else
    console.log(formatTable(rows))

  console.log(`\nCompleted in ${elapsed}s`)

  const errors = rows.filter(r => r.status === 'error')
  if (errors.length) {
    console.log(`\n${errors.length} package(s) errored:`)
    for (const e of errors)
      console.log(`  ${e.name}: ${e.error}`)
  }
}

const isMain = process.argv[1]?.includes('crosscheck-resolve')
if (isMain)
  main()
