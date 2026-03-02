import type { AgentType, CustomPrompt, OptimizeModel, SkillSection } from '../agent/index.ts'
import type { FeaturesConfig } from '../core/config.ts'
import type { ResolvedPackage, ResolveStep } from '../sources/index.ts'
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import * as p from '@clack/prompts'
import { join, relative, resolve } from 'pathe'
import {
  agents,
  createToolProgress,
  generateSkillMd,
  getAvailableModels,
  getModelLabel,
  getModelName,
  optimizeDocs,
} from '../agent/index.ts'
import { maxItems, maxLines } from '../agent/prompts/optional/budget.ts'
import {
  CACHE_DIR,
  clearCache,
  getCacheDir,
  getPackageDbPath,
  getRepoCacheDir,
  getShippedSkills,
  hasShippedDocs,
  linkCachedDir,
  linkPkg,
  linkPkgNamed,
  linkRepoCachedDir,
  linkShippedSkill,
  listReferenceFiles,
  readCachedDocs,
  resolvePkgDir,
  writeToCache,
  writeToRepoCache,
} from '../cache/index.ts'
import { isInteractive } from '../cli-helpers.ts'
import { defaultFeatures, readConfig, registerProject, updateConfig } from '../core/config.ts'
import { parsePackages, readLock, writeLock } from '../core/lockfile.ts'
import { parseFrontmatter } from '../core/markdown.ts'
import { sanitizeMarkdown } from '../core/sanitize.ts'
import { getSharedSkillsDir } from '../core/shared.ts'
import { createIndex } from '../retriv/index.ts'
import {
  $fetch,
  downloadLlmsDocs,
  fetchBlogReleases,
  fetchCrawledDocs,
  fetchGitDocs,
  fetchGitHubDiscussions,
  fetchGitHubIssues,
  fetchLlmsTxt,
  fetchNpmPackage,
  fetchReadmeContent,
  fetchReleaseNotes,
  filterFrameworkDocs,
  formatDiscussionAsMarkdown,
  formatIssueAsMarkdown,
  generateDiscussionIndex,
  generateDocsIndex,
  generateIssueIndex,
  generateReleaseIndex,
  getBlogPreset,
  getPrereleaseChangelogRef,
  isGhAvailable,
  isPrerelease,
  isShallowGitDocs,
  normalizeLlmsLinks,
  parseGitHubUrl,
  resolveEntryFiles,
  resolveLocalPackageDocs,
  toCrawlPattern,
} from '../sources/index.ts'

export const RESOLVE_STEP_LABELS: Record<ResolveStep, string> = {
  'npm': 'npm registry',
  'github-docs': 'GitHub docs',
  'github-meta': 'GitHub meta',
  'github-search': 'GitHub search',
  'readme': 'README',
  'llms.txt': 'llms.txt',
  'crawl': 'website crawl',
  'local': 'node_modules',
}

/** Classify a cached doc path into the right metadata type */
export function classifyCachedDoc(path: string): { type: string, number?: number } {
  const issueMatch = path.match(/^issues\/issue-(\d+)\.md$/)
  if (issueMatch)
    return { type: 'issue', number: Number(issueMatch[1]) }
  const discussionMatch = path.match(/^discussions\/discussion-(\d+)\.md$/)
  if (discussionMatch)
    return { type: 'discussion', number: Number(discussionMatch[1]) }
  if (path.startsWith('releases/'))
    return { type: 'release' }
  return { type: 'doc' }
}

export async function findRelatedSkills(packageName: string, skillsDir: string): Promise<string[]> {
  const related: string[] = []

  const npmInfo = await fetchNpmPackage(packageName)
  if (!npmInfo?.dependencies)
    return related

  const deps = new Set(Object.keys(npmInfo.dependencies))

  if (!existsSync(skillsDir))
    return related

  // Build packageName → dirName map from lockfile for accurate matching
  const lock = readLock(skillsDir)
  const pkgToDirName = new Map<string, string>()
  if (lock) {
    for (const [dirName, info] of Object.entries(lock.skills)) {
      if (info.packageName)
        pkgToDirName.set(info.packageName, dirName)
      for (const pkg of parsePackages(info.packages))
        pkgToDirName.set(pkg.name, dirName)
    }
  }

  const installedSkills = readdirSync(skillsDir)
  const installedSet = new Set(installedSkills)

  for (const dep of deps) {
    const dirName = pkgToDirName.get(dep)
    if (dirName && installedSet.has(dirName))
      related.push(dirName)
  }

  return related.slice(0, 5)
}

/** Clear cache + db for --force flag */
export function forceClearCache(packageName: string, version: string, repoInfo?: { owner: string, repo: string }): void {
  clearCache(packageName, version)
  const forcedDbPath = getPackageDbPath(packageName, version)
  if (existsSync(forcedDbPath))
    rmSync(forcedDbPath, { recursive: true, force: true })
  // Also clear repo-level cache when force is used
  if (repoInfo) {
    const repoDir = getRepoCacheDir(repoInfo.owner, repoInfo.repo)
    if (existsSync(repoDir))
      rmSync(repoDir, { recursive: true, force: true })
  }
}

