/**
 * Git repo skill source — parse inputs + fetch pre-authored skills from repos
 *
 * Supports GitHub shorthand (owner/repo), full URLs, SSH, GitLab, and local paths.
 * Skills are pre-authored SKILL.md files — no doc resolution or LLM generation needed.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import pLimit from 'p-limit'
import { resolve } from 'pathe'
import { yamlParseKV } from '../core/yaml.ts'
import { $fetch, normalizeRepoUrl, parseGitHubUrl } from './utils.ts'

export interface GitSkillSource {
  type: 'github' | 'gitlab' | 'git-ssh' | 'local'
  owner?: string
  repo?: string
  /** Direct path to a specific skill (from /tree/ref/path URLs) */
  skillPath?: string
  /** Branch/tag parsed from URL */
  ref?: string
  /** Absolute path for local sources */
  localPath?: string
}

export interface RemoteSkill {
  /** From SKILL.md frontmatter `name` field, or directory name */
  name: string
  /** From SKILL.md frontmatter `description` field */
  description: string
  /** Path within repo (e.g., "skills/web-design-guidelines") */
  path: string
  /** Full SKILL.md content */
  content: string
  /** Supporting files (scripts/, references/, assets/) */
  files: Array<{ path: string, content: string }>
}

/**
 * Detect whether an input string is a git skill source.
 * Returns null for npm package names (including scoped @scope/pkg).
 */
export function parseGitSkillInput(input: string): GitSkillSource | null {
  const trimmed = input.trim()

  // Scoped npm packages → not git
  if (trimmed.startsWith('@'))
    return null

  // Local paths
  if (trimmed.startsWith('./') || trimmed.startsWith('../') || trimmed.startsWith('/') || trimmed.startsWith('~')) {
    const localPath = trimmed.startsWith('~')
      ? resolve(process.env.HOME || '', trimmed.slice(1))
      : resolve(trimmed)
    return { type: 'local', localPath }
  }

  // SSH format: git@github.com:owner/repo
  if (trimmed.startsWith('git@')) {
    const normalized = normalizeRepoUrl(trimmed)
    const gh = parseGitHubUrl(normalized)
    if (gh)
      return { type: 'github', owner: gh.owner, repo: gh.repo }
    return null
  }

  // Full URLs
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return parseGitUrl(trimmed)
  }

  // GitHub shorthand: owner/repo (exactly one slash, no spaces, no commas)
  if (/^[\w.-]+\/[\w.-]+$/.test(trimmed)) {
    return { type: 'github', owner: trimmed.split('/')[0], repo: trimmed.split('/')[1] }
  }

  // Everything else → npm
  return null
}

function parseGitUrl(url: string): GitSkillSource | null {
  try {
    const parsed = new URL(url)

    if (parsed.hostname === 'github.com' || parsed.hostname === 'www.github.com') {
      const parts = parsed.pathname.replace(/^\//, '').replace(/\.git$/, '').split('/')
      const owner = parts[0]
      const repo = parts[1]
      if (!owner || !repo)
        return null

      // Handle /tree/ref/path URLs → extract specific skill path
      if (parts[2] === 'tree' && parts.length >= 4) {
        const ref = parts[3]
        const skillPath = parts.length > 4 ? parts.slice(4).join('/') : undefined
        return { type: 'github', owner, repo, ref, skillPath }
      }

      return { type: 'github', owner, repo }
    }

    if (parsed.hostname === 'gitlab.com') {
      const parts = parsed.pathname.replace(/^\//, '').replace(/\.git$/, '').split('/')
      const owner = parts[0]
      const repo = parts[1]
      if (!owner || !repo)
        return null
      return { type: 'gitlab', owner, repo }
    }

    return null
  }
  catch {
    return null
  }
}

/**
 * Parse name and description from SKILL.md frontmatter.
 */
export function parseSkillFrontmatterName(content: string): { name?: string, description?: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match)
    return {}

  const result: { name?: string, description?: string } = {}
  for (const line of match[1].split('\n')) {
    const kv = yamlParseKV(line)
    if (!kv)
      continue
    if (kv[0] === 'name')
      result.name = kv[1]
    if (kv[0] === 'description')
      result.description = kv[1]
  }
  return result
}

interface UnghFilesResponse {
  meta: { sha: string }
  files: Array<{ path: string, mode: string, sha: string, size: number }>
}

/** Supporting file dirs within a skill directory */
const SUPPORTING_DIRS = ['scripts', 'references', 'assets']

/**
 * Fetch skills from a git source. Returns list of discovered skills + commit SHA.
 */
export async function fetchGitSkills(
  source: GitSkillSource,
  onProgress?: (msg: string) => void,
): Promise<{ skills: RemoteSkill[], commitSha?: string }> {
  if (source.type === 'local')
    return fetchLocalSkills(source)
  if (source.type === 'github')
    return fetchGitHubSkills(source, onProgress)
  if (source.type === 'gitlab')
    return fetchGitLabSkills(source, onProgress)
  return { skills: [] }
}

// ── Local ──

function fetchLocalSkills(source: GitSkillSource): { skills: RemoteSkill[] } {
  const base = source.localPath!
  if (!existsSync(base))
    return { skills: [] }

  const skills: RemoteSkill[] = []

  // Check for skills/ subdirectory
  const skillsDir = resolve(base, 'skills')
  if (existsSync(skillsDir)) {
    for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
      if (!entry.isDirectory())
        continue
      const skill = readLocalSkill(resolve(skillsDir, entry.name), `skills/${entry.name}`)
      if (skill)
        skills.push(skill)
    }
  }

  // Check for root SKILL.md
  if (skills.length === 0) {
    const skill = readLocalSkill(base, '')
    if (skill)
      skills.push(skill)
  }

  return { skills }
}

