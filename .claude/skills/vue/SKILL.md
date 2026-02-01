---
description: Vue.js 3.x Best Practices, Performance, Accessibility, and TypeScript patterns.
globs: "**/*.vue, **/*.ts, **/*.js"
---

# Vue.js

The Progressive JavaScript Framework.

## Best Practices

### Accessibility (A11y)
- **Skip Links**: Add a "Skip to main content" link at the top of `App.vue` for keyboard users.
- **Landmarks**: Use semantic HTML (`<main>`, `<nav>`, `<header>`) or `role` attributes to define page structure.
- **Forms**:
  - Always link labels to inputs via `for`/`id` or use `aria-label`/`aria-labelledby`.
  - Avoid placeholders as replacements for labels (contrast/context issues).
  - Use `autocomplete="on"` on form elements.

### Performance
- **Props Stability**: Avoid passing parents' state IDs to children if it causes all children to re-render.
  - *Bad*: `<ListItem :active-id="activeId" />` (Updates all items when ID changes)
  - *Good*: `<ListItem :active="item.id === activeId" />` (Updates only relevant items)
- **Update Optimization**:
  - Use `v-once` for content that never changes.
  - Use `v-memo="[dep]"` (Vue 3.2+) to skip updates for large sub-trees/lists if dependencies haven't changed.
- **Computed Stability (Vue 3.4+)**: 
  - Computed properties now automatically avoid triggering effects if the *primitive* value hasn't changed.
  - For objects, manually compare and return the `oldValue` if identical to prevent expensive downstream updates.
- **Large Data**:
  - Use `shallowRef()` / `shallowReactive()` for large immutable structures to avoid deep reactivity overhead.
  - **Virtualize** lists with thousands of items (e.g., `vue-virtual-scroller`).
- **Bundle Size**:
  - Use `defineAsyncComponent` for lazy-loading components.
  - Prefer `lodash-es` over `lodash` for tree-shaking.

### Security
- **Templates**: Never use non-trusted content as a component template.
- **URLs**: Backend must sanitize URLs before storage. Frontend sanitization is insufficient.
- **Styles**: Avoid binding user input to `style` tags or attributes (risk of clickjacking).
- **HTML**: `v-html` should only be used with trusted content.

## Style Guide (Essential / Priority A)
- **Naming**: Component names must be multi-word (e.g., `TodoItem` not `Item`) to avoid HTML conflicts.
- **Props**: Define detailed prop types (at least `type`).
- **Loops**: Always use `:key` with `v-for`.
- **Conditionals**: **Never** use `v-if` on the same element as `v-for`.
  - *Fix*: Use a computed property for filtered lists or wrapper `<template v-for>`.
- **Styles**: Use component-scoped styling (`<style scoped>`) for non-root components.

## TypeScript Patterns

### Composition API
- **Props (Vue 3.3+)**: Use type-based declaration.
  ```ts
  const props = defineProps<{
    foo: string
    bar?: number
  }>()
  
- **Default Props (Vue 3.5+)**: Use Reactivity Props Destructure.
  ```ts
  const { msg = 'hello' } = defineProps<{ msg?: string }>()
  ```
- **Emits (Vue 3.3+)**: Use succinct tuple syntax.
  ```ts
  const emit = defineEmits<{
    change: [id: number]
    update: [value: string]
  }>()
  ```
- **Template Refs (Vue 3.5+)**: Use `useTemplateRef` which auto-infers types for static refs.
  ```ts
  const input = useTemplateRef('my-input') // Inferred as HTMLInputElement | null
  ```
  - *Pre-3.5*: `const el = ref<HTMLInputElement | null>(null)`

### Common Gotchas
- **Reactive Generic**: Avoid `reactive<T>()`. It interferes with unwrapping types.
  - *Good*: `const book: Book = reactive({ ... })`
- **Event Handlers**: Explicitly type `event` to avoid implicit `any`.
  ```ts
  function handleChange(event: Event) {
    const value = (event.target as HTMLInputElement).value
  }
  ```
- **Inject**: Use `InjectionKey<T>` to sync types between provider and consumer.
```

## Documentation

For deeper information, read the local docs. The `llms.txt` file contains an index with relative links to all documentation files:

```
./llms.txt          # Index with links to all docs
./docs/api/         # API reference
./docs/guide/       # Guides and tutorials
./docs/style-guide/ # Style guide rules
```

Follow relative links in llms.txt to read specific documentation files.
