#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { defineCommand, runMain } from 'citty'
import consola from 'consola'
import { resolvePackageDocs } from './npm'
import { agents, detectCurrentAgent, sanitizeName } from './agents'
import { type OptimizeModel, getAvailableModels, optimizeDocs } from './optimize'

const main = defineCommand({
  meta: {
    name: 'skilld',
    description: 'Sync package documentation for agentic use',
  },
  args: {
    package: {
      type: 'positional',
      description: 'Package name to sync docs for',
      required: false,
    },
    global: {
      type: 'boolean',
      alias: 'g',
      description: 'Install globally to ~/.claude/skills',
      default: false,
    },
    agent: {
      type: 'string',
      alias: 'a',
      description: 'Target specific agent (claude-code, cursor, windsurf, etc.)',
    },
    model: {
      type: 'string',
      alias: 'm',
      description: 'LLM model (haiku, sonnet, opus, gemini-flash, gemini-pro)',
    },
    yes: {
      type: 'boolean',
      alias: 'y',
      description: 'Skip prompts, use defaults',
      default: false,
    },
  },
  async run({ args }) {
    const currentAgent = args.agent as keyof typeof agents | undefined ?? detectCurrentAgent()

    if (!currentAgent) {
      consola.warn('Could not detect agent. Use --agent <name>')
      consola.info('Supported: ' + Object.keys(agents).join(', '))
      return
    }

    const agent = agents[currentAgent]
    consola.info(`Target: ${agent.displayName}`)

    if (!args.package) {
      consola.warn('Usage: skilld <package-name>')
      return
    }

    // Determine model - from flag, prompt, or default
    let model: OptimizeModel = 'haiku'

    if (args.model) {
      model = args.model as OptimizeModel
    }
    else if (!args.yes) {
      const availableModels = await getAvailableModels()
      if (availableModels.length > 0) {
        const modelChoice = await consola.prompt('Select LLM for SKILL.md generation:', {
          type: 'select',
          options: availableModels.map(m => ({
            label: m.recommended ? `${m.name} (Recommended)` : m.name,
            value: m.id,
            hint: m.description,
          })),
          initial: availableModels.find(m => m.recommended)?.id || availableModels[0]?.id,
        }) as string
        model = modelChoice as OptimizeModel
      }
    }

    await syncPackage(args.package, {
      global: args.global,
      agent: currentAgent,
      model,
    })
  },
})

