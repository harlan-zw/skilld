import type { PromptSection, SectionContext } from './types'

export function llmGapsSection({ packageName, hasIssues, hasReleases, hasChangelog }: SectionContext): PromptSection {
  const searchHints = [
    `\`skilld search "deprecated" -p ${packageName}\``,
    `\`skilld search "breaking" -p ${packageName}\``,
  ]
  const searchSources = [
    hasReleases && 'releases',
    hasChangelog && 'changelog',
  ].filter(Boolean)
  const sourceHint = searchSources.length ? ` across ${searchSources.join(' and ')}` : ''

  const releaseGuidance = hasReleases
    ? `\n\n**Scan release history:** Read \`./.skilld/releases/_INDEX.md\` for a timeline. Focus on [MAJOR] and [MINOR] releases — these contain breaking changes and renamed/deprecated APIs that LLMs trained on older data will get wrong.`
    : ''

  const issueGuidance = hasIssues
    ? `\n\n**Mine issues for gotchas:** Read \`./.skilld/issues/_INDEX.md\` for an overview. Focus on bug reports (type: bug) with high reactions — these reveal patterns users consistently get wrong. Closed bugs show resolved pitfalls worth warning about.`
    : ''

  return {
    task: `**Identify patterns an LLM will get wrong on first attempt.** These are NOT best practices — they are constraints, conventions, and non-obvious behaviors that cause immediate errors when an AI generates code without knowing them.

Find:
- Deprecated or renamed APIs that LLMs trained on older data will still use (search releases/changelog for "deprecated", "removed", "renamed")
- Default values that changed between major/minor versions (old code "works" but behaves wrong)
- File-location constraints (e.g. composable only works in specific directories)
- Framework magic that isn't obvious from API signatures (auto-imports, file-based routing, macro transforms)
- APIs that behave differently than similar packages (surprising argument order, return types, sync vs async)
- Context-dependent availability (server-only, client-only, build-time only, must be called inside setup)
- Implicit ordering or lifecycle requirements
- Convention-over-configuration patterns where violating the convention silently fails

Use ${searchHints.join(' and ')} to surface deprecations and breaking changes${sourceHint}.${releaseGuidance}${issueGuidance}`,

    format: `## LLM Gaps

This section goes BEFORE best practices — it's higher priority.

\`\`\`
## LLM Gaps

⚠️ \`createClient(url, key)\` — v2 changed to \`createClient({ url, key })\`, old positional args silently ignored [source](./.skilld/releases/v2.0.0.md)

⚠️ \`definePageMeta()\` — only works in \`pages/**/*.vue\`, silently ignored elsewhere [source](./.skilld/docs/routing.md)

⚠️ \`db.query()\` — returns \`{ rows }\` not raw array since v4, destructure or code breaks silently [source](./.skilld/docs/queries.md)
\`\`\`

Each item: ⚠️ + API/pattern name + what goes wrong + where it works + source link.`,

    rules: [
      '- **LLM Gaps:** 5-10 items that will prevent first-attempt errors, MAX 80 lines',
      '- Focus on "silent failures" and "works but wrong" over obvious runtime errors',
      '- Assume the LLM knows general programming but NOT this package\'s conventions',
      '- Prioritize deprecated/renamed APIs and changed defaults — these cause the most first-attempt failures',
      hasReleases ? '- Start with `./.skilld/releases/_INDEX.md` — scan [MAJOR]/[MINOR] releases for breaking changes, then read specific release files' : '',
      hasIssues ? '- Check `./.skilld/issues/_INDEX.md` for bug reports — high-reaction bugs often reveal non-obvious constraints' : '',
    ].filter(Boolean),
  }
}
