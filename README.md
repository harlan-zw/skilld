<h1>skilld</h1>

[![npm version](https://img.shields.io/npm/v/skilld?color=yellow)](https://npmjs.com/package/skilld)
[![npm downloads](https://img.shields.io/npm/dm/skilld?color=yellow)](https://npm.chart.dev/skilld)
[![license](https://img.shields.io/github/license/harlan-zw/skilld?color=yellow)](https://github.com/harlan-zw/skilld/blob/main/LICENSE)

> Skilld gives your AI agent skills for your npm dependencies, generated from versioned docs, dist files and GitHub data.

## Why?

Agents already know how most packages work from training data. Skills should focus on what they *don't* know and push them to follow best practices. Without this:

- **Generic patterns** - AI uses common approaches instead of package-specific conventions
- **Missed best practices** - Optimal patterns go unused because the AI defaults to "good enough"
- **Version drift** - Training data lags behind latest APIs and deprecations

skilld generates skills from the package's *actual* documentation using your existing agent. Works with any public npm package, no author opt-in needed.

```
npm install vueuse → skilld vueuse → AI knows current vueuse API
```

Compatible with [skills-npm](https://github.com/antfu/skills-npm)—if a package ships a `skills/` directory, skilld uses it directly. Generation is the fallback.

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

- 🤖 **Agent-powered** - Uses your existing LLM to generate SKILL.md for your key dependencies; works with any coding agent
- 🎯 **Best practices first** - Token-optimized output focused on non-obvious patterns and conventions, not generic knowledge
- 🔗 **Context-aware** - Generation adapts to your preferences and accepts custom prompts
- ✏️ **You own it** - Skills live in your project, easy to customize; sync new package versions with zero config
- 🚀 **Zero friction** - Works with any public npm package, no author opt-in; respects `llms.txt` and shipped `skills/` when available

## Installation

```bash
pnpm add -g skilld
```

## Automatic Updates

Add to `package.json` to keep skills fresh on install:

```json
{
  "scripts": {
    "prepare": "skilld --prepare -b"
  }
}
```

skilld fast-paths unchanged versions—only regenerates when minor/major versions bump.

## CLI Usage

```bash
# Interactive mode — auto-discover from package.json
skilld

# Sync specific package(s)
skilld vueuse
skilld vue,nuxt,pinia

# Search docs across installed skills
skilld nuxt -q "useFetch options"

# Target a specific agent
skilld vueuse --agent cursor

# Install globally to ~/.claude/skills
skilld vueuse --global

# Skip prompts
skilld vueuse --yes

# Check skill status
skilld status

# Manage settings
skilld config
```

### Commands

| Command | Description |
|---------|-------------|
| `skilld` | Interactive wizard (first run) or status menu (existing skills) |
| `skilld <pkg>` | Sync specific package(s), comma-separated |
| `skilld status` | Show skill status across agents |
| `skilld config` | Configure agent, model, preferences |
| `skilld install` | Restore references from lockfile |
| `skilld remove` | Remove installed skills |
| `skilld uninstall` | Remove all skilld data |

### CLI Options

| Option | Alias | Default | Description |
|--------|-------|---------|-------------|
| `--query` | `-q` | | Search docs: `skilld nuxt -q "useFetch"` |
| `--global` | `-g` | `false` | Install globally to `~/<agent>/skills` |
| `--agent` | `-a` | auto-detect | Target specific agent (claude-code, cursor, etc.) |
| `--yes` | `-y` | `false` | Skip prompts, use defaults |
| `--prepare` | | `false` | Non-interactive sync for prepare hook (outdated only) |
| `--background` | `-b` | `false` | Run `--prepare` in a detached background process |

## How It Works

```
Package name → Resolve docs → Fetch → Generate → Install
```

1. **Resolve** - Looks up npm registry for homepage, repository URL
2. **Fetch** - Tries versioned git docs → GitHub README → llms.txt (via ungh)
3. **Generate** - Your agent creates SKILL.md from fetched docs
4. **Cache** - References stored in `~/.skilld/` (shared across projects)
5. **Install** - Writes SKILL.md to `./<agent>/skills/<package>/` (e.g. `.claude/skills/vueuse/`)

Supported agents: Claude Code, Cursor, Windsurf, Cline, Codex, GitHub Copilot, Gemini CLI, Goose, Amp, OpenCode, Roo Code

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

Run `skilld` without arguments to interactively generate skills for your dependencies:

```bash
cd my-project
pnpx skilld
```

On first run, skilld launches a wizard to configure your agent and model, then lets you choose packages from:
- **Source imports** — scans your code for actually used packages
- **package.json** — all dependencies and devDependencies
- **Manual entry** — comma-separated package names

Skips `@types/*` and common dev tools (typescript, eslint, vitest, etc).

## Roadmap

- [ ] **Team sync** - SKILL.md files commit with version frontmatter; `skilld sync` hydrates references from global cache
- [ ] **Community skills repo** - Pull pre-generated skills from `skilld-community/skills` before generating; `skilld --share` to submit PRs
- [ ] **Migration docs** - Generate upgrade guides when re-running after major version bumps
- [ ] **MCP server mode** - Expose search as tool for Claude Code real-time doc lookups
- [ ] **Eval command** - Validate skill quality against known patterns and usage
- [ ] **CI integration** - GitHub Action to auto-regenerate skills on dependency updates
- [ ] **Smart presets** - Auto-detect recommended packages from project config (nuxt.config.ts → nuxt, vue, nitro, h3)

## Shipped Skills (skills-npm)

skilld supports the [skills-npm](https://github.com/antfu/skills-npm) convention. If a package ships a `skills/` directory, skilld symlinks it directly — no doc fetching, no caching, no LLM generation, no tokens spent.

```
node_modules/@slidev/cli/skills/
  slidev/
    SKILL.md
    references/

→ .claude/skills/slidev -> node_modules/@slidev/cli/skills/slidev
```

Package authors can ship skills alongside their code. skilld detects and links them automatically during sync. Generation is the fallback for packages that haven't adopted the convention yet.

## Related

- [skills-npm](https://github.com/antfu/skills-npm) - Convention for shipping agent skills in npm packages
- [mdream](https://github.com/harlan-zw/mdream) - HTML to Markdown converter used for crawling
- [retriv](https://github.com/harlan-zw/retriv) - Vector database abstraction layer

## License

Licensed under the [MIT license](https://github.com/harlan-zw/skilld/blob/main/LICENSE).
