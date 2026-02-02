#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import * as p from '@clack/prompts'
import { defineCommand, runMain } from 'citty'
import {
  CACHE_DIR,
  SEARCH_DB,
  ensureCacheDir,
  getCacheDir,
  getVersionKey,
  isCached,
  linkReferences,
  writeToCache,
} from './cache/index'
import {
  downloadLlmsDocs,
  fetchLlmsTxt,
  fetchNpmPackage,
  fetchReadmeContent,
  normalizeLlmsLinks,
  readLocalDependencies,
  resolvePackageDocs,
} from './doc-resolver'
import { type SearchSnippet, createIndex, searchSnippets } from './retriv'
import {
  type OptimizeModel,
  agents,
  detectCurrentAgent,
  detectInstalledAgents,
  optimizeDocs,
  sanitizeName,
} from './agent'

// List installed skills
function listSkills(args: { global?: boolean }) {
  const installedAgents = detectInstalledAgents()
  const cwd = process.cwd()
  let hasSkills = false

  // Local skills (project-level)
  if (!args.global) {
    console.log('\n\x1B[1mLocal Skills\x1B[0m (project)')
    let localFound = false

    for (const agentType of installedAgents) {
      const agent = agents[agentType]
      const skillsDir = join(cwd, agent.skillsDir)

      if (existsSync(skillsDir)) {
        const skills = readdirSync(skillsDir).filter(f => !f.startsWith('.'))
        if (skills.length > 0) {
          localFound = true
          hasSkills = true
          console.log(`  \x1B[36m${agent.displayName}\x1B[0m (${agent.skillsDir})`)
          for (const skill of skills) {
            const skillPath = join(skillsDir, skill, 'SKILL.md')
            const hasSkillMd = existsSync(skillPath)
            const icon = hasSkillMd ? '✓' : '○'
            console.log(`    ${icon} ${skill}`)
          }
        }
      }
    }

    if (!localFound) {
      console.log('  \x1B[90m(none)\x1B[0m')
    }
  }

  // Global skills
  console.log('\n\x1B[1mGlobal Skills\x1B[0m')
  let globalFound = false

  for (const agentType of installedAgents) {
    const agent = agents[agentType]
    const globalDir = agent.globalSkillsDir

    if (globalDir && existsSync(globalDir)) {
      const skills = readdirSync(globalDir).filter(f => !f.startsWith('.'))
      if (skills.length > 0) {
        globalFound = true
        hasSkills = true
        console.log(`  \x1B[36m${agent.displayName}\x1B[0m (${globalDir})`)
        for (const skill of skills) {
          const skillPath = join(globalDir, skill, 'SKILL.md')
          const hasSkillMd = existsSync(skillPath)
          const icon = hasSkillMd ? '✓' : '○'
          console.log(`    ${icon} ${skill}`)
        }
      }
    }
  }

  if (!globalFound) {
    console.log('  \x1B[90m(none)\x1B[0m')
  }

  if (!hasSkills) {
    console.log('\nRun \x1B[1mskilld <package>\x1B[0m to install skills')
  }

  console.log()
}

