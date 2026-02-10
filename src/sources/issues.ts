/**
 * GitHub issues fetching via gh CLI Search API
 * Sorted by reactions (upvotes), 75% open / 25% closed (within last year)
 * Categorized by labels, noise filtered out
 */

import { spawnSync } from 'node:child_process'

import { BOT_USERS, buildFrontmatter, isoDate } from './github-common'

export type IssueType = 'bug' | 'question' | 'docs' | 'feature' | 'other'

export interface IssueComment {
  body: string
  author: string
  reactions: number
}

export interface GitHubIssue {
  number: number
  title: string
  state: string
  labels: string[]
  body: string
  createdAt: string
  url: string
  reactions: number
  comments: number
  type: IssueType
  topComments: IssueComment[]
}

let _ghAvailable: boolean | undefined

/**
 * Check if gh CLI is installed and authenticated (cached)
 */
export function isGhAvailable(): boolean {
  if (_ghAvailable !== undefined)
    return _ghAvailable
  const { status } = spawnSync('gh', ['auth', 'status'], { stdio: 'ignore' })
  return (_ghAvailable = status === 0)
}

/** Labels that indicate noise — filter these out entirely */
const NOISE_LABELS = new Set([
  'duplicate',
  'stale',
  'invalid',
  'wontfix',
  'won\'t fix',
  'spam',
  'off-topic',
  'needs triage',
  'triage',
])

/** Labels that indicate feature requests — deprioritize */
const FEATURE_LABELS = new Set([
  'enhancement',
  'feature',
  'feature request',
  'feature-request',
  'proposal',
  'rfc',
  'idea',
  'suggestion',
])

const BUG_LABELS = new Set([
  'bug',
  'defect',
  'regression',
  'error',
  'crash',
  'fix',
  'confirmed',
  'verified',
])

const QUESTION_LABELS = new Set([
  'question',
  'help wanted',
  'support',
  'usage',
  'how-to',
  'help',
  'assistance',
])

const DOCS_LABELS = new Set([
  'documentation',
  'docs',
  'doc',
  'typo',
])

/**
 * Classify an issue by its labels into a type useful for skill generation
 */
export function classifyIssue(labels: string[]): IssueType {
  const lower = labels.map(l => l.toLowerCase())
  if (lower.some(l => BUG_LABELS.has(l)))
    return 'bug'
  if (lower.some(l => QUESTION_LABELS.has(l)))
    return 'question'
  if (lower.some(l => DOCS_LABELS.has(l)))
    return 'docs'
  if (lower.some(l => FEATURE_LABELS.has(l)))
    return 'feature'
  return 'other'
}

/**
 * Check if an issue should be filtered out entirely
 */
function isNoiseIssue(issue: { labels: string[], title: string, body: string }): boolean {
  const lower = issue.labels.map(l => l.toLowerCase())
  if (lower.some(l => NOISE_LABELS.has(l)))
    return true
  // Tracking/umbrella issues — low signal for skill generation
  if (issue.title.startsWith('☂️') || issue.title.startsWith('[META]') || issue.title.startsWith('[Tracking]'))
    return true
  return false
}

/**
 * Body truncation limit based on reactions — high-reaction issues deserve more space
 */
function bodyLimit(reactions: number): number {
  if (reactions >= 10)
    return 2000
  if (reactions >= 5)
    return 1500
  return 800
}

/**
 * Fetch issues for a state using GitHub Search API sorted by reactions
 */
function fetchIssuesByState(
  owner: string,
  repo: string,
  state: 'open' | 'closed',
  count: number,
  releasedAt?: string,
): GitHubIssue[] {
  const fetchCount = Math.min(count * 3, 100)
  let datePart = ''
  if (state === 'closed') {
    if (releasedAt) {
      // For older versions, include issues closed up to 6 months after release
      const date = new Date(releasedAt)
      date.setMonth(date.getMonth() + 6)
      datePart = `+closed:<=${isoDate(date.toISOString())}`
    }
    else {
      datePart = `+closed:>${oneYearAgo()}`
    }
  }
  else if (releasedAt) {
    // For older versions, only include issues created around or before release
    const date = new Date(releasedAt)
    date.setMonth(date.getMonth() + 6)
    datePart = `+created:<=${isoDate(date.toISOString())}`
  }

  const q = `repo:${owner}/${repo}+is:issue+is:${state}${datePart}`

  const { stdout: result } = spawnSync('gh', [
    'api',
    `search/issues?q=${q}&sort=reactions&order=desc&per_page=${fetchCount}`,
    '-q',
    '.items[] | {number, title, state, labels: [.labels[]?.name], body, createdAt: .created_at, url: .html_url, reactions: .reactions["+1"], comments: .comments, user: .user.login, userType: .user.type}',
  ], { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 })

  if (!result)
    return []

  return result
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line) as GitHubIssue & { user: string, userType: string })
    .filter(issue => !BOT_USERS.has(issue.user) && issue.userType !== 'Bot')
    .filter(issue => !isNoiseIssue(issue))
    .map(({ user: _, userType: __, ...issue }) => ({
      ...issue,
      type: classifyIssue(issue.labels),
      topComments: [] as IssueComment[],
    }))
    // Deprioritize feature requests — push to end
    .sort((a, b) => (a.type === 'feature' ? 1 : 0) - (b.type === 'feature' ? 1 : 0))
    .slice(0, count)
}

function oneYearAgo(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 1)
  return isoDate(d.toISOString())!
}

/**
 * Batch-fetch top comments for issues via GraphQL.
 * Enriches the top N highest-reaction issues with their most-reacted comments.
 */
