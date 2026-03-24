import type { OptimizeModel } from '../agent/index.ts'
import type { FeaturesConfig } from '../core/config.ts'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import * as p from '@clack/prompts'
import { defineCommand } from 'citty'
import { join, relative } from 'pathe'
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
import { defaultFeatures, readConfig } from '../core/config.ts'
import { timedSpinner } from '../core/formatting.ts'
import { appendToJsonArray, patchPackageJson } from '../core/package-json.ts'
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
  forceClearCache,
  linkAllReferences,
} from './sync-shared.ts'
import { enhanceSkillWithLLM, selectLlmConfig, writePromptFiles } from './sync.ts'

/**
 * Walk a directory recursively and collect all .md/.mdx files
 */
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
 * Resolve docs from local filesystem instead of fetching remotely.
 * Cascade: docs/ directory → llms.txt → README.md
 */
function resolveLocalDocs(
  cwd: string,
  packageName: string,
  version: string,
): { docsType: 'docs' | 'llms.txt' | 'readme', docSource: string } {
  const cachedDocs: Array<{ path: string, content: string }> = []

  // 1. Walk docs/ directory
  const docsDir = join(cwd, 'docs')
  if (existsSync(docsDir)) {
    const mdFiles = walkMarkdownFiles(docsDir)
    if (mdFiles.length > 0) {
      for (const f of mdFiles)
        cachedDocs.push({ path: `docs/${f.path}`, content: f.content })
      writeToCache(packageName, version, cachedDocs)

      // Also cache CHANGELOG if present
      cacheLocalChangelog(cwd, packageName, version)

      return { docsType: 'docs', docSource: 'local docs/' }
    }
  }

  // 2. Fallback: llms.txt
  const llmsPath = join(cwd, 'llms.txt')
  if (existsSync(llmsPath)) {
    const content = readFileSync(llmsPath, 'utf-8')
    cachedDocs.push({ path: 'llms.txt', content })
    writeToCache(packageName, version, cachedDocs)
    cacheLocalChangelog(cwd, packageName, version)
    return { docsType: 'llms.txt', docSource: 'local llms.txt' }
  }

  // 3. Fallback: README.md (case-insensitive)
  const readmeFile = readdirSync(cwd).find(f => /^readme\.md$/i.test(f))
  if (readmeFile) {
    const content = readFileSync(join(cwd, readmeFile), 'utf-8')
    cachedDocs.push({ path: 'docs/README.md', content })
    writeToCache(packageName, version, cachedDocs)
    cacheLocalChangelog(cwd, packageName, version)
    return { docsType: 'readme', docSource: 'local README.md' }
  }

  // Nothing found — still cache changelog if present
  cacheLocalChangelog(cwd, packageName, version)
  return { docsType: 'readme', docSource: 'none' }
}

function cacheLocalChangelog(cwd: string, packageName: string, version: string): void {
  const changelogFile = ['CHANGELOG.md', 'changelog.md'].find(f => existsSync(join(cwd, f)))
  if (changelogFile) {
    writeToCache(packageName, version, [{
      path: `releases/${changelogFile}`,
      content: readFileSync(join(cwd, changelogFile), 'utf-8'),
    }])
  }
}

/**
 * Fetch remote supplements (issues, discussions) from GitHub.
 * Reuses existing issue/discussion fetching from sync-shared.ts patterns.
 */
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

  // Issues
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

  // Discussions
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

/**
 * Add "skills" to package.json files array if it exists
 */
function patchPackageJsonFiles(cwd: string): void {
  const pkgPath = join(cwd, 'package.json')
  if (!existsSync(pkgPath))
    return

  const wrote = patchPackageJson(pkgPath, (raw, pkg) => {
    if (!Array.isArray(pkg.files)) {
      p.log.warn('No `files` array in package.json, add `"skills"` manually if needed')
      return null
    }

    if ((pkg.files as string[]).some((f: string) => f === 'skills' || f === 'skills/'))
      return null

    return appendToJsonArray(raw, ['files'], 'skills')
  })

  if (wrote)
    p.log.success('Added `"skills"` to package.json files array')
}

