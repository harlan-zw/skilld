---
name: bombshell-dev-clack
description: "ALWAYS use when writing code importing \"@clack/prompts\". Consult for debugging, best practices, or modifying @clack/prompts, clack/prompts, clack prompts, clack."
metadata:
  version: 1.0.0
  generated_by: Claude Code · Opus 4.6
---

# bombshell-dev/clack `@clack/prompts`

**Version:** 1.0.0 (today)
**Deps:** picocolors@^1.0.0, sisteransi@^1.0.5, @clack/core@1.0.1
**Tags:** alpha: 1.0.0-alpha.10 (2 weeks ago), latest: 1.0.1 (today)

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [GitHub Issues](./.skilld/issues/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `npx -y skilld search` instead of grepping `.skilld/` directories — hybrid semantic + keyword search across all indexed docs, issues, and releases.

```bash
npx -y skilld search "query" -p @clack/prompts
npx -y skilld search "issues:error handling" -p @clack/prompts
npx -y skilld search "releases:deprecated" -p @clack/prompts
```

Filters: `docs:`, `issues:`, `releases:` prefix narrows by source type.

## API Changes

⚠️ **ESM-only** — v1.0 dropped CJS dual-publishing; use ESM imports only [source](./.skilld/releases/@clack/prompts@1.0.0.md)

⚠️ `spinner.stop(msg, 1)` / `spinner.stop(msg, 2)` — v1.0 replaced numeric code with `spinner.cancel(msg)` and `spinner.error(msg)` [source](./.skilld/releases/@clack/prompts@1.0.0.md)

⚠️ `suggestion` prompt — added then removed in v1.0; `path` prompt changed to autocomplete-based [source](./.skilld/releases/@clack/prompts@1.0.0.md)

⚠️ `placeholder` in text prompts — v1.0 changed to visual hint only, no longer tabbable or returned as value [source](./.skilld/releases/@clack/prompts@1.0.0.md)

✨ `autocomplete()` / `autocompleteMultiselect()` — new prompts in v1.0 with custom `filter` function support [source](./.skilld/releases/@clack/prompts@1.0.0.md)

✨ `progress()` — new progress bar prompt in v1.0; uses `stop()`, `cancel()`, `error()` like spinner [source](./.skilld/releases/@clack/prompts@1.0.0.md)

✨ `taskLog()` — new prompt for scrolling log output cleared on success; supports `group()` for nested log sections [source](./.skilld/releases/@clack/prompts@1.0.0.md)

✨ `box()` — new prompt for rendering boxed text, similar to `note` [source](./.skilld/releases/@clack/prompts@1.0.0.md)

✨ `stream.step()` / `stream.*` — new in v0.10, mirrors `log.*` but accepts async iterables for streaming LLM output [source](./.skilld/pkg-prompts/CHANGELOG.md)

✨ `spinner({ indicator: 'timer' })` — new in v0.10, shows elapsed time instead of dots animation [source](./.skilld/pkg-prompts/CHANGELOG.md)

✨ `updateSettings({ messages, aliases })` — v0.9 added global keybinding aliases and v1.0 extended with `messages.cancel`/`messages.error` for i18n; also exposes `settings` object [source](./.skilld/releases/@clack/prompts@1.0.0.md)

✨ `signal` option — v0.9 added `AbortSignal` support to all prompts for programmatic cancellation [source](./.skilld/pkg-prompts/CHANGELOG.md)

✨ `withGuide` option — v1.0 added to all prompts to disable the default clack border guide [source](./.skilld/releases/@clack/prompts@1.0.0.md)

✨ `spinner.clear()` — new in v1.0, stops and clears spinner output entirely [source](./.skilld/releases/@clack/prompts@1.0.0.md)

## Best Practices

✅ Always check `isCancel()` after every prompt — returns a symbol, not `undefined`; unchecked cancels propagate silently and cause runtime errors downstream [source](./.skilld/pkg/README.md)

```ts
import { text, isCancel, cancel } from '@clack/prompts'

const name = await text({ message: 'Name?' })
if (isCancel(name)) {
  cancel('Cancelled.')
  process.exit(0)
}
// `name` is now narrowed to `string`

```
✅ Use `group()` with `onCancel` instead of individual `isCancel` checks — handles cancellation for all prompts in one place [source](./.skilld/pkg/README.md)

```ts
import * as p from '@clack/prompts'

const result = await p.group({
  name: () => p.text({ message: 'Name?' }),
  type: () => p.select({ message: 'Type?', options: [{ value: 'a', label: 'A' }] }),
}, {
  onCancel: () => { p.cancel('Cancelled.'); process.exit(0) },
})
```

✅ Use `signal` for programmatic cancellation and timeouts — `AbortSignal` support on all prompts since v0.9.0 [source](./.skilld/releases/@clack/prompts@0.9.0.md)

```ts
const answer = await confirm({
  message: 'Continue?',
  signal: AbortSignal.timeout(5000),
})
```

✅ Use distinct `stop()`, `cancel()`, `error()` on spinner/progress — v1.0.0 replaced the old `stop(msg, code)` API with explicit methods [source](./.skilld/releases/@clack/prompts@1.0.0.md)

```ts
const s = spinner()
s.start('Working...')
// s.stop('Done')      — success
// s.cancel('Aborted') — user cancelled
// s.error('Failed')   — error occurred
// s.clear()           — stop and erase output
```

✅ Use `placeholder` for visual hints only, `defaultValue` for actual defaults — v1.0.0 treats `placeholder` as purely visual (like HTML `<input placeholder>`), never returned as the value [source](./.skilld/issues/issue-321.md)

```ts
const name = await text({
  message: 'Project name?',
  placeholder: 'my-app',       // grey hint text, NOT returned
  defaultValue: 'my-app',      // returned when user presses Enter
})
```

✅ Pass `onCancel` to spinner when running long operations — detects Ctrl+C during spinner for graceful cleanup [source](./.skilld/releases/@clack/prompts@1.0.0.md)

```ts
const s = spinner({ onCancel: () => cleanup() })
s.start('Installing...')
await install()
if (s.isCancelled) return
s.stop('Installed')
```

✅ Use `updateSettings()` for i18n — customize global cancel/error messages rather than repeating per-instance [source](./.skilld/releases/@clack/prompts@1.0.0.md)

```ts
import { updateSettings } from '@clack/prompts'
updateSettings({
  messages: { cancel: 'Operación cancelada', error: 'Error' },
  aliases: { w: 'up', s: 'down' },  // custom keybindings
})
```

✅ Use `stream` API for LLM/async output — renders iterables with clack's log styling, supports async generators [source](./.skilld/releases/@clack/prompts@0.10.0.md)

```ts
import { stream } from '@clack/prompts'
await stream.step(async function* () { yield* generateResponse() }())
```

✅ v1.0.0 is ESM-only — CJS `require()` no longer works; Node 20+ can use `require()` for ESM via `--experimental-require-module` [source](./.skilld/releases/@clack/prompts@1.0.0.md)

✅ Avoid passing empty `options` array to `select`/`multiselect` — throws `TypeError: Cannot read properties of undefined` with no helpful error message [source](./.skilld/issues/issue-144.md)
