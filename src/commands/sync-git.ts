/**
 * Git skill sync — install pre-authored skills from git repos,
 * or generate skills from repo docs when no pre-authored skills exist.
 */

import type { AgentType, OptimizeModel } from '../agent/index.ts'
import type { GitSkillSource } from '../sources/git-skills.ts'
import { mkdirSync, writeFileSync } from 'node:fs'
import * as p from '@clack/prompts'
import { dirname, join, relative } from 'pathe'
import {
  agents,
  generateSkillMd,
  getModelLabel,
  linkSkillToAgents,
  sanitizeName,
} from '../agent/index.ts'
import {
  CACHE_DIR,
  ensureCacheDir,
  getCacheDir,
  getPkgKeyFiles,
  getVersionKey,
  hasShippedDocs,
  isCached,
  resolvePkgDir,
} from '../cache/index.ts'
import { defaultFeatures, readConfig, registerProject } from '../core/config.ts'
import { timedSpinner, todayIsoDate } from '../core/formatting.ts'
import { writeLock } from '../core/lockfile.ts'
import { sanitizeMarkdown } from '../core/sanitize.ts'
import { getSharedSkillsDir } from '../core/shared.ts'
import { shutdownWorker } from '../retriv/pool.ts'
import { fetchGitSkills } from '../sources/git-skills.ts'
import { resolveGitHubRepo } from '../sources/github.ts'
import { track } from '../telemetry.ts'
import {
  detectChangelog,
  enhanceSkillWithLLM,
  ensureAgentInstructions,
  ensureGitignore,
  fetchAndCacheResources,
  indexResources,
  linkAllReferences,
  resolveBaseDir,
  selectLlmConfig,
  writePromptFiles,
} from './sync-shared.ts'

export interface GitSyncOptions {
  source: GitSkillSource
  global: boolean
  agent: AgentType
  yes: boolean
  model?: OptimizeModel
  force?: boolean
  debug?: boolean
  from?: string
  /** Filter to specific skill names (comma-separated via --skill flag) */
  skillFilter?: string[]
}

export async function syncGitSkills(opts: GitSyncOptions): Promise<void> {
  const { source, agent, global: isGlobal, yes } = opts
  const cwd = process.cwd()
  const agentConfig = agents[agent]
  const baseDir = isGlobal
    ? join(CACHE_DIR, 'skills')
    : join(cwd, agentConfig.skillsDir)

  const label = source.type === 'local'
    ? source.localPath!
    : `${source.owner}/${source.repo}`

  const spin = timedSpinner()
  spin.start(`Fetching skills from ${label}`)

  const { skills } = await fetchGitSkills(source, msg => spin.message(msg))

  if (skills.length === 0) {
    // No pre-authored skills — fall back to generating from repo docs (GitHub only)
    if (source.type === 'github' && source.owner && source.repo) {
      spin.stop(`No pre-authored skills in ${label}, generating from repo docs...`)
      return syncGitHubRepo(opts)
    }
    spin.stop(`No skills found in ${label}`)
    return
  }

  spin.stop(`Found ${skills.length} skill(s) in ${label}`)

  // Select skills to install
  let selected = skills

  if (opts.skillFilter?.length) {
    // --skill flag: filter to matching names (strip -skilld suffix for comparison)
    const filterSet = new Set(opts.skillFilter.map(s => s.toLowerCase().replace(/-skilld$/, '')))
    selected = skills.filter(s => filterSet.has(s.name.toLowerCase().replace(/-skilld$/, '')))
    if (selected.length === 0) {
      p.log.warn(`No skills matched: ${opts.skillFilter.join(', ')}`)
      p.log.message(`Available: ${skills.map(s => s.name).join(', ')}`)
      return
    }
  }
  else if (source.skillPath) {
    // Direct path: auto-select the matched skill
    selected = skills
  }
  else if (skills.length > 1 && !yes) {
    const choices = await p.autocompleteMultiselect({
      message: `Select skills to install from ${label}`,
      options: skills.map(s => ({
        label: s.name.replace(/-skilld$/, ''),
        value: s.name,
        hint: s.description || s.path,
      })),
      initialValues: [],
    })

    if (p.isCancel(choices))
      return

    const selectedNames = new Set(choices)
    selected = skills.filter(s => selectedNames.has(s.name))
    if (selected.length === 0)
      return
  }

  // Install each selected skill
  mkdirSync(baseDir, { recursive: true })

  for (const skill of selected) {
    const skillDir = join(baseDir, skill.name)
    mkdirSync(skillDir, { recursive: true })

    // Sanitize and write SKILL.md
    writeFileSync(join(skillDir, 'SKILL.md'), sanitizeMarkdown(skill.content))

    // Write supporting files directly in skill dir (not under .skilld/)
    // so SKILL.md relative paths like ./references/docs/guide.md resolve correctly
    if (skill.files.length > 0) {
      for (const f of skill.files) {
        const filePath = join(skillDir, f.path)
        mkdirSync(dirname(filePath), { recursive: true })
        writeFileSync(filePath, f.content)
      }
    }

    // Write lockfile entry
    const sourceType = source.type === 'local' ? 'local' : source.type
    writeLock(baseDir, skill.name, {
      source: sourceType,
      repo: source.type === 'local' ? source.localPath : `${source.owner}/${source.repo}`,
      path: skill.path || undefined,
      ref: source.ref || 'main',
      syncedAt: todayIsoDate(),
      generator: 'external',
    })
  }

  if (!isGlobal)
    registerProject(cwd)

  // Track telemetry (skip local sources)
  if (source.type !== 'local' && source.owner && source.repo) {
    track({
      event: 'install',
      source: `${source.owner}/${source.repo}`,
      skills: selected.map(s => s.name).join(','),
      agents: agent,
      ...(isGlobal && { global: '1' as const }),
      sourceType: source.type,
    })
  }

  const names = selected.map(s => `\x1B[36m${s.name}\x1B[0m`).join(', ')
  p.log.success(`Installed ${names}`)
}

