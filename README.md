<h1>skilld</h1>

[![npm version](https://img.shields.io/npm/v/skilld?color=yellow)](https://npmjs.com/package/skilld)
[![npm downloads](https://img.shields.io/npm/dm/skilld?color=yellow)](https://npm.chart.dev/skilld)
[![license](https://img.shields.io/npm/l/skilld?color=yellow)](https://github.com/harlan-zw/skilld/blob/main/LICENSE)

> Generate AI agent skills from your NPM dependencies.

## Why?

Agents have [knowledge cutoffs](https://platform.claude.com/docs/en/about-claude/models/overview#latest-models-comparison) and predict the most likely code from training data, not the best code. For example, [Vue v3.5](https://blog.vuejs.org/posts/vue-3-5) was released over 16 months ago and agents refuse to use its features out-of-the-box. This is because they're trained on conventions not the latest docs.

Methods of getting the right context to your agent require either manual curation, author opt-in, or external servers. See [the landscape](#the-landscape)
for more details.

Skilld generates [agent skills](https://agentskills.io/home) from the docs maintainers already write. Version-aware, local-first, and optimized for your codebase.

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

- 🌍 **Any Source: Opt-in** - Any NPM dependency or GitHub source, docs auto-resolved
- 📦 **Bleeding Edge Context** - Latest issues, discussions, and releases synced on
every update. Always use the latest best practices and avoid deprecated patterns.
- 📚 **Opt-in LLM Sections** - Enhance skills with LLM-generated `Best practices`, `API Changes`, `Doc Map`, or your own prompts
- 🔍 **Semantic Search** - Query indexed docs across all skills via [retriv](https://github.com/harlan-zw/retriv) embeddings
- 🎯 **Safe & Versioned** - Prompt injection sanitization, version-aware caching, auto-updates on new releases
- 🤝 **Ecosystem** - Compatible with [`npx skills`](https://skills.sh/) and [skills-npm](https://github.com/antfu/skills-npm)

## Quick Start

Run skilld in a project to generate skills for your dependencies through a simple interactive wizard:

```bash
npx -y skilld
```

Or add a specific package directly:

```bash
npx -y skilld add vue
```

If you need to re-configure skilld, just run `npx -y skilld config` to update your agent, model, or preferences.

### Tips

- **Be selective** - Only add skills for packages your agent struggles with. Not every dependency needs one.
- **LLM is optional** - Skills work without any LLM, but enhancing with one makes them significantly better.
- **Multi-agent** - Run `skilld install --agent gemini-cli` to sync skills to another agent. The doc cache is shared.

## FAQ

### Why don't the skills run?

Try this in your project/user prompt:

```md
Before modifying code, evaluate each installed skill against the current task.
For each skill, determine YES/NO relevance and invoke all YES skills before proceeding.
```

### How is this different from Context7?

Context7 is an MCP that fetches raw doc chunks at query time. You get different results each prompt, no curation, and it requires their server. Skilld is local-first: it generates a SKILL.md that lives in your project, tied to your actual package versions. No MCP dependency, no per-prompt latency, and it goes further with LLM-enhanced sections, prompt injection sanitization, and semantic search.

### Will I be prompt injected?

Skilld pulls issues from GitHub which could be abused for potential prompt injection.

Skilld treats all data as untrusted, running in permissioned environments and using best practices to avoid injections.
However, always be cautious when using skills from untrusted sources.

### Do skills update when my deps update?

Yes. Run `skilld update` to regenerate outdated skills, or add `skilld update -b` to your prepare script and they regenerate in the background whenever you install packages.

## Installation

If you'd like to install skilld and track the lock file references, add it as a dev dependency:

```bash
npm install -D skilld
# or
yarn add -D skilld
# or
pnpm add -D skilld
```

### Automatic Updates

Add to `package.json` to keep skills fresh on install:

```json
{
  "scripts": {
    "prepare": "skilld update -b"
  }
}
```

## CLI Usage

```bash
# Interactive mode - auto-discover from package.json
skilld

# Add skills for specific package(s)
skilld add vue nuxt pinia

# Update outdated skills
skilld update
skilld update tailwindcss

# Search docs across installed skills
skilld search "useFetch options" -p nuxt

# Target a specific agent
skilld add react --agent cursor

# Install globally to ~/.claude/skills
skilld add zod --global

# Skip prompts
skilld add drizzle-orm --yes

# Check skill info
skilld info

# List installed skills
skilld list
skilld list --json

# Manage settings
skilld config
```

### Commands

| Command | Description |
|---------|-------------|
| `skilld` | Interactive wizard (first run) or status menu (existing skills) |
| `skilld add <pkg...>` | Add skills for package(s), space or comma-separated |
| `skilld update [pkg]` | Update outdated skills (all or specific) |
| `skilld search <query>` | Search indexed docs (`-p` to filter by package) |
| `skilld list`           | List installed skills (`--json` for machine-readable output) |
| `skilld info`           | Show skill info and config |
| `skilld config`         | Configure agent, model, preferences |
| `skilld install`        | Restore references from lockfile |
| `skilld remove`         | Remove installed skills |
| `skilld uninstall`      | Remove all skilld data |
| `skilld cache`          | Cache management (clean expired LLM cache entries) |

### Eject

Export a skill as a portable, self-contained directory with references copied as real files instead of symlinks. Useful for sharing skills via git repos.

```bash
# Eject to the default skill directory
skilld add vue --eject

# Eject to a custom path
skilld add vue --eject ./skills/vue/
```

The ejected skill contains `SKILL.md` plus a `references/` directory with docs, issues, and releases as real files. Share it via `skilld add owner/repo` — consumers get fully functional skills with no LLM cost.

### CLI Options

| Option | Alias | Default | Description |
|--------|-------|---------|-------------|
| `--global` | `-g` | `false` | Install globally to `~/<agent>/skills` |
| `--agent` | `-a` | auto-detect | Target specific agent (claude-code, cursor, etc.) |
| `--yes` | `-y` | `false` | Skip prompts, use defaults |
| `--force` | `-f` | `false` | Ignore all caches, re-fetch docs and regenerate |
| `--model`      | `-m` | config default | LLM model for skill generation (sonnet, haiku, opus, etc.) |
| `--eject`      | `-e` |                | Eject skill with references as real files (optional path override) |
| `--debug`      |      | `false`        | Save raw LLM output to logs/ for each section |

## The Landscape

Several approaches exist for steering agent knowledge. Each fills a different niche:

| Approach | Versioned | Curated | No Opt-in | Local |
|:---------|:---------:|:-------:|:---------:|:-----:|
| **Manual rules** | ✗ | ✓ | ✓ | ✓ |
| **llms.txt** | ~ | ✗ | ✗ | ✗ |
| **MCP servers** | ✓ | ✗ | ✗ | ✗ |
| **skills.sh** | ✗ | ~ | ✓ | ✗ |
| **skills-npm** | ✓ | ✓ | ✗ | ✓ |
| **skilld** | ✓ | ✓ | ✓ | ✓ |

> **Versioned** — tied to your installed package version. **Curated** — distilled best practices, not raw docs. **No Opt-in** — works without the package author doing anything. **Local** — runs on your machine, no external service dependency.

- **Manual rules** (CLAUDE.md, .cursorrules): full control, but you need to already know the best practices and maintain them across every dep.
- **[llms.txt](https://llmstxt.org/)**: standard convention for exposing docs to LLMs, but it's full docs not curated guidance and requires author adoption.
- **MCP servers**: live, version-aware responses, but adds per-request latency and the maintainer has to build and maintain a server.
- **[skills.sh](https://skills.sh/)**: easy skill sharing with a growing ecosystem, but community-sourced without version-awareness or author oversight.
- **[skills-npm](https://github.com/antfu/skills-npm)**: the ideal end-state: zero-token skills shipped by the package author, but requires every maintainer to opt in.
- **skilld**: generates version-aware skills from existing docs, changelogs, issues, and discussions. Works for any package without author opt-in.

## Telemetry

Skilld sends anonymous install events to [skills.sh](https://skills.sh/) so skills can be discovered and ranked. No personal information is collected.

Telemetry is automatically disabled in CI environments.

To opt out, set either environment variable:

```bash
DISABLE_TELEMETRY=1
DO_NOT_TRACK=1
```

## Related

- [skills-npm](https://github.com/antfu/skills-npm) - Convention for shipping agent skills in npm packages
- [mdream](https://github.com/harlan-zw/mdream) - HTML to Markdown converter
- [retriv](https://github.com/harlan-zw/retriv) - Vector search with sqlite-vec

## License

Licensed under the [MIT license](https://github.com/harlan-zw/skilld/blob/main/LICENSE).
