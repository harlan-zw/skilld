<h1>skilld</h1>

[![npm version](https://img.shields.io/npm/v/skilld?color=yellow)](https://npmjs.com/package/skilld)
[![npm downloads](https://img.shields.io/npm/dm/skilld?color=yellow)](https://npm.chart.dev/skilld)
[![license](https://img.shields.io/github/license/harlan-zw/skilld?color=yellow)](https://github.com/harlan-zw/skilld/blob/main/LICENSE.md)

> AI-generated skills and semantic search from your NPM dependencies real docs.

## Why?

Current approaches like [vercel-labs/skills](https://github.com/vercel-labs/skills) are fundamentally broken for distributing npm package agent skill documentation. They create friction for both end users (manual discovery, manual cloning, no version sync) and maintainers (separate repo to maintain, docs drift from source).

Agents already know how most packages work from training data. Skills should focus on what they *don't* know and push them to follow best practices. Without this:

- **Generic patterns** - AI uses common approaches instead of package-specific conventions
- **Missed best practices** - Optimal patterns go unused because the AI defaults to "good enough"
- **Version drift** - Training data lags behind latest APIs and deprecations

**Alternative approaches have friction:**

| Approach | Problem |
|----------|---------|
| Bundled skills in packages | Requires package authors to opt-in |
| Git-cloned skill repos | Version mismatch with installed packages |
| Manual CLAUDE.md maintenance | Doesn't scale, quickly outdated |

**skilld solves this differently:** generate skills from the package's *actual* documentation using your existing agent. No author opt-in. No version drift.

```
npm install vueuse → skilld vueuse → AI knows current vueuse API
```

**How it compares:**

| | [vercel-labs/skills](https://github.com/vercel-labs/skills) | skilld |
|---|---|---|
| Discovery | Manual | Auto from package.json |
| Coverage | Opt-in repos only | Any npm package |
| Version sync | Manual | Regenerate on upgrade |
| Author effort | Maintain separate repo | Zero (or ship skills/) |

**Compatibility:** skilld respects the [skills-npm](https://github.com/antfu/skills-npm) convention. If a package ships a `skills/` directory, we use it directly—no generation needed, no tokens spent. Generation is the fallback for packages that haven't adopted the standard yet.

**Trade-offs when generating:**

- **Public packages only** - Private npm registries and authenticated docs not yet supported
- **Version drift** - Generated skills don't auto-update; re-run after major/minor bumps (migration doc generation planned)
- **Token cost** - Generation uses LLM calls; mitigated when packages ship their own skills
- **LLM variance** - Output quality depends on model behavior; author-provided skills avoid this entirely

<p align="center">
<table>
<tbody>
<td align="center">
<sub>Made possible by my <a href="https://github.com/sponsors/harlan-zw">Sponsor Program 💖</a><br> Follow me <a href="https://twitter.com/harlan_zw">@harlan_zw</a> 🐦 • Join <a href="https://discord.gg/275MBUBvgP">Discord</a> for help</sub><br>
</td>
</tbody>
</table>
</p>

## Features

- 🤖 **Agent-powered** - Uses your existing LLM to generate SKILLS.md for your key dependencies; works with any coding agent
- 🎯 **Best practices first** - Token-optimized output focused on non-obvious patterns and conventions, not generic knowledge
- 🔗 **Context-aware** - Generation adapts to your preferences and accepts custom prompts
- ✏️ **You own it** - Skills live in your project, easy to customize; sync new package versions with zero config
- 🚀 **Zero friction** - Works with any public npm package, no author opt-in; respects `llms.txt` and shipped `skills/` when available

## How It Works

```
Package name → Resolve docs → Fetch → Generate → Install
```

1. **Resolve** - Looks up npm registry for homepage, repository URL
2. **Fetch** - Tries llms.txt → docs site → GitHub README (via ungh)
3. **Generate** - Your agent creates SKILLS.md from fetched docs
4. **Cache** - References stored in `~/.skilld/` (shared across projects)
5. **Install** - Writes SKILL.md to `./<agent>/skills/<package>/` (e.g. `.claude/skills/vueuse/`)

Supported agents: Claude Code, Cursor, Windsurf, Cline, Codex, GitHub Copilot, Gemini CLI, Goose, Amp, OpenCode, Roo Code

## Installation

```bash
pnpm add -g skilld
```

## Automatic Updates

Add to `package.json` to keep skills fresh on install:

```json
{
  "scripts": {
    "prepare": "skilld"
  }
}
```

skilld fast-paths unchanged versions—only regenerates when minor/major versions bump.

## CLI Usage

```bash
# Auto-discover from package.json dependencies
skilld

# Generate skill from specific package name
skilld vueuse
skilld @nuxt/kit

# Generate skill from URL
skilld https://nuxt.com/docs

# Custom output directory
skilld -o ./my-skills

# Concurrent processing (default: 3)
skilld -c 5

# Skip llms.txt and always crawl
skilld --crawl

# Limit pages fetched per package
skilld -m 50
```

### CLI Options

| Option | Alias | Default | Description |
|--------|-------|---------|-------------|
| `--output` | `-o` | `.skilld` | Output directory |
| `--maxPages` | `-m` | `100` | Max pages to fetch |
| `--chunkSize` | | `1000` | Chunk size in characters |
| `--model` | | `Xenova/bge-small-en-v1.5` | Embedding model |
| `--crawl` | | `false` | Skip llms.txt, always crawl |
| `--concurrency` | `-c` | `3` | Concurrent package processing |

## Programmatic Usage

```ts
import { generateSkill } from 'skilld'

const result = await generateSkill({
  url: 'https://nuxt.com/docs',
  outputDir: '.skilld',
  maxPages: 100,
  chunkSize: 1000,
  chunkOverlap: 200,
}, ({ url, count, phase }) => {
  console.log(`[${phase}] ${count}: ${url}`)
})

console.log(result)
// {
//   siteName: 'nuxt.com',
//   skillPath: '.skilld/nuxt.com/SKILL.md',
//   referencesDir: '.skilld/nuxt.com/references',
//   dbPath: '.skilld/nuxt.com/search.db',
//   chunkCount: 847
// }
```

## Output Structure

Skills install to each detected agent's skill directory. References are cached globally and shared across projects:

```
.claude/skills/vueuse/
└── SKILL.md                    # Project-specific, adapts to your conventions

~/.skilld/references/
└── vueuse@10.9.0/              # Global cache, static docs
    ├── chunks/
    └── search.db
```

SKILL.md is regenerated per-project (different conventions), but references stay static (same package docs). Version frontmatter enables sync:

```yaml
---
name: vueuse
version: 10.9.0
description: Collection of Vue Composition Utilities
---
```

## Package.json Auto-Discovery

Run `skilld` without arguments to generate skills for all dependencies:

```bash
cd my-project
pnpx skilld
```

This will:
1. Read `package.json` dependencies and devDependencies
2. Resolve documentation URL for each package (llms.txt → homepage → GitHub README)
3. Generate searchable skills in `.skilld/`

Skips `@types/*` and common dev tools (typescript, eslint, vitest, etc).

## NPM Package Skills

Generate skills for specific packages by name or URL:

```bash
# By package name (auto-resolves docs)
skilld vueuse
skilld @vueuse/core
skilld defu

# By URL
skilld https://vueuse.org
skilld https://nuxt.com  # Uses /llms.txt automatically
```

## Roadmap

- [ ] **Global search DB** - Single `~/.skilld/search.db` with hybrid BM25 + semantic search via [retriv](https://github.com/harlan-zw/retriv); query with `skilld -q "useFoo()"` scoped to your installed versions
- [ ] **Team sync** - SKILL.md files commit with version frontmatter; `skilld sync` hydrates references from global cache
- [ ] **Community skills repo** - Pull pre-generated skills from `skilld-community/skills` before generating; `skilld --share` to submit PRs
- [ ] **Migration docs** - Generate upgrade guides when re-running after major version bumps
- [ ] **MCP server mode** - Expose search as tool for Claude Code real-time doc lookups
- [ ] **Eval command** - Validate skill quality against known patterns and usage
- [ ] **CI integration** - GitHub Action to auto-regenerate skills on dependency updates
- [ ] **Smart presets** - Auto-detect recommended packages from project config (nuxt.config.ts → nuxt, vue, nitro, h3)

## Related

- [mdream](https://github.com/harlan-zw/mdream) - HTML to Markdown converter used for crawling
- [retriv](https://github.com/harlan-zw/retriv) - Vector database abstraction layer

## License

Licensed under the [MIT license](https://github.com/harlan-zw/skilld/blob/main/LICENSE.md).
