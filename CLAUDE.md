# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm build          # Build with obuild
pnpm dev:prepare    # Stub for development
pnpm typecheck      # TypeScript check
pnpm test           # Run vitest
pnpm test -- src/doc-resolver/llms.test.ts  # Single test file

# CLI (after build)
skilld                    # Interactive picker from package.json deps
skilld <package>          # Install single package skill
skilld sync               # Sync all outdated skills
skilld search <query>     # Search indexed docs
skilld list               # Show installed skills
skilld remove <package>   # Remove skill
```

## Architecture

CLI tool that generates AI agent skills from NPM package documentation.

**Key directories:**
- `~/.skilld/` - Global cache (references, llm-cache, search.db)
- `.claude/skills/<pkg>/SKILL.md` - Generated skill files
- `src/commands/` - CLI subcommands (install, sync, search, list, remove)
- `src/agent/` - Agent detection, LLM calls, skill generation
- `src/doc-resolver/` - Doc fetching (npm registry, llms.txt, GitHub)
- `src/retriv/` - Vector search with sqlite-vec

**Doc resolution priority:**
1. Package ships `skills/` directory → use directly
2. `llms.txt` at package homepage → parse sections
3. GitHub README via ungh proxy → fetch markdown

**LLM providers (via AI SDK):**
- Claude Code: opus, sonnet, haiku
- Gemini CLI: gemini-2.5-pro, gemini-2.5-flash, etc
- Codex CLI: codex

**Agent detection (`src/agent/detect.ts`):**
Checks env vars (CLAUDE_CODE, CURSOR_SESSION) and project dirs (.claude/, .cursor/) to auto-detect which agent to target.

**Skills-npm convention:**
Respects packages that ship `skills/` directory—no generation needed, uses bundled skills directly.