/** Link all reference symlinks (pkg, docs, issues, discussions, releases) */
export function linkAllReferences(skillDir: string, packageName: string, cwd: string, version: string, docsType: string, extraPackages?: Array<{ name: string, version?: string }>, features?: FeaturesConfig, repoInfo?: { owner: string, repo: string }): void {
  const f = features ?? readConfig().features ?? defaultFeatures
  try {
    linkPkg(skillDir, packageName, cwd, version)
    linkPkgNamed(skillDir, packageName, cwd, version)
    if (!hasShippedDocs(packageName, cwd, version) && docsType !== 'readme') {
      linkCachedDir(skillDir, packageName, version, 'docs')
    }
    // Issues/discussions/releases: use repo cache when available, else package cache
    if (f.issues) {
      if (repoInfo)
        linkRepoCachedDir(skillDir, repoInfo.owner, repoInfo.repo, 'issues')
      else
        linkCachedDir(skillDir, packageName, version, 'issues')
    }
    if (f.discussions) {
      if (repoInfo)
        linkRepoCachedDir(skillDir, repoInfo.owner, repoInfo.repo, 'discussions')
      else
        linkCachedDir(skillDir, packageName, version, 'discussions')
    }
    if (f.releases) {
      if (repoInfo)
        linkRepoCachedDir(skillDir, repoInfo.owner, repoInfo.repo, 'releases')
      else
        linkCachedDir(skillDir, packageName, version, 'releases')
    }
    linkCachedDir(skillDir, packageName, version, 'sections')
    // Create named symlinks for additional packages in multi-package skills
    if (extraPackages) {
      for (const pkg of extraPackages) {
        if (pkg.name !== packageName)
          linkPkgNamed(skillDir, pkg.name, cwd, pkg.version)
      }
    }
  }
  catch {
    // Symlink may fail on some systems
  }
}

/** Detect docs type from cached directory contents */
export function detectDocsType(packageName: string, version: string, repoUrl?: string, llmsUrl?: string): { docsType: 'docs' | 'llms.txt' | 'readme', docSource?: string } {
  const cacheDir = getCacheDir(packageName, version)
  if (existsSync(join(cacheDir, 'docs', 'index.md')) || existsSync(join(cacheDir, 'docs', 'guide'))) {
    return {
      docsType: 'docs',
      docSource: repoUrl ? `${repoUrl}/tree/v${version}/docs` : 'git',
    }
  }
  if (existsSync(join(cacheDir, 'llms.txt'))) {
    return {
      docsType: 'llms.txt',
      docSource: llmsUrl || 'llms.txt',
    }
  }
  if (existsSync(join(cacheDir, 'docs', 'README.md'))) {
    return { docsType: 'readme' }
  }
  return { docsType: 'readme' }
}

export interface HandleShippedResult {
  shipped: Array<{ skillName: string, skillDir: string }>
  baseDir: string
}

/** Link shipped skills, write lock entries, register project. Returns result or null if no shipped skills. */
export function handleShippedSkills(
  packageName: string,
  version: string,
  cwd: string,
  agent: AgentType,
  global: boolean,
): HandleShippedResult | null {
  const shippedSkills = getShippedSkills(packageName, cwd, version)
  if (shippedSkills.length === 0)
    return null

  const shared = getSharedSkillsDir(cwd)
  const agentConfig = agents[agent]
  const baseDir = global
    ? join(CACHE_DIR, 'skills')
    : shared || join(cwd, agentConfig.skillsDir)
  mkdirSync(baseDir, { recursive: true })

  for (const shipped of shippedSkills) {
    linkShippedSkill(baseDir, shipped.skillName, shipped.skillDir)
    writeLock(baseDir, shipped.skillName, {
      packageName,
      version,
      source: 'shipped',
      syncedAt: new Date().toISOString().split('T')[0],
      generator: 'skilld',
    })
  }

  if (!global)
    registerProject(cwd)

  return { shipped: shippedSkills, baseDir }
}

/** Resolve the base skills directory for an agent */
export function resolveBaseDir(cwd: string, agent: AgentType, global: boolean): string {
  if (global)
    return join(CACHE_DIR, 'skills')
  const shared = getSharedSkillsDir(cwd)
  if (shared)
    return shared
  const agentConfig = agents[agent]
  return join(cwd, agentConfig.skillsDir)
}

/** Try resolving a `link:` dependency to local package docs. Returns null if not a link dep or resolution fails. */
export async function resolveLocalDep(packageName: string, cwd: string): Promise<ResolvedPackage | null> {
  const pkgPath = join(cwd, 'package.json')
  if (!existsSync(pkgPath))
    return null

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
  const deps = { ...pkg.dependencies, ...pkg.devDependencies }
  const depVersion = deps[packageName]

  if (!depVersion?.startsWith('link:'))
    return null

  const localPath = resolve(cwd, depVersion.slice(5))
  return resolveLocalPackageDocs(localPath)
}

/** Detect CHANGELOG.md in a package directory or cached releases */
export function detectChangelog(pkgDir: string | null, cacheDir?: string): string | false {
  if (pkgDir) {
    const found = ['CHANGELOG.md', 'changelog.md'].find(f => existsSync(join(pkgDir, f)))
    if (found)
      return `pkg/${found}`
  }
  // Also check cached releases/CHANGELOG.md (fetched from GitHub)
  if (cacheDir && existsSync(join(cacheDir, 'releases', 'CHANGELOG.md')))
    return 'releases/CHANGELOG.md'
  return false
}

// ── Shared pipeline functions ──

export interface IndexDoc {
  id: string
  content: string
  metadata: Record<string, any>
}

export interface FetchResult {
  docSource: string
  docsType: 'llms.txt' | 'readme' | 'docs'
  docsToIndex: IndexDoc[]
  hasIssues: boolean
  hasDiscussions: boolean
  hasReleases: boolean
  warnings: string[]
  /** Parsed GitHub owner/repo for repo-level cache */
  repoInfo?: { owner: string, repo: string }
  /** Whether this result was served from cache (no fresh fetches) */
  usedCache: boolean
}

