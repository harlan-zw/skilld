import type { OptimizeModel } from '../agent/index.ts'
import type { FeaturesConfig } from '../core/config.ts'
import type { LlmConfig } from './sync-shared.ts'
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
import { appendToJsonArray, patchPackageJson } from '../core/package-json.ts'
import { sanitizeMarkdown } from '../core/sanitize.ts'
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

export interface MonorepoPackage {
  name: string
  version: string
  description?: string
  repoUrl?: string
  dir: string
}

export function detectMonorepoPackages(cwd: string): MonorepoPackage[] | null {
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

  const cacheChangelog = () => cacheLocalChangelog(packageDir, packageName, version, monorepoRoot)

  // 1. Package-level docs/
  const docsDir = join(packageDir, 'docs')
  if (existsSync(docsDir)) {
    const mdFiles = walkMarkdownFiles(docsDir)
    if (mdFiles.length > 0) {
      for (const f of mdFiles)
        cachedDocs.push({ path: `docs/${f.path}`, content: sanitizeMarkdown(f.content) })
      writeToCache(packageName, version, cachedDocs)
      cacheChangelog()
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
            cachedDocs.push({ path: `docs/${f.path}`, content: sanitizeMarkdown(f.content) })
          writeToCache(packageName, version, cachedDocs)
          cacheChangelog()
          return { docsType: 'docs', docSource: `monorepo ${candidate}/ (${mdFiles.length} files)` }
        }
      }
    }
  }

  // 3. llms.txt (package dir, then monorepo root)
  for (const dir of [packageDir, monorepoRoot].filter(Boolean) as string[]) {
    const llmsPath = join(dir, 'llms.txt')
    if (existsSync(llmsPath)) {
      cachedDocs.push({ path: 'llms.txt', content: sanitizeMarkdown(readFileSync(llmsPath, 'utf-8')) })
      writeToCache(packageName, version, cachedDocs)
      cacheChangelog()
      const source = dir === packageDir ? 'local llms.txt' : 'monorepo llms.txt'
      return { docsType: 'llms.txt', docSource: source }
    }
  }

  // 4. README.md (package dir, then monorepo root)
  for (const dir of [packageDir, monorepoRoot].filter(Boolean) as string[]) {
    const readmeFile = readdirSync(dir).find(f => /^readme\.md$/i.test(f))
    if (readmeFile) {
      cachedDocs.push({ path: 'docs/README.md', content: sanitizeMarkdown(readFileSync(join(dir, readmeFile), 'utf-8')) })
      writeToCache(packageName, version, cachedDocs)
      cacheChangelog()
      const source = dir === packageDir ? 'local README.md' : 'monorepo README.md'
      return { docsType: 'readme', docSource: source }
    }
  }

  cacheChangelog()
  return { docsType: 'readme', docSource: 'none' }
}

function cacheLocalChangelog(dir: string, packageName: string, version: string, monorepoRoot?: string): void {
  const candidates = ['CHANGELOG.md', 'changelog.md']
  const changelogFile = candidates.find(f => existsSync(join(dir, f)))
    || (monorepoRoot ? candidates.find(f => existsSync(join(monorepoRoot, f))) : undefined)
  const changelogDir = changelogFile && existsSync(join(dir, changelogFile)) ? dir : monorepoRoot
  if (changelogFile && changelogDir) {
    writeToCache(packageName, version, [{
      path: `releases/${changelogFile}`,
      content: sanitizeMarkdown(readFileSync(join(changelogDir, changelogFile), 'utf-8')),
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

export function patchPackageJsonFiles(packageDir: string): void {
  const pkgPath = join(packageDir, 'package.json')
  if (!existsSync(pkgPath))
    return

  const wrote = patchPackageJson(pkgPath, (raw, pkg) => {
    if (!Array.isArray(pkg.files)) {
      p.log.warn('No `files` array in package.json. Add `"skills"` to your files array manually.')
      return null
    }

    if ((pkg.files as string[]).some((f: string) => f === 'skills' || f === 'skills/' || f === 'skills/**'))
      return null

    return appendToJsonArray(raw, ['files'], 'skills')
  })

  if (wrote)
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
  llmConfig?: LlmConfig | null
  force?: boolean
  debug?: boolean
}): Promise<string | null> {
  const { packageDir, packageName, version } = opts
  const spin = timedSpinner()

  const sanitizedName = computeSkillDirName(packageName)
  const outDir = opts.out ? resolve(packageDir, opts.out) : join(packageDir, 'skills', sanitizedName)

  // Validate --out doesn't point at the package root or a parent
  if (opts.out) {
    const rel = relative(packageDir, outDir)
    if (!rel || rel === '.' || rel.startsWith('..')) {
      p.log.error('--out must point to a child directory, not the package root or a parent')
      return null
    }
  }

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

  // LLM enhancement (config resolved by caller)
  const skilldDir = join(outDir, '.skilld')
  try {
    const llmConfig = opts.llmConfig
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

    ejectReferences(outDir, packageName, packageDir, version, docsType, features)
  }
  finally {
    // Always clean up .skilld/ symlinks, even if LLM enhancement fails
    if (existsSync(skilldDir))
      rmSync(skilldDir, { recursive: true, force: true })
  }

  // Only patch package.json when output is under skills/
  const relOut = relative(packageDir, outDir)
  if (relOut === 'skills' || relOut.startsWith('skills/'))
    patchPackageJsonFiles(packageDir)
  else if (opts.out)
    p.log.info('Output is outside skills/, skipping package.json patch. Add the path to "files" manually if publishing.')

  return outDir
}

// ── Main command ──

async function resolveLlmConfig(model?: OptimizeModel, yes?: boolean): Promise<LlmConfig | null | undefined> {
  const globalConfig = readConfig()
  if (globalConfig.skipLlm || (yes && !model))
    return undefined
  return selectLlmConfig(model)
}

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

    if (opts.out) {
      p.log.error('--out is not supported in monorepo mode (each package gets its own skills/ directory)')
      return
    }

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

    // Resolve LLM config once for all packages
    const llmConfig = await resolveLlmConfig(opts.model, opts.yes)

    // Resolve monorepo-level repoUrl for packages that lack their own
    const rootPkgPath = join(cwd, 'package.json')
    const rootPkg = JSON.parse(readFileSync(rootPkgPath, 'utf-8'))
    const rootRepoUrl = typeof rootPkg.repository === 'string'
      ? rootPkg.repository
      : rootPkg.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, '')

    const results: Array<{ name: string, outDir: string }> = []

    for (const pkg of selected) {
      p.log.step(`\x1B[36m${pkg.name}\x1B[0m@${pkg.version}`)
      const outDir = await authorSinglePackage({
        packageDir: pkg.dir,
        packageName: pkg.name,
        version: pkg.version,
        description: pkg.description,
        repoUrl: pkg.repoUrl || rootRepoUrl,
        monorepoRoot: cwd,
        llmConfig,
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

  const llmConfig = await resolveLlmConfig(opts.model, opts.yes)

  const outDir = await authorSinglePackage({
    packageDir: cwd,
    packageName,
    version,
    description: pkgInfo.description,
    repoUrl,
    out: opts.out,
    llmConfig,
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
