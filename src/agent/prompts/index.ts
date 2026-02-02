/**
 * Skill generation prompt
 */

export interface BuildPromptOptions {
  packageName: string
  packageDocs: string
  referenceFiles?: string[]
}

/**
 * Build the skill generation prompt
 */
export function buildPrompt(opts: BuildPromptOptions): string {
  const { packageName, packageDocs, referenceFiles = [] } = opts

  const filesSection = referenceFiles.length > 0
    ? `\n## Available Reference Files\n\nThese files exist and can be linked to:\n\`\`\`\n${referenceFiles.join('\n')}\n\`\`\`\n\nUse these exact paths when linking. Do NOT invent paths.\n`
    : ''

  return `Generate a SKILL.md for the "${packageName}" package.

## Focus Areas (CRITICAL - in priority order)

1. **API signatures and syntax** - Exact function signatures, parameter types, return types
2. **Version-specific APIs** - What's new in recent versions (e.g., "3.5+"). Modern patterns that replace old ones
3. **Non-obvious gotchas** - Edge cases, common mistakes, things that silently fail
4. **Package-specific patterns** - Patterns unique to THIS package, not general programming advice
5. Always use TypeScript syntax for code examples

## Anti-patterns to AVOID

- Generic web dev advice (accessibility basics, "use semantic HTML", general security)
- Advice any senior dev already knows ("virtualize large lists", "avoid N+1 queries")
- Style guide rules that aren't API-specific
- Marketing language or feature lists without syntax
${filesSection}
## Documentation Index

Include a table at the end linking to reference files. Example format:

\`\`\`markdown
## References

| Topic | Path |
|-------|------|
| API | [./references/docs/api.md](./references/docs/api.md) |
| Source | [./references/dist/index.ts](./references/dist/index.ts) |
\`\`\`

## Rules

- Output ONLY the markdown content, no explanations
- Prioritize "what's the syntax for X" over "remember to do Y"
- Skip installation, badges, marketing
- Keep under 400 lines
- Code examples > prose explanations
- ONLY link to files from the "Available Reference Files" list above

## Package Documentation

${packageDocs}
`
}
