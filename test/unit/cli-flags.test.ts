import { parseArgs } from "citty";
import { describe, expect, it } from "vitest";

/**
 * Validates that CLI flag definitions parse correctly via citty.
 *
 * citty treats `--no-X` as the negation of flag `X`. Defining a flag
 * as `no-search` (default false) meant `--no-search` was a no-op —
 * citty interpreted it as "negate search → false", matching the default.
 *
 * The fix: define as `search` (default true) so `--no-search` flips it to false.
 */
describe("eject --no-search flag", () => {
  const ejectArgs = {
    package: { type: "positional" as const },
    search: { type: "boolean" as const, default: true },
    yes: { type: "boolean" as const, default: false },
    force: { type: "boolean" as const, default: false },
  };

  it("defaults search to true when flag is omitted", () => {
    const args = parseArgs(["vue", "--yes"], ejectArgs);
    expect(args.search).toBe(true);
  });

  it("sets search to false when --no-search is passed", () => {
    const args = parseArgs(["vue", "--no-search", "--yes"], ejectArgs);
    expect(args.search).toBe(false);
    expect(!args.search).toBe(true); // noSearch value passed to syncCommand
  });

  it("keeps search true when --search is explicitly passed", () => {
    const args = parseArgs(["vue", "--search", "--yes"], ejectArgs);
    expect(args.search).toBe(true);
  });
});

/**
 * Regression guard: a flag named `no-X` with default false is always false
 * in citty, regardless of whether `--no-X` is passed. This test documents
 * the broken pattern so it's never reintroduced.
 */
describe("citty --no-X flag gotcha", () => {
  it("no-search flag (default false) is always false — broken pattern", () => {
    const brokenArgs = {
      "no-search": { type: "boolean" as const, default: false },
    };
    const withFlag = parseArgs(["--no-search"], brokenArgs);
    const withoutFlag = parseArgs([], brokenArgs);
    // Both are false — the flag has no effect
    expect(withFlag["no-search"]).toBe(false);
    expect(withoutFlag["no-search"]).toBe(false);
  });
});
