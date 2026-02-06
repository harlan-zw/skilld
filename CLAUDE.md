# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm build          # Build with obuild
pnpm dev:prepare    # Stub for development (obuild --stub)
pnpm typecheck      # TypeScript check (tsc --noEmit)
pnpm lint           # ESLint (@antfu/eslint-config)
pnpm test           # Run vitest (tests in test/, not src/)
pnpm test -- test/cache.test.ts  # Single test file
```

### CLI Commands

```bash
skilld                # Interactive menu
skilld add vue,nuxt   # Add skills for packages
skilld update         # Update all outdated skills
skilld update vue     # Update specific package
skilld remove         # Remove installed skills
skilld status         # Show skill status
skilld config         # Change settings
skilld install        # Restore references from lockfile
skilld uninstall      # Remove skilld data
skilld search "query" # Search indexed docs
skilld search "query" -p nuxt  # Search filtered by package
```

## Architecture

CLI tool that generates AI agent skills from NPM package documentation. Flow: `package name → resolve docs → cache references → generate SKILL.md → install to agent dirs`.

**Key directories:**
- `~/.skilld/` - Global cache: `references/<pkg>@<version>/`, `llm-cache/`, `config.yaml`
- `.claude/skills/<pkg>/SKILL.md` - Generated skill files (project-level)
- `src/commands/` - CLI subcommands routed via citty `subCommands` in cli.ts
- `src/agent/` - Agent registry, detection, LLM spawning, skill generation
- `src/sources/` - Doc fetching (npm registry, llms.txt, GitHub via ungh.cc)
- `src/cache/` - Reference caching with symlinks to `~/.skilld/references/`
- `src/retriv/` - Vector search with sqlite-vec + @huggingface/transformers embeddings
- `src/core/` - Config (custom YAML parser), skills iteration, formatting, lockfile

**Doc resolution cascade:**
1. Package ships `skills/` directory → symlink directly (skills-npm convention)
2. Git-hosted versioned docs → fetch from GitHub tags via ungh.cc
3. `llms.txt` at package homepage → parse and download linked .md files
4. GitHub README via ungh proxy → fallback

**LLM integration (NO AI SDK):**
Spawns CLI processes directly (`claude`, `gemini`) with `--add-dir` for references. Custom stream-json parsing for progress. Results cached at `~/.skilld/llm-cache/<sha256>.json` with 7-day TTL.

**Agent detection (`src/agent/detect.ts`):**
Checks env vars (`CLAUDE_CODE`, `CURSOR_SESSION`) and project dirs (`.claude/`, `.cursor/`) to auto-detect target. Registry in `src/agent/registry.ts` defines per-agent skill dirs and detection.

**Cache structure:**
```
~/.skilld/references/<pkg>@<version>/
  docs/     # Fetched external docs
  github/   # Issues, discussions, releases
  pkg/      # Symlink → node_modules/<pkg>
```
References are global/static; SKILL.md is per-project (different conventions). Cache key is exact `name@version`. Symlinks are created in `.claude/skills/<pkg>/.skilld/` (gitignored, recreated by `skilld install`).

## Conventions

- **Functional only** — no classes, pure functions throughout
- **Custom YAML** — config.yaml and skilld-lock.yaml use hand-rolled parsers (no yaml library)
- **Let errors propagate** — fetch errors return `null`, resolution tracks attempts in `ResolveAttempt[]`
- **Parallelization** — `p-limit` for concurrency, batch downloads (20 at a time), `sync-parallel.ts` for multi-package
- **Overrides** — `src/sources/overrides.ts` has hardcoded fixes for packages with broken npm metadata (vue, nuxt, etc.)
- **Version comparison** — `isOutdated()` compares major.minor only, ignores patch
- **Tests** — vitest with `globals: true`, tests live in `test/` dir (not colocated), fs mocked via `vi.mock('node:fs')`
- **Build** — `obuild` bundles multiple entry points (cli, index, types, cache, retriv, agent, sources) as subpath exports