function enrichWithComments(owner: string, repo: string, issues: GitHubIssue[], topN = 10): void {
  // Only fetch comments for issues worth enriching
  const worth = issues
    .filter(i => i.comments > 0 && (i.type === 'bug' || i.type === 'question' || i.reactions >= 3))
    .sort((a, b) => b.reactions - a.reactions)
    .slice(0, topN)

  if (worth.length === 0)
    return

  // Build a single GraphQL query fetching comments for all selected issues
  const fragments = worth.map((issue, i) =>
    `i${i}: issue(number: ${issue.number}) { comments(first: 3) { nodes { body author { login } reactions { totalCount } } } }`,
  ).join(' ')

  const query = `query($owner: String!, $repo: String!) { repository(owner: $owner, name: $repo) { ${fragments} } }`

  try {
    const { stdout: result } = spawnSync('gh', [
      'api',
      'graphql',
      '-f',
      `query=${query}`,
      '-f',
      `owner=${owner}`,
      '-f',
      `repo=${repo}`,
    ], { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 })

    if (!result)
      return

    const data = JSON.parse(result)
    const repo_ = data?.data?.repository
    if (!repo_)
      return

    for (let i = 0; i < worth.length; i++) {
      const nodes = repo_[`i${i}`]?.comments?.nodes
      if (!Array.isArray(nodes))
        continue
      worth[i]!.topComments = nodes
        .filter((c: any) => c.author && !BOT_USERS.has(c.author.login))
        .map((c: any) => ({
          body: c.body || '',
          author: c.author.login,
          reactions: c.reactions?.totalCount || 0,
        }))
    }
  }
  catch {
    // Non-critical — issues still useful without comments
  }
}

/**
 * Fetch issues from a GitHub repo sorted by reactions (upvotes).
 * Returns 75% open issues + 25% recently closed issues (within last year).
 * Filters noise (duplicates, stale, tracking) and deprioritizes feature requests.
 * Enriches top issues with their most-reacted comments via GraphQL.
 */
export async function fetchGitHubIssues(
  owner: string,
  repo: string,
  limit = 30,
  releasedAt?: string,
): Promise<GitHubIssue[]> {
  if (!isGhAvailable())
    return []

  const openCount = Math.ceil(limit * 0.75)
  const closedCount = limit - openCount

  try {
    const open = fetchIssuesByState(owner, repo, 'open', openCount, releasedAt)
    const closed = fetchIssuesByState(owner, repo, 'closed', closedCount, releasedAt)
    const all = [...open, ...closed]
    enrichWithComments(owner, repo, all)
    return all
  }
  catch {
    return []
  }
}

/**
 * Format a single issue as markdown with YAML frontmatter
 */
export function formatIssueAsMarkdown(issue: GitHubIssue): string {
  const limit = bodyLimit(issue.reactions)
  const fmFields: Record<string, string | number | boolean | undefined> = {
    number: issue.number,
    title: issue.title,
    type: issue.type,
    state: issue.state,
    created: isoDate(issue.createdAt),
    url: issue.url,
    reactions: issue.reactions,
    comments: issue.comments,
  }
  if (issue.labels.length > 0)
    fmFields.labels = `[${issue.labels.join(', ')}]`
  const fm = buildFrontmatter(fmFields)

  const lines = [fm, '', `# ${issue.title}`]

  if (issue.body) {
    const body = issue.body.length > limit
      ? `${issue.body.slice(0, limit)}...`
      : issue.body
    lines.push('', body)
  }

  if (issue.topComments.length > 0) {
    lines.push('', '---', '', '## Top Comments')
    for (const c of issue.topComments) {
      const reactions = c.reactions > 0 ? ` (+${c.reactions})` : ''
      const commentBody = c.body.length > 600
        ? `${c.body.slice(0, 600)}...`
        : c.body
      lines.push('', `**@${c.author}**${reactions}:`, '', commentBody)
    }
  }

  return lines.join('\n')
}

/**
 * Generate a summary index of all issues for quick LLM scanning.
 * Groups by type so the LLM can quickly find bugs vs questions.
 */
export function generateIssueIndex(issues: GitHubIssue[]): string {
  const byType = new Map<IssueType, GitHubIssue[]>()
  for (const issue of issues) {
    const list = byType.get(issue.type) || []
    list.push(issue)
    byType.set(issue.type, list)
  }

  const typeLabels: Record<IssueType, string> = {
    bug: 'Bugs & Regressions',
    question: 'Questions & Usage Help',
    docs: 'Documentation',
    feature: 'Feature Requests',
    other: 'Other',
  }

  const typeOrder: IssueType[] = ['bug', 'question', 'docs', 'other', 'feature']

  const fm = [
    '---',
    `total: ${issues.length}`,
    `open: ${issues.filter(i => i.state === 'open').length}`,
    `closed: ${issues.filter(i => i.state !== 'open').length}`,
    '---',
  ]

  const sections: string[] = [fm.join('\n'), '', '# Issues Index', '']

  for (const type of typeOrder) {
    const group = byType.get(type)
    if (!group?.length)
      continue
    sections.push(`## ${typeLabels[type]} (${group.length})`, '')
    for (const issue of group) {
      const reactions = issue.reactions > 0 ? ` (+${issue.reactions})` : ''
      const state = issue.state === 'open' ? '' : ' [closed]'
      sections.push(`- [#${issue.number}](./issue-${issue.number}.md): ${issue.title}${reactions}${state}`)
    }
    sections.push('')
  }

  return sections.join('\n')
}