function readLocalSkill(dir: string, repoPath: string): RemoteSkill | null {
  const skillMdPath = resolve(dir, 'SKILL.md')
  if (!existsSync(skillMdPath))
    return null

  const content = readFileSync(skillMdPath, 'utf-8')
  const frontmatter = parseSkillFrontmatterName(content)
  const dirName = dir.split('/').pop()!
  const name = frontmatter.name || dirName

  const files: Array<{ path: string, content: string }> = []
  for (const subdir of SUPPORTING_DIRS) {
    const subdirPath = resolve(dir, subdir)
    if (!existsSync(subdirPath))
      continue
    for (const file of readdirSync(subdirPath, { withFileTypes: true })) {
      if (!file.isFile())
        continue
      files.push({
        path: `${subdir}/${file.name}`,
        content: readFileSync(resolve(subdirPath, file.name), 'utf-8'),
      })
    }
  }

  return {
    name,
    description: frontmatter.description || '',
    path: repoPath,
    content,
    files,
  }
}

// ── GitHub ──

async function fetchGitHubSkills(
  source: GitSkillSource,
  onProgress?: (msg: string) => void,
): Promise<{ skills: RemoteSkill[], commitSha?: string }> {
  const { owner, repo } = source
  if (!owner || !repo)
    return { skills: [] }

  const ref = source.ref || 'main'
  onProgress?.(`Listing files at ${owner}/${repo}@${ref}`)

  const data = await $fetch<UnghFilesResponse>(
    `https://ungh.cc/repos/${owner}/${repo}/files/${ref}`,
  ).catch(() => null)

  if (!data?.files?.length) {
    // Try 'master' fallback if default ref failed
    if (ref === 'main') {
      const fallback = await $fetch<UnghFilesResponse>(
        `https://ungh.cc/repos/${owner}/${repo}/files/master`,
      ).catch(() => null)
      if (fallback?.files?.length)
        return extractGitHubSkills(owner!, repo!, 'master', fallback, source.skillPath, onProgress)
    }
    return { skills: [] }
  }

  return extractGitHubSkills(owner!, repo!, ref, data, source.skillPath, onProgress)
}

