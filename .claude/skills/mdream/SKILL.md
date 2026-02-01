---
name: mdream
description: Documentation for mdream. Use this skill when working with mdream or importing from "mdream".
version: "0.15.3"
---

# mdream

Ultra-performant HTML to Markdown converter optimized for LLMs. ~50% fewer tokens with minimal preset, 5kB gzip, streaming support.

## Quick Reference

| Function | Use Case | Input | Output |
|----------|----------|-------|--------|
| `htmlToMarkdown()` | Convert complete HTML | HTML string | Markdown string |
| `streamHtmlToMarkdown()` | Convert from fetch/file streams | ReadableStream | Generator<string> |
| `parseHtml()` | Pure AST parsing without markdown | HTML string | Events + remaining HTML |
| `htmlToMarkdownSplitChunks()` | Split into sized chunks | HTML string | Array<MarkdownChunk> |
| `htmlToMarkdownSplitChunksStream()` | Memory-efficient chunking | HTML string | Generator<MarkdownChunk> |
| `createLlmsTxtStream()` | Generate llms.txt stream | Config object | WritableStream |
| `generateLlmsTxtArtifacts()` | Generate llms.txt from files | Glob pattern | llms.txt content |

## API Reference

### Core Functions

**`htmlToMarkdown(html, options?): string`**
```ts
import { htmlToMarkdown } from 'mdream'

const markdown = htmlToMarkdown('<h1>Hello</h1><p>Text</p>')
```

**`streamHtmlToMarkdown(htmlStream, options?): AsyncGenerator<string>`**
```ts
import { streamHtmlToMarkdown } from 'mdream'

const response = await fetch('https://example.com')
const markdownGen = streamHtmlToMarkdown(response.body, {
  origin: 'https://example.com'
})

for await (const chunk of markdownGen) {
  console.log(chunk)
}
```

**`parseHtml(html, options?): { events, remainingHtml }`**
- Returns AST events (enter/exit for elements and text nodes)
- No markdown generation overhead
- Plugin support during parsing
- Streaming compatible

### Chunking/Splitting

**`htmlToMarkdownSplitChunks(html, options): MarkdownChunk[]`**
```ts
import { TAG_H2, htmlToMarkdownSplitChunks } from 'mdream/splitter'

const chunks = htmlToMarkdownSplitChunks(html, {
  headersToSplitOn: [TAG_H2],     // Split on h2 headers
  chunkSize: 1000,                 // Max chars per chunk
  chunkOverlap: 200,               // Overlap for context
  stripHeaders: true,              // Remove headers from content
  origin: 'https://example.com'
})
```

**`htmlToMarkdownSplitChunksStream(html, options): Generator<MarkdownChunk>`**
- Memory efficient for large documents
- Can break early to stop processing
- Same options as `htmlToMarkdownSplitChunks`

**MarkdownChunk structure:**
```ts
{
  content: string
  metadata: {
    headers?: Record<string, string>  // { h1: "Title", h2: "Section" }
    code?: string                      // Code language if present
    loc?: { lines: { from, to } }     // Line number range
  }
}
```

### llms.txt Generation

**`createLlmsTxtStream(config): WritableStream`**
```ts
import { createLlmsTxtStream } from 'mdream'

const stream = createLlmsTxtStream({
  siteName: 'My Docs',
  description: 'Documentation',
  origin: 'https://example.com',
  outputDir: './dist',
  generateFull: true,              // Also generate llms-full.txt
  sections: [{ title, description, links: [{title, href, description}] }],
  notes: ['Custom notes']
})

const writer = stream.getWriter()
await writer.write({ title, content, url, metadata: {description} })
await writer.close()
```

**`generateLlmsTxtArtifacts(config): { llmsTxt, llmsFullTxt, processedFiles }`**
```ts
const result = await generateLlmsTxtArtifacts({
  patterns: '**/*.html',
  siteName: 'My Site',
  origin: 'https://example.com',
  generateFull: true,
  sections: [],
  notes: 'Footer'
})
```

## Plugin System

### Built-in Plugins

Import from `'mdream/plugins'`:
- `isolateMainPlugin()` - Extract main content area
- `frontmatterPlugin()` - Generate YAML frontmatter from meta tags
- `tailwindPlugin()` - Convert Tailwind classes to Markdown
- `filterPlugin(config)` - Include/exclude elements
- `extractionPlugin(selectors)` - Extract specific elements

