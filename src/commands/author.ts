import type { OptimizeModel } from '../agent/index.ts'
import type { FeaturesConfig } from '../core/config.ts'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import * as p from '@clack/prompts'
import { defineCommand } from 'citty'
import { join, relative, resolve } from 'pathe'
import {
  computeSkillDirName,
  generateSkillMd,
  getModelLabel,
} from '../agent/index.ts'
import {
  ensureCacheDir,
  getCacheDir,
  writeToCache,
} from '../cache/index.ts'
import { guard } from '../cli-helpers.ts'
import { defaultFeatures, readConfig } from '../core/config.ts'
import { timedSpinner } from '../core/formatting.ts'
import {
  fetchGitHubDiscussions,
  fetchGitHubIssues,
  formatDiscussionAsMarkdown,
  formatIssueAsMarkdown,
  generateDiscussionIndex,
  generateIssueIndex,
  isGhAvailable,
  parseGitHubUrl,
  readLocalPackageInfo,
} from '../sources/index.ts'
import {
  detectChangelog,
  ejectReferences,
  enhanceSkillWithLLM,
  forceClearCache,
  linkAllReferences,
  selectLlmConfig,
  writePromptFiles,
} from './sync-shared.ts'

const QUOTE_PREFIX_RE = /^['"]/
const QUOTE_SUFFIX_RE = /['"]$/

// ── Monorepo detection ──

interface MonorepoPackage {
  name: string
  version: string
  description?: string
  repoUrl?: string
  dir: string
}

function detectMonorepoPackages(cwd: string): MonorepoPackage[] | null {
  const pkgPath = join(cwd, 'package.json')
  if (!existsSync(pkgPath))
    return null

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

  // Must be private (monorepo root) with workspaces or pnpm-workspace.yaml
  if (!pkg.private)
    return null

  let patterns: string[] = []

  if (Array.isArray(pkg.workspaces)) {
    patterns = pkg.workspaces
  }
  else if (pkg.workspaces?.packages) {
    patterns = pkg.workspaces.packages
  }

  // Check pnpm-workspace.yaml
  if (patterns.length === 0) {
    const pnpmWs = join(cwd, 'pnpm-workspace.yaml')
    if (existsSync(pnpmWs)) {
      const lines = readFileSync(pnpmWs, 'utf-8').split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('-'))
          continue
        const value = trimmed.slice(1).trim().replace(QUOTE_PREFIX_RE, '').replace(QUOTE_SUFFIX_RE, '')
        if (value)
          patterns.push(value)
      }
    }
  }

  if (patterns.length === 0)
    return null

  const packages: MonorepoPackage[] = []

  for (const pattern of patterns) {
    // Expand simple glob: "packages/*" → scan packages/*/package.json
    const base = pattern.replace(/\/?\*+$/, '')
    const scanDir = resolve(cwd, base)
    if (!existsSync(scanDir))
      continue

    for (const entry of readdirSync(scanDir, { withFileTypes: true })) {
      if (!entry.isDirectory())
        continue
      const pkgJsonPath = join(scanDir, entry.name, 'package.json')
      if (!existsSync(pkgJsonPath))
        continue

      const childPkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'))
      if (childPkg.private)
        continue
      if (!childPkg.name)
        continue

      const repoUrl = typeof childPkg.repository === 'string'
        ? childPkg.repository
        : childPkg.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, '')

      packages.push({
        name: childPkg.name,
        version: childPkg.version || '0.0.0',
        description: childPkg.description,
        repoUrl,
        dir: join(scanDir, entry.name),
      })
    }
  }

  return packages.length > 0 ? packages : null
}

// ── Docs resolution ──

function walkMarkdownFiles(dir: string, base = ''): Array<{ path: string, content: string }> {
  const results: Array<{ path: string, content: string }> = []
  if (!existsSync(dir))
    return results

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...walkMarkdownFiles(full, rel))
    }
    else if (/\.mdx?$/.test(entry.name)) {
      results.push({ path: rel, content: readFileSync(full, 'utf-8') })
    }
  }
  return results
}

/**
 * Resolve docs from local filesystem. Cascade:
 * 1. Package-level docs/ directory
 * 2. Monorepo-root docs/ directory (if monorepoRoot provided)
 * 3. Monorepo-root docs/content/ (Nuxt Content convention)
 * 4. llms.txt in package dir
 * 5. README.md in package dir
 */
