/**
 * Detailed prompt - comprehensive skill generation
 */

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PromptPreset } from './types'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SKILL_CREATOR_PATH = join(__dirname, '../../../skills/skill-creator/SKILL.md')

export const detailedPreset: PromptPreset = {
  id: 'detailed',
  name: 'Detailed',
  description: 'Comprehensive skill with API signatures, gotchas, and doc index',

  build(packageName, packageDocs) {
    return `IMPORTANT: YOU MUST USE THIS SKILL: ${SKILL_CREATOR_PATH}

Generate a SKILL.md for the "${packageName}" package.

## Focus Areas (CRITICAL - in priority order)

1. **API signatures and syntax** - Exact function signatures, parameter types, return types. "How do I call X?" not "remember to use X"
2. **Version-specific APIs** - What's new in recent versions (e.g., "3.5+"). Modern patterns that replace old ones
3. **Non-obvious gotchas** - Edge cases, common mistakes, things that silently fail
4. **Package-specific patterns** - Patterns unique to THIS package, not general programming advice

## Anti-patterns to AVOID

- Generic web dev advice (accessibility basics, "use semantic HTML", general security)
- Advice any senior dev already knows ("virtualize large lists", "avoid N+1 queries")
- Style guide rules that aren't API-specific
- Marketing language or feature lists without syntax

## Documentation Index

If the package has local docs (llms.txt or similar), include a table at the end:

\`\`\`markdown
## Documentation

| Topic | Path | Description |
|-------|------|-------------|
| API Reference | ./docs/api/ | Function signatures |
| Composables | ./docs/composables/ | Reactive utilities |
| ... | ... | ... |
\`\`\`

Reinterpret vague llms.txt entries into actionable categories. Group by what a developer would search for.

## Rules

- Output ONLY the markdown content, no explanations
- Prioritize "what's the syntax for X" over "remember to do Y"
- Skip installation, badges, marketing
- Keep under 400 lines
- Code examples > prose explanations

Package docs:

${packageDocs}
`
  },
}