const main = defineCommand({
  meta: {
    name: 'skilld',
    description: 'Sync package documentation for agentic use',
  },
  args: {
    package: {
      type: 'positional',
      description: 'Package name to sync docs for (use "list" to show installed)',
      required: false,
    },
    query: {
      type: 'string',
      alias: 'q',
      description: 'Search docs: skilld -q "useFetch options"',
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
    yes: {
      type: 'boolean',
      alias: 'y',
      description: 'Skip prompts, use defaults',
      default: false,
    },
  },
  async run({ args }) {
    // List command (handle as pseudo-subcommand)
    if (args.package === 'list') {
      return listSkills(args)
    }

    // Search mode
    if (args.query) {
      await searchMode(args.query)
      return
    }

    p.intro('skilld')

    const currentAgent = args.agent as keyof typeof agents | undefined ?? detectCurrentAgent()

    if (!currentAgent) {
      p.log.warn('Could not detect agent. Use --agent <name>')
      p.log.info(`Supported: ${Object.keys(agents).join(', ')}`)
      p.outro('Exiting')
      return
    }

    const agent = agents[currentAgent]
    p.log.info(`Target: ${agent.displayName}`)

    // No package specified - show interactive picker
    if (!args.package) {
      const packages = await interactivePicker()
      if (!packages || packages.length === 0) {
        p.outro('No packages selected')
        return
      }

      // Determine model once for all packages
      const model = await selectModel(args.yes)
      if (!model)
        return

      for (const pkg of packages) {
        await syncPackage(pkg, {
          global: args.global,
          agent: currentAgent,
          model,
        })
      }
      return
    }

    // Single package mode
    const model = await selectModel(args.yes)
    if (!model)
      return

    await syncPackage(args.package, {
      global: args.global,
      agent: currentAgent,
      model,
    })
  },
})

async function searchMode(query: string) {
  if (!existsSync(SEARCH_DB)) {
    console.log('No docs indexed yet. Run `skilld <package>` first.')
    return
  }

  const start = performance.now()
  const results = await searchSnippets(query, { dbPath: SEARCH_DB }, { limit: 5 })
  const elapsed = ((performance.now() - start) / 1000).toFixed(2)

  if (results.length === 0) {
    console.log(`No results for "${query}"`)
    return
  }

  console.log()
  for (const r of results) {
    formatSnippet(r)
  }
  console.log(`${results.length} results (${elapsed}s)`)
}

function formatSnippet(r: SearchSnippet) {
  console.log(`${r.package} | ${r.source}:${r.line}`)
  console.log(`  ${r.content.replace(/\n/g, '\n  ')}`)
  console.log()
}

async function interactivePicker(): Promise<string[] | null> {
  const deps = await readLocalDependencies(process.cwd()).catch(() => [])

  if (deps.length === 0) {
    p.log.warn('No package.json found or no dependencies')
    return null
  }

  const options = deps.map(d => ({
    label: d.name,
    value: d.name,
    hint: d.version,
  }))

  const selected = await p.multiselect({
    message: 'Select packages to sync',
    options,
    required: false,
  })

  if (p.isCancel(selected)) {
    p.cancel('Cancelled')
    return null
  }

  return selected as string[]
}

const availableModels: Array<{ id: OptimizeModel, name: string, hint: string, recommended?: boolean }> = [
  { id: 'haiku', name: 'Claude Haiku', hint: 'Fast, cheap', recommended: true },
  { id: 'sonnet', name: 'Claude Sonnet', hint: 'Balanced' },
  { id: 'gemini-flash', name: 'Gemini Flash', hint: 'Fast, free' },
  { id: 'codex', name: 'Codex CLI', hint: 'OpenAI o4-mini' },
]

async function selectModel(skipPrompt: boolean): Promise<OptimizeModel | null> {
  if (skipPrompt)
    return 'haiku'

  const modelChoice = await p.select({
    message: 'Select LLM for SKILL.md generation',
    options: availableModels.map(m => ({
      label: m.recommended ? `${m.name} (Recommended)` : m.name,
      value: m.id,
      hint: m.hint,
    })),
    initialValue: 'haiku',
  })

  if (p.isCancel(modelChoice)) {
    p.cancel('Cancelled')
    return null
  }

  return modelChoice as OptimizeModel
}

async function syncPackage(packageName: string, config: {
  global: boolean
  agent: keyof typeof agents
  model: OptimizeModel
}) {
  const spin = p.spinner()
  spin.start(`Resolving ${packageName}`)

  const resolved = await resolvePackageDocs(packageName)
  if (!resolved) {
    spin.stop(`Could not find docs for: ${packageName}`)
    return
  }

  const version = resolved.version || 'latest'
  const versionKey = getVersionKey(version)

  // Check cache
  const useCache = isCached(packageName, version)
  if (useCache) {
    spin.stop(`Using cached ${packageName}@${versionKey}`)
  }
  else {
    spin.stop(`Resolved ${packageName}@${version}`)
  }

  ensureCacheDir()

  const agent = agents[config.agent]
  const baseDir = config.global
    ? join(CACHE_DIR, 'skills')
    : join(process.cwd(), agent.skillsDir)

  const skillDir = join(baseDir, sanitizeName(packageName))
  mkdirSync(skillDir, { recursive: true })

  // Fetch and cache docs (if not cached)
  let llmsRaw: string | null = null
  const docsToIndex: Array<{ id: string, content: string, metadata: Record<string, any> }> = []

  if (!useCache) {
    const cachedDocs: Array<{ path: string, content: string }> = []

    if (resolved.llmsUrl) {
      spin.start('Fetching llms.txt')
      const llmsContent = await fetchLlmsTxt(resolved.llmsUrl)
      if (llmsContent) {
        llmsRaw = llmsContent.raw
        cachedDocs.push({ path: 'llms.txt', content: normalizeLlmsLinks(llmsContent.raw) })

        if (llmsContent.links.length > 0) {
          spin.stop('Saved llms.txt')
          spin.start(`Downloading ${llmsContent.links.length} doc files`)
          const baseUrl = resolved.docsUrl || new URL(resolved.llmsUrl).origin
          const docs = await downloadLlmsDocs(llmsContent, baseUrl)

          for (const doc of docs) {
            const localPath = doc.url.startsWith('/') ? doc.url.slice(1) : doc.url
            cachedDocs.push({ path: `docs/${localPath}`, content: doc.content })

            docsToIndex.push({
              id: doc.url,
              content: doc.content,
              metadata: { package: packageName, source: localPath },
            })
          }

          spin.stop(`Downloaded ${docs.length}/${llmsContent.links.length} docs`)
        }
      }
      else {
        spin.stop('No llms.txt found')
      }
    }

    // Fallback to README
    if (resolved.readmeUrl && cachedDocs.length === 0) {
      spin.start('Fetching README')
      const content = await fetchReadmeContent(resolved.readmeUrl)
      if (content) {
        cachedDocs.push({ path: 'docs/README.md', content })
        docsToIndex.push({
          id: 'README.md',
          content,
          metadata: { package: packageName, source: 'README.md' },
        })
        spin.stop('Saved README.md')
      }
      else {
        spin.stop('No README found')
      }
    }

    // Write to global cache
    if (cachedDocs.length > 0) {
      writeToCache(packageName, version, cachedDocs)

      // Index into global search.db
      if (docsToIndex.length > 0) {
        spin.start('Indexing docs')
        await createIndex(docsToIndex, { dbPath: SEARCH_DB })
        spin.stop(`Indexed ${docsToIndex.length} docs`)
      }
    }
  }

  // Create symlink to cached references
  try {
    linkReferences(skillDir, packageName, version)
  }
  catch {
    // Symlink may fail on some systems, fallback to direct path
  }

  // Generate SKILL.md
  let docsContent: string | null = null
  const cacheDir = getCacheDir(packageName, version)

  // Read llms.txt from cache if we didn't fetch it
  if (!llmsRaw && existsSync(join(cacheDir, 'llms.txt'))) {
    llmsRaw = readFileSync(join(cacheDir, 'llms.txt'), 'utf-8')
  }

  if (llmsRaw) {
    const { parseMarkdownLinks } = await import('./doc-resolver')
    const bestPracticesPaths = parseMarkdownLinks(llmsRaw)
      .map(l => l.url)
      .filter(lp => lp.includes('/style-guide/') || lp.includes('/best-practices/') || lp.includes('/typescript/'))

    const sections: string[] = []
    for (const mdPath of bestPracticesPaths) {
      const localPath = mdPath.startsWith('/') ? mdPath.slice(1) : mdPath
      const filePath = join(cacheDir, 'docs', localPath)
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8')
        sections.push(`# ${mdPath}\n\n${content}`)
      }
    }

    docsContent = sections.length > 0 ? sections.join('\n\n---\n\n') : llmsRaw
  }
  else {
    const readmePath = join(cacheDir, 'docs', 'README.md')
    if (existsSync(readmePath)) {
      docsContent = readFileSync(readmePath, 'utf-8')
    }
  }

  if (docsContent) {
    p.log.step(`Calling ${config.model} to generate SKILL.md...`)
    const { optimized, wasOptimized } = await optimizeDocs(
      docsContent,
      packageName,
      config.model,
    )

    const relatedSkills = await findRelatedSkills(packageName, baseDir)

    if (wasOptimized) {
      let skillMd = cleanSkillMd(optimized)

      // Ensure frontmatter
      if (!skillMd.startsWith('---')) {
        skillMd = generateFrontmatter(packageName, resolved.description, version) + skillMd
      }

      // Add related skills and query instruction
      skillMd += generateFooter(packageName, relatedSkills)

      writeFileSync(join(skillDir, 'SKILL.md'), skillMd)
      p.log.success('Generated SKILL.md')
    }
    else {
      p.log.warn('LLM unavailable, creating minimal SKILL.md')
      const skillMd = generateMinimalSkill(packageName, resolved.description, version, relatedSkills)
      writeFileSync(join(skillDir, 'SKILL.md'), skillMd)
    }
  }

  p.outro(`Synced ${packageName} to ${skillDir}`)
}