function resolveLocalDocs(
  packageDir: string,
  packageName: string,
  version: string,
  monorepoRoot?: string,
): { docsType: 'docs' | 'llms.txt' | 'readme', docSource: string } {
  const cachedDocs: Array<{ path: string, content: string }> = []

  // 1. Package-level docs/
  const docsDir = join(packageDir, 'docs')
  if (existsSync(docsDir)) {
    const mdFiles = walkMarkdownFiles(docsDir)
    if (mdFiles.length > 0) {
      for (const f of mdFiles)
        cachedDocs.push({ path: `docs/${f.path}`, content: f.content })
      writeToCache(packageName, version, cachedDocs)
      cacheLocalChangelog(packageDir, packageName, version)
      return { docsType: 'docs', docSource: `local docs/ (${mdFiles.length} files)` }
    }
  }

  // 2. Monorepo-root docs/ or docs/content/
  if (monorepoRoot) {
    for (const candidate of ['docs/content', 'docs']) {
      const rootDocsDir = join(monorepoRoot, candidate)
      if (existsSync(rootDocsDir)) {
        const mdFiles = walkMarkdownFiles(rootDocsDir)
        if (mdFiles.length > 0) {
          for (const f of mdFiles)
            cachedDocs.push({ path: `docs/${f.path}`, content: f.content })
          writeToCache(packageName, version, cachedDocs)
          cacheLocalChangelog(packageDir, packageName, version)
          return { docsType: 'docs', docSource: `monorepo ${candidate}/ (${mdFiles.length} files)` }
        }
      }
    }
  }

  // 3. llms.txt
  const llmsPath = join(packageDir, 'llms.txt')
  if (existsSync(llmsPath)) {
    const content = readFileSync(llmsPath, 'utf-8')
    cachedDocs.push({ path: 'llms.txt', content })
    writeToCache(packageName, version, cachedDocs)
    cacheLocalChangelog(packageDir, packageName, version)
    return { docsType: 'llms.txt', docSource: 'local llms.txt' }
  }

  // 4. README.md
  const readmeFile = readdirSync(packageDir).find(f => /^readme\.md$/i.test(f))
  if (readmeFile) {
    const content = readFileSync(join(packageDir, readmeFile), 'utf-8')
    cachedDocs.push({ path: 'docs/README.md', content })
    writeToCache(packageName, version, cachedDocs)
    cacheLocalChangelog(packageDir, packageName, version)
    return { docsType: 'readme', docSource: 'local README.md' }
  }

  cacheLocalChangelog(packageDir, packageName, version)
  return { docsType: 'readme', docSource: 'none' }
}

function cacheLocalChangelog(dir: string, packageName: string, version: string): void {
  const changelogFile = ['CHANGELOG.md', 'changelog.md'].find(f => existsSync(join(dir, f)))
  if (changelogFile) {
    writeToCache(packageName, version, [{
      path: `releases/${changelogFile}`,
      content: readFileSync(join(dir, changelogFile), 'utf-8'),
    }])
  }
}

// ── Remote supplements ──

async function fetchRemoteSupplements(opts: {
  packageName: string
  version: string
  repoUrl?: string
  features: FeaturesConfig
  onProgress: (msg: string) => void
}): Promise<{ hasIssues: boolean, hasDiscussions: boolean }> {
  const { packageName, version, repoUrl, features, onProgress } = opts

  if (!repoUrl || !isGhAvailable())
    return { hasIssues: false, hasDiscussions: false }

  const gh = parseGitHubUrl(repoUrl)
  if (!gh)
    return { hasIssues: false, hasDiscussions: false }

  const cacheDir = getCacheDir(packageName, version)

  let hasIssues = false
  const issuesDir = join(cacheDir, 'issues')
  if (features.issues && !existsSync(issuesDir)) {
    onProgress('Fetching issues via GitHub API')
    const issues = await fetchGitHubIssues(gh.owner, gh.repo, 30).catch(() => [])
    if (issues.length > 0) {
      onProgress(`Caching ${issues.length} issues`)
      writeToCache(packageName, version, issues.map(issue => ({
        path: `issues/issue-${issue.number}.md`,
        content: formatIssueAsMarkdown(issue),
      })))
      writeToCache(packageName, version, [{
        path: 'issues/_INDEX.md',
        content: generateIssueIndex(issues),
      }])
      hasIssues = true
    }
  }
  else {
    hasIssues = features.issues && existsSync(issuesDir)
  }

  let hasDiscussions = false
  const discussionsDir = join(cacheDir, 'discussions')
  if (features.discussions && !existsSync(discussionsDir)) {
    onProgress('Fetching discussions via GitHub API')
    const discussions = await fetchGitHubDiscussions(gh.owner, gh.repo, 20).catch(() => [])
    if (discussions.length > 0) {
      onProgress(`Caching ${discussions.length} discussions`)
      writeToCache(packageName, version, discussions.map(d => ({
        path: `discussions/discussion-${d.number}.md`,
        content: formatDiscussionAsMarkdown(d),
      })))
      writeToCache(packageName, version, [{
        path: 'discussions/_INDEX.md',
        content: generateDiscussionIndex(discussions),
      }])
      hasDiscussions = true
    }
  }
  else {
    hasDiscussions = features.discussions && existsSync(discussionsDir)
  }

  return { hasIssues, hasDiscussions }
}

