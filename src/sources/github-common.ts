/**
 * Shared constants and helpers for GitHub source modules (issues, discussions, releases)
 */

import { spawnSync } from "node:child_process";
import { ofetch } from "ofetch";

export const BOT_USERS = new Set([
  "renovate[bot]",
  "dependabot[bot]",
  "renovate-bot",
  "dependabot",
  "github-actions[bot]",
]);

/** Extract YYYY-MM-DD date from an ISO timestamp */
export const isoDate = (iso: string) => iso.split("T")[0];

/** Build YAML frontmatter from a key-value object, auto-quoting strings with special chars */
export function buildFrontmatter(
  fields: Record<string, string | number | boolean | undefined>,
): string {
  const lines = ["---"];
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined)
      lines.push(
        `${k}: ${typeof v === "string" && /[:"[\]]/.test(v) ? `"${v.replace(/"/g, '\\"')}"` : v}`,
      );
  }
  lines.push("---");
  return lines.join("\n");
}

// ── Content Processing ──

/** Check if body contains a code block */
export function hasCodeBlock(text: string): boolean {
  return /```[\s\S]*?```/.test(text) || /`[^`]+`/.test(text);
}

/** Noise patterns in comments — filter these out */
export const COMMENT_NOISE_RE =
  /^(?:\+1|👍|same here|any update|bump|following|is there any progress|when will this|me too|i have the same|same issue|thanks|thank you)[\s!?.]*$/i;

/**
 * Smart body truncation — preserves code blocks and error messages.
 * Instead of slicing at a char limit, finds a safe break point.
 */
export function truncateBody(body: string, limit: number): string {
  if (body.length <= limit) return body;

  // Find code block boundaries so we don't cut mid-block
  const codeBlockRe = /```[\s\S]*?```/g;
  let lastSafeEnd = limit;
  let match: RegExpExecArray | null;

  // eslint-disable-next-line no-cond-assign
  while ((match = codeBlockRe.exec(body)) !== null) {
    const blockStart = match.index;
    const blockEnd = blockStart + match[0].length;

    // If the limit falls inside a code block, move limit to after the block
    // (if not too far) or before the block
    if (blockStart < limit && blockEnd > limit) {
      if (blockEnd <= limit + 500) {
        // Block ends reasonably close — include it
        lastSafeEnd = blockEnd;
      } else {
        // Block is too long — cut before it
        lastSafeEnd = blockStart;
      }
      break;
    }
  }

  // Try to break at a paragraph boundary
  const slice = body.slice(0, lastSafeEnd);
  const lastParagraph = slice.lastIndexOf("\n\n");
  if (lastParagraph > lastSafeEnd * 0.6) return `${slice.slice(0, lastParagraph)}\n\n...`;

  return `${slice}...`;
}

// ── GitHub Auth ──

let _ghToken: string | null | undefined;

/**
 * Get GitHub auth token from gh CLI (cached).
 * Returns null if gh CLI is not available or not authenticated.
 */
export function getGitHubToken(): string | null {
  if (_ghToken !== undefined) return _ghToken;
  try {
    const { stdout } = spawnSync("gh", ["auth", "token"], {
      encoding: "utf-8",
      timeout: 5_000,
      stdio: ["ignore", "pipe", "ignore"],
    });
    _ghToken = stdout?.trim() || null;
  } catch {
    _ghToken = null;
  }
  return _ghToken;
}

// ── Private Repo Tracking ──

/** Repos where ungh.cc failed but gh api succeeded (likely private) */
const _needsAuth = new Set<string>();

/** Mark a repo as needing authenticated access */
export function markRepoPrivate(owner: string, repo: string): void {
  _needsAuth.add(`${owner}/${repo}`);
}

/** Check if a repo is known to need authenticated access */
export function isKnownPrivateRepo(owner: string, repo: string): boolean {
  return _needsAuth.has(`${owner}/${repo}`);
}

// ── GitHub API (async, no process spawn) ──

const GH_API = "https://api.github.com";

const ghApiFetch = ofetch.create({
  retry: 2,
  retryDelay: 500,
  timeout: 15_000,
  headers: { "User-Agent": "skilld/1.0" },
});

const LINK_NEXT_RE = /<([^>]+)>;\s*rel="next"/;

/** Parse GitHub Link header for next page URL */
function parseLinkNext(header: string | null): string | null {
  if (!header) return null;
  return header.match(LINK_NEXT_RE)?.[1] ?? null;
}

/**
 * Authenticated fetch against api.github.com. Returns null if no token or request fails.
 * Endpoint should be relative, e.g. `repos/owner/repo/releases`.
 */
export async function ghApi<T>(endpoint: string): Promise<T | null> {
  const token = getGitHubToken();
  if (!token) return null;
  return ghApiFetch<T>(`${GH_API}/${endpoint}`, {
    headers: { Authorization: `token ${token}` },
  }).catch(() => null);
}

/**
 * Paginated GitHub API fetch. Follows Link headers, returns concatenated arrays.
 * Endpoint should return a JSON array, e.g. `repos/owner/repo/releases`.
 */
export async function ghApiPaginated<T>(endpoint: string): Promise<T[]> {
  const token = getGitHubToken();
  if (!token) return [];

  const headers = { Authorization: `token ${token}` };
  const results: T[] = [];
  let url: string | null = `${GH_API}/${endpoint}`;

  while (url) {
    const res = await ghApiFetch.raw<T[]>(url, { headers }).catch(() => null);
    if (!res?.ok || !Array.isArray(res._data)) break;
    results.push(...res._data);
    url = parseLinkNext(res.headers.get("link"));
  }

  return results;
}
