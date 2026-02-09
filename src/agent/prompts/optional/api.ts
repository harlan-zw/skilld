import type { PromptSection, SectionContext } from './types'

export function apiSection({ packageName, hasReleases, hasChangelog }: SectionContext): PromptSection {
  const searchHints = [
    `\`skilld search "added" -p ${packageName}\``,
    `\`skilld search "new" -p ${packageName}\``,
  ]
  const releaseHint = hasReleases || hasChangelog
    ? `\n\nSearch ${hasReleases ? 'releases' : 'changelog'} for recently added APIs using ${searchHints.join(' and ')}. Prioritize exports the LLM likely doesn't know about — new in recent minor/major versions.`
    : ''

  return {
    task: `**Generate a doc map — a compact index of exports the LLM wouldn't already know, linked to source files.** Focus on APIs added in recent versions, non-obvious exports, and anything with surprising behavior that isn't covered in LLM Gaps or Best Practices.

Skip well-known, stable APIs the LLM was trained on. Skip self-explanatory utilities (\`isString\`, \`toArray\`). The value is navigational: function name → which file to Read for details.${releaseHint}`,

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
      '- **Doc Map:** names only, grouped by doc page, MAX 25 lines',
      '- Skip entirely for packages with fewer than 5 exports or only 1 doc page',
      '- Prioritize new/recent exports over well-established APIs',
      '- No signatures, no descriptions — the linked doc IS the description',
      '- Do not list functions already in LLM Gaps or Best Practices',
    ],
  }
}
