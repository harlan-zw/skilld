import type { PromptSection, ReferenceWeight, SectionContext, SectionValidationWarning } from './types.ts'
import { resolveSkilldCommand } from '../../../core/skilld-command.ts'
import { maxItems, maxLines, releaseBoost } from './budget.ts'
import { checkAbsolutePaths, checkLineCount, checkSourceCoverage, checkSourcePaths, checkSparseness } from './validate.ts'

export function bestPracticesSection({ packageName, hasIssues, hasDiscussions, hasReleases, hasChangelog, hasDocs, pkgFiles, features, enabledSectionCount, releaseCount, version, overheadLines }: SectionContext): PromptSection {
  const [,, minor] = version?.match(/^(\d+)\.(\d+)/) ?? []
  // Dampened boost — best practices are less directly tied to releases than API changes
  const rawBoost = releaseBoost(releaseCount, minor ? Number(minor) : undefined)
  const boost = 1 + (rawBoost - 1) * 0.5
  const cmd = resolveSkilldCommand()
  const searchHints: string[] = []
  if (features?.search !== false) {
    searchHints.push(
      `\`${cmd} search "recommended" -p ${packageName}\``,
      `\`${cmd} search "avoid" -p ${packageName}\``,
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

  const bpMaxLines = maxLines(100, Math.round(250 * boost), enabledSectionCount, overheadLines)

  return {
    referenceWeights,

    validate(content: string): SectionValidationWarning[] {
      const warnings: SectionValidationWarning[] = [
        ...checkLineCount(content, bpMaxLines),
        ...checkSparseness(content),
        ...checkSourceCoverage(content, 0.8),
        ...checkSourcePaths(content),
        ...checkAbsolutePaths(content),
      ]
      // Code block density — warn if >50% of items have code blocks
      const bullets = (content.match(/^- /gm) || []).length
      const codeBlocks = (content.match(/^```/gm) || []).length / 2 // open+close pairs
      if (bullets > 2 && codeBlocks / bullets > 0.5)
        warnings.push({ warning: `${Math.round(codeBlocks)}/${bullets} items have code blocks — prefer concise descriptions with source links` })
      // Heading required
      if (!/^## Best Practices/im.test(content))
        warnings.push({ warning: 'Missing required "## Best Practices" heading' })
      return warnings
    },

    task: `**Extract non-obvious best practices from the references.** Focus on recommended patterns the LLM wouldn't already know: idiomatic usage, preferred configurations, performance tips, patterns that differ from what a developer would assume. Surface new patterns from recent minor releases that may post-date training data.

Skip: obvious API usage, installation steps, general TypeScript/programming patterns not specific to this package, anything a developer would naturally write without reading the docs. Every item must be specific to ${packageName} — reject general programming advice that applies to any project.
${searchHints.length ? `\nSearch: ${searchHints.join(', ')}` : ''}`,

    format: `<format-example note="Illustrative structure only — replace placeholder names with real ${packageName} APIs">
\`\`\`
## Best Practices

- Use ${packageName}'s built-in \`createX()\` helper over manual wiring — handles cleanup and edge cases automatically [source](./.skilld/docs/api.md#createx)

- Pass config through \`defineConfig()\` — enables type inference and plugin merging [source](./.skilld/docs/config.md:L22)

- Prefer \`useComposable()\` over direct imports in reactive contexts — ensures proper lifecycle binding [source](./.skilld/docs/composables.md:L85:109)

- Set \`retryDelay\` to exponential backoff for production resilience — default fixed delay causes thundering herd under load [source](./.skilld/docs/advanced.md#retry-strategies)

\`\`\`ts
// Only when the pattern cannot be understood from the description alone
const client = createX({ retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000) })
\`\`\`
\`\`\`
</format-example>

Each item: markdown list item (-) + ${packageName}-specific pattern + why it's preferred + \`[source](./.skilld/...#section)\` link. **Prefer concise descriptions over inline code** — the source link points the agent to full examples in the docs. Only add a code block when the pattern genuinely cannot be understood from the description alone (e.g., non-obvious syntax, multi-step wiring). Most items should be description + source link only. All source links MUST use \`./.skilld/\` prefix and include a **section anchor** (\`#heading-slug\`) or **line reference** (\`:L<line>\` or \`:L<start>:<end>\`) to pinpoint the exact location. Do NOT use emoji — use plain text markers only.`,

    rules: [
      `- **${maxItems(6, Math.round(15 * boost), enabledSectionCount)} best practice items**`,
      `- **MAX ${bpMaxLines} lines** for best practices section`,
      '- **Every item MUST have a `[source](./.skilld/...#section)` link** with a section anchor (`#heading-slug`) or line reference (`:L<line>` or `:L<start>:<end>`). If you cannot cite a specific location in a reference file, do NOT include the item — unsourced items risk hallucination and will be rejected',
      '- **Minimize inline code.** Most items should be description + source link only. The source file contains full examples the agent can read. Only add a code block when the pattern is unintuitable from the description (non-obvious syntax, surprising argument order, multi-step wiring). Aim for at most 1 in 4 items having a code block',
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
