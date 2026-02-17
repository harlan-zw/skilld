import type { PromptSection, ReferenceWeight, SectionContext } from './types.ts'
import { maxItems, maxLines, releaseBoost } from './budget.ts'

export function bestPracticesSection({ packageName, hasIssues, hasDiscussions, hasReleases, hasChangelog, hasDocs, pkgFiles, features, enabledSectionCount, releaseCount, version }: SectionContext): PromptSection {
  const [,, minor] = version?.match(/^(\d+)\.(\d+)/) ?? []
  // Dampened boost — best practices are less directly tied to releases than API changes
  const rawBoost = releaseBoost(releaseCount, minor ? Number(minor) : undefined)
  const boost = 1 + (rawBoost - 1) * 0.5
  const searchHints: string[] = []
  if (features?.search !== false) {
    searchHints.push(
      `\`npx -y skilld search "recommended" -p ${packageName}\``,
      `\`npx -y skilld search "avoid" -p ${packageName}\``,
    )
  }

  // Build reference weights — only include available references
  const referenceWeights: ReferenceWeight[] = []
  if (hasDocs) {
    referenceWeights.push({ name: 'Docs', path: './.skilld/docs/', score: 9, useFor: 'Primary source — recommended patterns, configuration, idiomatic usage' })
  }
  if (hasDiscussions) {
    referenceWeights.push({ name: 'Discussions', path: './.skilld/discussions/_INDEX.md', score: 5, useFor: 'Only maintainer-confirmed patterns — community workarounds are lower confidence' })
  }
  if (hasIssues) {
    referenceWeights.push({ name: 'Issues', path: './.skilld/issues/_INDEX.md', score: 4, useFor: 'Only workarounds confirmed by maintainers or with broad adoption' })
  }
  if (hasReleases) {
    referenceWeights.push({ name: 'Releases', path: './.skilld/releases/_INDEX.md', score: 3, useFor: 'Only for new patterns introduced in recent versions' })
  }
  if (hasChangelog) {
    referenceWeights.push({ name: 'Changelog', path: `./.skilld/${hasChangelog}`, score: 3, useFor: 'Only for new patterns introduced in recent versions' })
  }

  return {
    referenceWeights,

    task: `**Extract non-obvious best practices from the references.** Focus on recommended patterns the LLM wouldn't already know: idiomatic usage, preferred configurations, performance tips, patterns that differ from what a developer would assume. Surface new patterns from recent minor releases that may post-date training data.

Skip: obvious API usage, installation steps, general TypeScript/programming patterns not specific to this package, anything a developer would naturally write without reading the docs. Every item must be specific to ${packageName} — reject general programming advice that applies to any project.
${searchHints.length ? `\nSearch: ${searchHints.join(', ')}` : ''}`,

    format: `<format-example note="Illustrative structure only — replace placeholder names with real ${packageName} APIs">
\`\`\`
## Best Practices

- Use ${packageName}'s built-in \`createX()\` helper over manual wiring — handles cleanup and edge cases automatically [source](./.skilld/docs/api.md)

\`\`\`ts
// Preferred
const instance = createX({ ... })

// Avoid — misses cleanup, error boundaries
const instance = new X()
instance.init({ ... })
\`\`\`

- Pass config through \`defineConfig()\` — enables type inference and plugin merging [source](./.skilld/docs/config.md)

- Prefer \`useComposable()\` over direct imports in reactive contexts — ensures proper lifecycle binding [source](./.skilld/docs/composables.md)
\`\`\`
</format-example>

Each item: markdown list item (-) + ${packageName}-specific pattern + why it's preferred + source link. Code block only when the pattern isn't obvious from the title. Use the most relevant language tag (ts, vue, css, json, etc). Every example must be specific to ${packageName} — never generic TypeScript/JS advice. All source links MUST use \`./.skilld/\` prefix (e.g., \`[source](./.skilld/docs/guide.md)\`). Do NOT use emoji — use plain text markers only.`,

    rules: [
      `- **${maxItems(4, Math.round(10 * boost), enabledSectionCount)} best practice items**`,
      `- **MAX ${maxLines(80, Math.round(150 * boost), enabledSectionCount)} lines** for best practices section`,
      pkgFiles?.some(f => f.endsWith('.d.ts'))
        ? '- **Verify before including:** Confirm file paths exist via Glob/Read before linking. Confirm functions/composables are real exports in `./.skilld/pkg/` `.d.ts` files before documenting. If you cannot find an export, do NOT include it'
        : '- **Verify before including:** Confirm file paths exist via Glob/Read before linking. Only document APIs explicitly named in docs, release notes, or changelogs — do NOT infer API names from similar packages',
      '- **Source quality:** Issues and discussions are only valid sources if they contain a maintainer response, accepted answer, or confirmed workaround. Do NOT cite bare issue titles, one-line feature requests, or unresolved questions as sources',
      '- **Framework-specific sourcing:** When docs have framework-specific subdirectories (e.g., `vue/`, `react/`), always prefer the framework-specific version over shared or other-framework docs. Never cite React examples in a Vue skill',
      '- **Diversity:** Cover at least 3 distinct areas of the library. Count items per feature — if any single feature exceeds 40% of items, replace the excess with items from underrepresented areas',
      '- **Experimental APIs:** Mark unstable/experimental features with `(experimental)` in the description. **MAX 1 experimental item** — prioritize stable, production-ready patterns that most users need',
    ],
  }
}
