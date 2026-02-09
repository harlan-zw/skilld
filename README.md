<h1>skilld</h1>

[![npm version](https://img.shields.io/npm/v/skilld?color=yellow)](https://npmjs.com/package/skilld)
[![npm downloads](https://img.shields.io/npm/dm/skilld?color=yellow)](https://npm.chart.dev/skilld)
[![license](https://img.shields.io/github/license/harlan-zw/skilld?color=yellow)](https://github.com/harlan-zw/skilld/blob/main/LICENSE)

> Expert SKILL.md knowledge for your NPM dependencies.

## Why?

Agents suck at following latest conventions beyond their [reliable knowledge cut-off](https://platform.claude.com/docs/en/about-claude/models/overview#latest-models-comparison). They shoot themselves in the foot
with new APIs and conventions, and they don't know what they don't know.

Agent Skills help us solve this by distilling the most important patterns and conventions for a package into a single SKILL.md file.
Getting skills for our packages either involves the maintainer (or ourselves) taking on the maintenance burden and surfacing them or using skill sharing
sites like [skills.sh](https://skills.sh/).

While these are great for generic skills, they aren't good for NPM skills:
- No version-awareness, high maintenance burden to keep up with new releases and deprecations
- Non-optimized context windows, prompt injection risks
- Community-sourced skills leak personal opinions and biases. Maintainers are out of the loop, and may not even know about them.

Skilld super-charges maintainers' efforts. They write us great docs, release notes and GitHub comments. We generate our own local skills optimized for our models and codebase from them.

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

- 🌍 **Any NPM Package**: Sources GitHub repo, doc sources, releases, issues, discussions and more
- 🤖 **BYO Agent, or don't**: Generate SKILL.md for your key dependencies from sources (with or without an LLM)
- 📚 **SKILL.md your way**: Optional `Best practices`, `LLM Gaps`, `Doc Map` sections; or write your own prompts
- 🔍 **Token Optimized Search**: Semantic + token search with [retriv](https://github.com/harlan-zw/retriv)
- 🎯 **Best practices**: Token-optimized output, prompt injection sanitization, and version-aware
- 🤝 **Ecosystem Friendly**: [skills-npm](https://github.com/antfu/skills-npm) and repo `/llms.txt`

## Quick Start

Run skilld in a project to generate skills for your dependencies through a simple interactive wizard:

```bash
npx skilld
```

If you need to re-configure skilld, just run `npx skilld config` to update your agent, model, or preferences.

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
    "prepare": "skilld --prepare -b"
  }
}
```

## CLI Usage

```bash
# Interactive mode — auto-discover from package.json
skilld

# Add skills for specific package(s)
skilld add vueuse
skilld add vue nuxt pinia

# Update outdated skills
skilld update
skilld update vue

# Search docs across installed skills
skilld search "useFetch options" -p nuxt

# Target a specific agent
skilld add vueuse --agent cursor

# Install globally to ~/.claude/skills
skilld add vueuse --global

# Skip prompts
skilld add vueuse --yes

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

### CLI Options

| Option | Alias | Default | Description |
|--------|-------|---------|-------------|
| `--global` | `-g` | `false` | Install globally to `~/<agent>/skills` |
| `--agent` | `-a` | auto-detect | Target specific agent (claude-code, cursor, etc.) |
| `--yes` | `-y` | `false` | Skip prompts, use defaults |
| `--force` | `-f` | `false` | Ignore all caches, re-fetch docs and regenerate |
| `--model`      | `-m` | config default | LLM model for skill generation (sonnet, haiku, opus, etc.) |
| `--debug`      |      | `false`        | Save raw LLM output to logs/ for each section |
| `--prepare`    |      | `false`        | Non-interactive sync for prepare hook (outdated only) |
| `--background` | `-b` | `false`        | Run `--prepare` in a detached background process |

## Related

- [skills-npm](https://github.com/antfu/skills-npm) - Convention for shipping agent skills in npm packages
- [mdream](https://github.com/harlan-zw/mdream) - HTML to Markdown converter
- [retriv](https://github.com/harlan-zw/retriv) - Vector search with sqlite-vec

## License

Licensed under the [MIT license](https://github.com/harlan-zw/skilld/blob/main/LICENSE).
