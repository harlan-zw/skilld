/**
 * GitHub issues fetching via gh CLI Search API
 * Freshness-weighted scoring, type quotas, comment quality filtering
 * Categorized by labels, noise filtered out, non-technical issues detected
 */

import { spawnSync } from 'node:child_process'

import { mapInsert } from '../core/shared.ts'
import { BOT_USERS, buildFrontmatter, isoDate } from './github-common.ts'

export type IssueType = 'bug' | 'question' | 'docs' | 'feature' | 'other'

export interface IssueComment {
  body: string
  author: string
  reactions: number
  isMaintainer?: boolean
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
  /** Freshness-weighted score: reactions * decay(age) */
  score: number
  /** For closed issues: version where fix landed, if detectable */
  resolvedIn?: string
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

/** Check if body contains a code block */
function hasCodeBlock(text: string): boolean {
  return /```[\s\S]*?```/.test(text) || /`[^`]+`/.test(text)
}

/**
 * Detect non-technical issues: fan mail, roadmaps, showcases, sentiment.
 * Short body + no code + high reactions = likely non-technical.
 */
export function isNonTechnical(issue: { body: string, title: string, reactions: number }): boolean {
  const body = (issue.body || '').trim()
  // Very short body with no code — probably sentiment/meta
  if (body.length < 200 && !hasCodeBlock(body) && issue.reactions > 50)
    return true
  // Roadmap/tracking patterns
  if (/\b(?:roadmap|tracking|love|thank|awesome|great work)\b/i.test(issue.title) && !hasCodeBlock(body))
    return true
  return false
}

/**
 * Freshness-weighted score: reactions * decay(age_in_years)
 * A 2024 issue with 50 reactions outranks a 2014 issue with 500.
 */
export function freshnessScore(reactions: number, createdAt: string): number {
  const ageMs = Date.now() - new Date(createdAt).getTime()
  const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000)
  return reactions * (1 / (1 + ageYears * 0.3))
}

/**
 * Type quotas — guarantee a mix of issue types.
 * Bugs and questions get priority; feature requests are hard-capped.
 */
function applyTypeQuotas(issues: GitHubIssue[], limit: number): GitHubIssue[] {
  const byType = new Map<IssueType, GitHubIssue[]>()
  for (const issue of issues) {
    mapInsert(byType, issue.type, () => []).push(issue)
  }

  // Sort each group by score
  for (const group of byType.values())
    group.sort((a, b) => b.score - a.score)

  // Allocate slots: bugs 40%, questions 30%, docs 15%, features 10%, other 5%
  const quotas: [IssueType, number][] = [
    ['bug', Math.ceil(limit * 0.40)],
    ['question', Math.ceil(limit * 0.30)],
    ['docs', Math.ceil(limit * 0.15)],
    ['feature', Math.ceil(limit * 0.10)],
    ['other', Math.ceil(limit * 0.05)],
  ]

  const selected: GitHubIssue[] = []
  const used = new Set<number>()
  let remaining = limit

  // First pass: fill each type up to its quota
  for (const [type, quota] of quotas) {
    const group = byType.get(type) || []
    const take = Math.min(quota, group.length, remaining)
    for (let i = 0; i < take; i++) {
      selected.push(group[i]!)
      used.add(group[i]!.number)
      remaining--
    }
  }

  // Second pass: fill remaining slots from best-scored unused issues (any type except feature)
  if (remaining > 0) {
    const unused = issues
      .filter(i => !used.has(i.number) && i.type !== 'feature')
      .sort((a, b) => b.score - a.score)
    for (const issue of unused) {
      if (remaining <= 0)
        break
      selected.push(issue)
      remaining--
    }
  }

  return selected.sort((a, b) => b.score - a.score)
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
 * Smart body truncation — preserves code blocks and error messages.
 * Instead of slicing at a char limit, finds a safe break point.
 */
function truncateBody(body: string, limit: number): string {
  if (body.length <= limit)
    return body

  // Find code block boundaries so we don't cut mid-block
  const codeBlockRe = /```[\s\S]*?```/g
  let lastSafeEnd = limit
  let match: RegExpExecArray | null

  // eslint-disable-next-line no-cond-assign
  while ((match = codeBlockRe.exec(body)) !== null) {
    const blockStart = match.index
    const blockEnd = blockStart + match[0].length

    // If the limit falls inside a code block, move limit to after the block
    // (if not too far) or before the block
    if (blockStart < limit && blockEnd > limit) {
      if (blockEnd <= limit + 500) {
        // Block ends reasonably close — include it
        lastSafeEnd = blockEnd
      }
      else {
        // Block is too long — cut before it
        lastSafeEnd = blockStart
      }
      break
    }
  }

  // Try to break at a paragraph boundary
  const slice = body.slice(0, lastSafeEnd)
  const lastParagraph = slice.lastIndexOf('\n\n')
  if (lastParagraph > lastSafeEnd * 0.6)
    return `${slice.slice(0, lastParagraph)}\n\n...`

  return `${slice}...`
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
    .filter(issue => !isNonTechnical(issue))
    .map(({ user: _, userType: __, ...issue }) => ({
      ...issue,
      type: classifyIssue(issue.labels),
      topComments: [] as IssueComment[],
      score: freshnessScore(issue.reactions, issue.createdAt),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
}

function oneYearAgo(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 1)
  return isoDate(d.toISOString())!
}

/** Noise patterns in comments — filter these out */
const COMMENT_NOISE_RE = /^(?:\+1|👍|same here|any update|bump|following|is there any progress|when will this|me too|i have the same|same issue)[\s!?.]*$/i

/**
 * Batch-fetch top comments for issues via GraphQL.
 * Enriches the top N highest-score issues with their best comments.
 * Prioritizes: comments with code blocks, from maintainers, with high reactions.
 * Filters out "+1", "any updates?", "same here" noise.
 */
function enrichWithComments(owner: string, repo: string, issues: GitHubIssue[], topN = 15): void {
  // Only fetch comments for issues worth enriching
  const worth = issues
    .filter(i => i.comments > 0 && (i.type === 'bug' || i.type === 'question' || i.reactions >= 3))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)

  if (worth.length === 0)
    return

  // Build a single GraphQL query fetching comments for all selected issues
  // Fetch more comments (10) so we can filter noise and pick the best
  const fragments = worth.map((issue, i) =>
    `i${i}: issue(number: ${issue.number}) { comments(first: 10) { nodes { body author { login } authorAssociation reactions { totalCount } } } }`,
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

      const issue = worth[i]!

      const comments: (IssueComment & { _score: number })[] = nodes
        .filter((c: any) => c.author && !BOT_USERS.has(c.author.login))
        .filter((c: any) => !COMMENT_NOISE_RE.test((c.body || '').trim()))
        .map((c: any) => {
          const isMaintainer = ['OWNER', 'MEMBER', 'COLLABORATOR'].includes(c.authorAssociation)
          const body = c.body || ''
          const reactions = c.reactions?.totalCount || 0
          // Score: maintainers get 3x, code blocks get 2x, reactions add linearly
          const _score = (isMaintainer ? 3 : 1) * (hasCodeBlock(body) ? 2 : 1) * (1 + reactions)
          return { body, author: c.author.login, reactions, isMaintainer, _score }
        })
        .sort((a: any, b: any) => b._score - a._score)

      // Take top 3 quality comments
      issue.topComments = comments.slice(0, 3).map(({ _score: _, ...c }) => c)

      // For closed issues: try to detect fix version from maintainer comments
      if (issue.state === 'closed') {
        issue.resolvedIn = detectResolvedVersion(comments)
      }
    }
  }
  catch {
    // Non-critical — issues still useful without comments
  }
}

/**
 * Try to detect which version fixed a closed issue from maintainer comments.
 * Looks for version patterns in maintainer/collaborator comments.
 */
function detectResolvedVersion(comments: IssueComment[]): string | undefined {
  const maintainerComments = comments.filter(c => c.isMaintainer)
  // Check from last to first (fix announcements tend to be later)
  for (const c of maintainerComments.reverse()) {
    // "Fixed in v5.2", "landed in 4.1.0", "released in v3.0", "available in 2.1"
    const match = c.body.match(/(?:fixed|landed|released|available|shipped|resolved|included)\s+in\s+v?(\d+\.\d+(?:\.\d+)?)/i)
    if (match)
      return match[1]
    // "v5.2.0" or "5.2.0" at start of a short comment (release note style)
    if (c.body.length < 100) {
      const vMatch = c.body.match(/\bv?(\d+\.\d+\.\d+)\b/)
      if (vMatch)
        return vMatch[1]
    }
  }
  return undefined
}

/**
 * Fetch issues from a GitHub repo with freshness-weighted scoring and type quotas.
 * Returns a balanced mix: bugs > questions > docs > other > features.
 * Filters noise, non-technical content, and enriches with quality comments.
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
    // Fetch more than needed so type quotas have a pool to draw from
    const open = fetchIssuesByState(owner, repo, 'open', Math.min(openCount * 2, 100), releasedAt)
    const closed = fetchIssuesByState(owner, repo, 'closed', Math.min(closedCount * 2, 50), releasedAt)
    const all = [...open, ...closed]
    const selected = applyTypeQuotas(all, limit)
    enrichWithComments(owner, repo, selected)
    return selected
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
  if (issue.resolvedIn)
    fmFields.resolvedIn = issue.resolvedIn
  if (issue.labels.length > 0)
    fmFields.labels = `[${issue.labels.join(', ')}]`
  const fm = buildFrontmatter(fmFields)

  const lines = [fm, '', `# ${issue.title}`]

  if (issue.body) {
    const body = truncateBody(issue.body, limit)
    lines.push('', body)
  }

  if (issue.topComments.length > 0) {
    lines.push('', '---', '', '## Top Comments')
    for (const c of issue.topComments) {
      const reactions = c.reactions > 0 ? ` (+${c.reactions})` : ''
      const maintainer = c.isMaintainer ? ' [maintainer]' : ''
      const commentBody = truncateBody(c.body, 600)
      lines.push('', `**@${c.author}**${maintainer}${reactions}:`, '', commentBody)
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
    mapInsert(byType, issue.type, () => []).push(issue)
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
      const resolved = issue.resolvedIn ? ` [fixed in ${issue.resolvedIn}]` : ''
      const date = isoDate(issue.createdAt)
      sections.push(`- [#${issue.number}](./issue-${issue.number}.md): ${issue.title}${reactions}${state}${resolved} (${date})`)
    }
    sections.push('')
  }

  return sections.join('\n')
}
