/**
 * GitHub release notes fetching via GitHub API (preferred) with ungh.cc fallback
 */

import { ghApiPaginated, isoDate } from "./github-common.ts";
import { $fetch, fetchGitHubRaw } from "./utils.ts";

export interface GitHubRelease {
  id: number;
  tag: string;
  name: string;
  prerelease: boolean;
  createdAt: string;
  publishedAt: string;
  markdown: string;
}

interface UnghReleasesResponse {
  releases: GitHubRelease[];
}

interface CachedDoc {
  path: string;
  content: string;
}

export interface SemVer {
  major: number;
  minor: number;
  patch: number;
  raw: string;
}

export function parseSemver(version: string): SemVer | null {
  const clean = version.replace(/^v/, "");
  const match = clean.match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
  if (!match) return null;
  return {
    major: +match[1]!,
    minor: match[2] ? +match[2] : 0,
    patch: match[3] ? +match[3] : 0,
    raw: clean,
  };
}

/**
 * Extract version from a release tag, handling monorepo formats:
 * - `pkg@1.2.3` → `1.2.3`
 * - `pkg-v1.2.3` → `1.2.3`
 * - `v1.2.3` → `1.2.3`
 * - `1.2.3` → `1.2.3`
 */
function extractVersion(tag: string, packageName?: string): string | null {
  if (packageName) {
    // Monorepo: pkg@version or pkg-vversion
    const atMatch = tag.match(new RegExp(`^${escapeRegex(packageName)}@(.+)$`));
    if (atMatch) return atMatch[1]!;
    const dashMatch = tag.match(new RegExp(`^${escapeRegex(packageName)}-v?(.+)$`));
    if (dashMatch) return dashMatch[1]!;
  }
  // Standard: v1.2.3 or 1.2.3
  return tag.replace(/^v/, "");
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Check if a release tag belongs to a specific package
 */
function tagMatchesPackage(tag: string, packageName: string): boolean {
  // Exact match: pkg@version or pkg-vversion
  return (
    tag.startsWith(`${packageName}@`) ||
    tag.startsWith(`${packageName}-v`) ||
    tag.startsWith(`${packageName}-`)
  );
}

/**
 * Check if a version string contains a prerelease suffix (e.g. 6.0.0-beta, 1.2.3-rc.1)
 */
export function isPrerelease(version: string): boolean {
  return /^\d+\.\d+\.\d+-.+/.test(version.replace(/^v/, ""));
}

export function compareSemver(a: SemVer, b: SemVer): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}

interface GitHubApiRelease {
  id: number;
  tag_name: string;
  name: string;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  body: string;
}

/** Map GitHub API release to our GitHubRelease shape */
function mapApiRelease(r: GitHubApiRelease): GitHubRelease {
  return {
    id: r.id,
    tag: r.tag_name,
    name: r.name,
    prerelease: r.prerelease,
    createdAt: r.created_at,
    publishedAt: r.published_at,
    markdown: r.body,
  };
}

/**
 * Fetch all releases — GitHub API first (authenticated, async), ungh.cc fallback
 */
async function fetchAllReleases(owner: string, repo: string): Promise<GitHubRelease[]> {
  // Try authenticated GitHub API first (no rate limits, works for private repos)
  const apiReleases = await ghApiPaginated<GitHubApiRelease>(`repos/${owner}/${repo}/releases`);
  if (apiReleases.length > 0) return apiReleases.map(mapApiRelease);

  // Fallback: ungh.cc (fast, no auth needed for public repos)
  const data = await $fetch<UnghReleasesResponse>(
    `https://ungh.cc/repos/${owner}/${repo}/releases`,
    { signal: AbortSignal.timeout(15_000) },
  ).catch(() => null);
  return data?.releases ?? [];
}

/**
 * Select last 20 stable releases for a package, sorted newest first.
 * For monorepos, filters to package-specific tags (pkg@version).
 * Falls back to generic tags (v1.2.3) only if no package-specific found.
 * If installedVersion is provided, filters out releases newer than it.
 */