async function extractGitHubSkills(
  owner: string,
  repo: string,
  ref: string,
  data: UnghFilesResponse,
  skillPath?: string,
  onProgress?: (msg: string) => void,
): Promise<{ skills: RemoteSkill[], commitSha?: string }> {
  const allFiles = data.files.map(f => f.path)
  const commitSha = data.meta?.sha

  // Find SKILL.md files
  let skillMdPaths: string[]

  if (skillPath) {
    // Direct skill path: look for SKILL.md at that path
    const candidates = [
      `${skillPath}/SKILL.md`,
      // In case they linked directly to the SKILL.md
      skillPath.endsWith('/SKILL.md') ? skillPath : null,
    ].filter(Boolean) as string[]

    skillMdPaths = allFiles.filter(f => candidates.includes(f))
  }
  else {
    // Discover: skills/*/SKILL.md or root SKILL.md
    skillMdPaths = allFiles.filter(f =>
      f.match(/^skills\/[^/]+\/SKILL\.md$/) || f === 'SKILL.md',
    )
  }

  if (skillMdPaths.length === 0)
    return { skills: [], commitSha }

  const limit = pLimit(5)
  const skills: RemoteSkill[] = []

  onProgress?.(`Found ${skillMdPaths.length} skill(s), downloading...`)

  await Promise.all(skillMdPaths.map(mdPath => limit(async () => {
    const skillDir = mdPath === 'SKILL.md' ? '' : mdPath.replace(/\/SKILL\.md$/, '')
    const content = await fetchRawGitHub(owner, repo, ref, mdPath)
    if (!content)
      return

    const frontmatter = parseSkillFrontmatterName(content)
    const dirName = skillDir ? skillDir.split('/').pop()! : repo
    const name = frontmatter.name || dirName

    // Fetch supporting files
    const supportingFiles: Array<{ path: string, content: string }> = []
    const prefix = skillDir ? `${skillDir}/` : ''

    for (const subdir of SUPPORTING_DIRS) {
      const subdirPrefix = `${prefix}${subdir}/`
      const matching = allFiles.filter(f => f.startsWith(subdirPrefix))
      for (const filePath of matching) {
        const fileContent = await fetchRawGitHub(owner, repo, ref, filePath)
        if (fileContent) {
          const relativePath = filePath.slice(prefix.length)
          supportingFiles.push({ path: relativePath, content: fileContent })
        }
      }
    }

    skills.push({
      name,
      description: frontmatter.description || '',
      path: skillDir,
      content,
      files: supportingFiles,
    })
  })))

  return { skills, commitSha }
}

async function fetchRawGitHub(owner: string, repo: string, ref: string, path: string): Promise<string | null> {
  return $fetch(
    `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`,
    { responseType: 'text' },
  ).catch(() => null)
}

// ── GitLab ──

interface GitLabTreeEntry {
  id: string
  name: string
  type: string
  path: string
  mode: string
}

async function fetchGitLabSkills(
  source: GitSkillSource,
  onProgress?: (msg: string) => void,
): Promise<{ skills: RemoteSkill[], commitSha?: string }> {
  const { owner, repo } = source
  if (!owner || !repo)
    return { skills: [] }

  const ref = source.ref || 'main'
  const projectId = encodeURIComponent(`${owner}/${repo}`)

  onProgress?.(`Listing files at ${owner}/${repo}@${ref}`)

  const tree = await $fetch<GitLabTreeEntry[]>(
    `https://gitlab.com/api/v4/projects/${projectId}/repository/tree?ref=${ref}&recursive=true&per_page=100`,
  ).catch(() => null)

  if (!tree?.length)
    return { skills: [] }

  const allFiles = tree.filter(e => e.type === 'blob').map(e => e.path)

  // Find SKILL.md files
  const skillMdPaths = source.skillPath
    ? allFiles.filter(f => f === `${source.skillPath}/SKILL.md`)
    : allFiles.filter(f => f.match(/^skills\/[^/]+\/SKILL\.md$/) || f === 'SKILL.md')

  if (skillMdPaths.length === 0)
    return { skills: [] }

  const limit = pLimit(5)
  const skills: RemoteSkill[] = []

  onProgress?.(`Found ${skillMdPaths.length} skill(s), downloading...`)

  await Promise.all(skillMdPaths.map(mdPath => limit(async () => {
    const skillDir = mdPath === 'SKILL.md' ? '' : mdPath.replace(/\/SKILL\.md$/, '')
    const content = await fetchRawGitLab(owner!, repo!, ref, mdPath)
    if (!content)
      return

    const frontmatter = parseSkillFrontmatterName(content)
    const dirName = skillDir ? skillDir.split('/').pop()! : repo!
    const name = frontmatter.name || dirName

    // Fetch supporting files
    const supportingFiles: Array<{ path: string, content: string }> = []
    const prefix = skillDir ? `${skillDir}/` : ''

    for (const subdir of SUPPORTING_DIRS) {
      const subdirPrefix = `${prefix}${subdir}/`
      const matching = allFiles.filter(f => f.startsWith(subdirPrefix))
      for (const filePath of matching) {
        const fileContent = await fetchRawGitLab(owner!, repo!, ref, filePath)
        if (fileContent) {
          const relativePath = filePath.slice(prefix.length)
          supportingFiles.push({ path: relativePath, content: fileContent })
        }
      }
    }

    skills.push({
      name,
      description: frontmatter.description || '',
      path: skillDir,
      content,
      files: supportingFiles,
    })
  })))

  return { skills }
}

async function fetchRawGitLab(owner: string, repo: string, ref: string, path: string): Promise<string | null> {
  return $fetch(
    `https://gitlab.com/${owner}/${repo}/-/raw/${ref}/${path}`,
    { responseType: 'text' },
  ).catch(() => null)
}