async function syncPackage(packageName: string, config: {
  global: boolean
  agent: keyof typeof agents
  model: 'haiku' | 'sonnet' | 'opus' | 'gemini-flash' | 'gemini-pro'
}) {
  consola.start(`Resolving ${packageName}...`)

  const resolved = await resolvePackageDocs(packageName)
  if (!resolved) {
    consola.error(`Could not find docs for: ${packageName}`)
    return
  }

  const agent = agents[config.agent]
  const baseDir = config.global
    ? join(homedir(), '.claude/skills')
    : join(process.cwd(), agent.skillsDir)

  const skillDir = join(baseDir, sanitizeName(packageName))
  const docsDir = join(skillDir, 'docs')

  mkdirSync(docsDir, { recursive: true })

  // Fetch llms.txt and download all referenced .md files
  let llmsContent: string | null = null
  if (resolved.llmsUrl) {
    consola.start('Fetching llms.txt...')
    llmsContent = await fetchText(resolved.llmsUrl)
    if (llmsContent) {
      // Normalize links to relative paths for local access
      const normalizedLlms = llmsContent.replace(/\]\(\/([^)]+\.md)\)/g, '](./docs/$1)')
      writeFileSync(join(skillDir, 'llms.txt'), normalizedLlms)
      consola.success('Saved llms.txt')

      // Parse and download all .md files
      const baseUrl = resolved.docsUrl || new URL(resolved.llmsUrl).origin
      const mdUrls = parseMarkdownLinks(llmsContent)

      if (mdUrls.length > 0) {
        consola.start(`Downloading ${mdUrls.length} doc files...`)
        let downloaded = 0

        for (const mdPath of mdUrls) {
          const url = mdPath.startsWith('http') ? mdPath : `${baseUrl.replace(/\/$/, '')}${mdPath}`
          const content = await fetchText(url)
          if (content && content.length > 100) {
            // Save with path structure: docs/guide/essentials/reactivity.md
            const localPath = mdPath.startsWith('/') ? mdPath.slice(1) : mdPath
            const filePath = join(docsDir, localPath)
            mkdirSync(dirname(filePath), { recursive: true })
            writeFileSync(filePath, content)
            downloaded++
          }
        }

        consola.success(`Downloaded ${downloaded}/${mdUrls.length} docs`)
      }
    }
  }

  // Fallback to README
  if (resolved.readmeUrl && !existsSync(join(docsDir, 'llms.txt'))) {
    consola.start('Fetching README...')
    const content = await fetchReadme(resolved.readmeUrl)
    if (content) {
      writeFileSync(join(docsDir, 'README.md'), content)
      consola.success('Saved README.md')
    }
  }

  // Generate SKILL.md using Haiku
  // Read best-practices docs from local files
  let docsContent: string | null = null

  if (llmsContent) {
    // Find and read best-practices related docs
    const bestPracticesPaths = parseMarkdownLinks(llmsContent).filter(p =>
      p.includes('/style-guide/') || p.includes('/best-practices/') || p.includes('/typescript/'),
    )

    const sections: string[] = []
    for (const mdPath of bestPracticesPaths) {
      const localPath = mdPath.startsWith('/') ? mdPath.slice(1) : mdPath
      const filePath = join(docsDir, localPath)
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8')
        sections.push(`# ${mdPath}\n\n${content}`)
      }
    }

    docsContent = sections.length > 0 ? sections.join('\n\n---\n\n') : llmsContent
  }
  else if (existsSync(join(docsDir, 'README.md'))) {
    docsContent = readFileSync(join(docsDir, 'README.md'), 'utf-8')
  }

  if (docsContent) {
    consola.start(`Generating SKILL.md with ${config.model}...`)
    const { optimized, wasOptimized } = await optimizeDocs(
      docsContent,
      packageName,
      config.agent,
      config.model,
    )

    if (wasOptimized) {
      // Clean up output
      let skillMd = optimized
        .replace(/^```markdown\n?/m, '')
        .replace(/\n?```$/m, '')
        .trim()

      // Find the first frontmatter block (skip any header before it)
      const frontmatterMatch = skillMd.match(/^(.*?)(---\n[\s\S]*?\n---)/m)
      if (frontmatterMatch && frontmatterMatch[2]) {
        // Use content starting from frontmatter
        skillMd = skillMd.slice(skillMd.indexOf('---'))
      }

      // Ensure frontmatter exists
      if (!skillMd.startsWith('---')) {
        skillMd = `---
name: ${sanitizeName(packageName)}
description: "${resolved.description || packageName} - Use this skill when working with ${packageName}."
version: "${resolved.version || 'latest'}"
---

${skillMd}`
      }

      // Add documentation navigation section
      skillMd += `

## Documentation

For deeper information, read the local docs. The \`llms.txt\` file contains an index with relative links to all documentation files:

\`\`\`
./llms.txt          # Index with links to all docs
./docs/api/         # API reference
./docs/guide/       # Guides and tutorials
./docs/style-guide/ # Style guide rules
\`\`\`

Follow relative links in llms.txt to read specific documentation files.
`
      writeFileSync(join(skillDir, 'SKILL.md'), skillMd)
      consola.success('Generated SKILL.md')
    }
    else {
      consola.warn('Haiku not available, creating minimal SKILL.md')
      const skillMd = `---
name: ${sanitizeName(packageName)}
description: "${resolved.description || packageName} - Use this skill when working with ${packageName}."
version: "${resolved.version || 'latest'}"
---

# ${packageName}

${resolved.description || ''}

## Documentation

Raw docs in \`docs/\` - use skill-creator to generate optimized content.
`
      writeFileSync(join(skillDir, 'SKILL.md'), skillMd)
    }
  }

  consola.success(`Synced ${packageName} to ${skillDir}`)
}

async function fetchText(url: string): Promise<string | null> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'skilld/1.0' },
  }).catch(() => null)

  if (!res?.ok) return null
  return res.text()
}

async function fetchReadme(url: string): Promise<string | null> {
  // Handle ungh:// URLs
  if (url.startsWith('ungh://')) {
    const parts = url.replace('ungh://', '').split('/')
    const owner = parts[0]
    const repo = parts[1]
    const subdir = parts.slice(2).join('/')

    const unghUrl = subdir
      ? `https://ungh.cc/repos/${owner}/${repo}/files/main/${subdir}/README.md`
      : `https://ungh.cc/repos/${owner}/${repo}/readme`

    const res = await fetch(unghUrl, {
      headers: { 'User-Agent': 'skilld/1.0' },
    }).catch(() => null)

    if (!res?.ok) return null

    const text = await res.text()
    try {
      const json = JSON.parse(text) as { markdown?: string, file?: { contents?: string } }
      return json.markdown || json.file?.contents || null
    }
    catch {
      return text
    }
  }

  return fetchText(url)
}

/**
 * Parse markdown links from llms.txt to get .md file paths
 */
function parseMarkdownLinks(content: string): string[] {
  const links: string[] = []
  const linkRegex = /\[([^\]]+)\]\(([^)]+\.md)\)/g
  let match

  while ((match = linkRegex.exec(content)) !== null) {
    const url = match[2]!
    if (!links.includes(url)) {
      links.push(url)
    }
  }

  return links
}

/**
 * Extract sections from llms-full.txt by URL patterns
 * Format: ---\nurl: /path.md\n---\n<content>\n\n---\nurl: ...
 */
function extractSections(content: string, patterns: string[]): string | null {
  const sections: string[] = []
  const parts = content.split(/\n---\n/)

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!
    const urlMatch = part.match(/^url:\s*(.+)$/m)
    if (!urlMatch) continue

    const url = urlMatch[1]!
    if (patterns.some(p => url.includes(p))) {
      // Include content after the url line
      const contentStart = part.indexOf('\n', part.indexOf('url:'))
      if (contentStart > -1) {
        sections.push(part.slice(contentStart + 1))
      }
    }
  }

  if (sections.length === 0) return null
  return sections.join('\n\n---\n\n')
}

runMain(main)