/** Fetch and cache all resources for a package (docs cascade + issues + discussions + releases) */
export async function fetchAndCacheResources(opts: {
  packageName: string
  resolved: ResolvedPackage
  version: string
  useCache: boolean
  features?: FeaturesConfig
  /** Lower-bound date for release/issue/discussion collection (ISO date) */
  from?: string
  onProgress: (message: string) => void
}): Promise<FetchResult> {
  const { packageName, resolved, version, onProgress } = opts
  const features = opts.features ?? readConfig().features ?? defaultFeatures

  // Retry fetch if cache is README-only but richer sources exist (likely transient failure)
  const cacheInvalidated = opts.useCache
    && resolved.crawlUrl
    && detectDocsType(packageName, version, resolved.repoUrl, resolved.llmsUrl).docsType === 'readme'
  const useCache = opts.useCache && !cacheInvalidated
  let docSource: string = resolved.readmeUrl || 'readme'
  let docsType: 'llms.txt' | 'readme' | 'docs' = 'readme'
  const docsToIndex: IndexDoc[] = []
  const warnings: string[] = []
  if (cacheInvalidated)
    warnings.push(`Retrying crawl for ${resolved.crawlUrl} (previous attempt only cached README)`)

  if (!useCache) {
    const cachedDocs: Array<{ path: string, content: string }> = []
    const isFrameworkDoc = (path: string) => filterFrameworkDocs([path], packageName).length > 0

    // Try versioned git docs first
    if (resolved.gitDocsUrl && resolved.repoUrl) {
      const gh = parseGitHubUrl(resolved.repoUrl)
      if (gh) {
        onProgress('Fetching git docs')
        const gitDocs = await fetchGitDocs(gh.owner, gh.repo, version, packageName)
        if (gitDocs?.fallback) {
          warnings.push(`Docs fetched from ${gitDocs.ref} branch (no tag found for v${version})`)
        }
        if (gitDocs && gitDocs.files.length > 0) {
          const BATCH_SIZE = 20
          const results: Array<{ file: string, content: string } | null> = []

          for (let i = 0; i < gitDocs.files.length; i += BATCH_SIZE) {
            const batch = gitDocs.files.slice(i, i + BATCH_SIZE)
            onProgress(`Downloading docs ${Math.min(i + BATCH_SIZE, gitDocs.files.length)}/${gitDocs.files.length} from ${gitDocs.ref}`)
            const batchResults = await Promise.all(
              batch.map(async (file) => {
                const url = `${gitDocs.baseUrl}/${file}`
                const content = await $fetch(url, { responseType: 'text' }).catch(() => null)
                if (!content)
                  return null
                return { file, content }
              }),
            )
            results.push(...batchResults)
          }

          for (const r of results) {
            if (r) {
              const stripped = gitDocs.docsPrefix ? r.file.replace(gitDocs.docsPrefix, '') : r.file
              const cachePath = stripped.startsWith('docs/') ? stripped : `docs/${stripped}`
              cachedDocs.push({ path: cachePath, content: r.content })
              docsToIndex.push({
                id: cachePath,
                content: r.content,
                metadata: { package: packageName, source: cachePath, type: 'doc' },
              })
            }
          }

          const downloaded = results.filter(Boolean).length
          if (downloaded > 0) {
            // Shallow git-docs: if < threshold and llms.txt exists, discard and fall through
            if (isShallowGitDocs(downloaded) && resolved.llmsUrl) {
              onProgress(`Shallow git-docs (${downloaded} files), trying llms.txt`)
              cachedDocs.length = 0
              docsToIndex.length = 0
            }
            else {
              docSource = `${resolved.repoUrl}/tree/${gitDocs.ref}/docs`
              docsType = 'docs'
              writeToCache(packageName, version, cachedDocs)

              // Always cache llms.txt alongside good git-docs as supplementary reference
              if (resolved.llmsUrl) {
                onProgress('Caching supplementary llms.txt')
                const llmsContent = await fetchLlmsTxt(resolved.llmsUrl)
                if (llmsContent) {
                  const baseUrl = resolved.docsUrl || new URL(resolved.llmsUrl).origin
                  const supplementary: Array<{ path: string, content: string }> = [
                    { path: 'llms.txt', content: normalizeLlmsLinks(llmsContent.raw, baseUrl) },
                  ]
                  if (llmsContent.links.length > 0) {
                    onProgress(`Downloading ${llmsContent.links.length} supplementary docs`)
                    const docs = await downloadLlmsDocs(llmsContent, baseUrl, (url, done, total) => {
                      onProgress(`Downloading supplementary doc ${done + 1}/${total}`)
                    })
                    for (const doc of docs) {
                      if (!isFrameworkDoc(doc.url))
                        continue
                      const localPath = doc.url.startsWith('/') ? doc.url.slice(1) : doc.url
                      supplementary.push({ path: join('llms-docs', ...localPath.split('/')), content: doc.content })
                    }
                  }
                  writeToCache(packageName, version, supplementary)
                }
              }
            }
          }
        }
      }
    }

    // Try website crawl
    if (resolved.crawlUrl && cachedDocs.length === 0) {
      onProgress('Crawling website')
      const crawledDocs = await fetchCrawledDocs(resolved.crawlUrl, onProgress).catch((err) => {
        warnings.push(`Crawl failed for ${resolved.crawlUrl}: ${err?.message || err}`)
        return []
      })
      if (crawledDocs.length === 0 && resolved.crawlUrl) {
        warnings.push(`Crawl returned 0 docs from ${resolved.crawlUrl}`)
      }
      if (crawledDocs.length > 0) {
        for (const doc of crawledDocs) {
          if (!isFrameworkDoc(doc.path))
            continue
          cachedDocs.push(doc)
          docsToIndex.push({
            id: doc.path,
            content: doc.content,
            metadata: { package: packageName, source: doc.path, type: 'doc' },
          })
        }
        docSource = resolved.crawlUrl
        docsType = 'docs'
        writeToCache(packageName, version, cachedDocs)
      }
    }

    // Try llms.txt
    if (resolved.llmsUrl && cachedDocs.length === 0) {
      onProgress('Fetching llms.txt')
      const llmsContent = await fetchLlmsTxt(resolved.llmsUrl)
      if (llmsContent) {
        docSource = resolved.llmsUrl!
        docsType = 'llms.txt'
        const baseUrl = resolved.docsUrl || new URL(resolved.llmsUrl).origin
        cachedDocs.push({ path: 'llms.txt', content: normalizeLlmsLinks(llmsContent.raw, baseUrl) })

        if (llmsContent.links.length > 0) {
          onProgress(`Downloading ${llmsContent.links.length} linked docs`)
          const docs = await downloadLlmsDocs(llmsContent, baseUrl, (url, done, total) => {
            onProgress(`Downloading linked doc ${done + 1}/${total}`)
          })

          for (const doc of docs) {
            if (!isFrameworkDoc(doc.url))
              continue
            const localPath = doc.url.startsWith('/') ? doc.url.slice(1) : doc.url
            const cachePath = join('docs', ...localPath.split('/'))
            cachedDocs.push({ path: cachePath, content: doc.content })
            docsToIndex.push({
              id: doc.url,
              content: doc.content,
              metadata: { package: packageName, source: cachePath, type: 'doc' },
            })
          }
        }

        writeToCache(packageName, version, cachedDocs)
      }
    }

    // Try crawling docsUrl as fallback (when no actual doc files from git/crawl/llms.txt)
    if (resolved.docsUrl && !cachedDocs.some(d => d.path.startsWith('docs/'))) {
      const crawlPattern = resolved.crawlUrl || toCrawlPattern(resolved.docsUrl)
      onProgress('Crawling docs site')
      const crawledDocs = await fetchCrawledDocs(crawlPattern, onProgress).catch((err) => {
        warnings.push(`Crawl failed for ${crawlPattern}: ${err?.message || err}`)
        return []
      })
      if (crawledDocs.length > 0) {
        for (const doc of crawledDocs) {
          if (!isFrameworkDoc(doc.path))
            continue
          cachedDocs.push(doc)
          docsToIndex.push({
            id: doc.path,
            content: doc.content,
            metadata: { package: packageName, source: doc.path, type: 'doc' },
          })
        }
        docSource = crawlPattern
        docsType = 'docs'
        writeToCache(packageName, version, cachedDocs)
      }
    }

    // Fallback to README
    if (resolved.readmeUrl && cachedDocs.length === 0) {
      onProgress('Fetching README')
      const content = await fetchReadmeContent(resolved.readmeUrl)
      if (content) {
        cachedDocs.push({ path: 'docs/README.md', content })
        docsToIndex.push({
          id: 'README.md',
          content,
          metadata: { package: packageName, source: 'docs/README.md', type: 'doc' },
        })
        writeToCache(packageName, version, cachedDocs)
      }
    }

    // Generate docs index if we have multiple doc files
    if (docsType !== 'readme' && cachedDocs.filter(d => d.path.startsWith('docs/') && d.path.endsWith('.md')).length > 1) {
      const docsIndex = generateDocsIndex(cachedDocs)
      if (docsIndex) {
        writeToCache(packageName, version, [{ path: 'docs/_INDEX.md', content: docsIndex }])
      }
    }
  }
  else {
    // Detect docs type from cache
    onProgress('Loading cached docs')
    const detected = detectDocsType(packageName, version, resolved.repoUrl, resolved.llmsUrl)
    docsType = detected.docsType
    if (detected.docSource)
      docSource = detected.docSource

    // Load cached docs for indexing if db doesn't exist yet
    const dbPath = getPackageDbPath(packageName, version)
    if (!existsSync(dbPath)) {
      onProgress('Reading cached docs for indexing')
      const cached = readCachedDocs(packageName, version)
      for (const doc of cached) {
        docsToIndex.push({
          id: doc.path,
          content: doc.content,
          metadata: { package: packageName, source: doc.path, ...classifyCachedDoc(doc.path) },
        })
      }
    }

    // Backfill docs index for caches created before this feature
    if (docsType !== 'readme' && !existsSync(join(getCacheDir(packageName, version), 'docs', '_INDEX.md'))) {
      onProgress('Generating docs index')
      const cached = readCachedDocs(packageName, version)
      const docFiles = cached.filter(d => d.path.startsWith('docs/') && d.path.endsWith('.md'))
      if (docFiles.length > 1) {
        const docsIndex = generateDocsIndex(cached)
        if (docsIndex) {
          writeToCache(packageName, version, [{ path: 'docs/_INDEX.md', content: docsIndex }])
        }
      }
    }
  }

  // Parse repo info once for repo-level caching
  const gh = resolved.repoUrl ? parseGitHubUrl(resolved.repoUrl) : null
  const repoInfo = gh ? { owner: gh.owner, repo: gh.repo } : undefined

  // Determine where repo-level data lives (repo cache if available, else package cache)
  const repoCacheDir = repoInfo ? getRepoCacheDir(repoInfo.owner, repoInfo.repo) : null
  const cacheDir = getCacheDir(packageName, version)
  const issuesDir = repoCacheDir ? join(repoCacheDir, 'issues') : join(cacheDir, 'issues')
  const discussionsDir = repoCacheDir ? join(repoCacheDir, 'discussions') : join(cacheDir, 'discussions')
  const releasesPath = repoCacheDir ? join(repoCacheDir, 'releases') : join(cacheDir, 'releases')

  // Issues (independent of useCache — has its own existsSync guard)
  if (features.issues && gh && isGhAvailable() && !existsSync(issuesDir)) {
    onProgress('Fetching issues via GitHub API')
    const issues = await fetchGitHubIssues(gh.owner, gh.repo, 30, resolved.releasedAt, opts.from).catch(() => [])
    if (issues.length > 0) {
      onProgress(`Caching ${issues.length} issues`)
      const issueDocs = [
        ...issues.map(issue => ({
          path: `issues/issue-${issue.number}.md`,
          content: formatIssueAsMarkdown(issue),
        })),
        {
          path: 'issues/_INDEX.md',
          content: generateIssueIndex(issues),
        },
      ]
      if (repoInfo)
        writeToRepoCache(repoInfo.owner, repoInfo.repo, issueDocs)
      else
        writeToCache(packageName, version, issueDocs)
      for (const issue of issues) {
        docsToIndex.push({
          id: `issue-${issue.number}`,
          content: sanitizeMarkdown(`#${issue.number}: ${issue.title}\n\n${issue.body || ''}`),
          metadata: { package: packageName, source: `issues/issue-${issue.number}.md`, type: 'issue', number: issue.number },
        })
      }
    }
  }

  // Discussions
  if (features.discussions && gh && isGhAvailable() && !existsSync(discussionsDir)) {
    onProgress('Fetching discussions via GitHub API')
    const discussions = await fetchGitHubDiscussions(gh.owner, gh.repo, 20, resolved.releasedAt, opts.from).catch(() => [])
    if (discussions.length > 0) {
      onProgress(`Caching ${discussions.length} discussions`)
      const discussionDocs = [
        ...discussions.map(d => ({
          path: `discussions/discussion-${d.number}.md`,
          content: formatDiscussionAsMarkdown(d),
        })),
        {
          path: 'discussions/_INDEX.md',
          content: generateDiscussionIndex(discussions),
        },
      ]
      if (repoInfo)
        writeToRepoCache(repoInfo.owner, repoInfo.repo, discussionDocs)
      else
        writeToCache(packageName, version, discussionDocs)
      for (const d of discussions) {
        docsToIndex.push({
          id: `discussion-${d.number}`,
          content: sanitizeMarkdown(`#${d.number}: ${d.title}\n\n${d.body || ''}`),
          metadata: { package: packageName, source: `discussions/discussion-${d.number}.md`, type: 'discussion', number: d.number },
        })
      }
    }
  }

  // Releases (GitHub releases + blog releases + CHANGELOG → unified releases/ dir)
  if (features.releases && gh && isGhAvailable() && !existsSync(releasesPath)) {
    onProgress('Fetching releases via GitHub API')
    const changelogRef = isPrerelease(version) ? getPrereleaseChangelogRef(packageName) : undefined
    const releaseDocs = await fetchReleaseNotes(gh.owner, gh.repo, version, resolved.gitRef, packageName, opts.from, changelogRef).catch(() => [])

    // Fetch blog releases into same releases/ dir
    let blogDocs: Array<{ path: string, content: string }> = []
    if (getBlogPreset(packageName)) {
      onProgress('Fetching blog release notes')
      blogDocs = await fetchBlogReleases(packageName, version).catch(() => [])
    }

    const allDocs = [...releaseDocs, ...blogDocs]

    // Parse blog release metadata for index generation
    const blogEntries = blogDocs
      .filter(d => !d.path.endsWith('_INDEX.md'))
      .map((d) => {
        const versionMatch = d.path.match(/blog-(.+)\.md$/)
        const fm = parseFrontmatter(d.content)
        return {
          version: versionMatch?.[1] ?? '',
          title: fm.title ?? `Release ${versionMatch?.[1]}`,
          date: fm.date ?? '',
        }
      })
      .filter(b => b.version)

    // Parse GitHub releases for index (extract from frontmatter)
    const ghReleases = releaseDocs
      .filter(d => d.path.startsWith('releases/') && !d.path.endsWith('CHANGELOG.md'))
      .map((d) => {
        const fm = parseFrontmatter(d.content)
        const tag = fm.tag ?? ''
        const name = fm.name ?? tag
        const published = fm.published ?? ''
        return { id: 0, tag, name, prerelease: false, createdAt: published, publishedAt: published, markdown: '' }
      })
      .filter(r => r.tag)

    const hasChangelog = allDocs.some(d => d.path === 'releases/CHANGELOG.md')

    // Generate unified _INDEX.md
    if (ghReleases.length > 0 || blogEntries.length > 0) {
      allDocs.push({
        path: 'releases/_INDEX.md',
        content: generateReleaseIndex({ releases: ghReleases, packageName, blogReleases: blogEntries, hasChangelog }),
      })
    }

    if (allDocs.length > 0) {
      onProgress(`Caching ${allDocs.length} releases`)
      if (repoInfo)
        writeToRepoCache(repoInfo.owner, repoInfo.repo, allDocs)
      else
        writeToCache(packageName, version, allDocs)
      for (const doc of allDocs) {
        docsToIndex.push({
          id: doc.path,
          content: doc.content,
          metadata: { package: packageName, source: doc.path, type: 'release' },
        })
      }
    }
  }

  return {
    docSource,
    docsType,
    docsToIndex,
    hasIssues: features.issues && existsSync(issuesDir),
    hasDiscussions: features.discussions && existsSync(discussionsDir),
    hasReleases: features.releases && existsSync(releasesPath),
    warnings,
    repoInfo,
    usedCache: useCache,
  }
}