// ── package.json patching ──

function patchPackageJsonFiles(packageDir: string): void {
  const pkgPath = join(packageDir, 'package.json')
  if (!existsSync(pkgPath))
    return

  const raw = readFileSync(pkgPath, 'utf-8')
  const pkg = JSON.parse(raw)

  if (!Array.isArray(pkg.files)) {
    // Create files array with common defaults
    pkg.files = ['dist', 'skills']
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
    p.log.success('Created `files` array in package.json with `["dist", "skills"]`. Verify this matches your package.')
    return
  }

  if (pkg.files.some((f: string) => f === 'skills' || f === 'skills/' || f === 'skills/**'))
    return

  pkg.files.push('skills')
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
  p.log.success('Added `"skills"` to package.json files array')
}

// ── Core author flow for a single package ──

async function authorSinglePackage(opts: {
  packageDir: string
  packageName: string
  version: string
  description?: string
  repoUrl?: string
  monorepoRoot?: string
  out?: string
  model?: OptimizeModel
  yes?: boolean
  force?: boolean
  debug?: boolean
}): Promise<string | null> {
  const { packageDir, packageName, version } = opts
  const spin = timedSpinner()

  const sanitizedName = computeSkillDirName(packageName)
  const outDir = opts.out || join(packageDir, 'skills', sanitizedName)

  if (existsSync(outDir))
    rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })

  if (opts.force) {
    forceClearCache(packageName, version)
  }

  ensureCacheDir()
  const features = readConfig().features ?? defaultFeatures

  // Resolve local docs
  spin.start('Resolving local docs')
  const { docsType, docSource } = resolveLocalDocs(packageDir, packageName, version, opts.monorepoRoot)
  spin.stop(`Resolved docs: ${docSource}`)

  // Fetch remote supplements (issues/discussions)
  const supSpin = timedSpinner()
  supSpin.start('Checking remote supplements')
  const { hasIssues, hasDiscussions } = await fetchRemoteSupplements({
    packageName,
    version,
    repoUrl: opts.repoUrl,
    features,
    onProgress: msg => supSpin.message(msg),
  })
  const supParts: string[] = []
  if (hasIssues)
    supParts.push('issues')
  if (hasDiscussions)
    supParts.push('discussions')
  supSpin.stop(supParts.length > 0 ? `Fetched ${supParts.join(', ')}` : 'No remote supplements')

  // Create temporary .skilld/ symlinks (LLM needs these to read docs)
  linkAllReferences(outDir, packageName, packageDir, version, docsType, undefined, features)

  // Detect changelog + releases
  const cacheDir = getCacheDir(packageName, version)
  const hasChangelog = detectChangelog(packageDir, cacheDir)
  const hasReleases = existsSync(join(cacheDir, 'releases'))

  // Generate base SKILL.md
  const baseSkillMd = generateSkillMd({
    name: packageName,
    version,
    description: opts.description,
    relatedSkills: [],
    hasIssues,
    hasDiscussions,
    hasReleases,
    hasChangelog,
    docsType,
    hasShippedDocs: false,
    pkgFiles: [],
    dirName: sanitizedName,
    repoUrl: opts.repoUrl,
    features,
    eject: true,
  })
  writeFileSync(join(outDir, 'SKILL.md'), baseSkillMd)
  p.log.success(`Created base skill: ${relative(packageDir, outDir)}`)

  // LLM enhancement
  const globalConfig = readConfig()
  if (!globalConfig.skipLlm && (!opts.yes || opts.model)) {
    const llmConfig = await selectLlmConfig(opts.model)
    if (llmConfig?.promptOnly) {
      writePromptFiles({
        packageName,
        skillDir: outDir,
        version,
        hasIssues,
        hasDiscussions,
        hasReleases,
        hasChangelog,
        docsType,
        hasShippedDocs: false,
        pkgFiles: [],
        sections: llmConfig.sections,
        customPrompt: llmConfig.customPrompt,
        features,
      })
    }
    else if (llmConfig) {
      p.log.step(getModelLabel(llmConfig.model))
      await enhanceSkillWithLLM({
        packageName,
        version,
        skillDir: outDir,
        dirName: sanitizedName,
        model: llmConfig.model,
        resolved: { repoUrl: opts.repoUrl },
        relatedSkills: [],
        hasIssues,
        hasDiscussions,
        hasReleases,
        hasChangelog,
        docsType,
        hasShippedDocs: false,
        pkgFiles: [],
        force: opts.force,
        debug: opts.debug,
        sections: llmConfig.sections,
        customPrompt: llmConfig.customPrompt,
        features,
        eject: true,
      })
    }
  }

  // Clean up .skilld/ symlinks → eject references as real files
  const skilldDir = join(outDir, '.skilld')
  if (existsSync(skilldDir))
    rmSync(skilldDir, { recursive: true, force: true })

  ejectReferences(outDir, packageName, packageDir, version, docsType, features)

  // Patch package.json
  patchPackageJsonFiles(packageDir)

  return outDir
}

