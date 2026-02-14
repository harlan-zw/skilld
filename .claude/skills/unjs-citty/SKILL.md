---
name: unjs-citty
description: "ALWAYS use when writing code importing \"citty\". Consult for debugging, best practices, or modifying citty."
metadata:
  version: 0.2.1
---

# unjs/citty `citty`

**Version:** 0.2.1 (yesterday)
**Tags:** latest: 0.2.1 (yesterday)

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

⚠️ **ESM-only** — v0.2.0 ships ESM only, `require('citty')` no longer works [source](./releases/v0.2.0.md)

⚠️ **`node:util.parseArgs` internally** — v0.2.0 replaced custom parser with Node.js native `util.parseArgs`, edge cases around arg parsing may differ from v0.1.x [source](./releases/v0.2.0.md)

⚠️ **Optional args type `T | undefined`** — v0.2.0 improved type inference: args without `required: true` or `default` now correctly type as `T | undefined` instead of `T` [source](./releases/v0.2.0.md)

⚠️ **`--no-` negation conditionally printed** — v0.2.0 only shows `--no-<flag>` in usage when `negativeDescription` is set; previously always shown [source](./releases/v0.2.0.md)

✨ `type: "enum"` — new arg type in v0.2.0, requires `options: string[]` array. Typed as union of options values [source](./releases/v0.2.0.md)

```ts
args: {
  color: {
    type: "enum",
    options: ["red", "blue", "green"] as const,
    description: "Pick a color",
  },
}
// args.color typed as "red" | "blue" | "green" | undefined

```
✨ `meta.hidden` — v0.2.0, hides a subcommand from usage/help output [source](./releases/v0.2.0.md)

✨ `negativeDescription` — v0.2.0, on boolean args, sets description for the `--no-<flag>` variant in usage [source](./releases/v0.2.0.md)

✨ `cleanup` hook — v0.1.4, runs after `run()` completes (mirror of `setup`) [source](./releases/v0.1.4.md)

✨ `createMain(cmd)` — v0.1.4, returns a reusable `(opts?) => Promise<void>` wrapper around `runMain` [source](./releases/v0.1.4.md)

✨ `--version` flag — v0.1.4, auto-handled when `meta.version` is set [source](./releases/v0.1.4.md)

✨ `runMain({ showUsage })` — v0.1.5, accepts custom `showUsage` function to override default help rendering [source](./releases/v0.1.5.md)

⚠️ `--no-` propagation fix — v0.2.1, `--no-<flag>` now correctly negates aliases too (was broken in v0.2.0) [source](./releases/v0.2.1.md)

## Best Practices

✅ Use `setup` and `cleanup` hooks for lifecycle management — undocumented in README but fully supported; `cleanup` runs in `finally` block so it executes even on errors [source](./.skilld/pkg/dist/index.mjs)

```ts
defineCommand({
  args: { db: { type: "string", default: "mydb" } },
  async setup({ args }) { await connectDb(args.db) },
  async cleanup() { await disconnectDb() },
  async run({ args }) { /* db is connected */ },
})

```
✅ Use `enum` type with `options` for constrained values — validates input and shows allowed values in usage/error messages (v0.2.0+) [source](./.skilld/releases/v0.2.0.md)

```ts
args: {
  format: {
    type: "enum",
    options: ["json", "yaml", "toml"],
    default: "json",
    description: "Output format",
  },
}
```

✅ Use `meta.hidden: true` to hide subcommands from usage output — keeps internal/debug commands accessible but invisible (v0.2.0+) [source](./.skilld/releases/v0.2.0.md)

```ts
subCommands: {
  debug: () => defineCommand({ meta: { name: "debug", hidden: true }, run() {} }),
}
```

✅ Make `subCommands` values lazy via arrow functions — citty resolves them with `resolveValue()`, enabling code-splitting and faster startup [source](./.skilld/pkg/dist/index.mjs)

```ts
subCommands: {
  deploy: () => import("./commands/deploy").then(m => m.default),
  build: () => import("./commands/build").then(m => m.default),
}
```

✅ Use `negativeDescription` on boolean args that default to `true` — citty auto-generates `--no-*` flags with separate help text (v0.2.0+) [source](./.skilld/pkg/dist/index.mjs)

```ts
args: {
  color: {
    type: "boolean",
    default: true,
    description: "Colorize output",
    negativeDescription: "Disable colored output",
  },
}
```

✅ Pass custom `showUsage` to `runMain` for branded help screens — citty calls your function instead of the built-in one for `--help` and error display [source](./.skilld/pkg/dist/index.d.mts)

```ts
runMain(cmd, {
  showUsage: async (cmd, parent) => {
    console.log(await renderUsage(cmd, parent))
    console.log("\nDocs: https://example.com/docs")
  },
})
```

✅ Arg names auto-alias between camelCase and kebab-case — defining `outputDir` auto-creates `--output-dir` and vice versa; don't add redundant aliases [source](./.skilld/pkg/dist/index.mjs)

✅ `--version` only works as the sole argument — citty checks `rawArgs.length === 1 && rawArgs[0] === "--version"`, so `--version --verbose` won't trigger it; set `meta.version` on the root command [source](./.skilld/pkg/dist/index.mjs)

✅ Use `runCommand` over `runMain` for programmatic invocation — `runMain` calls `process.exit(1)` on errors and handles `--help`/`--version`; `runCommand` returns `{ result }` and lets errors propagate [source](./.skilld/pkg/dist/index.mjs)

```ts
const { result } = await runCommand(cmd, { rawArgs: ["build", "--prod"] })
```

✅ Avoid positional args on commands with subcommands — if a positional value matches a subcommand name, citty routes to the subcommand instead of using it as the arg value [source](./.skilld/issues/issue-41.md)