async function publishCommand(opts: {
  out?: string
  model?: OptimizeModel
  yes?: boolean
  force?: boolean
  debug?: boolean
}): Promise<void> {
  const cwd = process.cwd()
  const spin = timedSpinner()

  // 1. Read local package.json
  const pkgInfo = readLocalPackageInfo(cwd)
  if (!pkgInfo) {
    p.log.error('No package.json found in current directory')
    return
  }

  const { name: packageName, version, repoUrl } = pkgInfo

  p.intro(`Publishing skill for \x1B[36m${packageName}\x1B[0m@${version}`)

  // 2. Determine output dir
  const sanitizedName = computeSkillDirName(packageName)
  const outDir = opts.out || join(cwd, 'skills', sanitizedName)

  // 3. Force clear: clean output + optionally clear cache
  if (existsSync(outDir))
    rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })

  if (opts.force) {
    forceClearCache(packageName, version)
  }

  ensureCacheDir()
  const features = readConfig().features ?? defaultFeatures

  // 4. Resolve local docs
  spin.start('Resolving local docs')
  const { docsType, docSource } = resolveLocalDocs(cwd, packageName, version)
  spin.stop(`Resolved docs: ${docSource}`)

  // 5. Fetch remote supplements (issues/discussions)
  const supSpin = timedSpinner()
  supSpin.start('Checking remote supplements')
  const { hasIssues, hasDiscussions } = await fetchRemoteSupplements({
    packageName,
    version,
    repoUrl,
    features,
    onProgress: msg => supSpin.message(msg),
  })
  const supParts: string[] = []
  if (hasIssues)
    supParts.push('issues')
  if (hasDiscussions)
    supParts.push('discussions')
  supSpin.stop(supParts.length > 0 ? `Fetched ${supParts.join(', ')}` : 'No remote supplements')

  // 6. Create temporary .skilld/ symlinks (LLM needs these to read docs)
  linkAllReferences(outDir, packageName, cwd, version, docsType, undefined, features)

  // 7. Detect changelog + releases
  const cacheDir = getCacheDir(packageName, version)
  const hasChangelog = detectChangelog(cwd, cacheDir)
  const hasReleases = existsSync(join(cacheDir, 'releases'))

  // 8. Generate base SKILL.md with eject paths
  const baseSkillMd = generateSkillMd({
    name: packageName,
    version,
    description: pkgInfo.description,
    relatedSkills: [],
    hasIssues,
    hasDiscussions,
    hasReleases,
    hasChangelog,
    docsType,
    hasShippedDocs: false,
    pkgFiles: [],
    dirName: sanitizedName,
    repoUrl,
    features,
    eject: true,
  })
  writeFileSync(join(outDir, 'SKILL.md'), baseSkillMd)
  p.log.success(`Created base skill: ${relative(cwd, outDir)}`)

  // 9. LLM enhancement (optional)
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
        resolved: { repoUrl },
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

  // 10. Clean up .skilld/ symlinks → eject references as real files
  const skilldDir = join(outDir, '.skilld')
  if (existsSync(skilldDir))
    rmSync(skilldDir, { recursive: true, force: true })

  ejectReferences(outDir, packageName, cwd, version, docsType, features)

  // 11. Patch package.json
  patchPackageJsonFiles(cwd)

  p.outro(`Published skill to ${relative(cwd, outDir)}`)
}

export const publishCommandDef = defineCommand({
  meta: { name: 'publish', description: 'Generate portable skill for npm publishing' },
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
    await publishCommand({
      out: args.out,
      model: args.model as OptimizeModel | undefined,
      yes: args.yes,
      force: args.force,
      debug: args.debug,
    })
  },
})