/** Index all resources into the search database (single batch) */
export async function indexResources(opts: {
  packageName: string
  version: string
  cwd: string
  docsToIndex: IndexDoc[]
  features?: FeaturesConfig
  onProgress: (message: string) => void
}): Promise<void> {
  const { packageName, version, cwd, onProgress } = opts
  const features = opts.features ?? readConfig().features ?? defaultFeatures

  if (!features.search)
    return

  const dbPath = getPackageDbPath(packageName, version)

  if (existsSync(dbPath))
    return

  const allDocs = [...opts.docsToIndex]

  // Add entry files
  const pkgDir = resolvePkgDir(packageName, cwd, version)
  if (features.search && pkgDir) {
    onProgress('Scanning exports')
    const entryFiles = await resolveEntryFiles(pkgDir)
    for (const e of entryFiles) {
      allDocs.push({
        id: e.path,
        content: e.content,
        metadata: { package: packageName, source: `pkg/${e.path}`, type: e.type },
      })
    }
  }

  if (allDocs.length === 0)
    return

  onProgress(`Building search index (${allDocs.length} docs)`)
  await createIndex(allDocs, {
    dbPath,
    onProgress: ({ phase, current, total }) => {
      if (phase === 'storing') {
        const d = allDocs[current - 1]
        const type = d?.metadata?.type === 'source' || d?.metadata?.type === 'types' ? 'code' : (d?.metadata?.type || 'doc')
        onProgress(`Storing ${type} (${current}/${total})`)
      }
      else if (phase === 'embedding') {
        onProgress(`Creating embeddings (${current}/${total})`)
      }
    },
  })
}

