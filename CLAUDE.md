# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm build          # Build with obuild
pnpm dev:prepare    # Stub for development
pnpm typecheck      # TypeScript check
pnpm test           # Vitest (no tests yet)

# CLI usage
skilld                    # Interactive picker from package.json deps
skilld <package>          # Sync single package
skilld -q "<query>"       # Search global DB
skilld -g                 # Install globally (~/.claude/skills)
skilld -a cursor          # Target specific agent
skilld -y                 # Skip prompts, use defaults
```

## Architecture

CLI tool that generates skills from NPM package documentation and installs to coding agent directories.

**Directory structure:**
- `~/.skilld/references/<pkg>@<major.minor>/` - Global docs cache
- `~/.skilld/search.db` - Hybrid BM25 + vector index
- `.claude/skills/<pkg>/SKILL.md` - Project-specific skill
- `.claude/skills/<pkg>/references/` → symlink to global cache

**Source files:**
- `cli.ts` - CLI entry point with interactive picker, sync, and search modes
- `cache.ts` - Global cache at `~/.skilld/`, version-keyed storage
- `doc-resolver/` - NPM lookup, GitHub README, llms.txt parsing
- `agent/` - Agent detection, LLM optimization (haiku/sonnet/gemini)
- `retriv/` - Vector search with package-scoped queries

**Flow:**
1. Resolve package → NPM registry → homepage/llms.txt/README
2. Download docs to `~/.skilld/references/<pkg>@<version>/`
3. Index into global `search.db`
4. Generate SKILL.md via LLM (best-practices focus)
5. Write to `.claude/skills/<pkg>/`, symlink references
6. Add `Related:` line for linked dependencies

**Agent Support:**
Detects via env vars (CLAUDE_CODE, CURSOR_SESSION, etc.) or project dirs. Each agent has skillsDir (project) and globalSkillsDir (user home).
