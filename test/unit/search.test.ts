import type { SearchSnippet } from "../../src/retriv/types";
import { describe, expect, it } from "vitest";
import { parseFilterPrefix } from "../../src/commands/search";
import { normalizeScores, scoreLabel } from "../../src/core/formatting";

function snippet(overrides: Partial<SearchSnippet> = {}): SearchSnippet {
  return {
    package: "test-pkg",
    source: "docs/README.md",
    lineStart: 1,
    lineEnd: 10,
    content: "test content",
    score: 0.05,
    highlights: [],
    ...overrides,
  };
}

describe("parseFilterPrefix", () => {
  it("returns raw query when no prefix", () => {
    expect(parseFilterPrefix("useFetch options")).toEqual({ query: "useFetch options" });
  });

  it("parses issues: prefix", () => {
    expect(parseFilterPrefix("issues:memory leak")).toEqual({
      query: "memory leak",
      filter: { type: "issue" },
    });
  });

  it("parses issue: prefix (singular)", () => {
    expect(parseFilterPrefix("issue:bug")).toEqual({
      query: "bug",
      filter: { type: "issue" },
    });
  });

  it("parses docs: prefix", () => {
    expect(parseFilterPrefix("docs:routing")).toEqual({
      query: "routing",
      filter: { type: { $in: ["doc", "docs"] } },
    });
  });

  it("parses releases: prefix", () => {
    expect(parseFilterPrefix("releases:v3")).toEqual({
      query: "v3",
      filter: { type: "release" },
    });
  });

  it("is case-insensitive", () => {
    expect(parseFilterPrefix("Issues:bug")).toEqual({
      query: "bug",
      filter: { type: "issue" },
    });
  });
});

describe("normalizeScores", () => {
  it("normalizes best result to 100", () => {
    const results = [snippet({ score: 0.08 }), snippet({ score: 0.04 }), snippet({ score: 0.02 })];
    const scores = normalizeScores(results);
    expect(scores.get(results[0]!)).toBe(100);
  });

  it("normalizes relative to best", () => {
    const results = [snippet({ score: 0.1 }), snippet({ score: 0.05 })];
    const scores = normalizeScores(results);
    expect(scores.get(results[1]!)).toBe(50);
  });

  it("handles single result", () => {
    const results = [snippet({ score: 0.03 })];
    const scores = normalizeScores(results);
    expect(scores.get(results[0]!)).toBe(100);
  });

  it("handles zero scores", () => {
    const results = [snippet({ score: 0 })];
    const scores = normalizeScores(results);
    expect(scores.get(results[0]!)).toBe(0);
  });
});

describe("scoreLabel", () => {
  it("returns green for >= 70", () => {
    expect(scoreLabel(100)).toContain("100%");
    expect(scoreLabel(100)).toContain("\x1B[32m");
  });

  it("returns yellow for >= 40", () => {
    expect(scoreLabel(50)).toContain("50%");
    expect(scoreLabel(50)).toContain("\x1B[33m");
  });

  it("returns dim for < 40", () => {
    expect(scoreLabel(20)).toContain("20%");
    expect(scoreLabel(20)).toContain("\x1B[90m");
  });
});
