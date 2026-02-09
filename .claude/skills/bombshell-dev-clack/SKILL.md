---
name: bombshell-dev-clack-skilld
description: "Using code importing from \"@clack/prompts\". Researching or debugging @clack/prompts, clack/prompts, clack prompts, clack."
version: 1.0.0
generated_by: Claude Code · Haiku 4.5
---

# bombshell-dev/clack `@clack/prompts`

**Version:** 1.0.0 (1 week ago)
**Deps:** picocolors@^1.0.0, sisteransi@^1.0.5, @clack/core@1.0.0
**Tags:** latest: 1.0.0 (1 week ago), alpha: 1.0.0-alpha.10 (1 week ago)

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [GitHub Issues](./.skilld/issues/_INDEX.md) • [Releases](./.skilld/releases/)

## Search

Use `npx skilld search` instead of grepping `.skilld/` directories — hybrid semantic + keyword search across all indexed docs, issues, and releases.

```bash
npx skilld search "query" -p @clack/prompts
npx skilld search "issues:error handling" -p @clack/prompts
npx skilld search "releases:deprecated" -p @clack/prompts
```

Filters: `docs:`, `issues:`, `releases:` prefix narrows by source type.

## LLM Gaps

⚠️ **ESM-only in v1** — v1.0.0 is ESM-only, v0 was dual CJS/ESM. Node v20+ requires `--input-type=module` or `.mjs` extension. [source](./@clack/prompts@1.0.0.md)

⚠️ **Spinner API changed** — `spinner.stop(undefined, 1)` for cancel and `spinner.stop(undefined, 2)` for error are now `spinner.cancel()` and `spinner.error()`. Old code silently fails. [source](./@clack/prompts@1.0.0.md)

⚠️ **`suggestion` prompt removed** — v1 removed the standalone `suggestion` prompt. Use `autocomplete` or the new `path` prompt (which is autocomplete-based) instead. [source](./@clack/prompts@1.0.0.md)

⚠️ **Placeholder not used as value** — `placeholder` is visual-only since v1, doesn't populate return value if user presses Enter without typing. Use `initialValue` for defaults. [source](./issue-321.md)

⚠️ **Long spinner messages wrap badly** — Messages near terminal width overflow and duplicate/misalign. Truncate messages or test in narrow terminals. [source](./issue-237.md)

⚠️ **Spinner doesn't auto-cleanup** — Spinner leaves process hanging if not properly stopped. Always call `stop()`, `cancel()`, or `error()` to cleanup stdin. [source](./issue-348.md)

⚠️ **Multiline option rendering buggy** — Options with 2+ lines show selection highlight in wrong places when navigating. Wrap long text or split into single lines. [source](./issue-116.md)

⚠️ **Settings now customizable globally** — Use `updateSettings({ messages: { cancel: '...', error: '...' } })` for i18n/multilingual CLIs, not just per-instance options. [source](./@clack/prompts@1.0.0.md)

⚠️ **New `userInput` separate from `value`** — Prompts now store `userInput` (raw user text) separately from `value` (processed). Existing code expecting single field works but loses raw input. [source](./@clack/prompts@1.0.0.md)

⚠️ **Progress/Spinner no longer auto-exit** — Must explicitly call `stop()` or the process hangs. Generators and async functions don't auto-stop on completion. [source](./issue-348.md)

# Best Practices

✅ Use `isCancel()` with all prompts to detect user cancellation — enables graceful Ctrl+C handling [source](./.skilld/pkg/README.md)

```ts
import { isCancel, cancel, text } from '@clack/prompts';

const value = await text({ message: 'Input:' });
if (isCancel(value)) {
  cancel('Cancelled');
  process.exit(0);
}

```
✅ Use `group()` with `onCancel` callback for multi-prompt flows — prevents partial state on interruption [source](./.skilld/pkg/README.md)

```ts
const results = await group({
  name: () => text({ message: 'Name?' }),
  email: ({ results }) => text({ message: `Email for ${results.name}?` }),
}, {
  onCancel: () => {
    cancel('Operation cancelled');
    process.exit(0);
  }
});
```

✅ Call `spinner.stop()`, `spinner.cancel()`, or `spinner.error()` explicitly — don't use legacy code parameter API [source](./.skilld/releases/@clack/prompts@1.0.0.md)

```ts
const s = spinner();
s.start('Processing');
// ...
s.stop('Done');           // success
s.cancel('User cancelled'); // cancellation
s.error('Failed!');        // error
```

✅ Customize global messages via `updateSettings()` for multilingual CLIs — applies to all spinner instances [source](./.skilld/releases/@clack/prompts@1.0.0.md)

```ts
import * as prompts from '@clack/prompts';

prompts.updateSettings({
  messages: {
    cancel: 'Operación cancelada',
    error: 'Se produjo un error',
  }
});
```

✅ Use `taskLog()` for subprocess output — automatically clears logs on success [source](./.skilld/releases/@clack/prompts@1.0.0.md)

```ts
const log = taskLog({ title: 'Running npm install' });
for await (const line of npmProcess()) {
  log.message(line);
}
log.success('Done!'); // clears all logged lines
```

✅ Pass custom `filter` to `autocompleteMultiselect` for fuzzy search — enables user-defined matching logic [source](./.skilld/releases/@clack/prompts@1.0.0.md)

```ts
import { autocompleteMultiselect } from '@clack/prompts';

const selected = await autocompleteMultiselect({
  message: 'Select packages:',
  options: [...],
  filter: (value, options) => {
    // Custom fuzzy matching or filtering
    return options.filter(opt => opt.label.includes(value));
  }
});
```

✅ Use `progress()` with `max` and `advance()` for long operations — provides visual feedback on task completion [source](./.skilld/pkg/README.md)

```ts
const p = progress({ max: 100 });
p.start('Downloading');
for (let i = 0; i < 100; i += 10) {
  await delay(100);
  p.advance(i, `Progress: ${i}%`);
}
p.stop('Complete');
```

✅ Set `required: false` on `multiselect` and `autocompleteMultiselect` — allows zero selections [source](./.skilld/pkg/README.md)

```ts
const tools = await multiselect({
  message: 'Additional tools (optional)?',
  options: [...],
  required: false, // allows []
});
```

✅ Use `selectableGroups: false` in `groupMultiselect` to disable group-level selection — still allows selecting all children [source](./.skilld/releases/@clack/prompts@1.0.0.md)

```ts
const items = await groupMultiselect({
  message: 'Select items:',
  options: { fruits: [...], veggies: [...] },
  selectableGroups: false, // can't select whole group, only items
});
```

✅ ESM-only in v1.0.0+ — use Node 20+ `--input-type=module` or conditional imports for CJS [source](./.skilld/releases/@clack/prompts@1.0.0.md)

```json
{
  "type": "module",
  "exports": "./dist/index.js"
}
```
