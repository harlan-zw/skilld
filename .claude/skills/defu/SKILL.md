---
name: defu
description: Recursively assign default properties. Lightweight and Fast! Use this skill when working with defu, importing from "defu", or when the user asks about defu features, API, or usage.
version: "6.1.4"
---

# defu Skill Reference

## Quick Reference

**Purpose:** Recursively assign default properties. Preserves leftmost (destination) values, merges nested objects, concatenates arrays.

**Key Gotcha:** Nullish values (null/undefined) are skipped entirely—not treated as overridable defaults. Use a different library if you need to preserve or override with nullish values.

## API Reference

| Export | Signature | Purpose |
|--------|-----------|---------|
| `defu` | `defu(object, ...defaults)` | Recursive merge with leftmost priority |
| `createDefu` | `createDefu(merger)` | Factory to create custom merger instance |
| `defuFn` | `defuFn(fns, defaults)` | Call functions for user-provided values; skip if user didn't provide |
| `defuArrayFn` | `defuArrayFn(fns, defaults)` | Call functions only for array values in defaults |
| `Defu` | `Defu<Target, DefaultsArray>` | Type utility for merged result type |

### `defu(object, ...defaults)`
- **object:** Destination object (not modified)
- **defaults:** One or more source objects (left-to-right priority)
- **Returns:** New merged object
- **Priority:** Leftmost arguments win; later defaults fill gaps only

```js
defu({ a: 1 }, { a: 2, b: 3 }) // { a: 1, b: 3 }
defu({ a: { b: 2 } }, { a: { b: 1, c: 3 } }) // { a: { b: 2, c: 3 } } - recursive!
```

### `createDefu(merger)`
- **merger:** `(obj, key, value) => boolean` - Return true if custom merge applied
- **Returns:** New `defu` function with custom merge logic
- Use when default merge strategy doesn't fit your domain

```js
const sumDefu = createDefu((obj, key, value) => {
  if (typeof obj[key] === 'number' && typeof value === 'number') {
    obj[key] += value;
    return true;
  }
});
sumDefu({ cost: 15 }, { cost: 10 }) // { cost: 25 }
```

### `defuFn(fns, defaults)`
- **fns:** Object with function values for keys
- **defaults:** Object with default values
- **Returns:** Merged object where functions transform user-provided values
- **Behavior:** If user provides a value (in `fns`), that function is called with the default; if user didn't provide, function is kept as-is

```js
defuFn(
  { ignore: val => val.filter(i => i !== 'dist'), count: c => c + 20 },
  { ignore: ['node_modules', 'dist'], count: 10 }
)
// { ignore: ['node_modules'], count: 30 }
```

### `defuArrayFn(fns, defaults)`
- Same as `defuFn` but **only applies to array-type values in defaults**
- Non-array values in defaults are kept as-is in result
- Use when you want function transformation only for arrays

```js
defuArrayFn(
  { ignore: val => val.filter(i => i !== 'dist'), count: () => 20 },
  { ignore: ['node_modules', 'dist'], count: 10 }
)
// { ignore: ['node_modules'], count: () => 20 } - function kept, not called
```

## Best Practices

- **Immutable:** Neither `object` nor `defaults` are mutated; result is always new object
- **Multiple defaults:** Pass multiple sources; leftmost has highest priority
  ```js
  defu(userConfig, appConfig, systemDefaults)
  ```
- **Type safety:** Use `Defu<T, D>` type utility for correct merged types
  ```js
  type Config = Defu<{ foo: 'bar' }, [{ baz: 'qux' }]>
  ```

## Gotchas & Edges

1. **Nullish values are skipped:** `null` and `undefined` are not treated as assignable defaults. They won't override existing properties.
   ```js
   defu({ a: 1 }, { a: null }) // { a: 1 } - null ignored
   ```

2. **Array concatenation, not replacement:**
   ```js
   defu({ arr: ['b', 'c'] }, { arr: ['a'] }) // ['b', 'c', 'a'] - merged!
   ```

3. **Prototype pollution protection:** Keys `__proto__` and `constructor` are skipped entirely for security.

4. **Function merger edge case (`defuFn`):** If default value is undefined, the user's function is kept as-is (not called).