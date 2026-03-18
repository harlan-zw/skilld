/**
 * CLI orchestrator — spawns per-CLI processes for skill generation
 * Each CLI (claude, gemini, codex) has its own buildArgs + parseLine in separate files
 */

import type { SkillSection } from '../prompts/index.ts'
import type { AgentType } from '../types.ts'
import type { CliModelConfig, CliName, OptimizeDocsOptions, OptimizeModel, OptimizeResult, ParsedEvent, SectionResult, StreamProgress, ValidationWarning } from './types.ts'
import { exec, spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, realpathSync, unlinkSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { setTimeout as delay } from 'node:timers/promises'
import { promisify } from 'node:util'
import { dirname, join } from 'pathe'
import { isWindows } from 'std-env'
import { readCachedSection, writeSections } from '../../cache/index.ts'
import { sanitizeMarkdown } from '../../core/sanitize.ts'
import { detectInstalledAgents } from '../detect.ts'
import { buildAllSectionPrompts, getSectionValidator, SECTION_MERGE_ORDER, SECTION_OUTPUT_FILES, wrapSection } from '../prompts/index.ts'
import { agents } from '../registry.ts'
import * as claude from './claude.ts'
import * as codex from './codex.ts'
import * as gemini from './gemini.ts'

export { buildAllSectionPrompts, buildSectionPrompt, SECTION_MERGE_ORDER, SECTION_OUTPUT_FILES } from '../prompts/index.ts'
export type { CustomPrompt, SkillSection } from '../prompts/index.ts'
export type { CliModelConfig, CliName, ModelInfo, OptimizeDocsOptions, OptimizeModel, OptimizeResult, StreamProgress } from './types.ts'

// ── Tool progress display ────────────────────────────────────────────

const TOOL_VERBS: Record<string, string> = {
  // Claude
  Read: 'Reading',
  Glob: 'Searching',
  Grep: 'Searching',
  Write: 'Writing',
  Bash: 'Running',
  // Gemini
  read_file: 'Reading',
  glob_tool: 'Searching',
  write_file: 'Writing',
  list_directory: 'Listing',
  search_file_content: 'Searching',
  run_shell_command: 'Running',
}

interface ToolProgressLog {
  message: (msg: string) => void
}

/** Create a progress callback that emits one line per tool call, Claude Code style */
export function createToolProgress(log: ToolProgressLog): (progress: StreamProgress) => void {
  let lastMsg = ''
  let repeatCount = 0

  function emit(msg: string) {
    if (msg === lastMsg) {
      repeatCount++
      log.message(`${msg} \x1B[90m(+${repeatCount})\x1B[0m`)
    }
    else {
      lastMsg = msg
      repeatCount = 0
      log.message(msg)
    }
  }

  return ({ type, chunk, section }) => {
    if (type === 'text') {
      emit(`${section ? `\x1B[90m[${section}]\x1B[0m ` : ''}Writing...`)
      return
    }
    if (type !== 'reasoning' || !chunk.startsWith('['))
      return

    // Parse individual tool names and hints from "[Read: path]" or "[Read, Glob: path1, path2]"
    const match = chunk.match(/^\[([^:[\]]+)(?::\s(.+))?\]$/)
    if (!match)
      return

    const names = match[1]!.split(',').map(n => n.trim())
    const hints = match[2]?.split(',').map(h => h.trim()) ?? []

    for (let i = 0; i < names.length; i++) {
      const rawName = names[i]!
      const hint = hints[i] ?? hints[0] ?? ''
      const verb = TOOL_VERBS[rawName] ?? rawName
      const prefix = section ? `\x1B[90m[${section}]\x1B[0m ` : ''

      if ((rawName === 'Bash' || rawName === 'run_shell_command') && hint) {
        const searchMatch = hint.match(/skilld search\s+"([^"]+)"/)
        if (searchMatch) {
          emit(`${prefix}Searching \x1B[36m"${searchMatch[1]}"\x1B[0m`)
        }
        else if (hint.includes('skilld validate')) {
          emit(`${prefix}Validating...`)
        }
        else {
          const shortened = shortenCommand(hint)
          emit(`${prefix}Running ${shortened.length > 50 ? `${shortened.slice(0, 47)}...` : shortened}`)
        }
      }
      else {
        const path = shortenPath(hint || '...')
        emit(`${prefix}${verb} \x1B[90m${path}\x1B[0m`)
      }
    }
  }
}

// ── Per-CLI dispatch ─────────────────────────────────────────────────

const CLI_DEFS = [claude, gemini, codex] as const

const CLI_BUILD_ARGS: Record<CliName, (model: string, skillDir: string, symlinkDirs: string[]) => string[]> = {
  claude: claude.buildArgs,
  gemini: gemini.buildArgs,
  codex: codex.buildArgs,
}

const CLI_PARSE_LINE: Record<CliName, (line: string) => ParsedEvent> = {
  claude: claude.parseLine,
  gemini: gemini.parseLine,
  codex: codex.parseLine,
}

// ── Assemble CLI_MODELS from per-CLI model definitions ───────────────

export const CLI_MODELS: Partial<Record<OptimizeModel, CliModelConfig>> = Object.fromEntries(
  CLI_DEFS.flatMap(def =>
    Object.entries(def.models).map(([id, entry]) => [
      id,
      { ...entry, cli: def.cli, agentId: def.agentId },
    ]),
  ),
)

// ── Model helpers ────────────────────────────────────────────────────

export function getModelName(id: OptimizeModel): string {
  return CLI_MODELS[id]?.name ?? id
}

export function getModelLabel(id: OptimizeModel): string {
  const config = CLI_MODELS[id]
  if (!config)
    return id
  const agentName = agents[config.agentId]?.displayName ?? config.cli
  return `${agentName} · ${config.name}`
}

export async function getAvailableModels(): Promise<import('./types.ts').ModelInfo[]> {
  const execAsync = promisify(exec)
  const lookupCmd = isWindows ? 'where' : 'which'

  const installedAgents = detectInstalledAgents()
  const agentsWithCli = installedAgents.filter(id => agents[id].cli)

  const cliChecks = await Promise.all(
    agentsWithCli.map(async (agentId) => {
      const cli = agents[agentId].cli!
      try {
        await execAsync(`${lookupCmd} ${cli}`)
        return agentId
      }
      catch { return null }
    }),
  )
  const availableAgentIds = new Set(cliChecks.filter((id): id is AgentType => id != null))

  return (Object.entries(CLI_MODELS) as [OptimizeModel, CliModelConfig][])
    .filter(([_, config]) => availableAgentIds.has(config.agentId))
    .map(([id, config]) => ({
      id,
      name: config.name,
      hint: config.hint,
      recommended: config.recommended,
      agentId: config.agentId,
      agentName: agents[config.agentId]?.displayName ?? config.agentId,
    }))
}

// ── Reference dirs ───────────────────────────────────────────────────

/** Resolve symlinks in .skilld/ to get real paths for --add-dir */
function resolveReferenceDirs(skillDir: string): string[] {
  const refsDir = join(skillDir, '.skilld')
  if (!existsSync(refsDir))
    return []
  const resolved = readdirSync(refsDir)
    .map(entry => join(refsDir, entry))
    .filter(p => lstatSync(p).isSymbolicLink() && existsSync(p))
    .map(p => realpathSync(p))

  // Include parent directories so CLIs can search across all references at once
  // (e.g. Gemini's sandbox requires the parent dir to be explicitly included)
  const parents = new Set<string>()
  for (const p of resolved) {
    const parent = dirname(p)
    if (!resolved.includes(parent))
      parents.add(parent)
  }

  return [...resolved, ...parents]
}

// ── Cache ────────────────────────────────────────────────────────────

const CACHE_DIR = join(homedir(), '.skilld', 'llm-cache')

/** Strip absolute paths from prompt so the hash is project-independent */
function normalizePromptForHash(prompt: string): string {
  return prompt.replace(/\/[^\s`]*\.(?:claude|codex|gemini)\/skills\/[^\s/`]+/g, '<SKILL_DIR>')
}

function hashPrompt(prompt: string, model: OptimizeModel, section: SkillSection): string {
  return createHash('sha256').update(`exec:${model}:${section}:${normalizePromptForHash(prompt)}`).digest('hex').slice(0, 16)
}

function getCached(prompt: string, model: OptimizeModel, section: SkillSection, maxAge = 7 * 24 * 60 * 60 * 1000): string | null {
  const path = join(CACHE_DIR, `${hashPrompt(prompt, model, section)}.json`)
  if (!existsSync(path))
    return null
  try {
    const { text, timestamp } = JSON.parse(readFileSync(path, 'utf-8'))
    return Date.now() - timestamp > maxAge ? null : text
  }
  catch { return null }
}

function setCache(prompt: string, model: OptimizeModel, section: SkillSection, text: string): void {
  mkdirSync(CACHE_DIR, { recursive: true, mode: 0o700 })
  writeFileSync(
    join(CACHE_DIR, `${hashPrompt(prompt, model, section)}.json`),
    JSON.stringify({ text, model, section, timestamp: Date.now() }),
    { mode: 0o600 },
  )
}

// ── Per-section spawn ────────────────────────────────────────────────

interface OptimizeSectionOptions {
  section: SkillSection
  prompt: string
  outputFile: string
  skillDir: string
  model: OptimizeModel
  packageName: string
  onProgress?: (progress: StreamProgress) => void
  timeout: number
  debug?: boolean
  preExistingFiles: Set<string>
}

/** Spawn a single CLI process for one section */
function optimizeSection(opts: OptimizeSectionOptions): Promise<SectionResult> {
  const { section, prompt, outputFile, skillDir, model, onProgress, timeout, debug, preExistingFiles } = opts

  const cliConfig = CLI_MODELS[model]
  if (!cliConfig) {
    return Promise.resolve({ section, content: '', wasOptimized: false, error: `No CLI mapping for model: ${model}` })
  }

  const { cli, model: cliModel } = cliConfig
  const symlinkDirs = resolveReferenceDirs(skillDir)
  const args = CLI_BUILD_ARGS[cli](cliModel, skillDir, symlinkDirs)
  const parseLine = CLI_PARSE_LINE[cli]

  const skilldDir = join(skillDir, '.skilld')
  const outputPath = join(skilldDir, outputFile)

  // Remove stale output so we don't read a leftover from a previous run
  if (existsSync(outputPath))
    unlinkSync(outputPath)

  // Write prompt for debugging
  writeFileSync(join(skilldDir, `PROMPT_${section}.md`), prompt)

  return new Promise<SectionResult>((resolve) => {
    const proc = spawn(cli, args, {
      cwd: skilldDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout,
      env: { ...process.env, NO_COLOR: '1' },
      shell: isWindows,
    })

    let buffer = ''
    let accumulatedText = ''
    let lastWriteContent = ''
    let usage: { input: number, output: number } | undefined
    let cost: number | undefined
    const rawLines: string[] = []

    onProgress?.({ chunk: '[starting...]', type: 'reasoning', text: '', reasoning: '', section })

    proc.stdin.write(prompt)
    proc.stdin.end()

    proc.stdout.on('data', (chunk: Buffer) => {
      buffer += chunk.toString()
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.trim())
          continue
        if (debug)
          rawLines.push(line)
        const evt = parseLine(line)

        if (evt.textDelta)
          accumulatedText += evt.textDelta
        if (evt.fullText)
          accumulatedText = evt.fullText

        if (evt.writeContent)
          lastWriteContent = evt.writeContent

        if (evt.toolName) {
          const hint = evt.toolHint
            ? `[${evt.toolName}: ${evt.toolHint}]`
            : `[${evt.toolName}]`
          onProgress?.({ chunk: hint, type: 'reasoning', text: '', reasoning: hint, section })
        }

        if (evt.usage)
          usage = evt.usage
        if (evt.cost != null)
          cost = evt.cost
      }
    })

    let stderr = ''
    proc.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
    })

    proc.on('close', (code) => {
      // Drain remaining buffer for metadata
      if (buffer.trim()) {
        const evt = parseLine(buffer)
        if (evt.textDelta)
          accumulatedText += evt.textDelta
        if (evt.fullText)
          accumulatedText = evt.fullText
        if (evt.writeContent)
          lastWriteContent = evt.writeContent
        if (evt.usage)
          usage = evt.usage
        if (evt.cost != null)
          cost = evt.cost
      }

      // Remove unexpected files the LLM may have written (prompt injection defense)
      // Only clean files not in the pre-existing snapshot and not our expected output
      for (const entry of readdirSync(skilldDir)) {
        if (entry !== outputFile && !preExistingFiles.has(entry)) {
          // Allow other section output files and debug prompts
          if (Object.values(SECTION_OUTPUT_FILES).includes(entry))
            continue
          if (entry.startsWith('PROMPT_') || entry === 'logs')
            continue
          try {
            unlinkSync(join(skilldDir, entry))
          }
          catch {}
        }
      }

      // Prefer file written by LLM, fall back to Write tool content (if denied), then accumulated stdout
      const raw = (existsSync(outputPath) ? readFileSync(outputPath, 'utf-8') : lastWriteContent || accumulatedText).trim()

      // Always write stderr on failure; write all logs in debug mode
      const logsDir = join(skilldDir, 'logs')
      const logName = section.toUpperCase().replace(/-/g, '_')
      if (debug || (stderr && (!raw || code !== 0))) {
        mkdirSync(logsDir, { recursive: true })
        if (stderr)
          writeFileSync(join(logsDir, `${logName}.stderr.log`), stderr)
      }
      if (debug) {
        mkdirSync(logsDir, { recursive: true })
        if (rawLines.length)
          writeFileSync(join(logsDir, `${logName}.jsonl`), rawLines.join('\n'))
        if (raw)
          writeFileSync(join(logsDir, `${logName}.md`), raw)
      }

      if (!raw && code !== 0) {
        resolve({ section, content: '', wasOptimized: false, error: stderr.trim() || `CLI exited with code ${code}` })
        return
      }

      // Clean the section output (strip markdown fences, frontmatter, sanitize)
      const content = raw ? cleanSectionOutput(raw) : ''

      if (content) {
        // Write cleaned content back to the output file for debugging
        writeFileSync(outputPath, content)
      }

      const validator = getSectionValidator(section)
      const rawWarnings = content && validator ? validator(content) : []
      const warnings: ValidationWarning[] = rawWarnings.map(w => ({ section, warning: w.warning }))

      resolve({
        section,
        content,
        wasOptimized: !!content,
        warnings: warnings?.length ? warnings : undefined,
        usage,
        cost,
      })
    })

    proc.on('error', (err) => {
      resolve({ section, content: '', wasOptimized: false, error: err.message })
    })
  })
}

