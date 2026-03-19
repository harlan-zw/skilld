---
name: sqlite-vec-skilld
description: "ALWAYS use when writing code importing \"sqlite-vec\". Consult for debugging, best practices, or modifying sqlite-vec, sqlite vec."
metadata:
  version: 0.1.7
  generated_by: Claude Code · Haiku 4.5
  generated_at: 2026-03-19
---

# asg017/sqlite-vec `sqlite-vec`

**Version:** 0.1.7
**Tags:** latest: 0.1.7, alpha: 0.1.7-alpha.13

**References:** [package.json](./.skilld/pkg/package.json) — exports, entry points • [README](./.skilld/pkg/README.md) — setup, basic usage • [Docs](./.skilld/docs/_INDEX.md) — API reference, guides • [GitHub Issues](./.skilld/issues/_INDEX.md) — bugs, workarounds, edge cases • [Releases](./.skilld/releases/_INDEX.md) — changelog, breaking changes, new APIs

## Search

Use `skilld search` instead of grepping `.skilld/` directories — hybrid semantic + keyword search across all indexed docs, issues, and releases. If `skilld` is unavailable, use `npx -y skilld search`.

```bash
skilld search "query" -p sqlite-vec
skilld search "issues:error handling" -p sqlite-vec
skilld search "releases:deprecated" -p sqlite-vec
```

Filters: `docs:`, `issues:`, `releases:` prefix narrows by source type.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes — prioritize recent major/minor releases.

- BREAKING: DELETE operations now properly clear vector data and free space — v0.1.7 changed behavior from only setting validity bits. Code using DELETE statements may see different storage behavior [source](./.skilld/releases/v0.1.7.md:L16)

- NEW: Distance column constraints in KNN queries — v0.1.7 adds support for `>`, `>=`, `<`, `<=` constraints on the distance column, enabling pagination-like patterns without requiring large k values [source](./.skilld/releases/v0.1.7.md:L17)

- NEW: Metadata columns in vec0 virtual tables — v0.1.6 added ability to declare metadata columns that can be filtered in WHERE clauses of KNN queries alongside vector matching [source](./.skilld/releases/v0.1.6.md:L13-27)

- NEW: Partition keys for internal index sharding — v0.1.6 added `partition key` syntax to internally shard vector indexes by column values [source](./.skilld/releases/v0.1.6.md:L23-24)

- NEW: Auxiliary columns with `+` prefix — v0.1.6 added support for auxiliary columns (prefix with `+`) that are unindexed but available for fast lookups in KNN query results [source](./.skilld/releases/v0.1.6.md:L31-33)

- BREAKING: `vec_npy_each` table function removed from default entrypoint — v0.1.3 moved this experimental function out due to CVE-2024-46488 security mitigation; affected code using untrusted SQL or the rare `vec_npy_each` function [source](./.skilld/releases/v0.1.3.md:L9)

**Also changed:** Static linking support for SQLite 3.31.1+ · `serialize_float32()` / `serialize_int8()` Python functions added
<!-- /skilld:api-changes -->

<!-- skilld:best-practices -->
## Best Practices

- **Use two-column re-scoring pattern for binary quantization** — store both quantized and full-precision vectors; query coarse index with quantized vectors, then re-score top candidates with full precision to recover quality lost from extreme dimensionality reduction [source](./.skilld/docs/binary-quant.md#re-scoring)

- **Combine `vec_slice()` with `vec_normalize()` for Matryoshka embeddings** — truncating dimensions requires subsequent normalization to maintain embedding quality and semantic meaning [source](./.skilld/docs/matryoshka.md#matryoshka-embeddings-with-sqlite-vec)

- **Prefer scalar quantization over binary quantization for moderate storage savings** — trade off storage efficiency against quality loss; `vec_quantize_float16` (2 bytes per value) and `vec_quantize_int8` (1 byte per value) offer better quality retention than binary quantization for many use cases [source](./.skilld/docs/scalar-quant.md#L1:26)

- **Use partition keys to shard large vector datasets** — declare a `partition key` column in `CREATE VIRTUAL TABLE` to internally shard the vector index on that column, improving query performance by reducing search scope [source](./.skilld/releases/v0.1.6.md#L23:24)

- **Combine metadata columns (indexed) with auxiliary columns (unindexed) for efficient filtering** — use regular metadata columns for dimensions you filter on in KNN WHERE clauses; prefix columns with `+` to store related data without indexing overhead [source](./.skilld/releases/v0.1.6.md#L26:33)

- **Use distance constraints instead of oversampling for pagination** — as of v0.1.7, apply `distance > threshold` or `distance < threshold` constraints in WHERE clauses to paginate through KNN results without fetching excess candidates [source](./.skilld/releases/v0.1.7.md#L17)

- **Monitor the k value limit when performing large KNN queries** — the default maximum k is 4096 (configurable) to prevent memory exhaustion; be aware that kNN results are materialized in memory and internally use O(n²) complexity on k [source](./.skilld/issues/issue-157.md#L22:33)

- **Rely on v0.1.7+ for automatic DELETE cleanup** — vector space is now reclaimed when enough vectors are deleted to clear a chunk (~1024 vectors); previous versions only marked entries as deleted without freeing space [source](./.skilld/releases/v0.1.7.md#L16)

- **Select embedding models with quantization support for better results** — models like `nomic-embed-text-v1.5`, `mxbai-embed-large-v1`, and OpenAI's `text-embedding-3` are specifically trained to maintain quality after quantization and Matryoshka truncation [source](./.skilld/docs/binary-quant.md#L114:125)
<!-- /skilld:best-practices -->