/**
 * Eject references: copy cached files as real files into references/ dir.
 * Used for portable skills (git repos, sharing). Replaces symlinks with copies.
 * Does NOT copy pkg files — those reference node_modules directly.
 */
export function ejectReferences(skillDir: string, packageName: string, cwd: string, version: string, docsType: string, features?: FeaturesConfig, repoInfo?: { owner: string, repo: string }): void {
  const f = features ?? readConfig().features ?? defaultFeatures
  const cacheDir = getCacheDir(packageName, version)
  const refsDir = join(skillDir, 'references')
  // Repo-level data source (falls back to package cache)
  const repoDir = repoInfo ? getRepoCacheDir(repoInfo.owner, repoInfo.repo) : cacheDir

  // Copy cached docs (skip pkg — eject is for portable sharing, pkg references node_modules)
  if (!hasShippedDocs(packageName, cwd, version) && docsType !== 'readme')
    copyCachedSubdir(cacheDir, refsDir, 'docs')

  if (f.issues)
    copyCachedSubdir(repoDir, refsDir, 'issues')
  if (f.discussions)
    copyCachedSubdir(repoDir, refsDir, 'discussions')
  if (f.releases)
    copyCachedSubdir(repoDir, refsDir, 'releases')
}

/** Recursively copy a cached subdirectory into the references dir */
function copyCachedSubdir(cacheDir: string, refsDir: string, subdir: string): void {
  const srcDir = join(cacheDir, subdir)
  if (!existsSync(srcDir))
    return

  const destDir = join(refsDir, subdir)
  mkdirSync(destDir, { recursive: true })

  function walk(dir: string, rel: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const srcPath = join(dir, entry.name)
      const destPath = join(destDir, rel ? `${rel}/${entry.name}` : entry.name)
      if (entry.isDirectory()) {
        mkdirSync(destPath, { recursive: true })
        walk(srcPath, rel ? `${rel}/${entry.name}` : entry.name)
      }
      else {
        copyFileSync(srcPath, destPath)
      }
    }
  }

  walk(srcDir, '')
}

