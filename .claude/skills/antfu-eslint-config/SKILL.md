---
name: @antfu/eslint-config
description: Documentation for @antfu/eslint-config. Use this skill when working with @antfu/eslint-config or importing from "@antfu/eslint-config".
version: "6.7.3"
---

# @antfu/eslint-config

## Quick Reference

```js
import antfu from '@antfu/eslint-config'
export default antfu()
```

**Key principle:** Single quotes, no semicolons, sorted imports, dangling commas. Designed as a standalone formatter—no Prettier needed.

## API

### Main Export

```ts
antfu(options?, ...flatConfigs): FlatConfigComposer
```

**Options object:**

| Option | Type | Default | Notes |
|--------|------|---------|-------|
| `type` | `'lib' \| 'app'` | `'app'` | Library-specific rules if `'lib'` |
| `ignores` | `string[] \| ((defaults: string[]) => string[])` | (built-in) | Extends default ignores, doesn't override |
| `gitignore` | `boolean` | `true` | Parse `.gitignore` for ignores |
| `stylistic` | `boolean \| { indent: 2\|4\|'tab', quotes: 'single'\|'double' }` | `true` | Format/style rules |
| `typescript` | `boolean \| { tsconfigPath: string }` | auto-detected | Enable type-aware rules with `tsconfigPath` |
| `vue` | `boolean \| { vueVersion: 2\|3, a11y: boolean, overrides: {} }` | auto-detected | Vue 3 default; Vue 2 in maintenance mode only |
| `react` | `boolean` | `false` | Requires manual install of peer deps |
| `nextjs` | `boolean` | `false` | Requires manual install of peer deps |
| `svelte` | `boolean` | `false` | Requires manual install of peer deps |
| `astro` | `boolean` | `false` | Requires manual install of peer deps |
| `solid` | `boolean` | `false` | Requires manual install of peer deps |
| `unocss` | `boolean` | `false` | Requires manual install of peer deps |
| `jsonc` | `boolean` | `true` | JSON with comments support |
| `yaml` | `boolean` | `true` | YAML support |
| `markdown` | `boolean` | `true` | Markdown support |
| `toml` | `boolean` | `true` | TOML support |
| `formatters` | `{ css?: boolean\|'prettier'\|'dprint', html?: boolean, markdown?: 'prettier'\|'dprint' }` | `false` | Format non-JS files; requires `eslint-plugin-format` |
| `isInEditor` | `boolean` | auto-detected | Disables auto-fix for certain rules in editor mode |
| `lessOpinionated` | `boolean` | `false` | Removes strict function/control flow opinions |

**Return:** `FlatConfigComposer` with chainable methods:
- `.override(name, config)` - Override named config
- `.prepend(...configs)` - Add configs before main
- `.renamePlugins({ oldPrefix: 'newPrefix' })` - Remap plugin names
- `.append(...configs)` - Add configs after main

### Fine-Grained Imports

```ts
import {
  combine,
  javascript,
  typescript,
  vue,
  react,
  jsonc,
  yaml,
  markdown,
  toml,
  stylistic,
  comments,
  imports,
  unicorn,
  jsdoc,
  node,
  sortPackageJson,
  sortTsconfig,
} from '@antfu/eslint-config'
```

Each is a function that returns ESLint flat config(s). Use `combine(...configs)` to compose.

## Plugin Name Remapping

This config renames plugins for consistency. When overriding rules or using `eslint-disable` comments:

| New Prefix | Original | Source |
|-----------|----------|--------|
| `import/*` | `import-lite/*` | eslint-plugin-import-lite |
| `node/*` | `n/*` | eslint-plugin-n |
| `yaml/*` | `yml/*` | eslint-plugin-yml |
| `ts/*` | `@typescript-eslint/*` | @typescript-eslint/eslint-plugin |
| `style/*` | `@stylistic/*` | @stylistic/eslint-plugin |
| `test/*` | `vitest/*` or `no-only-tests/*` | @vitest/eslint-plugin / eslint-plugin-no-only-tests |
| `next/*` | `@next/next` | @next/eslint-plugin-next |

