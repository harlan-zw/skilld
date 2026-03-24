---
name: sindresorhus-log-update
description: "Log by overwriting the previous output in the terminal. Useful for rendering progress bars, animations, etc. ALWAYS use when writing code importing \"log-update\". Consult for debugging, best practices, or modifying log-update, log update."
metadata:
  version: 7.2.0
  generated_by: cached
  generated_at: 2026-03-24
---

# sindresorhus/log-update `log-update`

> Log by overwriting the previous output in the terminal. Useful for rendering progress bars, animations, etc.

**Version:** 7.2.0
**Deps:** ansi-escapes@^7.3.0, cli-cursor@^5.0.0, slice-ansi@^8.0.0, strip-ansi@^7.2.0, wrap-ansi@^10.0.0
**Tags:** latest: 7.2.0

**References:** [package.json](./.skilld/pkg/package.json) — exports, entry points • [GitHub Issues](./.skilld/issues/_INDEX.md) — bugs, workarounds, edge cases • [Releases](./.skilld/releases/_INDEX.md) — changelog, breaking changes, new APIs

## Search

Use `skilld search "query" -p log-update` instead of grepping `.skilld/` directories. Run `skilld search --guide -p log-update` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes — prioritize recent major/minor releases.

- BREAKING: Node.js requirement updated from 18 to 20 in v7.0.0 — code targeting earlier Node.js versions will fail at runtime [source](./.skilld/releases/v7.0.0.md#breaking)

- NEW: `persist(...text)` method added in v7.0.0 — writes output that persists in terminal scrollback, unlike the main `logUpdate()` which updates in place [source](./.skilld/releases/v7.0.0.md#improvements)

- NEW: `defaultWidth` option added in v7.0.0 — allows specifying terminal width (default: 80) when the stream doesn't provide `columns` property, useful for piped or redirected output [source](./.skilld/releases/v7.0.0.md#improvements)

- NEW: `defaultHeight` option added in v7.0.0 — allows specifying terminal height (default: 24) when the stream doesn't provide `rows` property, useful for piped or redirected output [source](./.skilld/releases/v7.0.0.md#improvements)

**Also changed:** Partial update rendering optimization v7.0.0 · Trailing newline handling fixes v7.0.1–v7.0.2
<!-- /skilld:api-changes -->

<!-- skilld:best-practices -->
## Best Practices

- Use `.persist()` for permanent terminal output that should remain in scrollback history — it writes like `console.log()` instead of updating in-place, ideal for results or status messages that users need to scroll back to review [source](./.skilld/pkg/index.d.ts:L45:66)

- Call `.done()` before starting a new log session to persist the current output and prepare for fresh updates below — prevents scrollback contamination [source](./.skilld/pkg/readme.md#logUpdateDone)

- Enable `showCursor: true` when your CLI accepts user input or displays a prompt — otherwise the hidden cursor creates a poor UX for interactive interfaces [source](./.skilld/pkg/readme.md#showCursor)

- Set `defaultWidth` and `defaultHeight` options when output is piped, redirected, or running in non-TTY environments — without this, the library assumes 80x24 which causes incorrect line wrapping and erasure [source](./.skilld/releases/v7.0.0.md#improvements)

- Create separate `logUpdate` instances via `createLogUpdate(stream)` for each independent update context instead of reusing the default export — prevents one instance's updates from clobbering another's [source](./.skilld/pkg/index.d.ts:L74:87)

- Understand that log-update can only erase and rewrite lines currently visible in the terminal viewport — content already in scrollback cannot be manipulated, so extremely long outputs will overflow and "leak" [source](./.skilld/issues/issue-10.md)

- Account for ANSI escape sequences in output width calculations — the library properly handles colorized text with tools like chalk/yoctocolors and accounts for their escape codes when calculating line wrapping [source](./.skilld/issues/issue-12.md)

- Use `logUpdateStderr` for error messages and warnings instead of `logUpdate` — maintains separation between stdout and stderr streams [source](./.skilld/pkg/index.d.ts:L69:81)

- Leverage partial/synchronized rendering in v7.1.0+ for reduced flicker when updating large outputs — the library now intelligently redraws only changed lines instead of erasing everything [source](./.skilld/releases/v7.1.0.md)

- Be aware that multiple consecutive blank lines at the end of output may collapse to a single blank line during rendering optimization — design output that doesn't rely on exact blank line preservation [source](./.skilld/issues/issue-62.md)
<!-- /skilld:best-practices -->
