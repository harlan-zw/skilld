/**
 * Docs index generation — creates _INDEX.md for docs directory
 */

import { extractDescription, extractTitle } from "../core/markdown.ts";

/**
 * Generate a _INDEX.md for a docs/ directory.
 * Input: array of cached docs with paths like `docs/api/reactivity.md`.
 * Output: markdown index grouped by directory with title + description per page.
 */
export function generateDocsIndex(docs: Array<{ path: string; content: string }>): string {
  const docFiles = docs
    .filter(
      (d) => d.path.startsWith("docs/") && d.path.endsWith(".md") && !d.path.endsWith("_INDEX.md"),
    )
    .sort((a, b) => a.path.localeCompare(b.path));

  if (docFiles.length === 0) return "";

  // Group by directory, root-level files first
  const rootFiles: Array<{ path: string; content: string }> = [];
  const byDir = new Map<string, Array<{ path: string; content: string }>>();
  for (const doc of docFiles) {
    const rel = doc.path.slice("docs/".length);
    const dir = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "";
    if (!dir) {
      rootFiles.push(doc);
    } else {
      const list = byDir.get(dir);
      if (list) list.push(doc);
      else byDir.set(dir, [doc]);
    }
  }

  const sections: string[] = ["---", `total: ${docFiles.length}`, "---", "", "# Docs Index", ""];

  // Root-level files first (no directory header)
  for (const file of rootFiles) {
    const rel = file.path.slice("docs/".length);
    const title = extractTitle(file.content) || rel.replace(/\.md$/, "");
    const desc = extractDescription(file.content);
    const descPart = desc ? `: ${desc}` : "";
    sections.push(`- [${title}](./${rel})${descPart}`);
  }
  if (rootFiles.length > 0) sections.push("");

  // Then grouped directories
  for (const [dir, files] of byDir) {
    sections.push(`## ${dir} (${files.length})`, "");

    for (const file of files) {
      const rel = file.path.slice("docs/".length);
      const title = extractTitle(file.content) || rel.replace(/\.md$/, "").split("/").pop()!;
      const desc = extractDescription(file.content);
      const descPart = desc ? `: ${desc}` : "";
      sections.push(`- [${title}](./${rel})${descPart}`);
    }
    sections.push("");
  }

  return sections.join("\n");
}