// ── Shared UI + LLM functions (used by sync.ts, sync-git.ts, sync-parallel.ts, etc.) ──

/**
 * Check if .gitignore has `.skilld` entry.
 * If missing, prompt to add it. Skipped for global installs.
 */
export async function ensureGitignore(skillsDir: string, cwd: string, isGlobal: boolean): Promise<void> {
  if (isGlobal)
    return

  const gitignorePath = join(cwd, '.gitignore')
  const pattern = '.skilld'

  // Check if already ignored
  if (existsSync(gitignorePath)) {
    const content = readFileSync(gitignorePath, 'utf-8')
    if (content.split('\n').some(line => line.trim() === pattern))
      return
  }

  // Non-interactive: auto-add (default is true anyway)
  if (!isInteractive()) {
    const entry = `\n# Skilld references (recreated by \`skilld install\`)\n${pattern}\n`
    if (existsSync(gitignorePath)) {
      const existing = readFileSync(gitignorePath, 'utf-8')
      const separator = existing.endsWith('\n') ? '' : '\n'
      appendFileSync(gitignorePath, `${separator}${entry}`)
    }
    else {
      writeFileSync(gitignorePath, entry)
    }
    return
  }

  // Show guidance
  const relSkillsDir = relative(cwd, skillsDir) || '.'
  p.log.info(
    `\x1B[1mGit guidance:\x1B[0m\n`
    + `  \x1B[32m✓\x1B[0m Commit: \x1B[36m${relSkillsDir}/*/SKILL.md\x1B[0m\n`
    + `  \x1B[32m✓\x1B[0m Commit: \x1B[36m${relSkillsDir}/skilld-lock.yaml\x1B[0m\n`
    + `  \x1B[31m✗\x1B[0m Ignore: \x1B[36m${pattern}\x1B[0m \x1B[90m(recreated by \`skilld install\`)\x1B[0m`,
  )

  const add = await p.confirm({
    message: `Add \`${pattern}\` to .gitignore?`,
    initialValue: true,
  })

  if (p.isCancel(add) || !add)
    return

  const entry = `\n# Skilld references (recreated by \`skilld install\`)\n${pattern}\n`
  if (existsSync(gitignorePath)) {
    const existing = readFileSync(gitignorePath, 'utf-8')
    const separator = existing.endsWith('\n') ? '' : '\n'
    appendFileSync(gitignorePath, `${separator}${entry}`)
  }
  else {
    writeFileSync(gitignorePath, entry)
  }

  p.log.success('Updated .gitignore')
}

