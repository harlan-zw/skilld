import type { PromptSection, ReferenceWeight, SectionContext, SectionValidationWarning } from './types.ts'
import { maxItems, maxLines, releaseBoost } from './budget.ts'
import { checkLineCount, checkSourceCoverage, checkSourcePaths, checkSparseness } from './validate.ts'

export function apiChangesSection({ packageName, version, hasReleases, hasChangelog, hasDocs, hasIssues, hasDiscussions, pkgFiles, features, enabledSectionCount, releaseCount }: SectionContext): PromptSection {
  const [, major, minor] = version?.match(/^(\d+)\.(\d+)/) ?? []
  const boost = releaseBoost(releaseCount, minor ? Number(minor) : undefined)

  // Search hints for the task text (specific queries to run)
  const searchHints: string[] = []
  if (features?.search !== false) {
    searchHints.push(
      `\`npx -y skilld search "deprecated" -p ${packageName}\``,
      `\`npx -y skilld search "breaking" -p ${packageName}\``,
    )
    if (major && minor) {
      const minorNum = Number(minor)
      const majorNum = Number(major)
      if (minorNum <= 2) {
        searchHints.push(`\`npx -y skilld search "v${majorNum}.${minorNum}" -p ${packageName}\``)
        if (minorNum > 0)
          searchHints.push(`\`npx -y skilld search "v${majorNum}.${minorNum - 1}" -p ${packageName}\``)
        if (majorNum > 0)
          searchHints.push(`\`npx -y skilld search "v${majorNum - 1}" -p ${packageName}\``)
      }
      else {
        searchHints.push(`\`npx -y skilld search "v${majorNum}.${minorNum}" -p ${packageName}\``)
        searchHints.push(`\`npx -y skilld search "v${majorNum}.${minorNum - 1}" -p ${packageName}\``)
        searchHints.push(`\`npx -y skilld search "v${majorNum}.${minorNum - 2}" -p ${packageName}\``)
      }
      searchHints.push(`\`npx -y skilld search "Features" -p ${packageName}\``)
    }
  }

  // Build reference weights — only include available references
  const referenceWeights: ReferenceWeight[] = []
  if (hasReleases) {
    referenceWeights.push({ name: 'Releases', path: './.skilld/releases/_INDEX.md', score: 9, useFor: 'Primary source — version headings list new/deprecated/renamed APIs' })
  }
  if (hasChangelog) {
    referenceWeights.push({ name: 'Changelog', path: `./.skilld/${hasChangelog}`, score: 9, useFor: 'Features/Breaking Changes sections per version' })
  }
  if (hasDocs) {
    referenceWeights.push({ name: 'Docs', path: './.skilld/docs/', score: 4, useFor: 'Only migration guides or upgrade pages' })
  }
  if (hasIssues) {
    referenceWeights.push({ name: 'Issues', path: './.skilld/issues/_INDEX.md', score: 2, useFor: 'Skip unless searching a specific removed API' })
  }
  if (hasDiscussions) {
    referenceWeights.push({ name: 'Discussions', path: './.skilld/discussions/_INDEX.md', score: 2, useFor: 'Skip unless searching a specific removed API' })
  }

  const releaseGuidance = hasReleases
    ? `\n\n**Scan release history:** Read \`./.skilld/releases/_INDEX.md\` for a timeline. Focus on [MAJOR] and [MINOR] releases — these contain breaking changes and renamed/deprecated APIs that LLMs trained on older data will get wrong.`
    : ''

  const versionGuidance = major && minor
    ? `\n\n**Item scoring** — include only items scoring ≥ 3. Items scoring 0 MUST be excluded:

| Change type | v${major}.x | v${Number(major) - 1}.x → v${major}.x migration | Older |
|-------------|:---:|:---:|:---:|
| Silent breakage (compiles, wrong result) | 5 | 4 | 0 |
| Removed/breaking API | 5 | 3 | 0 |
| New API unknown to LLMs | 4 | 1 | 0 |
| Deprecated (still works) | 3 | 1 | 0 |
| Renamed/moved | 3 | 1 | 0 |

The "Older" column means ≤ v${Number(major) - 2}.x — these changes are NOT useful because anyone on v${major}.x already migrated past them.`
    : ''

  const apiChangesMaxLines = maxLines(50, Math.round(80 * boost), enabledSectionCount)

  return {
    referenceWeights,

    validate(content: string): SectionValidationWarning[] {
      const warnings: SectionValidationWarning[] = [
        ...checkLineCount(content, apiChangesMaxLines),
        ...checkSparseness(content),
        ...checkSourceCoverage(content, 0.8),
        ...checkSourcePaths(content),
      ]
      // Every detailed item needs BREAKING/DEPRECATED/NEW label
      const detailedBullets = (content.match(/^- /gm) || []).length
      const labeledBullets = (content.match(/^- (?:BREAKING|DEPRECATED|NEW): /gm) || []).length
      // Exclude "Also changed" compact line from the count
      const alsoChangedItems = (content.match(/\*\*Also changed:\*\*/g) || []).length
      if (detailedBullets > 2 && labeledBullets / (detailedBullets - alsoChangedItems || 1) < 0.8)
        warnings.push({ warning: `Only ${labeledBullets}/${detailedBullets} items have BREAKING/DEPRECATED/NEW labels` })
      // Heading required
      if (!/^## API Changes/m.test(content))
        warnings.push({ warning: 'Missing required "## API Changes" heading' })
      return warnings
    },

    task: `**Find new, deprecated, and renamed APIs from version history.** Focus exclusively on APIs that changed between versions — LLMs trained on older data will use the wrong names, wrong signatures, or non-existent functions.

Find from releases/changelog:
- **New APIs added in recent major/minor versions** that the LLM will not know to use (new functions, composables, components, hooks)
- **Deprecated or removed APIs** that LLMs trained on older data will still use (search for "deprecated", "removed", "renamed")
- **Signature changes** where old code compiles but behaves wrong (changed parameter order, return types, default values)
- **Breaking changes** in recent versions (v2 → v3 migrations, major version bumps)
${searchHints.length ? `\nSearch: ${searchHints.join(', ')}` : ''}${releaseGuidance}${versionGuidance}`,

    format: `<format-example note="Illustrative structure only — replace placeholder names with real ${packageName} APIs">
## API Changes

This section documents version-specific API changes — prioritize recent major/minor releases.

- BREAKING: \`createClient(url, key)\` — v2 changed to \`createClient({ url, key })\`, old positional args silently ignored [source](./.skilld/releases/v2.0.0.md:L18)

- NEW: \`useTemplateRef()\` — new in v3.5, replaces \`$refs\` pattern [source](./.skilld/releases/v3.5.0.md#new-features)

- BREAKING: \`db.query()\` — returns \`{ rows }\` not raw array since v4 [source](./.skilld/docs/migration.md:L42:55)

**Also changed:** \`defineModel()\` stable v3.4 · \`onWatcherCleanup()\` new v3.5 · \`Suspense\` stable v3.5
</format-example>

Each item: BREAKING/DEPRECATED/NEW label + API name + what changed + source link. All source links MUST use \`./.skilld/\` prefix and include a **section anchor** (\`#heading-slug\`) or **line reference** (\`:L<line>\` or \`:L<start>:<end>\`) to pinpoint the exact location (e.g., \`[source](./.skilld/releases/v2.0.0.md#breaking-changes)\` or \`[source](./.skilld/docs/api.md:L127)\`). Do NOT use emoji — use plain text markers only.

**Tiered format:** Top-scoring items get full detailed entries. Remaining relevant items go in a compact "**Also changed:**" line at the end — API name + brief label, separated by \` · \`. This surfaces more changes without bloating the section.`,

    rules: [
      `- **API Changes:** ${maxItems(6, Math.round(12 * boost), enabledSectionCount)} detailed items + compact "Also changed" line for remaining, MAX ${apiChangesMaxLines} lines`,
      '- **Every detailed item MUST have a `[source](./.skilld/...#section)` link** with a section anchor (`#heading-slug`) or line reference (`:L<line>` or `:L<start>:<end>`). If you cannot cite a specific location in a release, changelog entry, or migration doc, do NOT include the item',
      '- **Recency:** Only include changes from the current major version and the previous→current migration. Exclude changes from older major versions entirely — users already migrated past them',
      '- Focus on APIs that CHANGED, not general conventions or gotchas',
      '- New APIs get NEW: prefix, deprecated/breaking get BREAKING: or DEPRECATED: prefix',
      '- **Experimental APIs:** Append `(experimental)` to ALL items for unstable/experimental APIs — every mention, not just the first. MAX 2 experimental items',
      pkgFiles?.some(f => f.endsWith('.d.ts'))
        ? '- **Verify before including:** Search for API names in `.d.ts` type definitions or source exports. If you searched and cannot find the export, do NOT include the item — you may be confusing it with a similar API from a different package or version'
        : '- **Verify before including:** Cross-reference API names against release notes, changelogs, or docs. Do NOT include APIs you infer from similar packages — only include APIs explicitly named in the references',
      '- **Framework-specific sourcing:** When docs have framework-specific subdirectories (e.g., `vue/`, `react/`), always cite the framework-specific version. Never cite React migration guides as sources in a Vue skill when equivalent Vue docs exist',
      hasReleases ? '- Start with `./.skilld/releases/_INDEX.md` to identify recent major/minor releases, then read specific release files' : '',
      hasChangelog ? '- Scan CHANGELOG.md for version headings, focus on Features/Breaking Changes sections' : '',
    ].filter(Boolean),
  }
}
