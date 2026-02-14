import type { AgentType } from '../agent/index'
import type { FeaturesConfig } from '../core/config'
import type { ResolvedPackage, ResolveStep } from '../sources/index'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { join, resolve } from 'pathe'
import { agents } from '../agent/index'
import {
  CACHE_DIR,
  clearCache,
  getCacheDir,
  getPackageDbPath,
  getShippedSkills,
  hasShippedDocs,
  linkCachedDir,
  linkPkg,
  linkPkgNamed,
  linkShippedSkill,
  readCachedDocs,
  resolvePkgDir,
  writeToCache,
} from '../cache/index'
import { defaultFeatures, readConfig, registerProject } from '../core/config'
import { parsePackages, readLock, writeLock } from '../core/lockfile'
import { sanitizeMarkdown } from '../core/sanitize'
import { getSharedSkillsDir } from '../core/shared'
import { createIndex } from '../retriv/index'
import {
  $fetch,
  downloadLlmsDocs,
  fetchBlogReleases,
  fetchGitDocs,
  fetchGitHubDiscussions,
  fetchGitHubIssues,
  fetchLlmsTxt,
  fetchNpmPackage,
  fetchReadmeContent,
  fetchReleaseNotes,
  formatDiscussionAsMarkdown,
  formatIssueAsMarkdown,
  generateDiscussionIndex,
  generateIssueIndex,
  generateReleaseIndex,
  getBlogPreset,
  isGhAvailable,
  isShallowGitDocs,
  normalizeLlmsLinks,
  parseGitHubUrl,
  resolveEntryFiles,
  resolveLocalPackageDocs,
} from '../sources/index'

