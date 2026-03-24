---
name: microsoft-typescript
description: "TypeScript is a language for application scale JavaScript development. ALWAYS use when editing or working with *.ts, *.tsx, *.mts, *.cts files or code importing \"typescript\". Consult for debugging, best practices, or modifying typescript, TypeScript."
metadata:
  version: 6.0.2
  generated_by: cached
  generated_at: 2026-03-24
---

# microsoft/TypeScript `typescript`

> TypeScript is a language for application scale JavaScript development

**Version:** 6.0.2
**Tags:** dev: 3.9.4, tag-for-publishing-older-releases: 4.1.6, insiders: 4.6.2-insiders.20220225, latest: 6.0.2, beta: 6.0.0-beta, rc: 6.0.1-rc, next: 6.0.0-dev.20260323

**References:** [package.json](./.skilld/pkg/package.json) — exports, entry points • [README](./.skilld/pkg/README.md) — setup, basic usage • [Docs](./.skilld/docs/_INDEX.md) — API reference, guides • [GitHub Issues](./.skilld/issues/_INDEX.md) — bugs, workarounds, edge cases • [Releases](./.skilld/releases/_INDEX.md) — changelog, breaking changes, new APIs

## Search

Use `skilld search "query" -p typescript` instead of grepping `.skilld/` directories. Run `skilld search --guide -p typescript` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes for TypeScript v5.7+, prioritizing recent major/minor releases.

