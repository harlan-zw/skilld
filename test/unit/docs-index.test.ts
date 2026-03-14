import { describe, expect, it } from "vitest";
import { generateDocsIndex } from "../../src/sources/docs.ts";

describe("generateDocsIndex", () => {
  it("returns empty for no docs", () => {
    expect(generateDocsIndex([])).toBe("");
    expect(generateDocsIndex([{ path: "releases/v1.md", content: "# v1" }])).toBe("");
  });

  it("generates index with titles from headings", () => {
    const docs = [
      {
        path: "docs/guide/reactivity.md",
        content:
          "# Reactivity {#reactivity}\n\nVue uses a reactivity system to track state changes.",
      },
      {
        path: "docs/guide/components.md",
        content: "# Components\n\nComponents are reusable Vue instances.",
      },
      {
        path: "docs/api/setup.md",
        content: "# Setup Function\n\nThe setup function is the entry point for Composition API.",
      },
    ];
    const result = generateDocsIndex(docs);
    expect(result).toContain("# Docs Index");
    expect(result).toContain("total: 3");
    expect(result).toContain("## api (1)");
    expect(result).toContain("## guide (2)");
    expect(result).toContain(
      "- [Reactivity](./guide/reactivity.md): Vue uses a reactivity system to track state changes.",
    );
    expect(result).toContain(
      "- [Components](./guide/components.md): Components are reusable Vue instances.",
    );
    expect(result).toContain(
      "- [Setup Function](./api/setup.md): The setup function is the entry point for Composition API.",
    );
  });

  it("extracts title from frontmatter", () => {
    const docs = [
      { path: "docs/index.md", content: "---\ntitle: Vue.js Guide\n---\n\nWelcome to Vue." },
      {
        path: "docs/intro.md",
        content: '---\ntitle: "Introduction"\n---\n\n# Introduction\n\nGet started here.',
      },
    ];
    const result = generateDocsIndex(docs);
    expect(result).toContain("[Vue.js Guide](./index.md)");
    expect(result).toContain("[Introduction](./intro.md)");
  });

  it("frontmatter title takes precedence over heading", () => {
    const docs = [
      {
        path: "docs/page.md",
        content: "---\ntitle: The Real Title\n---\n\n# Different Heading\n\nBody text.",
      },
    ];
    const result = generateDocsIndex(docs);
    expect(result).toContain("[The Real Title](./page.md)");
    expect(result).not.toContain("Different Heading");
  });

  it("falls back to filename for escaped/empty headings", () => {
    const docs = [
      {
        path: "docs/api/sfc-script-setup.md",
        content: "# \\ {#script-setup}\n\n`<script setup>` is syntactic sugar.",
      },
    ];
    const result = generateDocsIndex(docs);
    expect(result).toContain("[sfc-script-setup](./api/sfc-script-setup.md)");
  });

  it("falls back to filename when no title found", () => {
    const docs = [{ path: "docs/api/README.md", content: "Some content without headings." }];
    const result = generateDocsIndex(docs);
    expect(result).toContain("[README](./api/README.md)");
  });

  it("skips HTML component blocks in description extraction", () => {
    const docs = [
      {
        path: "docs/guide/ts.md",
        content:
          '# TypeScript {#ts}\n\n<ScrimbaLink href="https://example.com">\n  Watch a video\n</ScrimbaLink>\n\n> This page assumes prior knowledge.\n\nActual content.',
      },
    ];
    const result = generateDocsIndex(docs);
    // Should skip the ScrimbaLink block and blockquote, pick up the real paragraph
    expect(result).not.toContain("Watch a video");
    expect(result).toContain(": Actual content.");
  });

  it("excludes _INDEX.md from results", () => {
    const docs = [
      { path: "docs/_INDEX.md", content: "# Old Index" },
      { path: "docs/guide.md", content: "# Guide\n\nThe guide." },
    ];
    const result = generateDocsIndex(docs);
    expect(result).not.toContain("Old Index");
    expect(result).toContain("[Guide](./guide.md)");
    expect(result).toContain("total: 1");
  });

  it("truncates long descriptions", () => {
    const longText = "A".repeat(200);
    const docs = [{ path: "docs/long.md", content: `# Long\n\n${longText}` }];
    const result = generateDocsIndex(docs);
    expect(result).toContain("...");
    const descMatch = result.match(/: (A+\.\.\.)/);
    expect(descMatch).toBeTruthy();
    expect(descMatch![1].length).toBeLessThanOrEqual(153);
  });

  it("places root-level files before directory groups", () => {
    const docs = [
      { path: "docs/guide/intro.md", content: "# Intro\n\nGuide intro." },
      { path: "docs/index.md", content: "---\ntitle: Home\n---\n\nWelcome." },
    ];
    const result = generateDocsIndex(docs);
    const lines = result.split("\n");
    const homeIdx = lines.findIndex((l) => l.includes("[Home]"));
    const guideIdx = lines.findIndex((l) => l.includes("## guide"));
    expect(homeIdx).toBeLessThan(guideIdx);
  });

  it("handles root-level docs without directory header", () => {
    const docs = [
      { path: "docs/getting-started.md", content: "# Getting Started\n\nInstall the package." },
    ];
    const result = generateDocsIndex(docs);
    expect(result).not.toContain("## ");
    expect(result).toContain("- [Getting Started](./getting-started.md)");
  });

  it("strips markdown links from descriptions", () => {
    const docs = [
      {
        path: "docs/page.md",
        content: "# Page\n\nSee the [official docs](https://example.com) for details.",
      },
    ];
    const result = generateDocsIndex(docs);
    expect(result).toContain(": See the official docs for details.");
  });
});