export const SKILLD_MARKER_START = '<!-- skilld -->'
export const SKILLD_MARKER_END = '<!-- /skilld -->'

const SKILLD_INSTRUCTIONS = `${SKILLD_MARKER_START}
Before modifying code, evaluate each installed skill against the current task.
For each skill, determine YES/NO relevance and invoke all YES skills before proceeding.
${SKILLD_MARKER_END}`

/**
 * Check if agent instruction file has skilld skill-activation snippet.
 * If missing, prompt to add it. Skipped for global installs or agents without an instructionFile.
 */
export async function ensureAgentInstructions(agent: AgentType, cwd: string, isGlobal: boolean): Promise<void> {
  if (isGlobal)
    return

  const agentConfig = agents[agent]
  if (!agentConfig.instructionFile)
    return

  const filePath = join(cwd, agentConfig.instructionFile)

  // Check if marker already present
  if (existsSync(filePath)) {
    const content = readFileSync(filePath, 'utf-8')
    if (content.includes(SKILLD_MARKER_START))
      return
  }

  // Non-interactive: auto-add
  if (!isInteractive()) {
    if (existsSync(filePath)) {
      const existing = readFileSync(filePath, 'utf-8')
      const separator = existing.endsWith('\n') ? '' : '\n'
      appendFileSync(filePath, `${separator}\n${SKILLD_INSTRUCTIONS}\n`)
    }
    else {
      writeFileSync(filePath, `${SKILLD_INSTRUCTIONS}\n`)
    }
    return
  }

  p.note(SKILLD_INSTRUCTIONS, `Will be added to ${agentConfig.instructionFile}`)

  const add = await p.confirm({
    message: `Add skill activation instructions to ${agentConfig.instructionFile}?`,
    initialValue: true,
  })

  if (p.isCancel(add) || !add)
    return

  if (existsSync(filePath)) {
    const existing = readFileSync(filePath, 'utf-8')
    const separator = existing.endsWith('\n') ? '' : '\n'
    appendFileSync(filePath, `${separator}\n${SKILLD_INSTRUCTIONS}\n`)
  }
  else {
    writeFileSync(filePath, `${SKILLD_INSTRUCTIONS}\n`)
  }

  p.log.success(`Updated ${agentConfig.instructionFile}`)
}

/** Select LLM model for SKILL.md generation (independent of target agent) */
export async function selectModel(skipPrompt: boolean): Promise<OptimizeModel | null> {
  const config = readConfig()
  const available = await getAvailableModels()

  if (available.length === 0) {
    p.log.warn('No LLM CLIs found (claude, gemini, codex)')
    return null
  }

  // Use config model if set and available (only when not prompting)
  if (skipPrompt) {
    if (config.model && available.some(m => m.id === config.model))
      return config.model
    return available.find(m => m.recommended)?.id ?? available[0]!.id
  }

  const modelChoice = await p.select({
    message: 'Model for SKILL.md generation',
    options: available.map(m => ({
      label: m.recommended ? `${m.name} (Recommended)` : m.name,
      value: m.id,
      hint: `${m.agentName} · ${m.hint}`,
    })),
    initialValue: available.find(m => m.recommended)?.id ?? available[0]!.id,
  })

  if (p.isCancel(modelChoice)) {
    p.cancel('Cancelled')
    return null
  }

  // Remember choice for next time
  updateConfig({ model: modelChoice as OptimizeModel })

  return modelChoice as OptimizeModel
}

/** Default sections when model is pre-set (non-interactive) */
export const DEFAULT_SECTIONS: SkillSection[] = ['best-practices', 'api-changes']

export async function selectSkillSections(message = 'Generate SKILL.md with LLM'): Promise<{ sections: SkillSection[], customPrompt?: CustomPrompt, cancelled: boolean }> {
  p.log.info('Budgets adapt to package release density.')
  const selected = await p.multiselect({
    message,
    options: [
      { label: 'API changes', value: 'api-changes' as SkillSection, hint: 'new/deprecated APIs from version history' },
      { label: 'Best practices', value: 'best-practices' as SkillSection, hint: 'gotchas, pitfalls, patterns' },
      { label: 'Custom section', value: 'custom' as SkillSection, hint: 'add your own section' },
    ],
    initialValues: DEFAULT_SECTIONS,
    required: false,
  })

  if (p.isCancel(selected))
    return { sections: [], cancelled: true }

  const sections = selected as SkillSection[]
  if (sections.length === 0)
    return { sections: [], cancelled: false }

  // Show per-section budget based on selection count
  if (sections.length > 1) {
    const n = sections.length
    const budgetLines: string[] = []
    for (const s of sections) {
      switch (s) {
        case 'api-changes':
          budgetLines.push(`  API changes     ${maxItems(6, 12, n)}–${maxItems(6, Math.round(12 * 1.6), n)} items (adapts to release churn)`)
          break
        case 'best-practices':
          budgetLines.push(`  Best practices  ${maxItems(4, 10, n)}–${maxItems(4, Math.round(10 * 1.3), n)} items`)
          break
        case 'custom':
          budgetLines.push(`  Custom          ≤${maxLines(50, 80, n)} lines`)
          break
      }
    }
    p.log.info(`Budget (${n} sections):\n${budgetLines.join('\n')}`)
  }

  let customPrompt: CustomPrompt | undefined
  if (sections.includes('custom')) {
    const heading = await p.text({
      message: 'Section heading',
      placeholder: 'e.g. "Migration from v2" or "SSR Patterns"',
    })
    if (p.isCancel(heading))
      return { sections: [], cancelled: true }

    const body = await p.text({
      message: 'Instructions for this section',
      placeholder: 'e.g. "Document breaking changes and migration steps from v2 to v3"',
    })
    if (p.isCancel(body))
      return { sections: [], cancelled: true }

    customPrompt = { heading: heading as string, body: body as string }
  }

  return { sections, customPrompt, cancelled: false }
}

