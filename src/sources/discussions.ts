/**
 * GitHub discussions fetching via gh CLI GraphQL
 * Prioritizes Q&A and Help categories, includes accepted answers
 * Comment quality filtering, smart truncation, noise removal
 */

import { spawnSync } from "node:child_process";
import { mapInsert } from "../core/shared.ts";
import {
  BOT_USERS,
  buildFrontmatter,
  COMMENT_NOISE_RE,
  hasCodeBlock,
  isoDate,
  truncateBody,
} from "./github-common.ts";
import { isGhAvailable } from "./issues.ts";

/** Categories most useful for skill generation (in priority order) */
const HIGH_VALUE_CATEGORIES = new Set(["q&a", "help", "troubleshooting", "support"]);

const LOW_VALUE_CATEGORIES = new Set(["show and tell", "ideas", "polls"]);

export interface DiscussionComment {
  body: string;
  author: string;
  reactions: number;
  isMaintainer?: boolean;
}

export interface GitHubDiscussion {
  number: number;
  title: string;
  body: string;
  category: string;
  createdAt: string;
  url: string;
  upvoteCount: number;
  comments: number;
  isMaintainer?: boolean;
  answer?: string;
  topComments: DiscussionComment[];
}

/** Off-topic or spam title patterns — instant reject */
const TITLE_NOISE_RE =
  /looking .*(?:developer|engineer|freelanc)|hiring|job post|guide me to (?:complete|finish|build)|help me (?:complete|finish|build)|seeking .* tutorial|recommend.* course/i;

/** Minimum score for a discussion to be included */
const MIN_DISCUSSION_SCORE = 3;

/**
 * Score a comment for quality. Higher = more useful for skill generation.
 * Maintainers 3x, code blocks 2x, reactions linear.
 */
function scoreComment(c: { body: string; reactions: number; isMaintainer?: boolean }): number {
  return (c.isMaintainer ? 3 : 1) * (hasCodeBlock(c.body) ? 2 : 1) * (1 + c.reactions);
}

/**
 * Score a discussion for overall quality. Used for filtering and sorting.
 * Returns -1 for instant-reject (spam/off-topic).
 */
export function scoreDiscussion(d: GitHubDiscussion): number {
  if (TITLE_NOISE_RE.test(d.title)) return -1;

  let score = 0;

  // Discussion authored by a maintainer — high signal
  if (d.isMaintainer) score += 3;

  // Code presence — strongest signal for technical discussions
  const allText = [d.body, d.answer || "", ...d.topComments.map((c) => c.body)].join("\n");
  if (hasCodeBlock(allText)) score += 3;

  // Engagement
  score += Math.min(d.upvoteCount, 5);

  // Answer quality
  if (d.answer) {
    score += 2;
    if (d.answer.length > 100) score += 1;
  }

  // Maintainer involvement
  if (d.topComments.some((c) => c.isMaintainer)) score += 2;

  // Community validation via reactions
  if (d.topComments.some((c) => c.reactions > 0)) score += 1;

  return score;
}

/**
 * Fetch discussions from a GitHub repo using gh CLI GraphQL.
 * Prioritizes Q&A and Help categories. Includes accepted answer body for answered discussions.
 * Fetches extra comments and scores them for quality.
 */