export const RESOLVE_STEP_LABELS: Record<ResolveStep, string> = {
  'npm': 'npm registry',
  'github-docs': 'GitHub docs',
  'github-meta': 'GitHub meta',
  'github-search': 'GitHub search',
  'readme': 'README',
  'llms.txt': 'llms.txt',
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
export function forceClearCache(packageName: string, version: string): void {
  clearCache(packageName, version)
  const forcedDbPath = getPackageDbPath(packageName, version)
  if (existsSync(forcedDbPath))
    rmSync(forcedDbPath, { recursive: true, force: true })
}

/** Link all reference symlinks (pkg, docs, issues, discussions, releases) */
export function linkAllReferences(skillDir: string, packageName: string, cwd: string, version: string, docsType: string, extraPackages?: Array<{ name: string, version?: string }>, features?: FeaturesConfig): void {
  const f = features ?? readConfig().features ?? defaultFeatures
  try {
    linkPkg(skillDir, packageName, cwd, version)
    linkPkgNamed(skillDir, packageName, cwd, version)
    if (!hasShippedDocs(packageName, cwd, version) && docsType !== 'readme') {
      linkCachedDir(skillDir, packageName, version, 'docs')
    }
    if (f.issues)
      linkCachedDir(skillDir, packageName, version, 'issues')
    if (f.discussions)
      linkCachedDir(skillDir, packageName, version, 'discussions')
    if (f.releases)
      linkCachedDir(skillDir, packageName, version, 'releases')
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
      return found
  }
  // Also check cached releases/CHANGELOG.md (fetched from GitHub)
  if (cacheDir && existsSync(join(cacheDir, 'releases', 'CHANGELOG.md')))
    return 'CHANGELOG.md'
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
}

/** Fetch and cache all resources for a package (docs cascade + issues + discussions + releases) */
export async function fetchAndCacheResources(opts: {
  packageName: string
  resolved: ResolvedPackage
  version: string
  useCache: boolean
  features?: FeaturesConfig
  onProgress: (message: string) => void
}): Promise<FetchResult> {
  const { packageName, resolved, version, useCache, onProgress } = opts
  const features = opts.features ?? readConfig().features ?? defaultFeatures
  let docSource: string = resolved.readmeUrl || 'readme'
  let docsType: 'llms.txt' | 'readme' | 'docs' = 'readme'
  const docsToIndex: IndexDoc[] = []
  const warnings: string[] = []

  if (!useCache) {
    const cachedDocs: Array<{ path: string, content: string }> = []

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
              const cachePath = gitDocs.docsPrefix ? r.file.replace(gitDocs.docsPrefix, '') : r.file
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
  }
  else {
    // Detect docs type from cache
    const detected = detectDocsType(packageName, version, resolved.repoUrl, resolved.llmsUrl)
    docsType = detected.docsType
    if (detected.docSource)
      docSource = detected.docSource

    // Load cached docs for indexing if db doesn't exist yet
    const dbPath = getPackageDbPath(packageName, version)
    if (!existsSync(dbPath)) {
      const cached = readCachedDocs(packageName, version)
      for (const doc of cached) {
        docsToIndex.push({
          id: doc.path,
          content: doc.content,
          metadata: { package: packageName, source: doc.path, ...classifyCachedDoc(doc.path) },
        })
      }
    }
  }

  // Issues (independent of useCache — has its own existsSync guard)
  const cacheDir = getCacheDir(packageName, version)
  const issuesDir = join(cacheDir, 'issues')
  if (features.issues && resolved.repoUrl && isGhAvailable() && !existsSync(issuesDir)) {
    const gh = parseGitHubUrl(resolved.repoUrl)
    if (gh) {
      onProgress('Fetching issues via GitHub API')
      const issues = await fetchGitHubIssues(gh.owner, gh.repo, 30, resolved.releasedAt).catch(() => [])
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
        for (const issue of issues) {
          docsToIndex.push({
            id: `issue-${issue.number}`,
            content: sanitizeMarkdown(`#${issue.number}: ${issue.title}\n\n${issue.body || ''}`),
            metadata: { package: packageName, source: `issues/issue-${issue.number}.md`, type: 'issue', number: issue.number },
          })
        }
      }
    }
  }

  // Discussions
  const discussionsDir = join(cacheDir, 'discussions')
  if (features.discussions && resolved.repoUrl && isGhAvailable() && !existsSync(discussionsDir)) {
    const gh = parseGitHubUrl(resolved.repoUrl)
    if (gh) {
      onProgress('Fetching discussions via GitHub API')
      const discussions = await fetchGitHubDiscussions(gh.owner, gh.repo, 20, resolved.releasedAt).catch(() => [])
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
        for (const d of discussions) {
          docsToIndex.push({
            id: `discussion-${d.number}`,
            content: sanitizeMarkdown(`#${d.number}: ${d.title}\n\n${d.body || ''}`),
            metadata: { package: packageName, source: `discussions/discussion-${d.number}.md`, type: 'discussion', number: d.number },
          })
        }
      }
    }
  }

  // Releases (GitHub releases + blog releases + CHANGELOG → unified releases/ dir)
  const releasesPath = join(cacheDir, 'releases')
  if (features.releases && resolved.repoUrl && isGhAvailable() && !existsSync(releasesPath)) {
    const gh = parseGitHubUrl(resolved.repoUrl)
    if (gh) {
      onProgress('Fetching releases via GitHub API')
      const releaseDocs = await fetchReleaseNotes(gh.owner, gh.repo, version, resolved.gitRef, packageName).catch(() => [])

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
          const titleMatch = d.content.match(/^title:\s*"(.+)"/m)
          const dateMatch = d.content.match(/^date:\s*(.+)/m)
          return {
            version: versionMatch?.[1] ?? '',
            title: titleMatch?.[1] ?? `Release ${versionMatch?.[1]}`,
            date: dateMatch?.[1]?.trim() ?? '',
          }
        })
        .filter(b => b.version)

      // Parse GitHub releases for index (extract from frontmatter)
      const ghReleases = releaseDocs
        .filter(d => d.path.startsWith('releases/') && !d.path.endsWith('CHANGELOG.md'))
        .map((d) => {
          const tag = d.content.match(/^tag:\s*(.+)/m)?.[1]?.trim() ?? ''
          const nameMatch = d.content.match(/^name:\s*"([^"]+)"/m) || d.content.match(/^name:\s*(\S+)/m)
          const name = nameMatch?.[1]?.trim() ?? tag
          const published = d.content.match(/^published:\s*(.+)/m)?.[1]?.trim() ?? ''
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
  }

  return {
    docSource,
    docsType,
    docsToIndex,
    hasIssues: features.issues && existsSync(issuesDir),
    hasDiscussions: features.discussions && existsSync(discussionsDir),
    hasReleases: features.releases && existsSync(releasesPath),
    warnings,
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
