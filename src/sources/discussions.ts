/**
 * GitHub discussions fetching via gh CLI GraphQL
 * Prioritizes Q&A and Help categories, includes accepted answers
 */

import { spawnSync } from 'node:child_process'
import { BOT_USERS, buildFrontmatter, isoDate } from './github-common'
import { isGhAvailable } from './issues'

/** Categories most useful for skill generation (in priority order) */
const HIGH_VALUE_CATEGORIES = new Set([
  'q&a',
  'help',
  'troubleshooting',
  'support',
])

const LOW_VALUE_CATEGORIES = new Set([
  'show and tell',
  'ideas',
  'polls',
])

export interface DiscussionComment {
  body: string
  author: string
}

export interface GitHubDiscussion {
  number: number
  title: string
  body: string
  category: string
  createdAt: string
  url: string
  upvoteCount: number
  comments: number
  answer?: string
  topComments: DiscussionComment[]
}

/**
 * Fetch discussions from a GitHub repo using gh CLI GraphQL.
 * Prioritizes Q&A and Help categories. Includes accepted answer body for answered discussions.
 */
export async function fetchGitHubDiscussions(
  owner: string,
  repo: string,
  limit = 20,
  releasedAt?: string,
): Promise<GitHubDiscussion[]> {
  if (!isGhAvailable())
    return []

  // GraphQL discussions endpoint doesn't support date filtering,
  // so we fetch latest N and filter client-side. Skip entirely
  // if the cutoff is in the past — results would be empty anyway.
  if (releasedAt) {
    const cutoff = new Date(releasedAt)
    cutoff.setMonth(cutoff.getMonth() + 6)
    if (cutoff < new Date())
      return []
  }

  try {
    // Fetch more to compensate for filtering
    const fetchCount = Math.min(limit * 3, 80)
    const query = `query($owner: String!, $repo: String!) { repository(owner: $owner, name: $repo) { discussions(first: ${fetchCount}, orderBy: {field: CREATED_AT, direction: DESC}) { nodes { number title body category { name } createdAt url upvoteCount comments(first: 3) { totalCount nodes { body author { login } } } answer { body } author { login } } } } }`

    const { stdout: result } = spawnSync('gh', ['api', 'graphql', '-f', `query=${query}`, '-f', `owner=${owner}`, '-f', `repo=${repo}`], {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
    })
    if (!result)
      return []

    const data = JSON.parse(result)
    const nodes = data?.data?.repository?.discussions?.nodes
    if (!Array.isArray(nodes))
      return []

    const discussions = nodes
      .filter((d: any) => d.author && !BOT_USERS.has(d.author.login))
      .filter((d: any) => {
        const cat = (d.category?.name || '').toLowerCase()
        return !LOW_VALUE_CATEGORIES.has(cat)
      })
      .map((d: any) => ({
        number: d.number,
        title: d.title,
        body: d.body || '',
        category: d.category?.name || '',
        createdAt: d.createdAt,
        url: d.url,
        upvoteCount: d.upvoteCount || 0,
        comments: d.comments?.totalCount || 0,
        answer: d.answer?.body || undefined,
        topComments: (d.comments?.nodes || [])
          .filter((c: any) => c.author && !BOT_USERS.has(c.author.login))
          .map((c: any) => ({ body: c.body || '', author: c.author.login })),
      }))
      // Prioritize high-value categories, then sort by engagement
      .sort((a: GitHubDiscussion, b: GitHubDiscussion) => {
        const aHigh = HIGH_VALUE_CATEGORIES.has(a.category.toLowerCase()) ? 1 : 0
        const bHigh = HIGH_VALUE_CATEGORIES.has(b.category.toLowerCase()) ? 1 : 0
        if (aHigh !== bHigh)
          return bHigh - aHigh
        return (b.upvoteCount + b.comments) - (a.upvoteCount + a.comments)
      })
      .slice(0, limit)

    return discussions
  }
  catch {
    return []
  }
}

/**
 * Format a single discussion as markdown with YAML frontmatter
 */
export function formatDiscussionAsMarkdown(d: GitHubDiscussion): string {
  const fm = buildFrontmatter({
    number: d.number,
    title: d.title,
    category: d.category,
    created: isoDate(d.createdAt),
    url: d.url,
    upvotes: d.upvoteCount,
    comments: d.comments,
    answered: !!d.answer,
  })

  const bodyLimit = d.upvoteCount >= 5 ? 1500 : 800
  const lines = [fm, '', `# ${d.title}`]

  if (d.body) {
    const body = d.body.length > bodyLimit
      ? `${d.body.slice(0, bodyLimit)}...`
      : d.body
    lines.push('', body)
  }

  if (d.answer) {
    const answerLimit = 1000
    const answer = d.answer.length > answerLimit
      ? `${d.answer.slice(0, answerLimit)}...`
      : d.answer
    lines.push('', '---', '', '## Accepted Answer', '', answer)
  }
  else if (d.topComments.length > 0) {
    // No accepted answer — include top comments as context
    lines.push('', '---', '', '## Top Comments')
    for (const c of d.topComments) {
      const commentBody = c.body.length > 600
        ? `${c.body.slice(0, 600)}...`
        : c.body
      lines.push('', `**@${c.author}:**`, '', commentBody)
    }
  }

  return lines.join('\n')
}

/**
 * Generate a summary index of all discussions for quick LLM scanning.
 * Groups by category so the LLM can quickly find Q&A vs general discussions.
 */
export function generateDiscussionIndex(discussions: GitHubDiscussion[]): string {
  const byCategory = new Map<string, GitHubDiscussion[]>()
  for (const d of discussions) {
    const cat = d.category || 'Uncategorized'
    const list = byCategory.get(cat) || []
    list.push(d)
    byCategory.set(cat, list)
  }

  const answered = discussions.filter(d => d.answer).length

  const fm = [
    '---',
    `total: ${discussions.length}`,
    `answered: ${answered}`,
    '---',
  ]

  const sections: string[] = [fm.join('\n'), '', '# Discussions Index', '']

  // Sort categories: high-value first
  const cats = [...byCategory.keys()].sort((a, b) => {
    const aHigh = HIGH_VALUE_CATEGORIES.has(a.toLowerCase()) ? 0 : 1
    const bHigh = HIGH_VALUE_CATEGORIES.has(b.toLowerCase()) ? 0 : 1
    return aHigh - bHigh || a.localeCompare(b)
  })

  for (const cat of cats) {
    const group = byCategory.get(cat)!
    sections.push(`## ${cat} (${group.length})`, '')
    for (const d of group) {
      const upvotes = d.upvoteCount > 0 ? ` (+${d.upvoteCount})` : ''
      const answered = d.answer ? ' [answered]' : ''
      const date = isoDate(d.createdAt)
      sections.push(`- [#${d.number}](./discussion-${d.number}.md): ${d.title}${upvotes}${answered} (${date})`)
    }
    sections.push('')
  }

  return sections.join('\n')
}
