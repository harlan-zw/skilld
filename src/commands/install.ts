/**
 * Install command - restore .skilld/ and SKILL.md from lockfile
 *
 * After cloning a repo, the .skilld/ symlinks are missing (gitignored).
 * If SKILL.md was deleted, a base version is regenerated from local metadata.
 * This command recreates them from the lockfile:
 *   .claude/skills/<skill>/.skilld/pkg -> node_modules/<pkg> (always)
 *   .claude/skills/<skill>/.skilld/docs -> ~/.skilld/references/<pkg>@<version>/docs (if external)
 *   .claude/skills/<skill>/SKILL.md -> regenerated from package.json + cache state
 */

import type { AgentType, CustomPrompt, SkillSection } from '../agent/index'
import type { SkillInfo } from '../core/lockfile'
import { copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import * as p from '@clack/prompts'
import { defineCommand } from 'citty'
import { dirname, join } from 'pathe'
import { agents, createToolProgress, getModelLabel, linkSkillToAgents, optimizeDocs } from '../agent/index'
import { generateSkillMd } from '../agent/prompts/skill'
import {
  hasShippedDocs as checkShippedDocs,
  ensureCacheDir,
  getCacheDir,
  getPackageDbPath,
  getPkgKeyFiles,
  getShippedSkills,
  isCached,
  linkPkgNamed,
  linkShippedSkill,
  listReferenceFiles,
  readCachedDocs,
  resolvePkgDir,
  writeToCache,
} from '../cache/index'
import { promptForAgent, resolveAgent, sharedArgs } from '../cli-helpers'
import { defaultFeatures, readConfig } from '../core/config'
import { timedSpinner } from '../core/formatting'
import { mergeLocks, parsePackages, readLock, syncLockfilesToDirs, writeLock } from '../core/lockfile'
import { sanitizeMarkdown } from '../core/sanitize'
import { getSharedSkillsDir } from '../core/shared'
import { createIndex } from '../retriv/index'
import { shutdownWorker } from '../retriv/pool'
import {
  $fetch,
  downloadLlmsDocs,
  fetchGitDocs,
  fetchLlmsTxt,
  fetchReadmeContent,
  isShallowGitDocs,
  normalizeLlmsLinks,
  parseGitHubUrl,
  resolveEntryFiles,
  resolvePackageDocs,
} from '../sources/index'
import { fetchGitSkills } from '../sources/git-skills'
import { selectLlmConfig } from './sync'
import { classifyCachedDoc, indexResources } from './sync-shared'

export interface InstallOptions {
  global: boolean
  agent: AgentType
}

export async function installCommand(opts: InstallOptions): Promise<void> {
  const cwd = process.cwd()
  const agent = agents[opts.agent]
  const shared = !opts.global && getSharedSkillsDir(cwd)
  const skillsDir = opts.global
    ? join(homedir(), '.skilld', 'skills')
    : shared || join(cwd, agent.skillsDir)

  // Collect lockfiles from all agent skill dirs and merge
  // In shared mode, read from .skills/ only
  const allSkillsDirs = shared
    ? [shared]
    : Object.values(agents).map(t =>
        opts.global ? t.globalSkillsDir : join(cwd, t.skillsDir),
      )
  const allLocks = allSkillsDirs
    .map(dir => readLock(dir))
    .filter((l): l is NonNullable<typeof l> => !!l && Object.keys(l.skills).length > 0)

  if (allLocks.length === 0) {
    p.log.warn('No skilld-lock.yaml found. Run `skilld` to sync skills first.')
    return
  }

  const lock = mergeLocks(allLocks)

  const skills = Object.entries(lock.skills)
  const toRestore: Array<{ name: string, info: SkillInfo }> = []

  // Find skills with missing/broken references symlinks
  for (const [name, info] of skills) {
    if (!info.version)
      continue

    // Shipped skills: the skill dir IS the symlink, no references/ subdir
    if (info.source === 'shipped') {
      const skillDir = join(skillsDir, name)
      if (!existsSync(skillDir)) {
        toRestore.push({ name, info })
      }
      continue
    }

    const skillDir = join(skillsDir, name)
    const referencesPath = join(skillDir, '.skilld')
    const skillMdPath = join(skillDir, 'SKILL.md')

    // Check if skill dir is missing entirely, or has broken symlinks
    const needsRestore = !existsSync(skillDir)
      || !existsSync(skillMdPath)
      || !existsSync(referencesPath)
      || (lstatSync(referencesPath).isSymbolicLink() && !existsSync(referencesPath))
      || (existsSync(skillMdPath) && lstatSync(skillMdPath).isSymbolicLink() && !existsSync(skillMdPath))

    if (needsRestore) {
      toRestore.push({ name, info })
    }
  }

  if (toRestore.length === 0) {
    p.log.success('All up to date')
    return
  }

  p.log.info(`Restoring ${toRestore.length} references`)
  ensureCacheDir()
  const features = readConfig().features ?? defaultFeatures

  const allSkillNames = skills.map(([, info]) => info.packageName || '').filter(Boolean)
  const regenerated: Array<{ name: string, pkgName: string, version: string, skillDir: string, packages?: string }> = []

  for (const { name, info } of toRestore) {
    const version = info.version!
    const pkgName = info.packageName || unsanitizeName(name, info.source)

    // Shipped skills: re-link from node_modules or cached dist
    if (info.source === 'shipped') {
      const shipped = getShippedSkills(pkgName, cwd, version)
      const match = shipped.find(s => s.skillName === name)
      if (match) {
        linkShippedSkill(skillsDir, name, match.skillDir)
        p.log.success(`Linked ${name}`)
      }
      else {
        p.log.warn(`${name}: package ${pkgName} no longer ships this skill`)
      }
      continue
    }

    // Git-sourced skills: re-fetch from remote
    if (info.source === 'github' || info.source === 'gitlab' || info.source === 'local') {
      const source = {
        type: info.source as 'github' | 'gitlab' | 'local',
        ...(info.repo?.includes('/') ? { owner: info.repo.split('/')[0], repo: info.repo.split('/')[1] } : {}),
        skillPath: info.path,
        ref: info.ref,
        ...(info.source === 'local' ? { localPath: info.repo } : {}),
      }
      const result = await fetchGitSkills(source)
      const match = result.skills.find(s => s.name === name)
      if (match) {
        const skillDir = join(skillsDir, name)
        mkdirSync(skillDir, { recursive: true })
        writeFileSync(join(skillDir, 'SKILL.md'), sanitizeMarkdown(match.content))
        for (const f of match.files) {
          const filePath = join(skillDir, '.skilld', f.path)
          mkdirSync(dirname(filePath), { recursive: true })
          writeFileSync(filePath, f.content)
        }
        p.log.success(`Restored ${name} from ${info.repo}`)
      }
      else {
        p.log.warn(`${name}: skill not found in ${info.repo}`)
      }
      continue
    }

    const skillDir = join(skillsDir, name)
    const referencesPath = join(skillDir, '.skilld')
    const globalCachePath = getCacheDir(pkgName, version)
    const spin = timedSpinner()

    // Check if already in global cache - just create symlinks
    if (isCached(pkgName, version)) {
      spin.start(`Linking ${name}`)
      mkdirSync(skillDir, { recursive: true })
      mkdirSync(referencesPath, { recursive: true })
      linkPkgSymlink(referencesPath, pkgName, cwd, version)
      // Restore named symlinks for all tracked packages
      for (const pkg of parsePackages(info.packages))
        linkPkgNamed(skillDir, pkg.name, cwd, pkg.version)
      // Only link external docs if package doesn't ship its own and has more than just README
      if (!pkgHasShippedDocs(pkgName, cwd, version) && !isReadmeOnly(globalCachePath)) {
        const docsLink = join(referencesPath, 'docs')
        const cachedDocs = join(globalCachePath, 'docs')
        if (existsSync(docsLink))
          unlinkSync(docsLink)
        if (existsSync(cachedDocs))
          symlinkSync(cachedDocs, docsLink, 'junction')
      }
      // Link issues, discussions, and releases (only if feature enabled)
      if (features.issues) {
        const issuesLink = join(referencesPath, 'issues')
        const cachedIssues = join(globalCachePath, 'issues')
        if (existsSync(issuesLink))
          unlinkSync(issuesLink)
        if (existsSync(cachedIssues))
          symlinkSync(cachedIssues, issuesLink, 'junction')
      }
      if (features.discussions) {
        const discussionsLink = join(referencesPath, 'discussions')
        const cachedDiscussions = join(globalCachePath, 'discussions')
        if (existsSync(discussionsLink))
          unlinkSync(discussionsLink)
        if (existsSync(cachedDiscussions))
          symlinkSync(cachedDiscussions, discussionsLink, 'junction')
      }
      if (features.releases) {
        const releasesLink = join(referencesPath, 'releases')
        const cachedReleases = join(globalCachePath, 'releases')
        if (existsSync(releasesLink))
          unlinkSync(releasesLink)
        if (existsSync(cachedReleases))
          symlinkSync(cachedReleases, releasesLink, 'junction')
      }
      const sectionsLink = join(referencesPath, 'sections')
      const cachedSections = join(globalCachePath, 'sections')
      if (existsSync(sectionsLink))
        unlinkSync(sectionsLink)
      if (existsSync(cachedSections))
        symlinkSync(cachedSections, sectionsLink, 'junction')
      // Create search index from cached docs if missing
      if (features.search && !existsSync(getPackageDbPath(pkgName, version))) {
        spin.message(`Indexing ${name}`)
        const cached = readCachedDocs(pkgName, version)
        const docsToIndex = cached.map(d => ({
          id: d.path,
          content: d.content,
          metadata: { package: pkgName, source: d.path, type: classifyCachedDoc(d.path).type },
        }))
        await indexResources({ packageName: pkgName, version, cwd, docsToIndex, features, onProgress: msg => spin.message(msg) })
      }
      if (!copyFromExistingAgent(skillDir, name, allSkillsDirs)) {
        if (regenerateBaseSkillMd(skillDir, pkgName, version, cwd, allSkillNames, info.source, info.packages))
          regenerated.push({ name, pkgName, version, skillDir, packages: info.packages })
      }
      spin.stop(`Linked ${name}`)
      continue
    }

    // Need to download to global cache first
    spin.start(`Downloading ${name}@${version}`)

    const resolved = await resolvePackageDocs(pkgName, { version })

    if (!resolved) {
      spin.stop(`Could not resolve: ${name}`)
      continue
    }

    const cachedDocs: Array<{ path: string, content: string }> = []
    const docsToIndex: Array<{ id: string, content: string, metadata: Record<string, any> }> = []

    // Try git docs first
    if (resolved.gitDocsUrl && resolved.repoUrl) {
      const gh = parseGitHubUrl(resolved.repoUrl)
      if (gh) {
        const gitDocs = await fetchGitDocs(gh.owner, gh.repo, version, pkgName)
        if (gitDocs?.files.length) {
          const BATCH_SIZE = 20
          for (let i = 0; i < gitDocs.files.length; i += BATCH_SIZE) {
            const batch = gitDocs.files.slice(i, i + BATCH_SIZE)
            const results = await Promise.all(
              batch.map(async (file) => {
                const url = `${gitDocs.baseUrl}/${file}`
                const content = await $fetch(url, { responseType: 'text' }).catch(() => null)
                if (!content)
                  return null
                return { file, content }
              }),
            )
            for (const r of results) {
              if (r) {
                const cachePath = gitDocs.docsPrefix ? r.file.replace(gitDocs.docsPrefix, '') : r.file
                cachedDocs.push({ path: cachePath, content: r.content })
                docsToIndex.push({ id: cachePath, content: r.content, metadata: { package: pkgName, source: cachePath, type: 'doc' } })
              }
            }
          }

          // Shallow git-docs: if < threshold and llms.txt exists, discard and fall through
          if (isShallowGitDocs(cachedDocs.length) && resolved.llmsUrl) {
            cachedDocs.length = 0
            docsToIndex.length = 0
          }
          else if (cachedDocs.length > 0 && resolved.llmsUrl) {
            // Always cache llms.txt alongside good git-docs as supplementary reference
            const llmsContent = await fetchLlmsTxt(resolved.llmsUrl)
            if (llmsContent) {
              const baseUrl = resolved.docsUrl || new URL(resolved.llmsUrl).origin
              cachedDocs.push({ path: 'llms.txt', content: normalizeLlmsLinks(llmsContent.raw) })
              if (llmsContent.links.length > 0) {
                const docs = await downloadLlmsDocs(llmsContent, baseUrl)
                for (const doc of docs) {
                  const localPath = doc.url.startsWith('/') ? doc.url.slice(1) : doc.url
                  cachedDocs.push({ path: join('llms-docs', ...localPath.split('/')), content: doc.content })
                }
              }
            }
          }
        }
      }
    }

    // Try llms.txt
    if (resolved.llmsUrl && cachedDocs.length === 0) {
      const llmsContent = await fetchLlmsTxt(resolved.llmsUrl)
      if (llmsContent) {
        cachedDocs.push({ path: 'llms.txt', content: normalizeLlmsLinks(llmsContent.raw) })
        if (llmsContent.links.length > 0) {
          const baseUrl = resolved.docsUrl || new URL(resolved.llmsUrl).origin
          const docs = await downloadLlmsDocs(llmsContent, baseUrl)
          for (const doc of docs) {
            const localPath = doc.url.startsWith('/') ? doc.url.slice(1) : doc.url
            const cachePath = join('docs', ...localPath.split('/'))
            cachedDocs.push({ path: cachePath, content: doc.content })
            docsToIndex.push({ id: doc.url, content: doc.content, metadata: { package: pkgName, source: cachePath, type: 'doc' } })
          }
        }
      }
    }

    // Fallback to README
    if (resolved.readmeUrl && cachedDocs.length === 0) {
      const content = await fetchReadmeContent(resolved.readmeUrl)
      if (content) {
        cachedDocs.push({ path: 'docs/README.md', content })
        docsToIndex.push({ id: 'README.md', content, metadata: { package: pkgName, source: 'docs/README.md', type: 'doc' } })
      }
    }

    if (cachedDocs.length > 0) {
      writeToCache(pkgName, version, cachedDocs)

      mkdirSync(referencesPath, { recursive: true })
      linkPkgSymlink(referencesPath, pkgName, cwd, version)
      // Restore named symlinks for all tracked packages
      for (const pkg of parsePackages(info.packages))
        linkPkgNamed(skillDir, pkg.name, cwd, pkg.version)
      // Link fetched docs unless it's just a README (already in pkg/)
      if (!isReadmeOnly(globalCachePath)) {
        const docsLink = join(referencesPath, 'docs')
        const cachedDocsDir = join(globalCachePath, 'docs')
        if (existsSync(docsLink))
          unlinkSync(docsLink)
        if (existsSync(cachedDocsDir))
          symlinkSync(cachedDocsDir, docsLink, 'junction')
      }

      if (features.search) {
        if (docsToIndex.length > 0) {
          await createIndex(docsToIndex, { dbPath: getPackageDbPath(pkgName, version) })
        }

        // Index package entry files (.d.ts / .js)
        const pkgDir = resolvePkgDir(pkgName, cwd, version)
        const entryFiles = pkgDir ? await resolveEntryFiles(pkgDir) : []
        if (entryFiles.length > 0) {
          await createIndex(entryFiles.map(e => ({
            id: e.path,
            content: e.content,
            metadata: { package: pkgName, source: `pkg/${e.path}`, type: e.type },
          })), { dbPath: getPackageDbPath(pkgName, version) })
        }
      }

      if (!copyFromExistingAgent(skillDir, name, allSkillsDirs)) {
        if (regenerateBaseSkillMd(skillDir, pkgName, version, cwd, allSkillNames, info.source, info.packages))
          regenerated.push({ name, pkgName, version, skillDir, packages: info.packages })
      }
      spin.stop(`Downloaded and linked ${name}`)
    }
    else {
      spin.stop(`No docs found for ${name}`)
    }
  }

  // Offer LLM enhancement for regenerated SKILL.md files
  if (regenerated.length > 0 && !readConfig().skipLlm) {
    const names = regenerated.map(r => r.name).join(', ')
    const llmConfig = await selectLlmConfig(undefined, `Enhance SKILL.md for ${names}`)
    if (llmConfig) {
      p.log.step(getModelLabel(llmConfig.model))
      for (const { pkgName, version, skillDir, packages: pkgPackages } of regenerated) {
        await enhanceRegenerated(pkgName, version, skillDir, llmConfig.model, llmConfig.sections, llmConfig.customPrompt, pkgPackages)
      }
    }
  }

  // Write merged lockfile to target dir and sync to all other existing lockfiles
  for (const [name, info] of Object.entries(lock.skills))
    writeLock(skillsDir, name, info)

  // In shared mode: recreate per-agent symlinks, skip per-agent lockfile sync
  if (shared) {
    for (const [name] of skills)
      linkSkillToAgents(name, shared, cwd)
  }
  else {
    syncLockfilesToDirs(lock, allSkillsDirs.filter(d => d !== skillsDir))
  }

  await shutdownWorker()

  p.outro('Install complete')
}

/** Copy SKILL.md from another agent's skill dir if one exists */
function copyFromExistingAgent(skillDir: string, name: string, allSkillsDirs: string[]): boolean {
  const targetMd = join(skillDir, 'SKILL.md')
  if (existsSync(targetMd))
    return false
  for (const dir of allSkillsDirs) {
    if (dir === skillDir)
      continue
    const candidateMd = join(dir, name, 'SKILL.md')
    if (existsSync(candidateMd) && !lstatSync(candidateMd).isSymbolicLink()) {
      mkdirSync(skillDir, { recursive: true })
      copyFileSync(candidateMd, targetMd)
      return true
    }
  }
  return false
}

/** Try to recover original package name from sanitized name + source */
function unsanitizeName(sanitized: string, source?: string): string {
  if (source?.includes('ungh://')) {
    const match = source.match(/ungh:\/\/([^/]+)\/(.+)/)
    if (match)
      return `@${match[1]}/${match[2]}`
  }

  if (sanitized.startsWith('antfu-'))
    return `@antfu/${sanitized.slice(6)}`
  if (sanitized.startsWith('clack-'))
    return `@clack/${sanitized.slice(6)}`
  if (sanitized.startsWith('nuxt-'))
    return `@nuxt/${sanitized.slice(5)}`
  if (sanitized.startsWith('vue-'))
    return `@vue/${sanitized.slice(4)}`
  if (sanitized.startsWith('vueuse-'))
    return `@vueuse/${sanitized.slice(7)}`

  return sanitized
}

/** Create pkg symlink inside references dir (links to entire package or cached dist) */
function linkPkgSymlink(referencesDir: string, name: string, cwd: string, version?: string): void {
  const pkgPath = resolvePkgDir(name, cwd, version)
  if (!pkgPath)
    return

  const pkgLink = join(referencesDir, 'pkg')
  if (existsSync(pkgLink))
    unlinkSync(pkgLink)
  symlinkSync(pkgPath, pkgLink, 'junction')
}

/** Check if cache only has docs/README.md (pkg/ already has this) */
function isReadmeOnly(cacheDir: string): boolean {
  const docsDir = join(cacheDir, 'docs')
  if (!existsSync(docsDir))
    return false
  const files = readdirSync(docsDir)
  return files.length === 1 && files[0] === 'README.md'
}

/** Check if package ships its own docs folder */
function pkgHasShippedDocs(name: string, cwd: string, version?: string): boolean {
  const pkgPath = resolvePkgDir(name, cwd, version)
  if (!pkgPath)
    return false

  const docsCandidates = ['docs', 'documentation', 'doc']
  for (const candidate of docsCandidates) {
    const docsPath = join(pkgPath, candidate)
    if (existsSync(docsPath))
      return true
  }
  return false
}

/** Run LLM enhancement on a regenerated SKILL.md */
async function enhanceRegenerated(
  pkgName: string,
  version: string,
  skillDir: string,
  model: Parameters<typeof optimizeDocs>[0]['model'],
  sections: SkillSection[],
  customPrompt?: CustomPrompt,
  packages?: string,
): Promise<void> {
  const llmLog = p.taskLog({ title: `Agent exploring ${pkgName}` })

  const docFiles = listReferenceFiles(skillDir)
  const globalCachePath = getCacheDir(pkgName, version)
  const hasIssues = existsSync(join(globalCachePath, 'issues'))
  const hasDiscussions = existsSync(join(globalCachePath, 'discussions'))
  const hasGithub = hasIssues || hasDiscussions
  const hasReleases = existsSync(join(globalCachePath, 'releases'))

  const features = readConfig().features ?? defaultFeatures
  const { optimized, wasOptimized } = await optimizeDocs({
    packageName: pkgName,
    skillDir,
    model,
    version,
    hasGithub,
    hasReleases,
    docFiles,
    sections,
    customPrompt,
    features,
    onProgress: createToolProgress(llmLog),
  })

  if (wasOptimized) {
    llmLog.success('Generated best practices')
    // Re-read local metadata for the enhanced version
    const cwd = process.cwd()
    const pkgPath = resolvePkgDir(pkgName, cwd, version)
    let description: string | undefined
    let dependencies: Record<string, string> | undefined
    if (pkgPath) {
      const pkgJsonPath = join(pkgPath, 'package.json')
      if (existsSync(pkgJsonPath)) {
        const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'))
        description = pkg.description
        dependencies = pkg.dependencies
      }
    }

    let docsType: 'llms.txt' | 'readme' | 'docs' = 'docs'
    if (existsSync(join(globalCachePath, 'docs', 'llms.txt')))
      docsType = 'llms.txt'
    else if (isReadmeOnly(globalCachePath))
      docsType = 'readme'

    // Derive dirName from the skill directory name
    const dirName = skillDir.split('/').pop()

    const allPackages = parsePackages(packages).map(p => ({ name: p.name }))
    const skillMd = generateSkillMd({
      name: pkgName,
      version,
      description,
      dependencies,
      body: optimized,
      relatedSkills: [],
      hasIssues,
      hasDiscussions,
      hasReleases,
      docsType,
      hasShippedDocs: checkShippedDocs(pkgName, cwd, version),
      pkgFiles: getPkgKeyFiles(pkgName, cwd, version),
      dirName,
      packages: allPackages.length > 1 ? allPackages : undefined,
      features,
    })
    writeFileSync(join(skillDir, 'SKILL.md'), skillMd)
  }
  else {
    llmLog.error('LLM optimization skipped')
  }
}

export const installCommandDef = defineCommand({
  meta: { name: 'install', description: 'Restore references from lockfile' },
  args: {
    global: sharedArgs.global,
    agent: sharedArgs.agent,
  },
  async run({ args }) {
    let agent = resolveAgent(args.agent)
    if (!agent) {
      agent = await promptForAgent()
      if (!agent)
        return
    }

    p.intro(`\x1B[1m\x1B[35mskilld\x1B[0m install`)
    return installCommand({ global: args.global, agent })
  },
})

/** Regenerate base SKILL.md from local metadata if missing */
function regenerateBaseSkillMd(
  skillDir: string,
  pkgName: string,
  version: string,
  cwd: string,
  allSkillNames: string[],
  source?: string,
  packages?: string,
): boolean {
  const skillMdPath = join(skillDir, 'SKILL.md')
  if (existsSync(skillMdPath))
    return false

  // Read description + deps from local package.json
  const pkgPath = resolvePkgDir(pkgName, cwd, version)
  let description: string | undefined
  let dependencies: Record<string, string> | undefined
  if (pkgPath) {
    const pkgJsonPath = join(pkgPath, 'package.json')
    if (existsSync(pkgJsonPath)) {
      const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'))
      description = pkg.description
      dependencies = pkg.dependencies
    }
  }

  // Infer docsType from source or cache
  const globalCachePath = getCacheDir(pkgName, version)
  let docsType: 'llms.txt' | 'readme' | 'docs' = 'docs'
  if (source?.includes('llms.txt') || existsSync(join(globalCachePath, 'docs', 'llms.txt')))
    docsType = 'llms.txt'
  else if (isReadmeOnly(globalCachePath))
    docsType = 'readme'

  // Check cache dirs for issues/discussions/releases (only if feature enabled)
  const feat = readConfig().features ?? defaultFeatures
  const hasIssues = feat.issues && existsSync(join(globalCachePath, 'issues'))
  const hasDiscussions = feat.discussions && existsSync(join(globalCachePath, 'discussions'))
  const hasReleases = feat.releases && existsSync(join(globalCachePath, 'releases'))

  // Related skills from other lockfile entries
  const relatedSkills = allSkillNames.filter(n => n !== pkgName)

  // Derive dirName from the skill directory name (lockfile key)
  const dirName = skillDir.split('/').pop()

  // Build multi-package list from lockfile packages field
  const allPackages = parsePackages(packages).map(p => ({ name: p.name }))

  const content = generateSkillMd({
    name: pkgName,
    version,
    description,
    dependencies,
    relatedSkills,
    hasIssues,
    hasDiscussions,
    hasReleases,
    docsType,
    hasShippedDocs: checkShippedDocs(pkgName, cwd, version),
    pkgFiles: getPkgKeyFiles(pkgName, cwd, version),
    dirName,
    packages: allPackages.length > 1 ? allPackages : undefined,
    features: readConfig().features ?? defaultFeatures,
  })

  mkdirSync(skillDir, { recursive: true })
  writeFileSync(skillMdPath, content)
  return true
}