// ── Main orchestrator ────────────────────────────────────────────────

export async function optimizeDocs(opts: OptimizeDocsOptions): Promise<OptimizeResult> {
  const { packageName, skillDir, model = 'sonnet', version, hasGithub, hasReleases, hasChangelog, docFiles, docsType, hasShippedDocs, onProgress, timeout = 180000, debug, noCache, sections, customPrompt, features, pkgFiles } = opts

  const selectedSections = sections ?? ['api-changes', 'best-practices'] as SkillSection[]

  // Build all section prompts
  const sectionPrompts = buildAllSectionPrompts({
    packageName,
    skillDir,
    version,
    hasIssues: hasGithub,
    hasDiscussions: hasGithub,
    hasReleases,
    hasChangelog,
    docFiles,
    docsType,
    hasShippedDocs,
    customPrompt,
    features,
    pkgFiles,
    sections: selectedSections,
  })

  if (sectionPrompts.size === 0) {
    return { optimized: '', wasOptimized: false, error: 'No valid sections to generate' }
  }

  const cliConfig = CLI_MODELS[model]
  if (!cliConfig) {
    return { optimized: '', wasOptimized: false, error: `No CLI mapping for model: ${model}` }
  }

  // Check per-section cache: references dir first (version-keyed), then LLM cache (prompt-hashed)
  const cachedResults: SectionResult[] = []
  const uncachedSections: Array<{ section: SkillSection, prompt: string }> = []

  for (const [section, prompt] of sectionPrompts) {
    if (!noCache) {
      // Check global references dir (cross-project, version-keyed)
      if (version) {
        const outputFile = SECTION_OUTPUT_FILES[section]
        const refCached = readCachedSection(packageName, version, outputFile)
        if (refCached) {
          onProgress?.({ chunk: `[${section}: cached]`, type: 'text', text: refCached, reasoning: '', section })
          cachedResults.push({ section, content: refCached, wasOptimized: true })
          continue
        }
      }

      // Check LLM prompt-hash cache
      const cached = getCached(prompt, model, section)
      if (cached) {
        onProgress?.({ chunk: `[${section}: cached]`, type: 'text', text: cached, reasoning: '', section })
        cachedResults.push({ section, content: cached, wasOptimized: true })
        continue
      }
    }
    uncachedSections.push({ section, prompt })
  }

  // Prepare .skilld/ dir and snapshot before spawns
  const skilldDir = join(skillDir, '.skilld')
  mkdirSync(skilldDir, { recursive: true })

  // Pre-flight: warn about broken symlinks in .skilld/ (avoids wasting tokens on missing refs)
  for (const entry of readdirSync(skilldDir)) {
    const entryPath = join(skilldDir, entry)
    try {
      if (lstatSync(entryPath).isSymbolicLink() && !existsSync(entryPath))
        onProgress?.({ chunk: `[warn: broken symlink .skilld/${entry}]`, type: 'reasoning', text: '', reasoning: '' })
    }
    catch {}
  }

  const preExistingFiles = new Set(readdirSync(skilldDir))

  // Spawn uncached sections with staggered starts to avoid rate-limit collisions
  const STAGGER_MS = 3000
  const spawnResults = uncachedSections.length > 0
    ? await Promise.allSettled(
        uncachedSections.map(({ section, prompt }, i) => {
          const outputFile = SECTION_OUTPUT_FILES[section]
          const run = () => optimizeSection({
            section,
            prompt,
            outputFile,
            skillDir,
            model,
            packageName,
            onProgress,
            timeout,
            debug,
            preExistingFiles,
          })
          // Stagger: first section starts immediately, rest delayed
          if (i === 0)
            return run()
          return delay(i * STAGGER_MS).then(run)
        }),
      )
    : []

  // Collect results, retry failed sections once
  const allResults: SectionResult[] = [...cachedResults]
  let totalUsage: { input: number, output: number } | undefined
  let totalCost = 0
  const retryQueue: Array<{ index: number, section: SkillSection, prompt: string }> = []

  for (let i = 0; i < spawnResults.length; i++) {
    const r = spawnResults[i]!
    const { section, prompt } = uncachedSections[i]!
    if (r.status === 'fulfilled' && r.value.wasOptimized) {
      allResults.push(r.value)
      if (r.value.usage) {
        totalUsage = totalUsage ?? { input: 0, output: 0 }
        totalUsage.input += r.value.usage.input
        totalUsage.output += r.value.usage.output
      }
      if (r.value.cost != null)
        totalCost += r.value.cost
      if (!noCache)
        setCache(prompt, model, section, r.value.content)
    }
    else {
      retryQueue.push({ index: i, section, prompt })
    }
  }

  // Retry failed sections once (sequential to avoid rate limits)
  for (const { section, prompt } of retryQueue) {
    onProgress?.({ chunk: `[${section}: retrying...]`, type: 'reasoning', text: '', reasoning: '', section })
    await delay(STAGGER_MS)
    const result = await optimizeSection({
      section,
      prompt,
      outputFile: SECTION_OUTPUT_FILES[section],
      skillDir,
      model,
      packageName,
      onProgress,
      timeout,
      debug,
      preExistingFiles,
    }).catch((err: Error) => ({ section, content: '', wasOptimized: false, error: err.message }) as SectionResult)

    allResults.push(result)
    if (result.wasOptimized && !noCache)
      setCache(prompt, model, section, result.content)
    if (result.usage) {
      totalUsage = totalUsage ?? { input: 0, output: 0 }
      totalUsage.input += result.usage.input
      totalUsage.output += result.usage.output
    }
    if (result.cost != null)
      totalCost += result.cost
  }

  // Write successful sections to global references dir for cross-project reuse
  if (version) {
    const sectionFiles = allResults
      .filter(r => r.wasOptimized && r.content)
      .map(r => ({ file: SECTION_OUTPUT_FILES[r.section], content: r.content }))
    if (sectionFiles.length > 0) {
      writeSections(packageName, version, sectionFiles)
    }
  }

  // Merge results in SECTION_MERGE_ORDER, wrapped with comment markers
  const mergedParts: string[] = []
  for (const section of SECTION_MERGE_ORDER) {
    const result = allResults.find(r => r.section === section)
    if (result?.wasOptimized && result.content) {
      mergedParts.push(wrapSection(section, result.content))
    }
  }

  const optimized = mergedParts.join('\n\n')
  const wasOptimized = mergedParts.length > 0

  const usageResult = totalUsage
    ? { inputTokens: totalUsage.input, outputTokens: totalUsage.output, totalTokens: totalUsage.input + totalUsage.output }
    : undefined

  // Collect errors and warnings from sections
  const errors = allResults.filter(r => r.error).map(r => `${r.section}: ${r.error}`)
  const warnings = allResults.flatMap(r => r.warnings ?? []).map(w => `${w.section}: ${w.warning}`)

  const debugLogsDir = debug && uncachedSections.length > 0
    ? join(skillDir, '.skilld', 'logs')
    : undefined

  return {
    optimized,
    wasOptimized,
    error: errors.length > 0 ? errors.join('; ') : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    finishReason: wasOptimized ? 'stop' : 'error',
    usage: usageResult,
    cost: totalCost || undefined,
    debugLogsDir,
  }
}