- BREAKING: `ArrayBuffer` no longer supertype of `TypedArray` types — v5.9 changed `ArrayBuffer` relationships; methods expecting `ArrayBuffer` now reject `Uint8Array`, `Buffer`, etc. Fix by accessing `.buffer` property or using specific `Uint8Array<ArrayBuffer>` types [source](./.skilld/docs/docs/handbook/release-notes/typescript-5-9.html.md#libdts-changes)

- NEW: `import defer * as ns from "module"` — v5.9 syntax for deferred module evaluation; module loading deferred until namespace accessed, useful for conditional/lazy imports. Only supports namespace imports, not named/default exports [source](./.skilld/docs/docs/handbook/release-notes/typescript-5-9.html.md#support-for-import-defer)

- BREAKING: `TypedArray` generics over `ArrayBufferLike` — v5.7+ made all `TypedArray` types generic (`Uint8Array<TArrayBuffer>`), breaking code passing `Buffer`/`Uint8Array` where `ArrayBuffer` expected. Update `@types/node` and specify explicit buffer type or use `.buffer` property [source](./.skilld/docs/docs/handbook/release-notes/typescript-5-7.html.md#typedarrays-are-now-generic-over-arraybufferlike)

- NEW: `--module node20` — v5.9 stable option modeling Node.js v20 behavior; unlike `nodenext`, implies `--target es2023` and is not floating. Use when locked to Node.js v20 [source](./.skilld/docs/docs/handbook/release-notes/typescript-5-9.html.md#support-for---module-node20)

- NEW: `--erasableSyntaxOnly` option — v5.8 flag for Node.js 23.6+ `--experimental-strip-types` mode; errors on non-erasable TypeScript constructs (`enum`, `namespace` with code, parameter properties, `import =`, `export =`) [source](./.skilld/docs/docs/handbook/release-notes/typescript-5-8.html.md#the---erasablesyntaxonly-option)

- NEW: `--module node18` — v5.8 stable option for Node.js 18; disallows `require()` of ESM but allows import assertions (unlike `nodenext`) [source](./.skilld/docs/docs/handbook/release-notes/typescript-5-8.html.md#--module-node18)

- NEW: `require()` of ECMAScript modules — v5.8 `--module nodenext` now permits `require("esm")` from CommonJS (Node.js 22+), except for ESM with top-level `await` [source](./.skilld/docs/docs/handbook/release-notes/typescript-5-8.html.md#support-for-require-of-ecmascript-modules-in---module-nodenext)

- BREAKING: Import assertions deprecated in `--module nodenext` — v5.8 rejects `assert { type: "json" }` syntax in favor of `with { type: "json" }` [source](./.skilld/docs/docs/handbook/release-notes/typescript-5-8.html.md#restrictions-on-import-assertions-under---module-nodenext)

- NEW: `--rewriteRelativeImportExtensions` option — v5.7 compiler option rewrites relative `.ts` imports to `.js` when emitting, enabling in-place execution then compilation [source](./.skilld/docs/docs/handbook/release-notes/typescript-5-7.html.md#path-rewriting-for-relative-paths)

- NEW: `--target es2024` and `--lib es2024` — v5.7 support for ES2024 features (`Object.groupBy`, `Map.groupBy`, `Promise.withResolvers`, `SharedArrayBuffer` types) [source](./.skilld/docs/docs/handbook/release-notes/typescript-5-7.html.md#support-for---target-es2024-and---lib-es2024)

- NEW: Granular return expression checking — v5.8 type-checks each branch of conditional `return` statements against declared return type, catching type mismatches with `any` corruption [source](./.skilld/docs/docs/handbook/release-notes/typescript-5-8.html.md#granular-checks-for-branches-in-return-expressions)

- BREAKING: JSON import validation in `--module nodenext` — v5.7 requires `with { type: "json" }` attribute for JSON imports; no named exports, only default [source](./.skilld/docs/docs/handbook/release-notes/typescript-5-7.html.md#validated-json-imports-in---module-nodenext)

- NEW: `--libReplacement` flag — v5.8 option to disable/enable `@typescript/lib-*` package lookup; default behavior may change in future versions [source](./.skilld/docs/docs/handbook/release-notes/typescript-5-8.html.md#the---libreplacement-flag)

- BREAKING: Index signatures from non-literal class methods — v5.7 now generates index signatures for non-literal computed method names (e.g., `[symbolName]() {}`), changing class type shape [source](./.skilld/docs/docs/handbook/release-notes/typescript-5-7.html.md#creating-index-signatures-from-non-literal-method-names-in-classes)

- NEW: Preserved computed property names in declarations — v5.8 preserves entity names (bare variables, dotted names) in computed property declarations in classes [source](./.skilld/docs/docs/handbook/release-notes/typescript-5-8.html.md#preserved-computed-property-names-in-declaration-files)

**Also changed:** Checks for never-initialized variables (v5.7) · Minimal `tsc --init` output (v5.9) · Type argument inference changes may introduce new errors (v5.9) · V8 compile caching in Node.js (v5.7) · More implicit `any` errors on functions returning `null`/`undefined` (v5.7) · Expandable hovers preview (v5.9) · Configurable hover length `js/ts.hover.maximumLength` (v5.9) · Search ancestor `tsconfig.json` files (v5.7) · Faster project ownership checks for composite projects (v5.7)
<!-- /skilld:api-changes -->

<!-- skilld:best-practices -->
## Best Practices

- Use lowercase primitive type names (`string`, `number`, `boolean`, `symbol`) rather than capitalized versions (`String`, `Number`, `Boolean`, `Symbol`), which refer to boxed objects rarely used in JavaScript code [source](./.skilld/docs/handbook/declaration-files/do-s-and-don-ts.html.md:L154:L172)

- Avoid `any` unless actively migrating JavaScript to TypeScript; prefer `unknown` when the input type is truly unknown, as it forces explicit type checking before use [source](./.skilld/docs/handbook/declaration-files/do-s-and-don-ts.html.md:L178:L182)

- Use `void` for callback return types when the return value will be ignored; this prevents accidental access to the return value and catches real bugs [source](./.skilld/docs/handbook/declaration-files/do-s-and-don-ts.html.md:L196:L210)

```ts
// Good - prevents accidental use of return value
function fn(x: () => void) {
  x(); // return value is ignored
}
```

- Write callback parameters as required rather than optional unless you specifically need to allow invocation with fewer arguments; optional parameters create misleading contracts about how the callback can be called [source](./.skilld/docs/handbook/declaration-files/do-s-and-don-ts.html.md:L212:L230)

- Order function overloads from specific signatures to general ones; TypeScript selects the first matching overload, so more specific cases must come before general ones [source](./.skilld/docs/handbook/declaration-files/do-s-and-don-ts.html.md:L254:L272)

- Use optional parameters instead of multiple overloads that differ only in trailing parameters; this enables better error detection in higher-order functions and respects strict null checks [source](./.skilld/docs/handbook/declaration-files/do-s-and-don-ts.html.md:L274:L310)

- Use union types instead of overloads when signatures differ only in the type of a single argument; union signatures enable "pass-through" patterns where values can be forwarded without losing type information [source](./.skilld/docs/handbook/declaration-files/do-s-and-don-ts.html.md:L312:L338)

- Avoid writing generic types that don't use their type parameter, as unused generics provide no type safety benefit and confuse readers about intent [source](./.skilld/docs/handbook/declaration-files/do-s-and-don-ts.html.md:L174:L177)

- Enable strict compiler options in `tsconfig.json`: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and `verbatimModuleSyntax` catch real bugs at compile time rather than runtime [source](./.skilld/docs/handbook/release-notes/typescript-5-9.html.md:L160:L166)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force"
  }
}
```

- Rely on contextual typing to infer callback parameter types rather than explicitly annotating each one; TypeScript infers parameter types from the context in which the callback is used, reducing boilerplate [source](./.skilld/docs/handbook/type-inference.html.md:L194:L242)

- Use utility types like `Pick`, `Omit`, `Partial`, `Required`, and `Record` to transform existing types instead of manually rewriting object shapes; these compose reliably and reduce duplication [source](./.skilld/docs/handbook/utility-types.html.md:L152:L232)

- Provide explicit type annotations for array/collection literals when TypeScript's "best common type" algorithm fails; this is necessary when array elements have no single common base type across all candidates [source](./.skilld/docs/handbook/type-inference.html.md:L164:L192)

```ts
// TypeScript infers (Rhino | Elephant | Snake)[] without annotation
// Explicit annotation needed to get Animal[]
const zoo: Animal[] = [new Rhino(), new Elephant(), new Snake()]
```
<!-- /skilld:best-practices -->