/**
 * Generate a skill from a GitHub repo's docs (no npm package required).
 * Uses the same pipeline as npm packages: resolve → fetch → cache → generate → LLM enhance.
 */
async function syncGitHubRepo(opts: GitSyncOptions): Promise<void> {
  const { source, agent, global: isGlobal, yes } = opts
  const owner = source.owner!
  const repo = source.repo!
  const cwd = process.cwd()

  const spin = timedSpinner()
  spin.start(`Resolving ${owner}/${repo}`)

  const resolved = await resolveGitHubRepo(owner, repo, msg => spin.message(msg))
  if (!resolved) {
    spin.stop(`Could not find docs for ${owner}/${repo}`)
    return
  }

  const repoUrl = `https://github.com/${owner}/${repo}`
  const packageName = `${owner}-${repo}`
  const version = resolved.version || 'main'
  const versionKey = getVersionKey(version)
  const useCache = isCached(packageName, version)

  spin.stop(`Resolved ${owner}/${repo}@${useCache ? versionKey : version}${useCache ? ' (cached)' : ''}`)

  ensureCacheDir()

  const baseDir = resolveBaseDir(cwd, agent, isGlobal)
  const skillDirName = sanitizeName(`${owner}-${repo}`)
  const skillDir = join(baseDir, skillDirName)
  mkdirSync(skillDir, { recursive: true })

  const features = readConfig().features ?? defaultFeatures

  // Phase 1: Fetch & cache all resources
  const resSpin = timedSpinner()
  resSpin.start('Finding resources')
  const resources = await fetchAndCacheResources({
    packageName,
    resolved,
    version,
    useCache,
    features,
    from: opts.from,
    onProgress: msg => resSpin.message(msg),
  })
  const resParts: string[] = []
  if (resources.docsToIndex.length > 0) {
    const docCount = resources.docsToIndex.filter(d => d.metadata?.type === 'doc').length
    if (docCount > 0)
      resParts.push(`${docCount} docs`)
  }
  if (resources.hasIssues)
    resParts.push('issues')
  if (resources.hasDiscussions)
    resParts.push('discussions')
  if (resources.hasReleases)
    resParts.push('releases')
  resSpin.stop(`Fetched ${resParts.length > 0 ? resParts.join(', ') : 'resources'}`)
  for (const w of resources.warnings)
    p.log.warn(`\x1B[33m${w}\x1B[0m`)

  // Create symlinks (linkPkg/linkPkgNamed gracefully skip when no node_modules)
  linkAllReferences(skillDir, packageName, cwd, version, resources.docsType, undefined, features)

  // Phase 2: Search index
  if (features.search) {
    const idxSpin = timedSpinner()
    idxSpin.start('Creating search index')
    await indexResources({
      packageName,
      version,
      cwd,
      docsToIndex: resources.docsToIndex,
      features,
      onProgress: msg => idxSpin.message(msg),
    })
    idxSpin.stop('Search index ready')
  }

  const pkgDir = resolvePkgDir(packageName, cwd, version)
  const hasChangelog = detectChangelog(pkgDir, getCacheDir(packageName, version))
  const shippedDocs = hasShippedDocs(packageName, cwd, version)
  const pkgFiles = getPkgKeyFiles(packageName, cwd, version)

  // Write lockfile
  writeLock(baseDir, skillDirName, {
    packageName,
    version,
    repo: `${owner}/${repo}`,
    source: resources.docSource,
    syncedAt: todayIsoDate(),
    generator: 'skilld',
  })

  // Write base SKILL.md
  const baseSkillMd = generateSkillMd({
    name: packageName,
    version,
    releasedAt: resolved.releasedAt,
    description: resolved.description,
    relatedSkills: [],
    hasIssues: resources.hasIssues,
    hasDiscussions: resources.hasDiscussions,
    hasReleases: resources.hasReleases,
    hasChangelog,
    docsType: resources.docsType,
    hasShippedDocs: shippedDocs,
    pkgFiles,
    dirName: skillDirName,
    repoUrl,
    features,
  })
  writeFileSync(join(skillDir, 'SKILL.md'), baseSkillMd)

  p.log.success(`Created base skill: ${relative(cwd, skillDir)}`)

  // LLM enhancement
  const globalConfig = readConfig()
  if (!globalConfig.skipLlm && (!yes || opts.model)) {
    const llmConfig = await selectLlmConfig(opts.model)
    if (llmConfig?.promptOnly) {
      writePromptFiles({
        packageName,
        skillDir,
        version,
        hasIssues: resources.hasIssues,
        hasDiscussions: resources.hasDiscussions,
        hasReleases: resources.hasReleases,
        hasChangelog,
        docsType: resources.docsType,
        hasShippedDocs: shippedDocs,
        pkgFiles,
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
        skillDir,
        dirName: skillDirName,
        model: llmConfig.model,
        resolved,
        relatedSkills: [],
        hasIssues: resources.hasIssues,
        hasDiscussions: resources.hasDiscussions,
        hasReleases: resources.hasReleases,
        hasChangelog,
        docsType: resources.docsType,
        hasShippedDocs: shippedDocs,
        pkgFiles,
        force: opts.force,
        debug: opts.debug,
        sections: llmConfig.sections,
        customPrompt: llmConfig.customPrompt,
        features,
      })
    }
  }

  // Link shared dir to per-agent dirs
  const shared = !isGlobal && getSharedSkillsDir(cwd)
  if (shared)
    linkSkillToAgents(skillDirName, shared, cwd, agent)

  if (!isGlobal) {
    registerProject(cwd)
    const skillsDir = shared || agents[agent].skillsDir
    await ensureGitignore(skillsDir, cwd, isGlobal)
    await ensureAgentInstructions(agent, cwd, isGlobal)
  }

  await shutdownWorker()

  track({
    event: 'install',
    source: `${owner}/${repo}`,
    skills: skillDirName,
    agents: agent,
    ...(isGlobal && { global: '1' as const }),
    sourceType: 'github-generated',
  })

  p.outro(`Synced ${owner}/${repo} to ${relative(cwd, skillDir)}`)
}
