/**
 * AST-based markdown parsing using mdast/micromark.
 * Replaces scattered regex-based frontmatter/heading/link extraction.
 */

import type { Nodes, Root } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { frontmatterFromMarkdown } from "mdast-util-frontmatter";
import { toString } from "mdast-util-to-string";
import { frontmatter } from "micromark-extension-frontmatter";
import { visit } from "unist-util-visit";
import { yamlParseKV } from "./yaml.ts";

export interface MdHeading {
  depth: number;
  text: string;
}

export interface MdLink {
  title: string;
  url: string;
}

export interface ParsedMd {
  tree: Root;
  frontmatter: Record<string, string>;
}

/** Parse markdown string to AST + frontmatter key-values */
export function parseMd(content: string): ParsedMd {
  const tree = fromMarkdown(content, {
    extensions: [frontmatter(["yaml"])],
    mdastExtensions: [frontmatterFromMarkdown(["yaml"])],
  });

  const fm: Record<string, string> = {};
  visit(tree, "yaml", (node: Nodes) => {
    if (node.type === "yaml") {
      for (const line of (node as any).value.split("\n")) {
        const kv = yamlParseKV(line);
        if (kv) fm[kv[0]] = kv[1];
      }
    }
  });

  return { tree, frontmatter: fm };
}

/** Extract frontmatter key-value pairs only */
export function parseFrontmatter(content: string): Record<string, string> {
  return parseMd(content).frontmatter;
}

/** Strip custom heading anchors like {#some-id} */
function stripHeadingAnchors(text: string): string {
  return text.replace(/\s*\{#[^}]+\}\s*$/, "").trim();
}

/** Extract title: frontmatter title > first h1 > null */
export function extractTitle(content: string): string | null {
  const { tree, frontmatter: fm } = parseMd(content);
  if (fm.title) return fm.title;

  let title: string | null = null;
  visit(tree, "heading", (node) => {
    if (node.depth === 1 && !title) {
      // Strip {#id} anchors and leading backslash escapes (e.g. `# \`)
      const text = stripHeadingAnchors(toString(node))
        .replace(/^\\+\s*/, "")
        .trim();
      if (text.length > 0) title = text;
    }
  });

  return title;
}

/** Extract first paragraph text, 150 char max */
export function extractDescription(content: string): string | null {
  const { tree } = parseMd(content);

  let desc: string | null = null;
  visit(tree, "paragraph", (node, _index, parent) => {
    // Only top-level paragraphs (skip blockquote children, list items, etc.)
    if (desc || parent?.type !== "root") return;

    const text = toString(node).trim();
    if (text.length === 0) return;

    // Strip markdown link syntax remnants and formatting chars
    let clean = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[`*_~]/g, "");
    if (clean.length > 150) clean = `${clean.slice(0, 147)}...`;
    desc = clean;
  });

  return desc;
}

/** Extract all headings with depth and text */
export function extractHeadings(content: string): MdHeading[] {
  const { tree } = parseMd(content);
  const headings: MdHeading[] = [];

  visit(tree, "heading", (node) => {
    headings.push({ depth: node.depth, text: stripHeadingAnchors(toString(node)) });
  });

  return headings;
}

/** Extract all links (deduped by url) */
export function extractLinks(content: string): MdLink[] {
  const { tree } = parseMd(content);
  const links: MdLink[] = [];
  const seen = new Set<string>();

  visit(tree, "link", (node) => {
    if (!seen.has(node.url)) {
      seen.add(node.url);
      links.push({ title: toString(node), url: node.url });
    }
  });

  return links;
}

/** Strip frontmatter block, return body only */
export function stripFrontmatter(content: string): string {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  return match ? content.slice(match[0].length).trim() : content;
}
