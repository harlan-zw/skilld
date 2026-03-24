import { describe, expect, it } from 'vitest'
import { cleanSectionOutput } from '../../src/agent/clis/index'

describe('cleanSectionOutput', () => {
  // ── Wrapping fence stripping ──────────────────────────────────────

  describe('wrapping fence stripping', () => {
    it('strips ```markdown wrapper', () => {
      const input = '```markdown\n## API Changes\n\n- NEW: `foo()` — new in v2\n```'
      const result = cleanSectionOutput(input)
      expect(result).toBe('## API Changes\n\n- NEW: `foo()` — new in v2')
    })

    it('strips ```md wrapper', () => {
      const input = '```md\n## Best Practices\n\n- Use foo() [source](./docs/api.md)\n```'
      const result = cleanSectionOutput(input)
      expect(result).toBe('## Best Practices\n\n- Use foo() [source](./.skilld/docs/api.md)')
    })

    it('strips bare ``` wrapper when inner has section markers', () => {
      const input = '```\n## API Changes\n\n- BREAKING: `bar()` — removed in v3\n```'
      const result = cleanSectionOutput(input)
      expect(result).toBe('## API Changes\n\n- BREAKING: `bar()` — removed in v3')
    })

    it('does NOT strip bare ``` wrapper when inner looks like code', () => {
      // Bare wrapper with content that has no section markers → ambiguous, leave alone
      const input = '```\nconst x = 1\nconst y = 2\n```'
      const result = cleanSectionOutput(input)
      // Should be rejected (no section structure)
      expect(result).toBe('')
    })

    it('does NOT strip internal code fences (the critical bug)', () => {
      const input = [
        '## Best Practices',
        '',
        '- Destructure props from `defineProps` [source](./.skilld/docs/api.md)',
        '',
        '```vue',
        '<script setup lang="ts">',
        'const { foo } = defineProps<{ foo: string }>()',
        '</script>',
        '```',
        '',
        '- Use `useTemplateRef()` [source](./.skilld/docs/helpers.md)',
      ].join('\n')
      const result = cleanSectionOutput(input)
      expect(result).toContain('```vue')
      expect(result).toContain('<script setup lang="ts">')
      expect(result).toContain('</script>')
      expect(result).toContain('```')
    })

    it('does NOT strip ```vue fence in middle of content', () => {
      const input = [
        '## Best Practices',
        '',
        '- Example',
        '',
        '```vue',
        '<template><div /></template>',
        '```',
      ].join('\n')
      const result = cleanSectionOutput(input)
      expect(result).toContain('```vue')
      expect(result).toContain('<template><div /></template>')
    })

    it('does NOT strip ```ts fence in middle of content', () => {
      const input = [
        '## Best Practices',
        '',
        '- Use storeToRefs()',
        '',
        '```ts',
        'const { count } = storeToRefs(store)',
        '```',
        '',
        '- Another tip',
      ].join('\n')
      const result = cleanSectionOutput(input)
      expect(result).toContain('```ts')
      expect(result).toContain('const { count } = storeToRefs(store)')
      expect(result).toContain('- Another tip')
    })

    it('preserves multiple code blocks in sequence', () => {
      const input = [
        '## Best Practices',
        '',
        '- First',
        '',
        '```ts',
        'const a = 1',
        '```',
        '',
        '- Second',
        '',
        '```vue',
        '<script setup>',
        'import { ref } from "vue"',
        '</script>',
        '```',
        '',
        '- Third',
        '',
        '```ts',
        'const b = 2',
        '```',
      ].join('\n')
      const result = cleanSectionOutput(input)
      expect(result).toContain('```ts\nconst a = 1\n```')
      expect(result).toContain('```vue\n<script setup>')
      expect(result).toContain('</script>\n```')
      expect(result).toContain('```ts\nconst b = 2\n```')
    })

    it('strips outer ```markdown wrapper but preserves inner code blocks', () => {
      const input = [
        '```markdown',
        '## API Changes',
        '',
        '- NEW: `useId()` — new in v3.5',
        '',
        '```ts',
        'const id = useId()',
        '```',
        '',
        '- BREAKING: `$ref` — removed in v3.4',
        '```',
      ].join('\n')
      const result = cleanSectionOutput(input)
      expect(result).toContain('## API Changes')
      expect(result).toContain('```ts\nconst id = useId()\n```')
      expect(result).not.toMatch(/^```/)
    })

    it('handles wrapper with trailing whitespace on closing fence', () => {
      const input = '```markdown\n## API Changes\n\n- NEW: `foo()`\n```   '
      const result = cleanSectionOutput(input)
      expect(result).toBe('## API Changes\n\n- NEW: `foo()`')
    })

    it('does NOT treat content ending with code block as wrapped', () => {
      // Content ends with a ``` that's a code block closing, not a wrapper closing
      const input = [
        '## Best Practices',
        '',
        '- Tip here',
        '',
        '```ts',
        'const x = 1',
        '```',
      ].join('\n')
      const result = cleanSectionOutput(input)
      expect(result).toContain('```ts\nconst x = 1\n```')
    })
  })

  // ── Real-world reproduction cases ─────────────────────────────────

  describe('real-world: vue ecosystem skill generation', () => {
    it('vuejs-core best practices — preserves ALL code blocks with <script setup>', () => {
      const input = [
        '## Best Practices',
        '',
        '- Destructure props from `defineProps` to maintain reactivity [source](./.skilld/docs/api/sfc-script-setup.md)',
        '',
        '```vue',
        '<script setup lang="ts">',
        '// Preferred: foo is reactive',
        'const { foo = \'default\' } = defineProps<{ foo?: string }>()',
        '</script>',
        '```',
        '',
        '- Use `useTemplateRef()` for element references [source](./.skilld/docs/api/helpers.md)',
        '',
        '```vue',
        '<script setup lang="ts">',
        'import { useTemplateRef, onMounted } from \'vue\'',
        'const inputRef = useTemplateRef<HTMLInputElement>(\'input-el\')',
        'onMounted(() => inputRef.value?.focus())',
        '</script>',
        '<template>',
        '  <input ref="input-el" />',
        '</template>',
        '```',
      ].join('\n')
      const result = cleanSectionOutput(input)

      // First code block must survive intact
      expect(result).toContain('```vue\n<script setup lang="ts">')
      expect(result).toContain('const { foo = \'default\' } = defineProps')
      expect(result).toContain('</script>\n```')

      // Second code block also fully intact
      expect(result).toContain('import { useTemplateRef, onMounted }')
      expect(result).toContain('useTemplateRef<HTMLInputElement>')
      expect(result).toContain('<template>')
      expect(result).toContain('<input ref="input-el" />')
      expect(result).toContain('</template>\n```')
    })

    it('vuejs-pinia best practices — preserves code blocks without HTML tags', () => {
      const input = [
        '## Best Practices',
        '',
        '- Use `storeToRefs()` when destructuring [source](./.skilld/docs/core-concepts/index.md)',
        '```ts',
        'const store = useCounterStore()',
        'const { count, doubleCount } = storeToRefs(store)',
        'const { increment } = store',
        '```',
        '',
        '- Call `useStore()` at the top of actions [source](./.skilld/docs/cookbook/composing-stores.md)',
        '```ts',
        'async orderCart() {',
        '  const user = useUserStore()',
        '  await apiOrderCart(user.token, this.items)',
        '}',
        '```',
      ].join('\n')
      const result = cleanSectionOutput(input)

      // First code block: fences + content must be intact
      expect(result).toContain('```ts\nconst store = useCounterStore()')
      expect(result).toContain('storeToRefs(store)')
      expect(result).toContain('const { increment } = store\n```')

      // Second code block too
      expect(result).toContain('```ts\nasync orderCart()')
      expect(result).toContain('await apiOrderCart')
    })

    it('vuejs-router best practices — preserves first code block', () => {
      const input = [
        '## Best Practices',
        '',
        '- **Fetch Data During Navigation** [source](./.skilld/docs/data-loaders/defining-loaders.md)',
        '',
        '```ts',
        '// Preferred: data is ready when component renders',
        'export const useUserData = defineBasicLoader(\'/users/[id]\', async to => {',
        '  return getUserById(to.params.id)',
        '})',
        '```',
        '',
        '- **Keep Data Loaders Side-Effect Free** [source](./.skilld/docs/data-loaders/defining-loaders.md)',
      ].join('\n')
      const result = cleanSectionOutput(input)
      expect(result).toContain('```ts\n// Preferred')
      expect(result).toContain('defineBasicLoader')
      expect(result).toContain('})\n```')
    })

    it('full api-changes + best-practices merged body', () => {
      // Simulates the merged body from two sections
      const input = [
        '## API Changes',
        '',
        'This section documents version-specific API changes.',
        '',
        '- NEW: `useTemplateRef(key)` — v3.5+, replaces matching ref pattern [source](./.skilld/releases/blog-3.5.md)',
        '',
        '- BREAKING: Reactivity Transform — removed in v3.4 [source](./.skilld/releases/blog-3.4.md)',
        '',
        '## Best Practices',
        '',
        '- Destructure props from `defineProps` [source](./.skilld/docs/api/sfc-script-setup.md)',
        '',
        '```vue',
        '<script setup lang="ts">',
        'const { foo = \'default\' } = defineProps<{ foo?: string }>()',
        '</script>',
        '```',
        '',
        '- Use `useTemplateRef()` [source](./.skilld/docs/api/helpers.md)',
        '',
        '```vue',
        '<script setup lang="ts">',
        'import { useTemplateRef } from \'vue\'',
        'const el = useTemplateRef(\'my-el\')',
        '</script>',
        '<template>',
        '  <div ref="my-el" />',
        '</template>',
        '```',
      ].join('\n')
      const result = cleanSectionOutput(input)

      // Both sections present
      expect(result).toContain('## API Changes')
      expect(result).toContain('## Best Practices')

      // All code blocks intact
      expect(result).toContain('```vue\n<script setup lang="ts">\nconst { foo')
      expect(result).toContain('```vue\n<script setup lang="ts">\nimport { useTemplateRef }')
      expect(result).toContain('<template>\n  <div ref="my-el" />\n</template>\n```')
    })
  })

  // ── H1 → H2 normalization ───────────────────────────────────────

  describe('h1 to h2 normalization', () => {
    it('converts # heading to ## heading', () => {
      const input = '# API Changes\n\n- NEW: `foo()` — new in v2'
      const result = cleanSectionOutput(input)
      expect(result).toBe('## API Changes\n\n- NEW: `foo()` — new in v2')
    })

    it('converts multiple h1 headings', () => {
      const input = '# API Changes\n\n- NEW: `foo()`\n\n# Best Practices\n\n- Use bar()'
      const result = cleanSectionOutput(input)
      expect(result).toContain('## API Changes')
      expect(result).toContain('## Best Practices')
      expect(result).not.toMatch(/^# /m)
    })

    it('does not affect ## or ### headings', () => {
      const input = '## API Changes\n\n### Details\n\n- NEW: `foo()`'
      const result = cleanSectionOutput(input)
      expect(result).toContain('## API Changes')
      expect(result).toContain('### Details')
    })

    it('does not affect # inside code blocks', () => {
      const input = '## Best Practices\n\n```bash\n# this is a comment\necho hello\n```'
      const result = cleanSectionOutput(input)
      expect(result).toContain('# this is a comment')
    })
  })

  // ── Frontmatter stripping ─────────────────────────────────────────

  describe('frontmatter stripping', () => {
    it('strips YAML frontmatter', () => {
      const input = '---\ntitle: Test\n---\n## API Changes\n\n- NEW: `foo()`'
      const result = cleanSectionOutput(input)
      expect(result).toBe('## API Changes\n\n- NEW: `foo()`')
    })

    it('strips leading horizontal rule without closing', () => {
      const input = '---\n## API Changes\n\n- NEW: `foo()`'
      const result = cleanSectionOutput(input)
      expect(result).toBe('## API Changes\n\n- NEW: `foo()`')
    })

    it('does not strip --- inside content', () => {
      const input = '## API Changes\n\nSome text\n\n---\n\nMore text\n\n- NEW: `foo()`'
      const result = cleanSectionOutput(input)
      expect(result).toContain('---')
    })
  })

  // ── Code preamble stripping ───────────────────────────────────────

  describe('code preamble stripping', () => {
    it('strips code dump before first section marker', () => {
      const input = 'const x = 1\nfunction foo() {}\nexport default bar\n\n## API Changes\n\n- NEW: `foo()`'
      const result = cleanSectionOutput(input)
      expect(result).toMatch(/^## API Changes/)
    })

    it('strips non-code preamble (LLM reasoning) before section marker', () => {
      const input = 'Here is some context about the package.\n\n## API Changes\n\n- NEW: `foo()`'
      const result = cleanSectionOutput(input)
      expect(result).toMatch(/^## API Changes/)
    })

    it('strips tool_call XML preamble before section marker', () => {
      const input = '<tool_call>\n{"name": "read_file"}\n</tool_call>\n\n## Best Practices\n\n- Use foo'
      const result = cleanSectionOutput(input)
      expect(result).toMatch(/^## Best Practices/)
    })
  })

  // ── Duplicate heading stripping ───────────────────────────────────

  describe('duplicate heading stripping', () => {
    it('strips duplicate section heading echoed from format example', () => {
      const input = [
        '## Best Practices',
        '',
        'Here are the best practices for this package:',
        '',
        '## Best Practices',
        '',
        '- Real content here',
      ].join('\n')
      const result = cleanSectionOutput(input)
      expect(result).toMatch(/^## Best Practices\n\n- Real content here/)
    })

    it('does not strip distant duplicate headings', () => {
      const input = [
        '## Best Practices',
        '',
        // 200+ chars of real content
        '- First item with a lot of detail about how to properly use the library in production applications including error handling and edge cases and more details here.\n',
        '- Second item with even more detail.\n',
        '',
        '## Best Practices',
        '',
        '- Repeated section',
      ].join('\n')
      const result = cleanSectionOutput(input)
      expect(result).toContain('- First item')
    })
  })

  // ── Source link normalization ──────────────────────────────────────

  describe('source link normalization', () => {
    it('adds .skilld/ prefix to bare relative source links', () => {
      const input = '## Best Practices\n\n- Tip [source](./docs/api.md)'
      const result = cleanSectionOutput(input)
      expect(result).toContain('[source](./.skilld/docs/api.md)')
    })

    it('adds .skilld/ prefix to issues/ links', () => {
      const input = '## API Changes\n\n- BREAKING: Bug [source](./issues/123.md)'
      const result = cleanSectionOutput(input)
      expect(result).toContain('[source](./.skilld/issues/123.md)')
    })

    it('adds .skilld/ prefix to releases/ links', () => {
      const input = '## API Changes\n\n- NEW: New [source](./releases/v2.0.0.md)'
      const result = cleanSectionOutput(input)
      expect(result).toContain('[source](./.skilld/releases/v2.0.0.md)')
    })

    it('does not double-prefix already-correct links', () => {
      const input = '## API Changes\n\n- NEW: New [source](./.skilld/releases/v2.0.0.md)'
      const result = cleanSectionOutput(input)
      expect(result).toContain('[source](./.skilld/releases/v2.0.0.md)')
      expect(result).not.toContain('.skilld/.skilld')
    })

    it('normalizes path-as-link-text to [source] for references/ paths', () => {
      const input = '## Best Practices\n\n- Use shallowRef [./references/docs/reactivity.md#shallowref](./references/docs/reactivity.md#shallowref)'
      const result = cleanSectionOutput(input)
      expect(result).toContain('[source](./references/docs/reactivity.md#shallowref)')
      expect(result).not.toContain('[./references/')
    })

    it('normalizes backtick-wrapped path link text to [source]', () => {
      const input = '## API Changes\n\n- BREAKING: useLoader [`./references/docs/upgrade.md:L55:110`](./references/docs/upgrade.md#useloader)'
      const result = cleanSectionOutput(input)
      expect(result).toContain('[source](./references/docs/upgrade.md#useloader)')
      expect(result).not.toContain('[`./references/')
    })

    it('normalizes paren-wrapped citation to [source]', () => {
      const input = '## API Changes\n\n- BREAKING: foo ([`./references/docs/upgrade.md`](./references/docs/upgrade.md))'
      const result = cleanSectionOutput(input)
      expect(result).toContain('[source](./references/docs/upgrade.md)')
      expect(result).not.toContain('([`')
    })

    it('normalizes .skilld/ path-as-link-text to [source]', () => {
      const input = '## Best Practices\n\n- Tip [./.skilld/docs/api.md](./.skilld/docs/api.md)'
      const result = cleanSectionOutput(input)
      expect(result).toContain('[source](./.skilld/docs/api.md)')
    })

    it('does not normalize links where URL is not a reference path', () => {
      // Link text looks like a reference path but URL points to a local non-reference path
      const input = '## Best Practices\n\n- See [./references/docs/api.md](./some-other/path.md)'
      const result = cleanSectionOutput(input)
      // Should not become [source] since URL is not a .skilld/ or references/ path
      expect(result).not.toContain('[source]')
    })
  })

  // ── Content rejection ─────────────────────────────────────────────

  describe('content rejection', () => {
    it('rejects content without section structure', () => {
      const input = 'This is just some random text without any headings or markers.'
      expect(cleanSectionOutput(input)).toBe('')
    })

    it('rejects empty content', () => {
      expect(cleanSectionOutput('')).toBe('')
    })

    it('accepts content with ## heading', () => {
      const input = '## API Changes\n\nSome valid content with - NEW: markers'
      expect(cleanSectionOutput(input)).toBeTruthy()
    })

    it('accepts content with text markers only (no heading)', () => {
      const input = '- Use foo() for better performance [source](./.skilld/docs/api.md)\n\n- NEW: `bar()` — new in v2'
      expect(cleanSectionOutput(input)).toBeTruthy()
    })
  })

  // ── Edge cases ────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles content that is just a heading', () => {
      const input = '## API Changes'
      expect(cleanSectionOutput(input)).toBe('## API Changes')
    })

    it('handles code block as last element (closing fence at string end)', () => {
      const input = [
        '## Best Practices',
        '',
        '- Example:',
        '',
        '```ts',
        'const x = 1',
        '```',
      ].join('\n')
      const result = cleanSectionOutput(input)
      expect(result).toContain('```ts\nconst x = 1\n```')
    })

    it('handles code block immediately after item (no blank line)', () => {
      const input = [
        '## Best Practices',
        '',
        '- Example:',
        '```ts',
        'const x = 1',
        '```',
      ].join('\n')
      const result = cleanSectionOutput(input)
      expect(result).toContain('```ts\nconst x = 1\n```')
    })

    it('preserves ````-length fences inside content', () => {
      const input = [
        '## Best Practices',
        '',
        '- Use nested code:',
        '',
        '````md',
        '```ts',
        'const x = 1',
        '```',
        '````',
      ].join('\n')
      const result = cleanSectionOutput(input)
      expect(result).toContain('````md')
      expect(result).toContain('```ts')
      expect(result).toContain('````')
    })

    it('handles tilde fences inside content', () => {
      const input = [
        '## Best Practices',
        '',
        '- Example:',
        '',
        '~~~ts',
        'const x = 1',
        '~~~',
      ].join('\n')
      const result = cleanSectionOutput(input)
      expect(result).toContain('~~~ts\nconst x = 1\n~~~')
    })

    it('preserves content with only text markers and code blocks', () => {
      const input = [
        '- First tip [source](./.skilld/docs/api.md)',
        '',
        '```ts',
        'const x = ref(0)',
        '```',
        '',
        '- Second tip [source](./.skilld/docs/guide.md)',
      ].join('\n')
      const result = cleanSectionOutput(input)
      expect(result).toContain('```ts\nconst x = ref(0)\n```')
      expect(result).toContain('- First tip')
      expect(result).toContain('- Second tip')
    })

    it('handles content with mixed ``` and ~~~ fences', () => {
      const input = [
        '## Best Practices',
        '',
        '- Backtick example:',
        '',
        '```ts',
        'const a = 1',
        '```',
        '',
        '- Tilde example:',
        '',
        '~~~ts',
        'const b = 2',
        '~~~',
      ].join('\n')
      const result = cleanSectionOutput(input)
      expect(result).toContain('```ts\nconst a = 1\n```')
      expect(result).toContain('~~~ts\nconst b = 2\n~~~')
    })
  })

  // ── Idempotency ───────────────────────────────────────────────────

  describe('idempotency', () => {
    it('is idempotent on clean section output', () => {
      const input = [
        '## Best Practices',
        '',
        '- Use `storeToRefs()` [source](./.skilld/docs/index.md)',
        '',
        '```ts',
        'const { count } = storeToRefs(store)',
        '```',
        '',
        '- Batch updates with `$patch()` [source](./.skilld/docs/state.md)',
        '',
        '```ts',
        'store.$patch((state) => {',
        '  state.items.push({ name: "shoes" })',
        '})',
        '```',
      ].join('\n')
      const first = cleanSectionOutput(input)
      const second = cleanSectionOutput(first)
      expect(second).toBe(first)
    })

    it('is idempotent on content with Vue SFC code blocks', () => {
      const input = [
        '## Best Practices',
        '',
        '- Use `<script setup>` [source](./.skilld/docs/sfc.md)',
        '',
        '```vue',
        '<script setup lang="ts">',
        'import { ref } from "vue"',
        'const count = ref(0)',
        '</script>',
        '<template>',
        '  <button @click="count++">{{ count }}</button>',
        '</template>',
        '```',
      ].join('\n')
      const first = cleanSectionOutput(input)
      const second = cleanSectionOutput(first)
      expect(second).toBe(first)
    })

    it('is idempotent on wrapped content', () => {
      const input = '```markdown\n## API Changes\n\n- NEW: `foo()` — new in v2\n```'
      const first = cleanSectionOutput(input)
      const second = cleanSectionOutput(first)
      expect(second).toBe(first)
    })
  })
})
