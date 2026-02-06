/**
 * GitHub issues fetching via gh CLI
 */

import { execSync } from 'node:child_process'

export interface GitHubIssue {
  number: number
  title: string
  state: string
  labels: string[]
  body: string
  createdAt: string
  url: string
}

let _ghAvailable: boolean | undefined

/**
 * Check if gh CLI is installed and authenticated (cached)
 */
export function isGhAvailable(): boolean {
  if (_ghAvailable !== undefined)
    return _ghAvailable
  try {
    execSync('gh auth status', { stdio: 'ignore' })
    return (_ghAvailable = true)
  }
  catch {
    return (_ghAvailable = false)
  }
}

/**
 * Fetch last N issues from a GitHub repo using gh CLI
 */
export async function fetchGitHubIssues(
  owner: string,
  repo: string,
  limit = 20,
): Promise<GitHubIssue[]> {
  if (!isGhAvailable())
    return []

  try {
    // Fetch more than limit to compensate for filtered PRs/bots, use per_page query param
    const fetchCount = Math.min(limit * 3, 100)
    const result = execSync(
      `gh api "repos/${owner}/${repo}/issues?per_page=${fetchCount}&state=all" -q '.[] | {number, title, state, labels: [.labels[].name], body, createdAt: .created_at, url: .html_url, isPr: (.pull_request != null), user: .user.login, userType: .user.type}'`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 },
    )

    const BOT_USERS = new Set(['renovate[bot]', 'dependabot[bot]', 'renovate-bot', 'dependabot', 'github-actions[bot]'])

    // gh outputs one JSON object per line — filter out PRs and bot-created issues
    return result
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line) as GitHubIssue & { isPr: boolean, user: string, userType: string })
      .filter(issue => !issue.isPr && !BOT_USERS.has(issue.user) && issue.userType !== 'Bot')
      .slice(0, limit)
      .map(({ isPr: _, user: __, userType: ___, ...issue }) => issue)
  }
  catch {
    return []
  }
}

/**
 * Format issues as markdown for agent consumption
 */
export function formatIssuesAsMarkdown(issues: GitHubIssue[]): string {
  if (issues.length === 0)
    return ''

  const lines = ['# Recent Issues\n']

  for (const issue of issues) {
    const labels = issue.labels.length > 0 ? ` [${issue.labels.join(', ')}]` : ''
    lines.push(`## #${issue.number}: ${issue.title}${labels}`)
    lines.push(`State: ${issue.state} | Created: ${issue.createdAt.split('T')[0]}`)
    lines.push(`URL: ${issue.url}\n`)

    if (issue.body) {
      // Truncate long bodies
      const body = issue.body.length > 500
        ? `${issue.body.slice(0, 500)}...`
        : issue.body
      lines.push(body)
    }
    lines.push('\n---\n')
  }

  return lines.join('\n')
}
