/**
 * Simple prompt - streamlined skill generation
 */

import type { PromptPreset } from './types'

export const simplePreset: PromptPreset = {
  id: 'simple',
  name: 'Simple',
  description: 'Concise skill with essential APIs and examples',

  build(packageName, packageDocs) {
    return `Generate a concise SKILL.md for "${packageName}".

## Requirements

1. Start with YAML frontmatter: name, description (when to use this skill)
2. Core API - most used functions with signatures and 1-line examples
3. Common patterns - 2-3 code snippets for typical use cases
4. Gotchas - only non-obvious issues that cause bugs

## Format

\`\`\`markdown
---
name: ${packageName}
description: Use when working with ${packageName} or importing from "${packageName}".
---

## Core API

\`function(args): returnType\` - what it does

## Patterns

\\\`\\\`\\\`ts
// typical usage
\\\`\\\`\\\`

## Gotchas

- Issue: cause and fix
\`\`\`

## Rules

- Under 150 lines
- No installation, no marketing
- Code > prose
- Output markdown only

Docs:

${packageDocs}
`
  },
}
