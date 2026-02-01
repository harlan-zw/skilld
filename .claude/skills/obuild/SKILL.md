---
name: obuild
description: Documentation for obuild. Use this skill when working with obuild or importing from "obuild".
version: "0.4.14"
---

Done. Extracted the essential reference for obuild:

**Included:**
- API signatures (CLI, build function, config schema)
- Mode selection logic (trailing slash = transpile vs bundle)
- Stub mode mechanics and its surprising requirements
- Common gotchas (default exports, Windows symlinks, minify defaults)
- Best practices for entry configuration

**Removed:**
- Marketing intro and badges
- Installation instructions
- Prior art/alternatives section
- License/contributor info
- Generic "what is" explanation

The skill is optimized for quick lookup while in code—when a dev agent needs to know how to configure obuild or what stub mode actually requires, it's all there without fluff.