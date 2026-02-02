---
name: defu
description: Use when working with defu or importing from "defu".
---

## Core API

`defu(object, ...defaults): object` - recursively assign defaults, left args have priority

`createDefu(merger): defuFn` - custom merger strategy with `(obj, key, value) => boolean`

`defuFn(object, defaults): object` - call functions in object with default values instead of merging

`defuArrayFn(object, defaults): object` - call functions only for array values in defaults

## Patterns

```ts
import { defu } from "defu";

// Basic recursive merge
const config = defu(
  { api: { timeout: 5000 } },
  { api: { timeout: 3000, retries: 3 } }
);
// { api: { timeout: 5000, retries: 3 } }

// Multiple defaults, left wins
const opts = defu(
  { color: "red" },
  { color: "blue", size: "lg" },
  { color: "green", size: "md", theme: "dark" }
);
// { color: "red", size: "lg", theme: "dark" }

// Function values to transform defaults
import { defuFn } from "defu";

defuFn(
  { items: (arr) => arr.filter(x => x !== "skip") },
  { items: ["a", "skip", "b"] }
);
// { items: ['a', 'b'] }

```ts
// Custom merger for specific logic
import { createDefu } from "defu";

const sumNumbers = createDefu((obj, key, value) => {
  if (typeof obj[key] === "number" && typeof value === "number") {
    obj[key] += value;
    return true;
  }
});

sumNumbers({ count: 10 }, { count: 5 }); // { count: 15 }
```

## Gotchas

- **Nullish values skipped:** `null` and `undefined` in defaults are ignored, not merged. If you need to preserve them, use a different library.

- **Array concatenation, not override:** Arrays concat instead of replace. `defu({ arr: [1] }, { arr: [2] })` → `{ arr: [1, 2] }`. If you need override behavior, use `createDefu`.

- **Security:** `__proto__` and `constructor` keys are blocked to prevent prototype pollution.

- **Shallow object input:** Only merges plain objects. Non-POJO values (class instances, Dates) are copied as-is.
```

## Documentation

Query docs: `skilld -q "defu <your question>"`
