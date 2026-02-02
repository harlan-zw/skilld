/**
 * Install command - restore references from lockfile without regenerating SKILL.md
 *
 * After cloning a repo, the references symlinks are missing (gitignored).
 * This command recreates them from the lockfile:
 *   .claude/skills/<skill>/references/docs -> ~/.skilld/references/<pkg>@<version>/docs
 *   .claude/skills/<skill>/references/dist -> node_modules/<pkg>/dist
 */

import { existsSync, lstatSync, mkdirSync, symlinkSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import * as p from '@clack/prompts'
import { type AgentType, agents } from '../agent'
import {
  ensureCacheDir,
  getCacheDir,
  getPackageDbPath,
  isCached,
  writeToCache,
} from '../cache'
import { readLock, type SkillInfo } from '../core/lockfile'
import {
  downloadLlmsDocs,
  fetchGitDocs,
  fetchLlmsTxt,
  fetchReadmeContent,
  normalizeLlmsLinks,
  parseGitHubUrl,
  resolvePackageDocs,
} from '../doc-resolver'
import { createIndex } from '../retriv'

export interface InstallOptions {
  global: boolean
  agent: AgentType
}

export async function installCommand(opts: InstallOptions): Promise<void> {
  const cwd = process.cwd()
  const agent = agents[opts.agent]
  const skillsDir = opts.global
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
    if (!info.version) continue

    const skillDir = join(skillsDir, name)
    const referencesPath = join(skillDir, 'references')

    // Check if symlink exists and resolves
    const needsRestore = !existsSync(skillDir)
      || !existsSync(referencesPath)
      || (lstatSync(referencesPath).isSymbolicLink() && !existsSync(referencesPath))

    if (needsRestore && existsSync(skillDir)) {
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
    const skillDir = join(skillsDir, name)
    const referencesPath = join(skillDir, 'references')
    const globalCachePath = getCacheDir(pkgName, version)
    const spin = p.spinner()

    // Check if already in global cache - just create symlinks
    if (isCached(pkgName, version)) {
      spin.start(`Linking ${name}`)
      mkdirSync(referencesPath, { recursive: true })
      const docsLink = join(referencesPath, 'docs')
      const cachedDocs = join(globalCachePath, 'docs')
      if (existsSync(docsLink)) unlinkSync(docsLink)
      if (existsSync(cachedDocs)) symlinkSync(cachedDocs, docsLink, 'junction')
      linkDistSymlink(referencesPath, pkgName, cwd)
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
        const gitDocs = await fetchGitDocs(gh.owner, gh.repo, version)
        if (gitDocs?.files.length) {
          const BATCH_SIZE = 20
          for (let i = 0; i < gitDocs.files.length; i += BATCH_SIZE) {
            const batch = gitDocs.files.slice(i, i + BATCH_SIZE)
            const results = await Promise.all(
              batch.map(async (file) => {
                const url = `${gitDocs.baseUrl}/${file}`
                const res = await fetch(url, { headers: { 'User-Agent': 'skilld/1.0' } }).catch(() => null)
                if (!res?.ok) return null
                return { file, content: await res.text() }
              }),
            )
            for (const r of results) {
              if (r) {
                cachedDocs.push({ path: r.file, content: r.content })
                docsToIndex.push({ id: r.file, content: r.content, metadata: { package: pkgName, source: r.file } })
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
            const cachePath = `docs/${localPath}`
            cachedDocs.push({ path: cachePath, content: doc.content })
            docsToIndex.push({ id: doc.url, content: doc.content, metadata: { package: pkgName, source: cachePath } })
          }
        }
      }
    }

    // Fallback to README
    if (resolved.readmeUrl && cachedDocs.length === 0) {
      const content = await fetchReadmeContent(resolved.readmeUrl)
      if (content) {
        cachedDocs.push({ path: 'docs/README.md', content })
        docsToIndex.push({ id: 'README.md', content, metadata: { package: pkgName, source: 'docs/README.md' } })
      }
    }

    if (cachedDocs.length > 0) {
      writeToCache(pkgName, version, cachedDocs)

      mkdirSync(referencesPath, { recursive: true })
      const docsLink = join(referencesPath, 'docs')
      const cachedDocsDir = join(globalCachePath, 'docs')
      if (existsSync(docsLink)) unlinkSync(docsLink)
      if (existsSync(cachedDocsDir)) symlinkSync(cachedDocsDir, docsLink, 'junction')
      linkDistSymlink(referencesPath, pkgName, cwd)

      if (docsToIndex.length > 0) {
        await createIndex(docsToIndex, { dbPath: getPackageDbPath(pkgName, version) })
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
    if (match) return `@${match[1]}/${match[2]}`
  }

  if (sanitized.startsWith('antfu-')) return `@antfu/${sanitized.slice(6)}`
  if (sanitized.startsWith('clack-')) return `@clack/${sanitized.slice(6)}`
  if (sanitized.startsWith('nuxt-')) return `@nuxt/${sanitized.slice(5)}`
  if (sanitized.startsWith('vue-')) return `@vue/${sanitized.slice(4)}`
  if (sanitized.startsWith('vueuse-')) return `@vueuse/${sanitized.slice(7)}`

  return sanitized
}

/** Create dist symlink inside references dir */
function linkDistSymlink(referencesDir: string, name: string, cwd: string): void {
  const candidates = ['dist', 'lib', 'build', 'esm']
  const nodeModulesPath = join(cwd, 'node_modules', name)
  if (!existsSync(nodeModulesPath)) return

  for (const candidate of candidates) {
    const distPath = join(nodeModulesPath, candidate)
    if (existsSync(distPath)) {
      const distLink = join(referencesDir, 'dist')
      if (existsSync(distLink)) unlinkSync(distLink)
      symlinkSync(distPath, distLink, 'junction')
      return
    }
  }
}