export interface LlmConfig {
  model: OptimizeModel
  sections: SkillSection[]
  customPrompt?: CustomPrompt
}

/**
 * Resolve sections + model for LLM enhancement.
 * If presetModel is provided, uses DEFAULT_SECTIONS without prompting.
 * Returns null if cancelled or no sections/model selected.
 */
export async function selectLlmConfig(presetModel?: OptimizeModel, message?: string): Promise<LlmConfig | null> {
  if (presetModel) {
    return { model: presetModel, sections: DEFAULT_SECTIONS }
  }

  // Non-interactive (CI, agent, no TTY): skip generation unless model explicitly provided
  if (!isInteractive()) {
    return null
  }

  // Resolve default model (configured or recommended) without prompting
  const defaultModel = await selectModel(true)
  if (!defaultModel)
    return null

  const defaultModelName = getModelName(defaultModel)

  const choice = await p.select({
    message: 'Generate enhanced SKILL.md?',
    options: [
      { label: defaultModelName, value: 'default' as const, hint: 'configured default' },
      { label: 'Different model', value: 'pick' as const, hint: 'choose another model' },
      { label: 'Skip', value: 'skip' as const, hint: 'base skill only' },
    ],
  })

  if (p.isCancel(choice))
    return null

  if (choice === 'skip')
    return null

  const model = choice === 'pick' ? await selectModel(false) : defaultModel
  if (!model)
    return null

  const modelName = getModelName(model)
  const { sections, customPrompt, cancelled } = await selectSkillSections(
    message ? `${message} (${modelName})` : `Generate SKILL.md with ${modelName}`,
  )

  if (cancelled || sections.length === 0)
    return null

  return { model, sections, customPrompt }
}

export interface EnhanceOptions {
  packageName: string
  cachePackageName?: string
  version: string
  skillDir: string
  dirName?: string
  model: OptimizeModel
  resolved: { repoUrl?: string, llmsUrl?: string, releasedAt?: string, docsUrl?: string, gitRef?: string, dependencies?: Record<string, string>, distTags?: Record<string, { version: string, releasedAt?: string }> }
  relatedSkills: string[]
  hasIssues: boolean
  hasDiscussions: boolean
  hasReleases: boolean
  hasChangelog: string | false
  docsType: 'llms.txt' | 'readme' | 'docs'
  hasShippedDocs: boolean
  pkgFiles: string[]
  force?: boolean
  debug?: boolean
  sections?: SkillSection[]
  customPrompt?: CustomPrompt
  packages?: Array<{ name: string }>
  features?: FeaturesConfig
  eject?: boolean
}

export async function enhanceSkillWithLLM(opts: EnhanceOptions): Promise<void> {
  const { packageName, cachePackageName, version, skillDir, dirName, model, resolved, relatedSkills, hasIssues, hasDiscussions, hasReleases, hasChangelog, docsType, hasShippedDocs: shippedDocs, pkgFiles, force, debug, sections, customPrompt, packages, features, eject } = opts

  const effectiveFeatures = features

  const llmLog = p.taskLog({ title: `Agent exploring ${packageName}` })
  const docFiles = listReferenceFiles(skillDir)
  const hasGithub = hasIssues || hasDiscussions
  const { optimized, wasOptimized, usage, cost, warnings, error, debugLogsDir } = await optimizeDocs({
    packageName: cachePackageName || packageName,
    skillDir,
    model,
    version,
    hasGithub,
    hasReleases,
    hasChangelog,
    docFiles,
    docsType,
    hasShippedDocs: shippedDocs,
    noCache: force,
    debug,
    sections,
    customPrompt,
    features: effectiveFeatures,
    pkgFiles,
    onProgress: createToolProgress(llmLog),
  })

  if (wasOptimized) {
    const costParts: string[] = []
    if (usage) {
      const totalK = Math.round(usage.totalTokens / 1000)
      costParts.push(`${totalK}k tokens`)
    }
    if (cost)
      costParts.push(`$${cost.toFixed(2)}`)
    const costSuffix = costParts.length > 0 ? ` (${costParts.join(', ')})` : ''
    llmLog.success(`Generated best practices${costSuffix}`)
    if (debugLogsDir)
      p.log.info(`Debug logs: ${relative(process.cwd(), debugLogsDir)}`)
    if (error)
      p.log.warn(`\x1B[33mPartial failure: ${error}\x1B[0m`)
    if (warnings?.length) {
      for (const w of warnings)
        p.log.warn(`\x1B[33m${w}\x1B[0m`)
    }
    const skillMd = generateSkillMd({
      name: packageName,
      version,
      releasedAt: resolved.releasedAt,
      dependencies: resolved.dependencies,
      distTags: resolved.distTags,
      body: optimized,
      relatedSkills,
      hasIssues,
      hasDiscussions,
      hasReleases,
      hasChangelog,
      docsType,
      hasShippedDocs: shippedDocs,
      pkgFiles,
      generatedBy: getModelLabel(model),
      dirName,
      packages,
      repoUrl: resolved.repoUrl,
      features,
      eject,
    })
    writeFileSync(join(skillDir, 'SKILL.md'), skillMd)
  }
  else {
    llmLog.error(`LLM optimization failed${error ? `: ${error}` : ''}`)
  }
}
