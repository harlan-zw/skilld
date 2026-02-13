---
name: unjs-citty
description: "ALWAYS use when writing code importing \"citty\". Consult for debugging, best practices, or modifying citty."
metadata:
  version: 0.2.0
---

# unjs/citty `citty`

**Version:** 0.2.0 (today)
**Tags:** latest: 0.2.1 (today)

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [GitHub Issues](./.skilld/issues/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `npx -y skilld search` instead of grepping `.skilld/` directories — hybrid semantic + keyword search across all indexed docs, issues, and releases.

```bash
npx -y skilld search "query" -p citty
npx -y skilld search "issues:error handling" -p citty
npx -y skilld search "releases:deprecated" -p citty
```

Filters: `docs:`, `issues:`, `releases:` prefix narrows by source type.

## API Changes

⚠️ ESM-only — v0.2.0 ships ESM only, no CJS dist. Update `require()` to `import` [source](./.skilld/releases/v0.2.0.md)

⚠️ `node:util.parseArgs` — v0.2.0 replaced custom arg parser with native `node:util.parseArgs`, may change edge-case parsing behavior (e.g. `--no-` prefix handling) [source](./.skilld/releases/v0.2.0.md)

⚠️ `--no-<flag>` usage — v0.2.0 only prints negative boolean arg usage when `negativeDescription` is set, previously always shown [source](./.skilld/releases/v0.2.0.md)

⚠️ Optional args type safety — v0.2.0 args without `required: true` or `default` now typed as `T | undefined` instead of `T`. Add `required: true` or `default` to fix type errors [source](./.skilld/releases/v0.2.0.md)

⚠️ Zero dependencies — v0.2.0 removed `consola` dep (used since v0.1.2), uses simple `console` formatting. Custom formatters relying on consola internals will break [source](./.skilld/releases/v0.2.0.md)

✨ `type: "enum"` — new arg type in v0.2.0, restricts values to `options` array. Typed as union of options [source](./.skilld/releases/v0.2.0.md)

```ts
args: {
  level: {
    type: "enum",
    options: ["debug", "info", "warn", "error"] as const,
    description: "Log level",
  },
}

```
✨ `negativeDescription` — new in v0.2.0 for boolean args, shown for `--no-<flag>` in usage output [source](./.skilld/releases/v0.2.0.md)

✨ `hidden` in `CommandMeta` — v0.2.0 adds `hidden: true` to hide subcommands from usage/help [source](./.skilld/releases/v0.2.0.md)

✨ `cleanup` hook — added v0.1.4, runs after `run` for teardown. Not new in v0.2.0 but LLMs trained on v0.1.0-era data won't know it [source](./.skilld/releases/v0.1.4.md)

✨ `createMain(cmd)` — added v0.1.4, wraps command so calling the returned function invokes `runMain` [source](./.skilld/releases/v0.1.4.md)

✨ `--version` flag — built-in since v0.1.4 when `meta.version` is set [source](./.skilld/releases/v0.1.4.md)

✨ `runCommand` returns `{ result }` — since v0.1.5, `run()` return value accessible via `(await runCommand(cmd, opts)).result` [source](./.skilld/releases/v0.1.5.md)

## Best Practices

✅ Use `setup`/`cleanup` lifecycle hooks for init and teardown — undocumented in README but fully supported; `cleanup` runs in `finally` block so it executes even when `run` throws [source](./.skilld/pkg/README.md)

```ts
defineCommand({
  async setup(ctx) { await db.connect() },
  async run({ args }) { /* use db */ },
  async cleanup() { await db.disconnect() },
})

```
✅ Use `enum` type with `options` array for constrained string args (v0.2.0) — validates input and shows allowed values in usage output automatically [source](./.skilld/releases/v0.2.0.md)

```ts
args: {
  format: {
    type: "enum",
    options: ["json", "yaml", "toml"],
    description: "Output format",
  },
}
// args.format is typed as "json" | "yaml" | "toml" via const generic inference
```

✅ Use `meta.hidden: true` to hide internal subcommands from help output (v0.2.0) — subcommands with `hidden` are still executable but omitted from `renderUsage` [source](./.skilld/releases/v0.2.0.md)

✅ Use `negativeDescription` on boolean args to document `--no-*` flags (v0.2.0) — the `--no-` variant only renders in usage when `default: true` OR `negativeDescription` is set, AND the arg name doesn't already start with `no` [source](./.skilld/releases/v0.2.0.md)

```ts
args: {
  color: {
    type: "boolean",
    default: true,
    description: "Colorize output",
    negativeDescription: "Disable colors",
  },
}
// renders both --color and --no-color in help
```

✅ Wrap subcommands in arrow functions for lazy loading — `Resolvable<T>` accepts `() => T | Promise<T>`, so subcommands can be dynamically imported without upfront cost [source](./.skilld/pkg/README.md)

```ts
subCommands: {
  deploy: () => import("./commands/deploy").then(m => m.default),
  build: () => import("./commands/build").then(m => m.default),
}
```

✅ Pass custom `showUsage` to `runMain` for branded help — replaces the built-in help renderer entirely; accepts the same `(cmd, parent?)` signature [source](./.skilld/issues/issue-137.md)

```ts
runMain(main, {
  showUsage: async (cmd, parent) => {
    console.log(myBanner)
    await showUsage(cmd, parent) // delegate to built-in after banner
  },
})
```

✅ Use `valueHint` for descriptive option placeholders — renders in help as `--output=<path>` instead of showing the default value [source](./.skilld/releases/v0.1.6.md)

```ts
args: {
  output: { type: "string", valueHint: "path", description: "Output directory" },
}
```

✅ Avoid positional args on commands with subcommands — if a positional arg value matches a subcommand name, the subcommand takes priority and runs instead [source](./.skilld/issues/issue-41.md)

✅ v0.2.0 is ESM-only and zero-dependency — uses `node:util.parseArgs` internally (requires Node 18.11+), dropped `mri` parser and `consola` dependency, reducing install from 267kB to 22.8kB [source](./.skilld/releases/v0.2.0.md)

✅ `runCommand` returns `{ result }` from `run()` — capture return values from command execution for programmatic use; `runMain` discards the result [source](./.skilld/pkg/README.md)

```ts
const { result } = await runCommand(cmd, { rawArgs: ["--verbose"] })
```
