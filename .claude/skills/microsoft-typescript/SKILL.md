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

⚠️ `createImportClause(isTypeOnly, name, namedBindings)` — v6.0 changed first param to `phaseModifier: ImportPhaseModifierSyntaxKind | undefined`, old `isTypeOnly: boolean` overload deprecated [source](./pkg/)

⚠️ `AssertClause` / `createAssertClause()` — deprecated, renamed to `ImportAttributes` / `createImportAttributes()`. Import assertions (`assert {}`) replaced by import attributes (`with {}`) [source](./pkg/)

⚠️ `ModuleResolutionKind.Node10` — deprecated (was already renamed from `NodeJs`). Use `Node16`, `NodeNext`, or `Bundler` [source](./pkg/)

⚠️ `ScriptTarget.ES3` / `ScriptTarget.ES5` — deprecated. `--target es3` and `--target es5` emit deprecated [source](./pkg/)

⚠️ `ModuleKind.AMD` / `ModuleKind.UMD` / `ModuleKind.System` / `ModuleKind.None` — all deprecated [source](./pkg/)

⚠️ `ImportsNotUsedAsValues` — entire enum deprecated. Use `verbatimModuleSyntax: true` instead of `importsNotUsedAsValues` / `preserveValueImports` [source](./pkg/)

⚠️ `downlevelIteration` — compiler option deprecated. No longer needed when targeting ES2015+ [source](./pkg/)

✨ `erasableSyntaxOnly` — new compiler option (v5.8+). Ensures all TypeScript-specific syntax is fully erasable (no `enum`, no `namespace`, no `constructor` parameter properties), aligning with Node.js `--experimental-strip-types` [source](./pkg/)

✨ `isolatedDeclarations` — new compiler option (v5.5+). Enables `.d.ts` generation without full program type-checking, requires explicit return types on exports [source](./pkg/)

✨ `rewriteRelativeImportExtensions` — new compiler option (v5.7+). Rewrites `.ts`/`.tsx` extensions to `.js`/`.jsx` in output, enabling `import "./foo.ts"` source imports [source](./pkg/)

✨ `noUncheckedSideEffectImports` — new compiler option (v5.8+). Reports errors on bare `import "./setup"` if the module file is not found [source](./pkg/)

✨ `--module node18` / `--module node20` — new module targets (v5.9+/v6.0). More precise than `nodenext`, targeting specific Node.js version semantics [source](./pkg/)

✨ `Iterator` helper methods — `lib.es2025.iterator.d.ts` adds `.map()`, `.filter()`, `.flatMap()`, `.take()`, `.drop()`, `.forEach()`, `.some()`, `.every()`, `.find()`, `.reduce()`, `Iterator.from()` on iterator objects [source](./pkg/)

✨ `noCheck` — compiler option (v5.6+). Skips type-checking entirely while still emitting output, useful for fast builds [source](./pkg/)

## Best Practices

✅ Use `using` / `await using` for resource cleanup — automatically calls `[Symbol.dispose]()` when scope exits, replacing manual try/finally [source](./.skilld/pkg/lib/lib.esnext.disposable.d.ts)

```ts
await using db = getConnection()
// db[Symbol.asyncDispose]() called automatically at scope exit

```
✅ Use `DisposableStack` to group multiple disposable resources — `stack.move()` transfers ownership to prevent premature disposal when initialization succeeds [source](./.skilld/pkg/lib/lib.esnext.disposable.d.ts)

✅ Prefer `Iterator.from(iterable)` over spread for lazy iteration — built-in iterator helpers (`map`, `filter`, `take`, `drop`, `flatMap`, `reduce`, `toArray`) chain without allocating intermediate arrays [source](./.skilld/pkg/lib/lib.es2025.iterator.d.ts)

```ts
const first5Even = Iterator.from(values)
  .filter(n => n % 2 === 0)
  .take(5)
  .toArray()
```

✅ Use `Map.getOrInsertComputed()` instead of has/get/set pattern — atomically inserts on cache miss, avoids double-lookup [source](./.skilld/pkg/lib/lib.esnext.collection.d.ts)

```ts
const cached = map.getOrInsertComputed(key, k => expensiveCompute(k))
```

✅ Use `Set` methods for set operations instead of manual loops — `union`, `intersection`, `difference`, `symmetricDifference`, `isSubsetOf`, `isSupersetOf`, `isDisjointFrom` are typed and native [source](./.skilld/pkg/lib/lib.es2025.collection.d.ts)

✅ Use `Promise.try()` instead of `new Promise(resolve => resolve(fn()))` — wraps sync-or-async callbacks correctly, catches sync throws as rejections [source](./.skilld/pkg/lib/lib.es2025.promise.d.ts)

```ts
const result = await Promise.try(mayThrowSync, arg1, arg2)
```

✅ Use `Uint8Array.fromBase64()` / `.toBase64()` / `.toHex()` instead of Buffer or manual conversion — native, typed, supports `base64url` alphabet [source](./.skilld/pkg/lib/lib.esnext.typedarrays.d.ts)

✅ Use `Error.isError(value)` instead of `value instanceof Error` — works across realms (iframes, vm contexts) where `instanceof` fails [source](./.skilld/pkg/lib/lib.esnext.error.d.ts)

✅ Use `RegExp.escape(str)` instead of manual regex escaping — built-in, handles all special chars correctly [source](./.skilld/pkg/lib/lib.es2025.regexp.d.ts)

```ts
const re = new RegExp(RegExp.escape(userInput) + '\\d+')
```