```js
// eslint-disable-next-line ts/consistent-type-definitions (NOT @typescript-eslint/...)
type Foo = { bar: string }
```

To revert: `.renamePlugins({ ts: '@typescript-eslint' })`

## Config Rules Override

Use `overrides` option or add separate flat config objects:

```js
antfu({
  vue: {
    overrides: {
      'vue/operator-linebreak': ['error', 'before'],
    },
  },
  typescript: {
    overrides: {
      'ts/consistent-type-definitions': ['error', 'interface'],
    },
  },
},
{
  files: ['**/*.ts'],
  rules: {
    'style/semi': ['error', 'always'], // Override for TS only
  },
})
```

**Critical:** File-specific rules need `files` glob to work correctly.

## Vue Configuration

Auto-detected; explicitly enable with `vue: true`.

**Vue 2** (EOL, maintenance mode only):
```js
antfu({ vue: { vueVersion: 2 } })
```

**Accessibility** (requires manual peer dep install):
```js
antfu({ vue: { a11y: true } })
// Then: npm i -D eslint-plugin-vuejs-accessibility
```

## TypeScript Type-Aware Rules

Requires `tsconfigPath`:

```js
antfu({
  typescript: {
    tsconfigPath: 'tsconfig.json',
  },
})
```

## Formatters

Format CSS/HTML/Markdown via ESLint (no Prettier):

```js
antfu({
  formatters: {
    css: true,        // Prettier (default)
    html: true,       // Prettier (default)
    markdown: 'prettier' // or 'dprint'
  }
})
// Requires: npm i -D eslint-plugin-format
```

## Optional Plugins (Require Manual Install)

React, Next.js, Svelte, Astro, Solid, UnoCSS require peer deps. Enable and let ESLint prompt you, or install manually:

```bash
# React
npm i -D @eslint-react/eslint-plugin eslint-plugin-react-hooks eslint-plugin-react-refresh

# Next.js
npm i -D @next/eslint-plugin-next

# Svelte
npm i -D eslint-plugin-svelte

# Astro
npm i -D eslint-plugin-astro

# Solid
npm i -D eslint-plugin-solid

# UnoCSS
npm i -D @unocss/eslint-plugin
```

## Command Comments (Codemods)

Enable via `command` rule (powered by `eslint-plugin-command`). Trigger one-line transformations:

```ts
/// to-function
const foo = async (msg: string) => console.log(msg)
// ↓ After fix ↓
async function foo(msg: string) {
  console.log(msg)
}
```

Other triggers: `to-arrow`, `to-for-each`, `to-for-of`, `keep-sorted`, etc.

## Best Practices

- **Config as code:** ESLint flat config composes flexibly—always return the composer object, chain methods.
- **Ignores strategy:** `ignores` option *extends* defaults, never overrides. Use function form if you need to filter defaults.
- **Editor mode:** Auto-fix disabled for `prefer-const`, `no-unused-imports`, etc. in editors to prevent accidental deletions during refactoring. Disable with `isInEditor: false`.
- **Type-aware rules:** Expensive; only enable if you need them and provide `tsconfigPath`.
- **Vue 2 is EOL:** Upgrade to Vue 3 when possible; Vue 2 support limited to bug fixes.
- **Personal config:** Review changes on every update—this reflects opinionated preferences that may not suit all projects.

## Gotchas

- **No `.eslintignore` in flat config:** Use `ignores` option instead.
- **Plugin naming collision risk:** Renaming plugins to top-level prefixes is intentional but unconventional. Combine with other configs carefully.
- **Rules disabled in editor by default:** If you rely on auto-fix for `prefer-const` during refactoring, set `isInEditor: false`.
- **Vue 2 vueVersion mismatch:** Explicitly set `vueVersion: 2` if on Vue 2; default is Vue 3.
- **Type-aware rules + no tsconfigPath:** Type rules won't work; they silently fail if `tsconfigPath` missing.
- **`formatters` requires separate plugin:** CSS/HTML formatting won't work without installing `eslint-plugin-format`.
- **Prettier conflict:** If Prettier is installed, disable it in your editor config (see IDE setup sections in original docs).