// ── Helpers ──────────────────────────────────────────────────────────

/** Shorten absolute paths for display: /home/user/project/.claude/skills/vue/SKILL.md → .claude/.../SKILL.md */
function shortenPath(p: string): string {
  const refIdx = p.indexOf('.skilld/')
  if (refIdx !== -1)
    return p.slice(refIdx + '.skilld/'.length)
  // Keep just filename for other paths
  const parts = p.split('/')
  return parts.length > 2 ? `.../${parts.slice(-2).join('/')}` : p
}

/** Replace absolute paths in a command string with shortened versions */
function shortenCommand(cmd: string): string {
  return cmd.replace(/\/[^\s"']+/g, (match) => {
    // Only shorten paths that look like they're inside a project
    if (match.includes('.claude/') || match.includes('.skilld/') || match.includes('node_modules/'))
      return `.../${match.split('/').slice(-2).join('/')}`
    return match
  })
}

/** Clean a single section's LLM output: strip markdown fences, frontmatter, sanitize */
export function cleanSectionOutput(content: string): string {
  let cleaned = content.trim()

  // Strip wrapping fences if output is wrapped in ```markdown, ```md, or bare ```
  // Requires matched open+close pair to avoid stripping internal code blocks
  const wrapMatch = cleaned.match(/^```(?:markdown|md)?[^\S\n]*\n([\s\S]+)\n```[^\S\n]*$/)
  if (wrapMatch) {
    const inner = wrapMatch[1]!.trim()
    // For bare ``` wrappers (no markdown/md tag), verify inner looks like section output
    const isExplicitWrapper = /^```(?:markdown|md)/.test(cleaned)
    if (isExplicitWrapper || /^##\s/m.test(inner) || /^- (?:BREAKING|DEPRECATED|NEW): /m.test(inner)) {
      cleaned = inner
    }
  }

  // Normalize h1 headers to h2 — LLMs sometimes use # instead of ##
  cleaned = cleaned.replace(/^# (?!#)/gm, '## ')

  // Strip accidental frontmatter or leading horizontal rules
  const fmMatch = cleaned.match(/^-{3,}\n/)
  if (fmMatch) {
    const afterOpen = fmMatch[0].length
    const closeMatch = cleaned.slice(afterOpen).match(/\n-{3,}/)
    if (closeMatch) {
      cleaned = cleaned.slice(afterOpen + closeMatch.index! + closeMatch[0].length).trim()
    }
    else {
      cleaned = cleaned.slice(afterOpen).trim()
    }
  }

  // Strip raw code preamble before first section marker (defense against LLMs dumping source)
  // Section markers: ## heading, BREAKING/DEPRECATED/NEW labels
  const firstMarker = cleaned.match(/^(##\s|- (?:BREAKING|DEPRECATED|NEW): )/m)
  if (firstMarker?.index && firstMarker.index > 0) {
    const preamble = cleaned.slice(0, firstMarker.index)
    // Only strip if preamble looks like code (contains function/const/export/return patterns)
    if (/\b(?:function|const |let |var |export |return |import |async |class )\b/.test(preamble)) {
      cleaned = cleaned.slice(firstMarker.index).trim()
    }
  }

  // Strip duplicate section headings (LLM echoing the format example before real content)
  // Handles headings separated by blank lines or boilerplate text
  const headingMatch = cleaned.match(/^(## .+)\n/)
  if (headingMatch) {
    const heading = headingMatch[1]!
    const afterFirst = headingMatch[0].length
    const secondIdx = cleaned.indexOf(heading, afterFirst)
    if (secondIdx !== -1) {
      // Only strip if the gap between duplicates is small (< 200 chars of boilerplate)
      if (secondIdx - afterFirst < 200)
        cleaned = cleaned.slice(secondIdx).trim()
    }
  }

  // Normalize citation link text to [source] — LLMs sometimes use the path as link text
  // e.g. [./references/docs/api.md](./references/docs/api.md) or [`./references/...`](...)
  // Also handles paren-wrapped variants: ([`path`](url))
  cleaned = cleaned.replace(
    /\(?\[`?\.\/(?:\.skilld\/|references\/)[^)\]]*\]\(([^)]+)\)\)?/g,
    (match, url: string) => {
      // Only normalize if the URL points to a reference path
      if (/^\.\/(?:\.skilld\/|references\/)/.test(url))
        return `[source](${url})`
      return match
    },
  )

  // Normalize source link paths: ensure .skilld/ prefix is present
  // LLMs sometimes emit [source](./docs/...) instead of [source](./.skilld/docs/...)
  cleaned = cleaned.replace(
    /\[source\]\(\.\/((docs|issues|discussions|releases|pkg|guide)\/)/g,
    '[source](./.skilld/$1',
  )

  cleaned = sanitizeMarkdown(cleaned)

  // Reject content that lacks any section structure — likely leaked LLM reasoning/narration
  // Valid sections contain headings (##), API change labels, or source-linked items
  if (!/^##\s/m.test(cleaned) && !/^- (?:BREAKING|DEPRECATED|NEW): /m.test(cleaned) && !/\[source\]/.test(cleaned)) {
    return ''
  }

  return cleaned
}
