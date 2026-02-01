# Simplified CLI Design

## Commands

```bash
skilld                    # Interactive picker from package.json deps
skilld <package>          # Sync single package
skilld -q "<query>"       # Search global DB, show snippets
```

## Flags

| Flag | Alias | Description |
|------|-------|-------------|
| `--global` | `-g` | Install to `~/.claude/skills/` |
| `--agent` | `-a` | Target specific agent (auto-detect default) |
| `--yes` | `-y` | Skip prompts, use defaults |

Model selection: interactive prompt (kept for cost/quality choice).

## Directory Structure

### Global cache
```
~/.skilld/
├── search.db                      # Hybrid BM25 + vector index
└── references/
    ├── vueuse@10.9/
    │   ├── README.md
    │   └── docs/*.md
    └── @nuxt/kit@3.15/
        └── ...
```

### Project installation
```
.claude/skills/<pkg>/
├── SKILL.md                       # LLM-generated, project-specific
└── references/ → ~/.skilld/references/<pkg>@<major.minor>/
```

## SKILL.md Template

```markdown
---
name: <pkg>
version: <version>
description: <description>
---

IMPORTANT: Query <pkg> docs using `skilld -q "<pkg> <query>"`.

Related: nuxt, h3  <!-- only if these skills exist locally -->

[LLM-generated best practices content...]
```

## Related Skills Linking

On sync, check npm `dependencies` for current package. Scan `.claude/skills/` for existing skills. If overlap, add `Related: x, y, z` line to SKILL.md.

No auto-creation - only links skills the user has already synced.

## Query Output Format

```
$ skilld -q "useFetch options"

vueuse@10.9 | references/docs/functions/useFetch.md:42
  The `useFetch` composable accepts options for immediate execution,
  refetch on parameter change, and custom fetch implementations...

2 results (0.03s)
```

## Doc Resolution Flow

1. Package name → npm registry → homepage/repository
2. Try `llms.txt` at homepage → crawl if found
3. No llms.txt → crawl site with mdream
4. No site → check for `docs/` folder in repo
5. No docs folder → use README.md
6. Download docs to `~/.skilld/references/<pkg>@<major.minor>/`
7. Index into `~/.skilld/search.db`
8. Generate SKILL.md via LLM
9. Write to `.claude/skills/<pkg>/SKILL.md`
10. Symlink `references/` → global cache

## Version Handling

- Cache key: `<pkg>@<major.minor>` (patch ignored)
- Re-sync overwrites if version differs
- SKILL.md regenerated per-project

## Implementation Changes

### `src/cli.ts` - Rewrite
- No args → read package.json, show multi-select picker
- Positional arg → sync single package
- `-q` flag → search mode
- Keep `--global`, `--agent`, `--yes`

### `src/index.ts` - Keep core
- `generateSkill()` internal, called after doc fetch
- Add `searchDocs(query)` for `-q`
- Keep `crawlSite()`, `fetchFromLlmsTxt()` as fallback

### `src/retriv/` - Extend
- Scoped search by package name
- Snippet extraction with line numbers

### New: `src/cache.ts`
- `~/.skilld/` structure management
- Version comparison (major.minor)
- Symlink creation

### Dropped
- `--output`, `--concurrency`, `--maxPages`, `--crawl`, `--chunkSize` flags
- Direct URL input (URL resolution is internal)
