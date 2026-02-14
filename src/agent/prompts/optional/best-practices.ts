import type { PromptSection, ReferenceWeight, SectionContext } from './types.ts'
import { maxItems, maxLines } from './budget.ts'

export function bestPracticesSection({ packageName, hasIssues, hasDiscussions, hasReleases, hasChangelog, features, enabledSectionCount }: SectionContext): PromptSection {
  const searchHints: string[] = []
  if (features?.search !== false) {
    searchHints.push(
      `\`npx -y skilld search "recommended" -p ${packageName}\``,
      `\`npx -y skilld search "avoid" -p ${packageName}\``,
    )
  }

  // Build reference weights — only include available references
  const referenceWeights: ReferenceWeight[] = [
    { name: 'Docs', path: './.skilld/docs/', score: 9, useFor: 'Primary source — recommended patterns, configuration, idiomatic usage' },
  ]
  if (hasDiscussions) {
    referenceWeights.push({ name: 'Discussions', path: './.skilld/discussions/_INDEX.md', score: 8, useFor: 'Q&A with accepted answers reveal "the right way"' })
  }
  if (hasIssues) {
    referenceWeights.push({ name: 'Issues', path: './.skilld/issues/_INDEX.md', score: 7, useFor: 'Questions reveal what users find confusing' })
  }
  if (hasReleases) {
    referenceWeights.push({ name: 'Releases', path: './.skilld/releases/_INDEX.md', score: 3, useFor: 'Only for new patterns introduced in recent versions' })
  }
  if (hasChangelog) {
    referenceWeights.push({ name: 'Changelog', path: `./.skilld/pkg/${hasChangelog}`, score: 3, useFor: 'Only for new patterns introduced in recent versions' })
  }

  return {
    referenceWeights,

    task: `**Extract non-obvious best practices from the references.** Focus on recommended patterns Claude wouldn't already know: idiomatic usage, preferred configurations, performance tips, patterns that differ from what a developer would assume. Surface new patterns from recent minor releases that may post-date training data. Every item must link to a verified source file.

Skip: obvious API usage, installation steps, general TypeScript/programming patterns, anything a developer would naturally write without reading the docs.
${searchHints.length ? `\nSearch: ${searchHints.join(', ')}` : ''}`,

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
      `- **${maxItems(4, 10, enabledSectionCount)} best practice items**`,
      `- **MAX ${maxLines(80, 150, enabledSectionCount)} lines** for best practices section`,
      '- **Only link files confirmed to exist** via Glob or Read — no guessed paths',
    ],
  }
}
