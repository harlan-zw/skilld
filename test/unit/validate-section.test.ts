import { describe, expect, it } from "vitest";
import { getSectionValidator } from "../../src/agent/prompts/prompt";

describe("section validators", () => {
  describe("api-changes", () => {
    const validate = getSectionValidator("api-changes")!;

    it("returns validator function", () => {
      expect(validate).toBeTypeOf("function");
    });

    it("passes valid content", () => {
      const content = [
        "## API Changes",
        "",
        "- BREAKING: `createClient(url, key)` — v2 changed to `createClient({ url, key })` [source](./.skilld/releases/v2.0.0.md)",
        "- NEW: `useTemplateRef()` — new in v3.5 [source](./.skilld/releases/v3.5.0.md)",
        "- DEPRECATED: `$ref` — use `ref()` instead [source](./.skilld/releases/v3.4.0.md)",
      ].join("\n");
      expect(validate(content)).toEqual([]);
    });

    it("warns on missing heading", () => {
      const content = [
        "- BREAKING: `foo()` — changed [source](./.skilld/releases/v2.0.0.md)",
        "- NEW: `bar()` — added [source](./.skilld/releases/v2.0.0.md)",
        "- DEPRECATED: `baz()` — removed [source](./.skilld/releases/v2.0.0.md)",
      ].join("\n");
      const warnings = validate(content);
      expect(
        warnings.some((w) => w.warning.includes('Missing required "## API Changes" heading')),
      ).toBe(true);
    });

    it("warns on missing labels", () => {
      const content = [
        "## API Changes",
        "",
        "- `createClient()` now takes object args [source](./.skilld/releases/v2.0.0.md)",
        "- `useRef()` is new [source](./.skilld/releases/v3.0.0.md)",
        "- `oldApi()` was removed [source](./.skilld/releases/v3.0.0.md)",
      ].join("\n");
      const warnings = validate(content);
      expect(warnings.some((w) => w.warning.includes("BREAKING/DEPRECATED/NEW labels"))).toBe(true);
    });

    it("warns on missing sources", () => {
      const content = [
        "## API Changes",
        "",
        "- BREAKING: `foo()` — changed",
        "- NEW: `bar()` — added",
        "- DEPRECATED: `baz()` — removed",
      ].join("\n");
      const warnings = validate(content);
      expect(warnings.some((w) => w.warning.includes("source citations"))).toBe(true);
    });

    it("warns on sparse content", () => {
      const warnings = validate("## API Changes");
      expect(warnings.some((w) => w.warning.includes("too sparse"))).toBe(true);
    });
  });

  describe("best-practices", () => {
    const validate = getSectionValidator("best-practices")!;

    it("returns validator function", () => {
      expect(validate).toBeTypeOf("function");
    });

    it("passes valid content", () => {
      const content = [
        "## Best Practices",
        "",
        "- Use `storeToRefs()` when destructuring [source](./.skilld/docs/index.md)",
        "- Prefer `defineConfig()` for type inference [source](./.skilld/docs/config.md)",
        "- Use lazy loading for routes [source](./.skilld/docs/routing.md)",
      ].join("\n");
      expect(validate(content)).toEqual([]);
    });

    it("warns on missing heading", () => {
      const content = [
        "- Use foo [source](./.skilld/docs/api.md)",
        "- Use bar [source](./.skilld/docs/api.md)",
        "- Use baz [source](./.skilld/docs/api.md)",
      ].join("\n");
      const warnings = validate(content);
      expect(
        warnings.some((w) => w.warning.includes('Missing required "## Best Practices" heading')),
      ).toBe(true);
    });

    it("warns on excessive code blocks", () => {
      const content = [
        "## Best Practices",
        "",
        "- Tip one [source](./.skilld/docs/a.md)",
        "```ts",
        "const a = 1",
        "```",
        "- Tip two [source](./.skilld/docs/b.md)",
        "```ts",
        "const b = 2",
        "```",
        "- Tip three [source](./.skilld/docs/c.md)",
        "```ts",
        "const c = 3",
        "```",
      ].join("\n");
      const warnings = validate(content);
      expect(warnings.some((w) => w.warning.includes("code blocks"))).toBe(true);
    });

    it("warns on missing sources", () => {
      const content = [
        "## Best Practices",
        "",
        "- Unsourced item one",
        "- Unsourced item two",
        "- Unsourced item three",
      ].join("\n");
      const warnings = validate(content);
      expect(warnings.some((w) => w.warning.includes("source citations"))).toBe(true);
    });
  });

  describe("custom", () => {
    const validate = getSectionValidator("custom")!;

    it("returns validator function", () => {
      expect(validate).toBeTypeOf("function");
    });

    it("passes valid content with lower source threshold", () => {
      const content = [
        "## Custom Section",
        "",
        "- Item with source [source](./.skilld/docs/api.md)",
        "- Item without source but that is ok",
        "- Another item without source",
      ].join("\n");
      expect(validate(content)).toEqual([]);
    });

    it("warns on sparse content", () => {
      const warnings = validate("hi");
      expect(warnings.some((w) => w.warning.includes("too sparse"))).toBe(true);
    });
  });

  describe("source path checks", () => {
    const validate = getSectionValidator("api-changes")!;

    it("warns on source links missing .skilld/ prefix", () => {
      const content = [
        "## API Changes",
        "",
        "- BREAKING: `foo()` — changed [source](./docs/migration.md)",
        "- NEW: `bar()` — added [source](./releases/v2.0.0.md)",
        "- DEPRECATED: `baz()` — removed [source](./.skilld/releases/v3.0.0.md)",
      ].join("\n");
      const warnings = validate(content);
      expect(warnings.some((w) => w.warning.includes("missing .skilld/ prefix"))).toBe(true);
    });

    it("does not warn on correct .skilld/ paths", () => {
      const content = [
        "## API Changes",
        "",
        "- BREAKING: `foo()` — changed [source](./.skilld/releases/v2.0.0.md)",
        "- NEW: `bar()` — added [source](./.skilld/docs/migration.md)",
        "- DEPRECATED: `baz()` — removed [source](./.skilld/issues/123.md)",
      ].join("\n");
      const warnings = validate(content);
      expect(warnings.every((w) => !w.warning.includes("missing .skilld/ prefix"))).toBe(true);
    });

    it("warns on absolute filesystem paths in source links", () => {
      const content = [
        "## API Changes",
        "",
        "- BREAKING: `foo()` — changed [source](/home/user/.skilld/references/pkg@1.0.0/docs/migration.md)",
        "- NEW: `bar()` — added [source](./.skilld/releases/v2.0.0.md)",
        "- DEPRECATED: `baz()` — removed [source](/tmp/skilld/releases/v3.0.0.md)",
      ].join("\n");
      const warnings = validate(content);
      expect(warnings.some((w) => w.warning.includes("absolute paths"))).toBe(true);
    });

    it("does not warn on relative paths for absolute path check", () => {
      const content = [
        "## API Changes",
        "",
        "- BREAKING: `foo()` — changed [source](./.skilld/releases/v2.0.0.md)",
        "- NEW: `bar()` — added [source](./.skilld/docs/migration.md)",
        "- DEPRECATED: `baz()` — removed [source](./.skilld/issues/123.md)",
      ].join("\n");
      const warnings = validate(content);
      expect(warnings.every((w) => !w.warning.includes("absolute paths"))).toBe(true);
    });
  });
});
