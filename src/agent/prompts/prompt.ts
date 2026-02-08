/**
 * Skill generation prompt - minimal, agent explores via tools
 */

import { dirname } from 'node:path'

export type SkillSection = 'best-practices' | 'api' | 'custom'

export interface BuildSkillPromptOptions {
  packageName: string
  /** Absolute path to skill directory with ./.skilld/ */
  skillDir: string
  /** Package version (e.g., "3.5.13") */
  version?: string
  /** Has GitHub data (issues + discussions) indexed */
  hasGithub?: boolean
  /** Has release notes */
  hasReleases?: boolean
  /** CHANGELOG filename if found in package (e.g. CHANGELOG.md, changelog.md) */
  hasChangelog?: string | false
  /** Resolved absolute paths to .md doc files */
  docFiles?: string[]
  /** Doc source type */
  docsType?: 'llms.txt' | 'readme' | 'docs'
  /** Package ships its own docs */
  hasShippedDocs?: boolean
  /** Which sections to generate (defaults to all) */
  sections?: SkillSection[]
  /** Custom instructions from the user (when 'custom' section selected) */
  customPrompt?: string
}

/**
 * Group files by parent directory with counts
 * e.g. `/path/to/docs/api/ (15 .md files)`
 */
function formatDocTree(files: string[]): string {
  const dirs = new Map<string, number>()
  for (const f of files) {
    const dir = dirname(f)
    dirs.set(dir, (dirs.get(dir) || 0) + 1)
  }
  return [...dirs.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dir, count]) => `- \`${dir}/\` (${count} .md files)`)
    .join('\n')
}

function generateImportantBlock({ packageName, hasGithub, hasReleases, hasChangelog, docsType, hasShippedDocs, skillDir }: {
  packageName: string
  hasGithub?: boolean
  hasReleases?: boolean
  hasChangelog?: string | false
  docsType: string
  hasShippedDocs: boolean
  skillDir: string
}): string {
  const searchDesc = hasGithub ? 'Docs + GitHub' : 'Docs'
  const searchCmd = `\`Bash 'npx skilld search "<query>" -p ${packageName}'\``

  const docsPath = hasShippedDocs
    ? `\`${skillDir}/.skilld/pkg/docs/\` or \`${skillDir}/.skilld/pkg/README.md\``
    : docsType === 'llms.txt'
      ? `\`${skillDir}/.skilld/docs/llms.txt\``
      : docsType === 'readme'
        ? `\`${skillDir}/.skilld/pkg/README.md\``
        : `\`${skillDir}/.skilld/docs/\``

  const rows = [
    [searchDesc, searchCmd],
    ['Docs', docsPath],
    ['Package', `\`${skillDir}/.skilld/pkg/\``],
  ]
  if (hasGithub) {
    rows.push(['GitHub', `\`${skillDir}/.skilld/github/\``])
  }
  if (hasChangelog) {
    rows.push(['Changelog', `\`${skillDir}/.skilld/pkg/${hasChangelog}\``])
  }
  if (hasReleases) {
    rows.push(['Releases', `\`${skillDir}/.skilld/releases/\``])
  }

  const table = [
    '| Resource | Command |',
    '|----------|---------|',
    ...rows.map(([desc, cmd]) => `| ${desc} | ${cmd} |`),
  ].join('\n')

  return `**IMPORTANT:** Use these references\n\n${table}`
}

/**
 * Build the skill generation prompt - agent uses tools to explore
 */
export function buildSkillPrompt(opts: BuildSkillPromptOptions): string {
  const { packageName, skillDir, version, hasGithub, hasReleases, hasChangelog, docFiles, docsType = 'docs', hasShippedDocs = false, sections, customPrompt } = opts

  const hasBestPractices = !sections || sections.includes('best-practices')
  const hasApi = !sections || sections.includes('api')
  const hasCustom = sections?.includes('custom') && customPrompt

  const versionContext = version ? ` v${version}` : ''

  const docsSection = docFiles?.length
    ? `**Documentation** (use Read tool to explore):\n${formatDocTree(docFiles)}`
    : ''

  const importantBlock = generateImportantBlock({ packageName, hasGithub, hasReleases, hasChangelog, docsType, hasShippedDocs, skillDir })

  // Build task description based on selected sections
  const taskParts: string[] = []
  if (hasBestPractices) {
    taskParts.push(`Find novel best practices from the references. Every item must link to its source.

Look for: tip, warning, best practice, avoid, pitfall, note, important.`)
  }
  if (hasApi) {
    taskParts.push(`**Generate an API reference section.** List the package's exported functions/composables grouped by documentation page or category. Each function gets a one-liner description. Link group headings to the source doc URL when available.`)
  }
  if (hasCustom) {
    taskParts.push(`**Custom instructions from the user:**\n${customPrompt}`)
  }

  // Build format section based on selected sections
  const formatParts: string[] = []
  if (hasBestPractices) {
    formatParts.push(`\`\`\`
[✅ descriptive title](./.skilld/path/to/source.md)
\`\`\`ts
code example (1-3 lines)
\`\`\`

[❌ pitfall title](./.skilld/path/to/source.md#section)
\`\`\`ts
wrong // correct way
\`\`\`
\`\`\``)
  }
  if (hasApi) {
    formatParts.push(`API reference format${hasBestPractices ? ' (place at end, after best practices)' : ''}:
\`\`\`
## API

### [Category Name](./.skilld/docs/category.md)
- functionName — one-line description
- anotherFn — one-line description
\`\`\`

Link group headings to the local \`./.skilld/\` source file.

For single-page-docs packages, use a flat list without grouping. Skip the API section entirely for packages with fewer than 3 exports.`)
  }

  // Build rules based on selected sections
  const rules: string[] = []
  if (hasBestPractices)
    rules.push('- **5-10 best practice items**, MAX 150 lines for best practices')
  if (hasApi)
    rules.push('- **API section:** list all public exports, grouped by doc page, MAX 80 lines')
  rules.push(
    '- Link to exact source file where you found info',
    '- TypeScript only, Vue uses `<script setup lang="ts">`',
    '- Imperative voice ("Use X" not "You should use X")',
    '- **NEVER fetch external URLs.** All information is in the local `./.skilld/` directory. Use Read/Glob only.',
  )

  return `Generate SKILL.md body for "${packageName}"${versionContext}.

${importantBlock}
${docsSection ? `${docsSection}\n` : ''}

## Skill Quality Principles

The context window is a shared resource. Skills share it with system prompt, conversation history, other skills, and the user request.

- **Only add what Claude doesn't know.** Claude already knows general programming, popular APIs, common patterns. Challenge every line: "Does this justify its token cost?"
- **Prefer concise examples over verbose explanations.** A 2-line code example beats a paragraph.
- **Skip:** API signatures, installation steps, tutorials, marketing, general programming knowledge, anything in the package README that's obvious
- **Include:** Non-obvious gotchas, surprising defaults, version-specific breaking changes, pitfalls from issues, patterns that differ from what Claude would assume

## Task

${taskParts.join('\n\n')}

## Format

${formatParts.join('\n\n')}

## Rules

${rules.join('\n')}

## Output

Write the body content to \`${skillDir}/.skilld/_SKILL.md\` using the Write tool.
Do NOT output the content to stdout. Write it to the file only.
`
}
