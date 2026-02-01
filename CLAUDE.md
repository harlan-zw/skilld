# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm build          # Build with obuild
pnpm dev:prepare    # Stub for development
pnpm lint           # ESLint
pnpm typecheck      # TypeScript check
pnpm test           # Vitest (no tests yet)

# CLI usage
skilld                    # Auto-discover from package.json
skilld vueuse             # By package name
skilld https://nuxt.com   # By URL (crawls site)
skilld -g                 # Install globally (~/.claude/skills)
skilld -a cursor          # Target specific agent
```

## Architecture

CLI tool that generates skills from NPM package documentation and installs to coding agent directories.

**Source files:**
- `cli.ts` - CLI entry point, orchestrates fetch/install
- `npm.ts` - NPM registry lookup, GitHub README resolution via ungh
- `agents.ts` - Agent detection, skill installation to directories
- `index.ts` - Site crawling/indexing (for docs sites, not READMEs)
- `split-text.ts` - Markdown-aware text chunking

**Flow:**
1. Resolve package → npm registry → homepage/repo URL
2. Fetch docs: llms.txt > docs site (crawl) > README (ungh)
3. Detect installed agents (Claude Code, Cursor, etc.)
4. Write SKILL.md to each agent's skill directory

**Output:** `.claude/skills/<package>/SKILL.md`, `.cursor/skills/<package>/SKILL.md`, etc.
