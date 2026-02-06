/**
 * Install command - restore .skilld/ from lockfile without regenerating SKILL.md
 *
 * After cloning a repo, the .skilld/ symlinks are missing (gitignored).
 * This command recreates them from the lockfile:
 *   .claude/skills/<skill>/.skilld/pkg -> node_modules/<pkg> (always)
 *   .claude/skills/<skill>/.skilld/docs -> ~/.skilld/references/<pkg>@<version>/docs (if external)
 */

import type { AgentType } from '../agent'
import type { SkillInfo } from '../core/lockfile'
import { existsSync, lstatSync, mkdirSync, readdirSync, symlinkSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import * as p from '@clack/prompts'
import { agents } from '../agent'
import {
  ensureCacheDir,
  getCacheDir,
  getPackageDbPath,
  getShippedSkills,
  isCached,
  linkShippedSkill,
  resolvePkgDir,
  writeToCache,
} from '../cache'
import { readLock } from '../core/lockfile'
import { createIndex } from '../retriv'
import {
  downloadLlmsDocs,
  fetchGitDocs,
  fetchLlmsTxt,
  fetchReadmeContent,
  normalizeLlmsLinks,
  parseGitHubUrl,
  resolveEntryFiles,
  resolvePackageDocs,
} from '../sources'

export interface InstallOptions {
  global: boolean
  agent: AgentType
}

export async function installCommand(opts: InstallOptions): Promise<void> {
  const cwd = process.cwd()
  const agent = agents[opts.agent]
  const skillsDir = opts.global
    // eslint-disable-next-line ts/no-require-imports
    ? join(require('node:os').homedir(), '.skilld', 'skills')
    : join(cwd, agent.skillsDir)

  const lock = readLock(skillsDir)
  if (!lock || Object.keys(lock.skills).length === 0) {
    p.log.warn('No skilld-lock.yaml found. Run `skilld` to sync skills first.')
    return
  }

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
    p.log.success('All references already linked')
    return
  }

  p.log.info(`Restoring ${toRestore.length} references`)
  ensureCacheDir()

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

    const skillDir = join(skillsDir, name)
    const referencesPath = join(skillDir, '.skilld')
    const globalCachePath = getCacheDir(pkgName, version)
    const spin = p.spinner()

    // Check if already in global cache - just create symlinks
    if (isCached(pkgName, version)) {
      spin.start(`Linking ${name}`)
      mkdirSync(skillDir, { recursive: true })
      mkdirSync(referencesPath, { recursive: true })
      linkPkgSymlink(referencesPath, pkgName, cwd, version)
      // Only link external docs if package doesn't ship its own and has more than just README
      if (!pkgHasShippedDocs(pkgName, cwd, version) && !isReadmeOnly(globalCachePath)) {
        const docsLink = join(referencesPath, 'docs')
        const cachedDocs = join(globalCachePath, 'docs')
        if (existsSync(docsLink))
          unlinkSync(docsLink)
        if (existsSync(cachedDocs))
          symlinkSync(cachedDocs, docsLink, 'junction')
      }
      // Link github data and releases
      const githubLink = join(referencesPath, 'github')
      const cachedGithub = join(globalCachePath, 'github')
      if (existsSync(githubLink))
        unlinkSync(githubLink)
      if (existsSync(cachedGithub))
        symlinkSync(cachedGithub, githubLink, 'junction')
      const releasesLink = join(referencesPath, 'releases')
      const cachedReleases = join(globalCachePath, 'releases')
      if (existsSync(releasesLink))
        unlinkSync(releasesLink)
      if (existsSync(cachedReleases))
        symlinkSync(cachedReleases, releasesLink, 'junction')
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
                const res = await fetch(url, { headers: { 'User-Agent': 'skilld/1.0' } }).catch(() => null)
                if (!res?.ok)
                  return null
                return { file, content: await res.text() }
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
      // Link fetched docs unless it's just a README (already in pkg/)
      if (!isReadmeOnly(globalCachePath)) {
        const docsLink = join(referencesPath, 'docs')
        const cachedDocsDir = join(globalCachePath, 'docs')
        if (existsSync(docsLink))
          unlinkSync(docsLink)
        if (existsSync(cachedDocsDir))
          symlinkSync(cachedDocsDir, docsLink, 'junction')
      }

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

      spin.stop(`Downloaded and linked ${name}`)
    }
    else {
      spin.stop(`No docs found for ${name}`)
    }
  }

  p.outro('Install complete')
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