// ── Main command ──

async function authorCommand(opts: {
  out?: string
  model?: OptimizeModel
  yes?: boolean
  force?: boolean
  debug?: boolean
}): Promise<void> {
  const cwd = process.cwd()

  // Check for monorepo
  const monoPackages = detectMonorepoPackages(cwd)

  if (monoPackages && monoPackages.length > 0) {
    p.intro(`\x1B[1m\x1B[35mskilld\x1B[0m author \x1B[90m(monorepo: ${monoPackages.length} packages)\x1B[0m`)

    const selected = guard(await p.multiselect({
      message: 'Which packages should ship skills?',
      options: monoPackages.map(pkg => ({
        label: pkg.name,
        value: pkg,
        hint: pkg.description,
      })),
    }))

    if (selected.length === 0)
      return

    const results: Array<{ name: string, outDir: string }> = []

    for (const pkg of selected) {
      p.log.step(`\x1B[36m${pkg.name}\x1B[0m@${pkg.version}`)
      const outDir = await authorSinglePackage({
        packageDir: pkg.dir,
        packageName: pkg.name,
        version: pkg.version,
        description: pkg.description,
        repoUrl: pkg.repoUrl,
        monorepoRoot: cwd,
        out: opts.out,
        model: opts.model,
        yes: opts.yes,
        force: opts.force,
        debug: opts.debug,
      })
      if (outDir)
        results.push({ name: pkg.name, outDir })
    }

    if (results.length > 0) {
      p.log.message('')
      for (const { name, outDir } of results)
        p.log.success(`${name} → ${relative(cwd, outDir)}`)

      printConsumerGuidance(results.map(r => r.name))
    }

    p.outro('Done')
    return
  }

  // Single package mode
  const pkgInfo = readLocalPackageInfo(cwd)
  if (!pkgInfo) {
    p.log.error('No package.json found in current directory')
    return
  }

  const { name: packageName, version, repoUrl } = pkgInfo

  p.intro(`\x1B[1m\x1B[35mskilld\x1B[0m author \x1B[36m${packageName}\x1B[0m@${version}`)

  const outDir = await authorSinglePackage({
    packageDir: cwd,
    packageName,
    version,
    description: pkgInfo.description,
    repoUrl,
    out: opts.out,
    model: opts.model,
    yes: opts.yes,
    force: opts.force,
    debug: opts.debug,
  })

  if (outDir) {
    printConsumerGuidance([packageName])
    p.outro(`Authored skill to ${relative(cwd, outDir)}`)
  }
}

function printConsumerGuidance(packageNames: string[]): void {
  const names = packageNames.join(', ')
  p.log.info(
    `\x1B[90mConsumers get ${packageNames.length > 1 ? 'these skills' : 'this skill'} automatically:\x1B[0m\n`
    + `  \x1B[90m1. Install ${names} as a dependency\x1B[0m\n`
    + `  \x1B[90m2. Run \x1B[36mskilld prepare\x1B[90m (or add to package.json: \x1B[36m"prepare": "skilld prepare"\x1B[90m)\x1B[0m`,
  )
}

export const authorCommandDef = defineCommand({
  meta: { name: 'author', description: 'Generate portable skill for npm publishing' },
  args: {
    out: {
      type: 'string',
      alias: 'o',
      description: 'Output directory (default: ./skills/<name>/)',
    },
    model: {
      type: 'string',
      alias: 'm',
      description: 'Enhancement model for SKILL.md generation',
      valueHint: 'id',
    },
    yes: {
      type: 'boolean',
      alias: 'y',
      description: 'Skip prompts, use defaults',
      default: false,
    },
    force: {
      type: 'boolean',
      alias: 'f',
      description: 'Clear cache and regenerate',
      default: false,
    },
    debug: {
      type: 'boolean',
      description: 'Save raw enhancement output to logs/',
      default: false,
    },
  },
  async run({ args }) {
    await authorCommand({
      out: args.out,
      model: args.model as OptimizeModel | undefined,
      yes: args.yes,
      force: args.force,
      debug: args.debug,
    })
  },
})