async function findRelatedSkills(packageName: string, skillsDir: string): Promise<string[]> {
  const related: string[] = []

  // Get npm dependencies for this package
  const npmInfo = await fetchNpmPackage(packageName)
  if (!npmInfo?.dependencies)
    return related

  const deps = Object.keys(npmInfo.dependencies)

  // Check which deps have skills installed
  if (!existsSync(skillsDir))
    return related

  const { readdirSync } = await import('node:fs')
  const installedSkills = readdirSync(skillsDir)

  for (const skill of installedSkills) {
    if (deps.some(d => sanitizeName(d) === skill)) {
      related.push(skill)
    }
  }

  return related.slice(0, 5) // Max 5 related
}

function cleanSkillMd(content: string): string {
  let cleaned = content
    .replace(/^```markdown\n?/m, '')
    .replace(/\n?```$/m, '')
    .trim()

  // Skip to frontmatter if there's content before it
  const frontmatterStart = cleaned.indexOf('---')
  if (frontmatterStart > 0) {
    cleaned = cleaned.slice(frontmatterStart)
  }

  return cleaned
}

function generateFrontmatter(name: string, description: string | undefined, version: string): string {
  return `---
name: ${sanitizeName(name)}
description: "${description || name} - Use this skill when working with ${name}."
version: "${version}"
---

`
}

function generateFooter(packageName: string, relatedSkills: string[]): string {
  let footer = `

## Documentation

Query docs: \`skilld -q "${packageName} <your question>"\`
`

  if (relatedSkills.length > 0) {
    footer += `\nRelated: ${relatedSkills.join(', ')}\n`
  }

  return footer
}

function generateMinimalSkill(
  name: string,
  description: string | undefined,
  version: string,
  relatedSkills: string[],
): string {
  let content = `---
name: ${sanitizeName(name)}
description: "${description || name} - Use this skill when working with ${name}."
version: "${version}"
---

# ${name}

${description || ''}

## Documentation

Query docs: \`skilld -q "${name} <your question>"\`
`

  if (relatedSkills.length > 0) {
    content += `\nRelated: ${relatedSkills.join(', ')}\n`
  }

  return content
}

runMain(main)
