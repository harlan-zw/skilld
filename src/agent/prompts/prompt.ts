/**
 * Skill generation prompt - minimal, agent explores via tools
 */

import { dirname } from 'node:path'

export interface BuildSkillPromptOptions {
  packageName: string
  /** Absolute path to skill directory with ./references/ */
  skillDir: string
  /** Package version (e.g., "3.5.13") */
  version?: string
  /** Has issues indexed */
  hasIssues?: boolean
  /** Has release notes */
  hasReleases?: boolean
  /** Has CHANGELOG.md in package */
  hasChangelog?: boolean
  /** Resolved absolute paths to .md doc files */
  docFiles?: string[]
  /** Doc source type */
  docsType?: 'llms.txt' | 'readme' | 'docs'
  /** Package ships its own docs */
  hasShippedDocs?: boolean
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

function generateImportantBlock({ packageName, hasIssues, hasReleases, hasChangelog, docsType, hasShippedDocs, skillDir }: {
  packageName: string
  hasIssues?: boolean
  hasReleases?: boolean
  hasChangelog?: boolean
  docsType: string
  hasShippedDocs: boolean
  skillDir: string
}): string {
  const searchDesc = hasIssues ? 'Docs + issues' : 'Docs'
  const searchCmd = `\`Bash 'npx skilld ${packageName} -q "<query>"'\``

  const docsPath = hasShippedDocs
    ? `\`${skillDir}/references/pkg/docs/\` or \`${skillDir}/references/pkg/README.md\``
    : docsType === 'llms.txt'
      ? `\`${skillDir}/references/docs/llms.txt\``
      : docsType === 'readme'
        ? `\`${skillDir}/references/pkg/README.md\``
        : `\`${skillDir}/references/docs/\``

  const rows = [
    [searchDesc, searchCmd],
    ['Docs', docsPath],
    ['Package', `\`${skillDir}/references/pkg/\``],
  ]
  if (hasIssues) {
    rows.push(['Issues', `\`${skillDir}/references/issues/\``])
  }
  if (hasChangelog) {
    rows.push(['Changelog', `\`${skillDir}/references/pkg/CHANGELOG.md\``])
  }
  if (hasReleases) {
    rows.push(['Releases', `\`${skillDir}/references/releases/\``])
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
  const { packageName, skillDir, version, hasIssues, hasReleases, hasChangelog, docFiles, docsType = 'docs', hasShippedDocs = false } = opts

  const versionContext = version ? ` v${version}` : ''

  const docsSection = docFiles?.length
    ? `**Documentation** (use Read tool to explore):\n${formatDocTree(docFiles)}`
    : ''

  const importantBlock = generateImportantBlock({ packageName, hasIssues, hasReleases, hasChangelog, docsType, hasShippedDocs, skillDir })

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

Find novel best practices from the references. Every item must link to its source.

Look for: tip, warning, best practice, avoid, pitfall, note, important.

## Format

\`\`\`
[✅ descriptive title](./references/path/to/source.md)
\`\`\`ts
code example (1-3 lines)
\`\`\`

[❌ pitfall title](./references/path/to/source.md#section)
\`\`\`ts
wrong // correct way
\`\`\`
\`\`\`

## Rules

- **5-10 items**, MAX 150 lines total body
- Link to exact source file where you found info
- TypeScript only, Vue uses \`<script setup lang="ts">\`
- Imperative voice ("Use X" not "You should use X")

## Output

Start with \`<!-- BEGIN -->\`, end with \`<!-- END -->\`.
Output ONLY the body content between markers.
`
}
