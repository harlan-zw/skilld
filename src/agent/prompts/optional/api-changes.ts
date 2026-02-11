import type { PromptSection, ReferenceWeight, SectionContext } from './types'

export function apiChangesSection({ packageName, version, hasReleases, hasChangelog, hasIssues, hasDiscussions, features }: SectionContext): PromptSection {
  const [, major, minor] = version?.match(/^(\d+)\.(\d+)/) ?? []

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
    referenceWeights.push({ name: 'Changelog', path: `./.skilld/pkg/${hasChangelog}`, score: 9, useFor: 'Features/Breaking Changes sections per version' })
  }
  referenceWeights.push({ name: 'Docs', path: './.skilld/docs/', score: 4, useFor: 'Only migration guides or upgrade pages' })
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
    ? `\n\n**New APIs in recent releases are the highest-priority gaps** — the LLM was trained on older data and will use outdated or non-existent APIs instead. Search for recent version tags and "Features" in releases/changelog to find new composables, components, hooks, or utilities added in recent major/minor versions.`
    : ''

  return {
    referenceWeights,

    task: `**Find new, deprecated, and renamed APIs from version history.** Focus exclusively on APIs that changed between versions — LLMs trained on older data will use the wrong names, wrong signatures, or non-existent functions.

Find from releases/changelog:
- **New APIs added in recent major/minor versions** that the LLM will not know to use (new functions, composables, components, hooks)
- **Deprecated or removed APIs** that LLMs trained on older data will still use (search for "deprecated", "removed", "renamed")
- **Signature changes** where old code compiles but behaves wrong (changed parameter order, return types, default values)
- **Breaking changes** in recent versions (v2 → v3 migrations, major version bumps)
${searchHints.length ? `\nSearch: ${searchHints.join(', ')}` : ''}${releaseGuidance}${versionGuidance}`,

    format: `## API Changes

This section documents version-specific API changes — prioritize recent major/minor releases.

\`\`\`
## API Changes

⚠️ \`createClient(url, key)\` — v2 changed to \`createClient({ url, key })\`, old positional args silently ignored [source](./.skilld/releases/v2.0.0.md)

✨ \`useTemplateRef()\` — new in v3.5, replaces \`$refs\` pattern [source](./.skilld/releases/v3.5.0.md)

⚠️ \`db.query()\` — returns \`{ rows }\` not raw array since v4 [source](./.skilld/docs/migration.md)
\`\`\`

Each item: ⚠️ (breaking/deprecated) or ✨ (new) + API name + what changed + source link.`,

    rules: [
      '- **API Changes:** 8-12 items from version history, MAX 80 lines',
      '- Prioritize recent major/minor releases over old patch versions',
      '- Focus on APIs that CHANGED, not general conventions or gotchas',
      '- New APIs get ✨, deprecated/breaking get ⚠️',
      hasReleases ? '- Start with `./.skilld/releases/_INDEX.md` to identify recent major/minor releases, then read specific release files' : '',
      hasChangelog ? '- Scan CHANGELOG.md for version headings, focus on Features/Breaking Changes sections' : '',
    ].filter(Boolean),
  }
}