```ts
import { filterPlugin, frontmatterPlugin, isolateMainPlugin, extractionPlugin } from 'mdream/plugins'

// Usage
htmlToMarkdown(html, {
  plugins: [
    isolateMainPlugin(),
    frontmatterPlugin(),
    filterPlugin({ exclude: ['nav', '.sidebar', '#footer'] })
  ]
})
```

### Creating Plugins

```ts
import { createPlugin } from 'mdream/plugins'
import type { ElementNode, TextNode, NodeEvent } from 'mdream'

const myPlugin = createPlugin({
  // Called before node processing - can skip nodes
  beforeNodeProcess(event: NodeEvent) {
    if (event.node.type === ELEMENT_NODE) {
      return { skip: true } // Skip processing
    }
  },

  // Called entering element
  onNodeEnter(node: ElementNode) {
    if (node.name === 'h1') return '🔥 '
  },

  // Called exiting element
  onNodeExit(node: ElementNode) {},

  // Transform text nodes
  processTextNode(textNode: TextNode) {
    return {
      content: `**${textNode.value}**`,
      skip: false
    }
  },

  // Process attributes
  processAttributes(attributes: Record<string, string>) {}
})
```

### Extraction Plugin Pattern

```ts
import { extractionPlugin } from 'mdream'

const plugin = extractionPlugin({
  'h2': (element, state) => {
    console.log('Heading:', element.textContent)
    console.log('Depth:', state.depth)
  },
  'img[alt]': (element, state) => {
    console.log('Image:', element.attributes.src)
  }
})
```

## Presets

### Minimal Preset

Optimized for token reduction (50% fewer tokens):

```ts
import { withMinimalPreset } from 'mdream/preset/minimal'

const options = withMinimalPreset({
  origin: 'https://example.com'
})

// Includes: isolateMain, frontmatter, tailwind, filter (removes nav/buttons/forms/footer)
const markdown = htmlToMarkdown(html, options)
```

**CLI:** `npx mdream --preset minimal --origin https://example.com`

## Options Reference

```ts
interface ConversionOptions {
  origin?: string              // Base URL for resolving relative links/images
  plugins?: Plugin[]           // Array of plugins to apply
}

interface SplitterOptions extends ConversionOptions {
  headersToSplitOn?: number[]  // Which headers to split on (TAG_H1-H6)
  chunkSize?: number           // Max chunk size (default: 1000)
  chunkOverlap?: number        // Overlap between chunks (default: 200)
  lengthFunction?: (text) => number  // Custom length function (e.g., token count)
  stripHeaders?: boolean       // Remove headers from chunks (default: true)
  returnEachLine?: boolean     // Split into individual lines (default: false)
}
```

## Best Practices

**For streams:** Use `streamHtmlToMarkdown()` instead of `htmlToMarkdown()` when fetching or reading from files. Processes content as it arrives, lower memory.

**For LLM context:** Use `minimal` preset + `htmlToMarkdownSplitChunks()` together for optimized token usage.

**For extraction:** Use `extractionPlugin` with CSS selectors for memory-efficient data extraction during conversion.

**For large documents:** Use `htmlToMarkdownSplitChunksStream()` generator instead of array variant to avoid loading entire document.

**With Readability:** Combine with `@mozilla/readability` for advanced boilerplate removal before mdream conversion.

## Gotchas

**Relative paths:** Pass `origin` option to fix relative image and link paths - without it, paths remain relative.

**Origin flag critical for CLI:** Always use `--origin https://example.com` with CLI or relative paths break.

**Plugin order matters:** Apply plugins in logical order - `isolateMain` before `filter` to avoid filtering main content before extraction.

**Stream consumption:** `AsyncGenerator` from `streamHtmlToMarkdown()` must be consumed with `for await` or `.next()` - assigning to variable doesn't consume.

**Chunk overlap doesn't guarantee context:** With `stripHeaders: true`, headers removed but overlapped text preserved - for true context preservation, set `stripHeaders: false`.

**Extraction happens during conversion:** Extracted data only available via callbacks during `htmlToMarkdown()` call - results not returned separately.

**CDN build limitations:** Browser IIFE build (`unpkg.com/mdream/dist/iife.js`) only includes `htmlToMarkdown`, not streaming or splitting functions. Use npm package for full API.