export function selectReleases(
  releases: GitHubRelease[],
  packageName?: string,
  installedVersion?: string,
  fromDate?: string,
): GitHubRelease[] {
  // Check if this looks like a monorepo (has package-prefixed tags)
  const hasMonorepoTags =
    packageName && releases.some((r) => tagMatchesPackage(r.tag, packageName));
  const installedSv = installedVersion ? parseSemver(installedVersion) : null;
  const installedIsPrerelease = installedVersion ? isPrerelease(installedVersion) : false;
  const fromTs = fromDate ? new Date(fromDate).getTime() : null;

  const filtered = releases.filter((r) => {
    const ver = extractVersion(r.tag, hasMonorepoTags ? packageName : undefined);
    if (!ver) return false;

    const sv = parseSemver(ver);
    if (!sv) return false;

    // Monorepo: only include tags for this package
    if (hasMonorepoTags && packageName && !tagMatchesPackage(r.tag, packageName)) return false;

    // Date lower bound: skip releases published before fromDate
    if (fromTs) {
      const pubDate = r.publishedAt || r.createdAt;
      if (pubDate && new Date(pubDate).getTime() < fromTs) return false;
    }

    // Prerelease handling: include only when installed is also prerelease and same major.minor
    if (r.prerelease) {
      if (!installedIsPrerelease || !installedSv) return false;
      return sv.major === installedSv.major && sv.minor === installedSv.minor;
    }

    // Filter out stable releases newer than installed version
    if (installedSv && compareSemver(sv, installedSv) > 0) return false;

    return true;
  });

  const sorted = filtered.sort((a, b) => {
    const verA = extractVersion(a.tag, hasMonorepoTags ? packageName : undefined);
    const verB = extractVersion(b.tag, hasMonorepoTags ? packageName : undefined);
    if (!verA || !verB) return 0;
    return compareSemver(parseSemver(verB)!, parseSemver(verA)!);
  });

  // No cap when fromDate is set — include all matching releases
  return fromDate ? sorted : sorted.slice(0, 20);
}

/**
 * Format a release as markdown with YAML frontmatter
 */
function formatRelease(release: GitHubRelease, packageName?: string): string {
  const date = isoDate(release.publishedAt || release.createdAt);
  const version = extractVersion(release.tag, packageName) || release.tag;

  const fm = ["---", `tag: ${release.tag}`, `version: ${version}`, `published: ${date}`];
  if (release.name && release.name !== release.tag)
    fm.push(`name: "${release.name.replace(/"/g, '\\"')}"`);
  fm.push("---");

  return `${fm.join("\n")}\n\n# ${release.name || release.tag}\n\n${release.markdown}`;
}

export interface ReleaseIndexOptions {
  releases: GitHubRelease[];
  packageName?: string;
  blogReleases?: Array<{ version: string; title: string; date: string }>;
  hasChangelog?: boolean;
}

/**
 * Generate a unified summary index of all releases for quick LLM scanning.
 * Includes GitHub releases, blog release posts, and CHANGELOG link.
 */
