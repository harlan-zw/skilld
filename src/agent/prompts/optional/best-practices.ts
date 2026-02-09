import type { PromptSection, SectionContext } from './types'

export function bestPracticesSection({ packageName, hasIssues, hasDiscussions }: SectionContext): PromptSection {
  const searchHints = [
    `\`skilld search "recommended" -p ${packageName}\``,
    `\`skilld search "avoid" -p ${packageName}\``,
  ]

  const communityGuidance: string[] = []

  if (hasDiscussions) {
    communityGuidance.push('**Mine discussions for patterns:** Read `./.skilld/discussions/_INDEX.md` for an overview. Q&A discussions with accepted answers reveal the "right way" to do things — especially when the question implies a non-obvious pattern.')
  }
  if (hasIssues) {
    communityGuidance.push('**Mine questions from issues:** Issues tagged as questions (type: question) in `./.skilld/issues/_INDEX.md` reveal what users find confusing — address these patterns proactively.')
  }

  const communityBlock = communityGuidance.length
    ? `\n\n${communityGuidance.join('\n\n')}`
    : ''

  return {
    task: `**Extract non-obvious best practices from the references.** Focus on recommended patterns Claude wouldn't already know: idiomatic usage, preferred configurations, performance tips, patterns that differ from what a developer would assume. Surface new patterns from recent minor releases that may post-date training data. Every item must link to a verified source file.

Skip: obvious API usage, installation steps, general TypeScript/programming patterns, anything a developer would naturally write without reading the docs.

Search for recommended patterns using ${searchHints.join(', ')}.${communityBlock}`,

    format: `\`\`\`
## Best Practices

✅ Pass \`AbortSignal\` to long-lived operations — enables caller-controlled cancellation [source](./.skilld/docs/api.md)

\`\`\`ts
async function fetchUser(id: string, signal?: AbortSignal) {
  return fetch(\`/api/users/\${id}\`, { signal })
}
\`\`\`

✅ Use \`satisfies\` for config objects — preserves literal types while validating shape [source](./.skilld/docs/config.md)

✅ Prefer \`structuredClone()\` over spread for deep copies — handles nested objects, Maps, Sets [source](./.skilld/docs/utilities.md)

✅ Set \`isolatedDeclarations: true\` — enables parallel .d.ts emit without full type-checking [source](./.skilld/docs/typescript.md)
\`\`\`

Each item: ✅ + pattern name + why it's preferred + source link. Code block only when the pattern isn't obvious from the title. Use the most relevant language tag (ts, vue, css, json, etc).`,

    rules: [
      '- **5-10 best practice items**',
      '- **MAX 150 lines** for best practices section',
      '- **Only link files confirmed to exist** via Glob or Read — no guessed paths',
      hasDiscussions ? '- Check `./.skilld/discussions/_INDEX.md` for answered Q&A — these reveal idiomatic patterns' : '',
      hasIssues ? '- Check `./.skilld/issues/_INDEX.md` for common questions — address confusing patterns proactively' : '',
    ].filter(Boolean),
  }
}
