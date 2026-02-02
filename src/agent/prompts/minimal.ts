/**
 * Minimal prompt - bare essentials
 */

import type { PromptPreset } from './types'

export const minimalPreset: PromptPreset = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Just the API signatures and one example',

  build(packageName, packageDocs) {
    return `Create minimal SKILL.md for "${packageName}".

Output format:
\`\`\`markdown
---
name: ${packageName}
description: Use when working with ${packageName}.
---

## API

\`functionName(args): returnType\`

## Example

\\\`\\\`\\\`ts
import { x } from '${packageName}'
// usage
\\\`\\\`\\\`
\`\`\`

Rules: under 50 lines, API signatures only, one example, no prose.

Docs:
${packageDocs}
`
  },
}