export function generateReleaseIndex(
  releasesOrOpts: GitHubRelease[] | ReleaseIndexOptions,
  packageName?: string,
): string {
  // Support both old signature and new options object
  const opts: ReleaseIndexOptions = Array.isArray(releasesOrOpts)
    ? { releases: releasesOrOpts, packageName }
    : releasesOrOpts;

  const { releases, blogReleases, hasChangelog } = opts;
  const pkg = opts.packageName;

  const total = releases.length + (blogReleases?.length ?? 0);
  const fm = ["---", `total: ${total}`, `latest: ${releases[0]?.tag || "unknown"}`, "---"];

  const lines: string[] = [fm.join("\n"), "", "# Releases Index", ""];

  // Blog release posts (major version announcements)
  if (blogReleases && blogReleases.length > 0) {
    lines.push("## Blog Releases", "");
    for (const b of blogReleases) {
      lines.push(`- [${b.version}](./blog-${b.version}.md): ${b.title} (${b.date})`);
    }
    lines.push("");
  }

  // GitHub release notes
  if (releases.length > 0) {
    if (blogReleases && blogReleases.length > 0) lines.push("## Release Notes", "");
    for (const r of releases) {
      const date = isoDate(r.publishedAt || r.createdAt);
      const filename = r.tag.includes("@") || r.tag.startsWith("v") ? r.tag : `v${r.tag}`;
      const version = extractVersion(r.tag, pkg) || r.tag;
      const sv = parseSemver(version);
      const label =
        sv?.patch === 0 && sv.minor === 0 ? " **[MAJOR]**" : sv?.patch === 0 ? " **[MINOR]**" : "";
      lines.push(`- [${r.tag}](./${filename}.md): ${r.name || r.tag} (${date})${label}`);
    }
    lines.push("");
  }

  // CHANGELOG link
  if (hasChangelog) {
    lines.push("## Changelog", "");
    lines.push("- [CHANGELOG.md](./CHANGELOG.md)");
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Check if a single release is a stub redirecting to CHANGELOG.md.
 * Short body (<500 chars) that mentions CHANGELOG indicates no real content.
 */
export function isStubRelease(release: GitHubRelease): boolean {
  const body = (release.markdown || "").trim();
  return body.length < 500 && /changelog\.md/i.test(body);
}

/**
 * Detect if releases are just short stubs redirecting to CHANGELOG.md.
 * Samples up to 3 releases — if all are stubs, it's a redirect pattern.
 */
export function isChangelogRedirectPattern(releases: GitHubRelease[]): boolean {
  const sample = releases.slice(0, 3);
  if (sample.length === 0) return false;
  return sample.every(isStubRelease);
}

/**
 * Fetch CHANGELOG.md from a GitHub repo at a specific ref as fallback.
 * For monorepos, also checks packages/{shortName}/CHANGELOG.md.
 */
async function fetchChangelog(
  owner: string,
  repo: string,
  ref: string,
  packageName?: string,
): Promise<string | null> {
  const paths: string[] = [];

  // Monorepo: try package-specific paths first (e.g. packages/pinia/CHANGELOG.md)
  if (packageName) {
    const shortName = packageName.replace(/^@.*\//, "");
    const scopeless = packageName.replace(/^@/, "").replace("/", "-");
    const candidates = [...new Set([shortName, scopeless])];
    for (const name of candidates) {
      paths.push(`packages/${name}/CHANGELOG.md`);
    }
  }

  // Root-level changelog
  paths.push("CHANGELOG.md", "changelog.md", "CHANGES.md");

  for (const path of paths) {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`;
    const content = await fetchGitHubRaw(url);
    if (content) return content;
  }
  return null;
}

/**
 * Fetch release notes for a package. Returns CachedDoc[] with releases/{tag}.md files.
 *
 * Strategy:
 * 1. Fetch GitHub releases, filter to package-specific tags for monorepos
 * 2. If no releases found, try CHANGELOG.md as fallback
 */
export async function fetchReleaseNotes(
  owner: string,
  repo: string,
  installedVersion: string,
  gitRef?: string,
  packageName?: string,
  fromDate?: string,
  changelogRef?: string,
): Promise<CachedDoc[]> {
  const releases = await fetchAllReleases(owner, repo);
  const selected = selectReleases(releases, packageName, installedVersion, fromDate);

  if (selected.length > 0) {
    // Filter out individual stub releases that just say "see CHANGELOG"
    const substantive = selected.filter((r) => !isStubRelease(r));

    const docs = substantive.map((r) => {
      const filename = r.tag.includes("@") || r.tag.startsWith("v") ? r.tag : `v${r.tag}`;
      return {
        path: `releases/${filename}.md`,
        content: formatRelease(r, packageName),
      };
    });

    // Always fetch CHANGELOG.md alongside substantive releases
    const ref = changelogRef || gitRef || selected[0]!.tag;
    const changelog = await fetchChangelog(owner, repo, ref, packageName);
    if (changelog && changelog.length < 500_000) {
      docs.push({ path: "releases/CHANGELOG.md", content: changelog });
    }

    return docs;
  }

  // Fallback: CHANGELOG.md (indexed as single file)
  const ref = changelogRef || gitRef || "main";
  const changelog = await fetchChangelog(owner, repo, ref, packageName);
  if (!changelog) return [];

  return [{ path: "releases/CHANGELOG.md", content: changelog }];
}
