---
name: microsoft-typescript
description: "ALWAYS use when editing or working with *.ts, *.tsx, *.mts, *.cts files or code importing \"typescript\". Consult for debugging, best practices, or modifying typescript, TypeScript."
metadata:
  version: 6.0.0-beta
  generated_by: Claude Code · Opus 4.6
---

# microsoft/TypeScript `typescript`

**Version:** 6.0.0-beta (4 months ago)
**Tags:** dev: 3.9.4 (5 years ago), tag-for-publishing-older-releases: 4.1.6 (4 years ago), insiders: 4.6.2-insiders.20220225 (3 years ago), rc: 5.9.1-rc (6 months ago), latest: 5.9.3 (4 months ago), beta: 6.0.0-beta (2 days ago), next: 6.0.0-dev.20260213 (today)

**References:** [package.json](./.skilld/pkg/package.json) — exports, entry points • [README](./.skilld/pkg/README.md) — setup, basic usage • [GitHub Issues](./.skilld/issues/_INDEX.md) — bugs, workarounds, edge cases • [Releases](./.skilld/releases/_INDEX.md) — changelog, breaking changes, new APIs

## Search

Use `npx -y skilld search` instead of grepping `.skilld/` directories — hybrid semantic + keyword search across all indexed docs, issues, and releases.

```bash
npx -y skilld search "query" -p typescript
npx -y skilld search "issues:error handling" -p typescript
npx -y skilld search "releases:deprecated" -p typescript
```

Filters: `docs:`, `issues:`, `releases:` prefix narrows by source type.

## API Changes

⚠️ `erasableSyntaxOnly` — new in v6.0, when enabled disallows runtime-emitted TS syntax (enums, namespaces, parameter properties, non-`declare` class fields with `useDefineForClassFields: false`); required for `--noEmit` + Node.js `--experimental-strip-types` workflows [source](./.skilld/releases/blog-6.0.md)

⚠️ `ModuleKind.None` / `AMD` / `UMD` / `System` — deprecated in v6.0, use `ES2015`+ / `Node16`+ / `NodeNext` / `Preserve` instead [source](./.skilld/pkg/lib/typescript.d.ts)

✨ `ModuleKind.Node18` / `Node20` — new in v6.0, target specific Node.js version module semantics (alongside existing `Node16` and `NodeNext`) [source](./.skilld/pkg/lib/typescript.d.ts)

✨ `noCheck` — new compiler option (v5.6+), skips type checking entirely while still emitting declarations/JS; replaces `skipLibCheck` for full-skip use cases [source](./.skilld/pkg/lib/typescript.d.ts)

✨ `isolatedDeclarations` — new in v5.5, requires annotations on exported declarations so `.d.ts` can be generated without type checking (enables parallel declaration emit) [source](./.skilld/pkg/lib/typescript.d.ts)

⚠️ `ImportClause` API changed — `createImportClause(isTypeOnly, name, namedBindings)` deprecated, use `createImportClause(phaseModifier, name, namedBindings)` where `phaseModifier` is `SyntaxKind.TypeKeyword | SyntaxKind.DeferKeyword | undefined`; `DeferKeyword` supports deferred import evaluation proposal [source](./.skilld/pkg/lib/typescript.d.ts)

⚠️ `AssertClause`/`AssertEntry` — deprecated, renamed to `ImportAttributes`/`ImportAttribute`; `assert` keyword replaced by `with` keyword (`import x from 'y' with { type: 'json' }`) [source](./.skilld/pkg/lib/typescript.d.ts)

✨ `rewriteRelativeImportExtensions` — new in v5.7, rewrites `.ts`/`.tsx`/`.mts`/`.cts` extensions in relative imports to `.js`/`.jsx`/`.mjs`/`.cjs` in output; enables writing `.ts` extensions in source [source](./.skilld/pkg/lib/typescript.d.ts)

✨ `noUncheckedSideEffectImports` — new in v5.6, reports errors on bare `import 'module'` statements when the module can't be resolved [source](./.skilld/pkg/lib/typescript.d.ts)

