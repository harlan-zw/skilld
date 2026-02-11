import type { PromptSection, SectionContext } from './types'

export function apiChangesSection({ packageName, version, hasReleases, hasChangelog, features }: SectionContext): PromptSection {
  const searchHints: string[] = []

  // Parse version for both search hints and guidance
  const [major, minor] = version?.match(/^(\d+)\.(\d+)/)?.[1, 2] ?? []

  // Only emit search hints if search feature is enabled
  if (features?.search !== false) {
    searchHints.push(
      `\`npx -y skilld search "deprecated" -p ${packageName}\``,
      `\`npx -y skilld search "breaking" -p ${packageName}\``,
    )
    // Add version-specific search hints to surface new APIs in recent releases
    if (major && minor) {
      const minorNum = Number(minor)
      const majorNum = Number(major)

      if (minorNum <= 2) {
        // Close to major boundary — include previous major
        searchHints.push(`\`npx -y skilld search "v${majorNum}.${minorNum}" -p ${packageName}\``)
        if (minorNum > 0) {
          searchHints.push(`\`npx -y skilld search "v${majorNum}.${minorNum - 1}" -p ${packageName}\``)
        }
        if (majorNum > 0) {
          searchHints.push(`\`npx -y skilld search "v${majorNum - 1}" -p ${packageName}\``)
        }
      }
      else {
        // Far from boundary — include last 3 minors
        searchHints.push(`\`npx -y skilld search "v${majorNum}.${minorNum}" -p ${packageName}\``)
        searchHints.push(`\`npx -y skilld search "v${majorNum}.${minorNum - 1}" -p ${packageName}\``)
        searchHints.push(`\`npx -y skilld search "v${majorNum}.${minorNum - 2}" -p ${packageName}\``)
      }
      searchHints.push(`\`npx -y skilld search "Features" -p ${packageName}\``)
    }
  }

  // Add fallback hints to read docs directly for discovery
  const docHints: string[] = []
  if (hasReleases) {
    docHints.push('Read `./.skilld/releases/_INDEX.md` for release timeline')
  }
  if (hasChangelog) {
    docHints.push(`Check \`./.skilld/pkg/${hasChangelog}\` for changelog entries`)
  }

  const allHints = [...searchHints, ...docHints]
  const hintsText = allHints.length ? `Use ${allHints.map(h => h.trim()).join(' or ')}` : ''

  const searchSources = [
    hasReleases && 'releases',
    hasChangelog && 'changelog',
  ].filter(Boolean)
  const sourceHint = searchSources.length ? ` across ${searchSources.join(' and ')}` : ''

  const releaseGuidance = hasReleases
    ? `\n\n**Scan release history:** Read \`./.skilld/releases/_INDEX.md\` for a timeline. Focus on [MAJOR] and [MINOR] releases — these contain breaking changes and renamed/deprecated APIs that LLMs trained on older data will get wrong.`
    : ''

  const versionGuidance = major && minor
    ? `\n\n**New APIs in recent releases are the highest-priority gaps** — the LLM was trained on older data and will use outdated or non-existent APIs instead. Search for recent version tags and "Features" in releases/changelog to find new composables, components, hooks, or utilities added in recent major/minor versions.`
    : ''

  return {
    task: `**Find new, deprecated, and renamed APIs from version history.** Focus exclusively on APIs that changed between versions — LLMs trained on older data will use the wrong names, wrong signatures, or non-existent functions.

Find from releases/changelog:
- **New APIs added in recent major/minor versions** that the LLM will not know to use (new functions, composables, components, hooks)
- **Deprecated or removed APIs** that LLMs trained on older data will still use (search for "deprecated", "removed", "renamed")
- **Signature changes** where old code compiles but behaves wrong (changed parameter order, return types, default values)
- **Breaking changes** in recent versions (v2 → v3 migrations, major version bumps)

${hintsText} to surface API changes${sourceHint}.${releaseGuidance}${versionGuidance}`,

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