export async function fetchGitHubDiscussions(
  owner: string,
  repo: string,
  limit = 20,
  releasedAt?: string,
  fromDate?: string,
): Promise<GitHubDiscussion[]> {
  if (!isGhAvailable()) return [];

  // GraphQL discussions endpoint doesn't support date filtering,
  // so we fetch latest N and filter client-side. Skip entirely
  // if the cutoff is in the past — results would be empty anyway.
  // (Skip this check when fromDate is set — we'll filter client-side below)
  if (!fromDate && releasedAt) {
    const cutoff = new Date(releasedAt);
    cutoff.setMonth(cutoff.getMonth() + 6);
    if (cutoff < new Date()) return [];
  }

  try {
    // Fetch more to compensate for filtering
    const fetchCount = Math.min(limit * 3, 80);
    // Fetch 10 comments per discussion so we can filter noise and pick best
    const query = `query($owner: String!, $repo: String!) { repository(owner: $owner, name: $repo) { discussions(first: ${fetchCount}, orderBy: {field: CREATED_AT, direction: DESC}) { nodes { number title body category { name } createdAt url upvoteCount comments(first: 10) { totalCount nodes { body author { login } authorAssociation reactions { totalCount } } } answer { body author { login } authorAssociation } author { login } authorAssociation } } } }`;

    const { stdout: result } = spawnSync(
      "gh",
      ["api", "graphql", "-f", `query=${query}`, "-f", `owner=${owner}`, "-f", `repo=${repo}`],
      {
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024,
      },
    );
    if (!result) return [];

    const data = JSON.parse(result);
    const nodes = data?.data?.repository?.discussions?.nodes;
    if (!Array.isArray(nodes)) return [];

    const fromTs = fromDate ? new Date(fromDate).getTime() : null;
    const discussions = nodes
      .filter((d: any) => d.author && !BOT_USERS.has(d.author.login))
      .filter((d: any) => {
        const cat = (d.category?.name || "").toLowerCase();
        return !LOW_VALUE_CATEGORIES.has(cat);
      })
      .filter((d: any) => !fromTs || new Date(d.createdAt).getTime() >= fromTs)
      .map((d: any) => {
        // Process answer — tag maintainer status
        let answer: string | undefined;
        if (d.answer?.body) {
          const isMaintainer = ["OWNER", "MEMBER", "COLLABORATOR"].includes(
            d.answer.authorAssociation,
          );
          const author = d.answer.author?.login;
          const tag = isMaintainer && author ? `**@${author}** [maintainer]:\n\n` : "";
          answer = `${tag}${d.answer.body}`;
        }

        // Process comments — filter noise, score for quality, take best 3
        const comments: DiscussionComment[] = (d.comments?.nodes || [])
          .filter((c: any) => c.author && !BOT_USERS.has(c.author.login))
          .filter((c: any) => !COMMENT_NOISE_RE.test((c.body || "").trim()))
          .map((c: any) => {
            const isMaintainer = ["OWNER", "MEMBER", "COLLABORATOR"].includes(c.authorAssociation);
            return {
              body: c.body || "",
              author: c.author.login,
              reactions: c.reactions?.totalCount || 0,
              isMaintainer,
            };
          })
          .sort((a: DiscussionComment, b: DiscussionComment) => scoreComment(b) - scoreComment(a))
          .slice(0, 3);

        return {
          number: d.number,
          title: d.title,
          body: d.body || "",
          category: d.category?.name || "",
          createdAt: d.createdAt,
          url: d.url,
          upvoteCount: d.upvoteCount || 0,
          comments: d.comments?.totalCount || 0,
          isMaintainer: ["OWNER", "MEMBER", "COLLABORATOR"].includes(d.authorAssociation),
          answer,
          topComments: comments,
        };
      })
      // Score, filter low-quality, sort by category priority then score
      .map((d: GitHubDiscussion) => ({ d, score: scoreDiscussion(d) }))
      .filter(({ score }) => score >= MIN_DISCUSSION_SCORE)
      .sort((a, b) => {
        const aHigh = HIGH_VALUE_CATEGORIES.has(a.d.category.toLowerCase()) ? 1 : 0;
        const bHigh = HIGH_VALUE_CATEGORIES.has(b.d.category.toLowerCase()) ? 1 : 0;
        if (aHigh !== bHigh) return bHigh - aHigh;
        return b.score - a.score;
      })
      .slice(0, limit)
      .map(({ d }) => d);

    return discussions;
  } catch {
    return [];
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
  });

  const bodyLimit = d.upvoteCount >= 5 ? 1500 : 800;
  const lines = [fm, "", `# ${d.title}`];

  if (d.body) {
    lines.push("", truncateBody(d.body, bodyLimit));
  }

  if (d.answer) {
    lines.push("", "---", "", "## Accepted Answer", "", truncateBody(d.answer, 1000));
  } else if (d.topComments.length > 0) {
    // No accepted answer — include top comments as context
    lines.push("", "---", "", "## Top Comments");
    for (const c of d.topComments) {
      const reactions = c.reactions > 0 ? ` (+${c.reactions})` : "";
      const maintainer = c.isMaintainer ? " [maintainer]" : "";
      lines.push("", `**@${c.author}**${maintainer}${reactions}:`, "", truncateBody(c.body, 600));
    }
  }

  return lines.join("\n");
}

/**
 * Generate a summary index of all discussions for quick LLM scanning.
 * Groups by category so the LLM can quickly find Q&A vs general discussions.
 */
export function generateDiscussionIndex(discussions: GitHubDiscussion[]): string {
  const byCategory = new Map<string, GitHubDiscussion[]>();
  for (const d of discussions) {
    const cat = d.category || "Uncategorized";
    mapInsert(byCategory, cat, () => []).push(d);
  }

  const answered = discussions.filter((d) => d.answer).length;

  const fm = ["---", `total: ${discussions.length}`, `answered: ${answered}`, "---"];

  const sections: string[] = [fm.join("\n"), "", "# Discussions Index", ""];

  // Sort categories: high-value first
  const cats = [...byCategory.keys()].sort((a, b) => {
    const aHigh = HIGH_VALUE_CATEGORIES.has(a.toLowerCase()) ? 0 : 1;
    const bHigh = HIGH_VALUE_CATEGORIES.has(b.toLowerCase()) ? 0 : 1;
    return aHigh - bHigh || a.localeCompare(b);
  });

  for (const cat of cats) {
    const group = byCategory.get(cat)!;
    sections.push(`## ${cat} (${group.length})`, "");
    for (const d of group) {
      const upvotes = d.upvoteCount > 0 ? ` (+${d.upvoteCount})` : "";
      const answered = d.answer ? " [answered]" : "";
      const date = isoDate(d.createdAt);
      sections.push(
        `- [#${d.number}](./discussion-${d.number}.md): ${d.title}${upvotes}${answered} (${date})`,
      );
    }
    sections.push("");
  }

  return sections.join("\n");
}