✨ `NoInfer<T>` — new intrinsic utility type (v5.4+), prevents inference from a type parameter position; use to force explicit type arguments instead of accidental widening [source](./.skilld/pkg/lib/lib.es5.d.ts)

⚠️ `ScriptTarget.ES3` / `ES5` — deprecated, minimum recommended target is `ES2015`+ [source](./.skilld/pkg/lib/typescript.d.ts)

✨ `Promise.try()` — new in `lib.es2025.promise`, wraps sync/async callbacks into a Promise: `Promise.try(() => mayThrow())` [source](./.skilld/pkg/lib/lib.es2025.promise.d.ts)

✨ `RegExp.escape()` — new in `lib.es2025.regexp`, escapes regex metacharacters: `new RegExp(RegExp.escape(userInput))` [source](./.skilld/pkg/lib/lib.es2025.regexp.d.ts)

✨ `Iterator.from()` / `IteratorObject` helpers — new in `lib.es2025.iterator`, built-in `.map()`, `.filter()`, `.take()`, `.drop()`, `.flatMap()`, `.reduce()`, `.toArray()`, `.forEach()` on iterators [source](./.skilld/pkg/lib/lib.es2025.iterator.d.ts)

⚠️ `verbatimModuleSyntax` — v5.5+ replaces both `importsNotUsedAsValues` (deprecated) and `preserveValueImports` (deprecated); use `import type` explicitly or enable this flag [source](./.skilld/pkg/lib/typescript.d.ts)

## Best Practices

✅ Set `erasableSyntaxOnly: true` for Node.js `--experimental-strip-types` compatibility — ensures no TypeScript syntax that requires runtime emit (enums, namespaces, parameter properties) [source](./.skilld/pkg/lib/typescript.d.ts)

✅ Use `noCheck: true` to skip type-checking while still emitting `.d.ts` and `.js` — useful for fast builds when editor already reports errors [source](./.skilld/pkg/lib/typescript.d.ts)

✅ Use `verbatimModuleSyntax: true` instead of deprecated `importsNotUsedAsValues` and `preserveValueImports` — enforces explicit `import type` for type-only imports [source](./.skilld/pkg/lib/typescript.d.ts)

✅ Target `"ES2025"` to get `Set` methods, `Promise.try`, `Iterator` helpers, `RegExp.escape`, `Map.getOrInsert`, and `Float16Array` without polyfills [source](./.skilld/pkg/lib/lib.es2025.d.ts)

```json
{ "compilerOptions": { "target": "ES2025", "lib": ["ES2025"] } }

```
✅ Use `Map.getOrInsert`/`getOrInsertComputed` instead of `has()`-then-`set()` pattern — atomic get-or-create avoids race conditions and redundant lookups (lib `"ESNext"`) [source](./.skilld/pkg/lib/lib.esnext.collection.d.ts)

```ts
const cache = new Map<string, Item[]>()
cache.getOrInsertComputed(key, () => []).push(item)
```

✅ Use `using`/`await using` with `DisposableStack` for deterministic cleanup — replaces try/finally for file handles, connections, event listeners (lib `"ESNext.Disposable"`) [source](./.skilld/pkg/lib/lib.esnext.disposable.d.ts)

```ts
using stack = new DisposableStack()
const conn = stack.use(getConnection())
const sub = stack.adopt(emitter, e => e.removeAllListeners())
stack.defer(() => cleanup())
```

✅ Prefer `Promise.try()` over `new Promise(resolve => resolve(fn()))` — wraps sync-or-async callbacks into promises without boilerplate (lib `"ES2025.Promise"`) [source](./.skilld/pkg/lib/lib.es2025.promise.d.ts)

✅ Use `Uint8Array.fromBase64()`/`.toBase64()` instead of `btoa`/`atob` — handles binary data directly without string encoding issues, supports `base64url` alphabet (lib `"ESNext.TypedArrays"`) [source](./.skilld/pkg/lib/lib.esnext.typedarrays.d.ts)

✅ Use `customConditions` to resolve package.json `exports` with custom conditions — enables framework-specific entry points (e.g., `"react-server"`) without bundler hacks [source](./.skilld/pkg/lib/typescript.d.ts)
