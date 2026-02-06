/**
 * GitHub discussions fetching via gh CLI GraphQL
 */

import { execSync } from 'node:child_process'
import { isGhAvailable } from './issues'

export interface GitHubDiscussion {
  number: number
  title: string
  body: string
  category: string
  createdAt: string
  url: string
  upvoteCount: number
  comments: number
}

/**
 * Fetch last N discussions from a GitHub repo using gh CLI GraphQL
 */
export async function fetchGitHubDiscussions(
  owner: string,
  repo: string,
  limit = 20,
): Promise<GitHubDiscussion[]> {
  if (!isGhAvailable())
    return []

  try {
    const query = `query { repository(owner: "${owner}", name: "${repo}") { discussions(first: ${Math.min(limit * 2, 50)}, orderBy: {field: CREATED_AT, direction: DESC}) { nodes { number title body category { name } createdAt url upvoteCount comments { totalCount } author { login } } } } }`

    const result = execSync(
      `gh api graphql -f query='${query}'`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 },
    )

    const data = JSON.parse(result)
    const nodes = data?.data?.repository?.discussions?.nodes
    if (!Array.isArray(nodes))
      return []

    const BOT_USERS = new Set(['renovate[bot]', 'dependabot[bot]', 'renovate-bot', 'dependabot', 'github-actions[bot]'])

    return nodes
      .filter((d: any) => d.author && !BOT_USERS.has(d.author.login))
      .slice(0, limit)
      .map((d: any) => ({
        number: d.number,
        title: d.title,
        body: d.body || '',
        category: d.category?.name || '',
        createdAt: d.createdAt,
        url: d.url,
        upvoteCount: d.upvoteCount || 0,
        comments: d.comments?.totalCount || 0,
      }))
  }
  catch {
    return []
  }
}

/**
 * Format discussions as markdown for agent consumption
 */
export function formatDiscussionsAsMarkdown(discussions: GitHubDiscussion[]): string {
  if (discussions.length === 0)
    return ''

  const lines = ['# Recent Discussions\n']

  for (const d of discussions) {
    const meta = [
      d.category && `Category: ${d.category}`,
      `Created: ${d.createdAt.split('T')[0]}`,
      d.upvoteCount > 0 && `Upvotes: ${d.upvoteCount}`,
      d.comments > 0 && `Comments: ${d.comments}`,
    ].filter(Boolean).join(' | ')

    lines.push(`## #${d.number}: ${d.title}`)
    lines.push(meta)
    lines.push(`URL: ${d.url}\n`)

    if (d.body) {
      const body = d.body.length > 500
        ? `${d.body.slice(0, 500)}...`
        : d.body
      lines.push(body)
    }
    lines.push('\n---\n')
  }

  return lines.join('\n')
}
