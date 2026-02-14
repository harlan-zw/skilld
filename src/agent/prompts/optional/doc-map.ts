import type { PromptSection, ReferenceWeight, SectionContext } from './types.ts'
import { maxLines } from './budget.ts'

export function apiSection({ hasReleases, hasChangelog, hasIssues, hasDiscussions, enabledSectionCount }: SectionContext): PromptSection {
  // Build reference weights — only include available references
  const referenceWeights: ReferenceWeight[] = [
    { name: 'Docs', path: './.skilld/docs/', score: 10, useFor: 'Primary source — scan all doc pages for export names' },
  ]
  if (hasReleases) {
    referenceWeights.push({ name: 'Releases', path: './.skilld/releases/_INDEX.md', score: 5, useFor: 'New APIs added in recent versions' })
  }
  if (hasChangelog) {
    referenceWeights.push({ name: 'Changelog', path: `./.skilld/pkg/${hasChangelog}`, score: 5, useFor: 'New APIs added in recent versions' })
  }
  referenceWeights.push({ name: 'Package', path: './.skilld/pkg/', score: 4, useFor: 'Check exports field and entry points' })
  if (hasIssues) {
    referenceWeights.push({ name: 'Issues', path: './.skilld/issues/_INDEX.md', score: 1, useFor: 'Skip' })
  }
  if (hasDiscussions) {
    referenceWeights.push({ name: 'Discussions', path: './.skilld/discussions/_INDEX.md', score: 1, useFor: 'Skip' })
  }

  return {
    referenceWeights,

    task: `**Generate a doc map — a compact index of exports the LLM wouldn't already know, linked to source files.** Focus on APIs added in recent versions, non-obvious exports, and anything with surprising behavior that isn't covered in API Changes or Best Practices.

Skip well-known, stable APIs the LLM was trained on. Skip self-explanatory utilities (\`isString\`, \`toArray\`). The value is navigational: function name → which file to Read for details.`,

    format: `\`\`\`
## Doc Map

### [Queries](./.skilld/docs/queries.md)

createQueryKeyStore, queryOptions, infiniteQueryOptions

### [Hooks](./.skilld/docs/hooks.md)  *(v5.0+)*

useSuspenseQuery, usePrefetchQuery, useQueries

### [Composables](./.skilld/docs/composables.md)

useNuxtData, usePreviewMode, prerenderRoutes
\`\`\`

Comma-separated names per group. One line per doc page. Annotate version when APIs are recent additions. For single-doc packages, use a flat comma list.`,

    rules: [
      `- **Doc Map:** names only, grouped by doc page, MAX ${maxLines(15, 25, enabledSectionCount)} lines`,
      '- Skip entirely for packages with fewer than 5 exports or only 1 doc page',
      '- Prioritize new/recent exports over well-established APIs',
      '- No signatures, no descriptions — the linked doc IS the description',
      '- Do not list functions already in API Changes or Best Practices',
    ],
  }
}
