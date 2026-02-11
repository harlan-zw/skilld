/**
 * CLI orchestrator — spawns per-CLI processes for skill generation
 * Each CLI (claude, gemini, codex) has its own buildArgs + parseLine in separate files
 */

import type { SkillSection } from '../prompts'
import type { AgentType } from '../types'
import type { CliModelConfig, CliName, OptimizeDocsOptions, OptimizeModel, OptimizeResult, ParsedEvent, SectionResult, StreamProgress, ValidationWarning } from './types'
import { exec, spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, realpathSync, unlinkSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { promisify } from 'node:util'
import { join } from 'pathe'
import { readCachedSection, writeSections } from '../../cache'
import { sanitizeMarkdown } from '../../core/sanitize'
import { detectInstalledAgents } from '../detect'
import { buildAllSectionPrompts, SECTION_MERGE_ORDER, SECTION_OUTPUT_FILES } from '../prompts'
import { agents } from '../registry'
import * as claude from './claude'
import * as codex from './codex'
import * as gemini from './gemini'

export { buildAllSectionPrompts, buildSectionPrompt, SECTION_MERGE_ORDER, SECTION_OUTPUT_FILES } from '../prompts'
export type { CustomPrompt, SkillSection } from '../prompts'
export type { CliModelConfig, CliName, ModelInfo, OptimizeDocsOptions, OptimizeModel, OptimizeResult, StreamProgress } from './types'

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

export async function getAvailableModels(): Promise<import('./types').ModelInfo[]> {
  const execAsync = promisify(exec)

  const installedAgents = detectInstalledAgents()
  const agentsWithCli = installedAgents.filter(id => agents[id].cli)

  const cliChecks = await Promise.all(
    agentsWithCli.map(async (agentId) => {
      const cli = agents[agentId].cli!
      try {
        await execAsync(`which ${cli}`)
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
  return readdirSync(refsDir)
    .map(entry => join(refsDir, entry))
    .filter(p => lstatSync(p).isSymbolicLink())
    .map(p => realpathSync(p))
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
            ? `[${evt.toolName}: ${shortenPath(evt.toolHint)}]`
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

      // Write debug logs: raw stream + raw text output
      if (debug) {
        const logsDir = join(skilldDir, 'logs')
        mkdirSync(logsDir, { recursive: true })
        const logName = section.toUpperCase().replace(/-/g, '_')
        if (rawLines.length)
          writeFileSync(join(logsDir, `${logName}.jsonl`), rawLines.join('\n'))
        if (raw)
          writeFileSync(join(logsDir, `${logName}.md`), raw)
        if (stderr)
          writeFileSync(join(logsDir, `${logName}.stderr.log`), stderr)
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

      const warnings = content ? validateSectionOutput(content, section) : undefined

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
  const { packageName, skillDir, model = 'sonnet', version, hasGithub, hasReleases, hasChangelog, docFiles, docsType, hasShippedDocs, onProgress, timeout = 180000, debug, noCache, sections, customPrompt, features } = opts

  const selectedSections = sections ?? ['llm-gaps', 'best-practices', 'api'] as SkillSection[]

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
  const preExistingFiles = new Set(readdirSync(skilldDir))

  // Spawn uncached sections in parallel
  const spawnResults = uncachedSections.length > 0
    ? await Promise.allSettled(
        uncachedSections.map(({ section, prompt }) => {
          const outputFile = SECTION_OUTPUT_FILES[section]
          return optimizeSection({
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
        }),
      )
    : []

  // Collect all results
  const allResults: SectionResult[] = [...cachedResults]
  let totalUsage: { input: number, output: number } | undefined
  let totalCost = 0

  for (let i = 0; i < spawnResults.length; i++) {
    const r = spawnResults[i]!
    const { section, prompt } = uncachedSections[i]!
    if (r.status === 'fulfilled') {
      const result = r.value
      allResults.push(result)
      // Cache successful results
      if (result.wasOptimized && !noCache) {
        setCache(prompt, model, section, result.content)
      }
      if (result.usage) {
        totalUsage = totalUsage ?? { input: 0, output: 0 }
        totalUsage.input += result.usage.input
        totalUsage.output += result.usage.output
      }
      if (result.cost != null) {
        totalCost += result.cost
      }
    }
    else {
      allResults.push({ section, content: '', wasOptimized: false, error: String(r.reason) })
    }
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

  // Merge results in SECTION_MERGE_ORDER
  const mergedParts: string[] = []
  for (const section of SECTION_MERGE_ORDER) {
    const result = allResults.find(r => r.section === section)
    if (result?.wasOptimized && result.content) {
      mergedParts.push(result.content)
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

/** Shorten absolute paths for display: /home/.../.skilld/docs/guide.md → docs/guide.md */
function shortenPath(p: string): string {
  const refIdx = p.indexOf('.skilld/')
  if (refIdx !== -1)
    return p.slice(refIdx + '.skilld/'.length)
  // Keep just filename for other paths
  const parts = p.split('/')
  return parts.length > 2 ? `.../${parts.slice(-2).join('/')}` : p
}

// ── Validation ───────────────────────────────────────────────────────

/** Max lines per section — generous thresholds (2x prompt guidance) to flag only egregious overruns */
const SECTION_MAX_LINES: Record<string, number> = {
  'llm-gaps': 160,
  'best-practices': 300,
  'api': 160,
  'custom': 160,
}

/** Validate a section's output against heuristic quality checks */
function validateSectionOutput(content: string, section: SkillSection): ValidationWarning[] {
  const warnings: ValidationWarning[] = []
  const lines = content.split('\n').length
  const maxLines = SECTION_MAX_LINES[section]

  if (maxLines && lines > maxLines * 1.5) {
    warnings.push({ section, warning: `Output ${lines} lines exceeds ${maxLines} max by >50%` })
  }

  if (lines < 3) {
    warnings.push({ section, warning: `Output only ${lines} lines — likely too sparse` })
  }

  return warnings
}

/** Clean a single section's LLM output: strip markdown fences, frontmatter, sanitize */
function cleanSectionOutput(content: string): string {
  let cleaned = content
    .replace(/^```markdown\n?/m, '')
    .replace(/\n?```$/m, '')
    .trim()

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
  // Section markers: ## heading, ⚠️ warning, ✅ best practice
  const firstMarker = cleaned.match(/^(##\s|⚠️|✅)/m)
  if (firstMarker?.index && firstMarker.index > 0) {
    const preamble = cleaned.slice(0, firstMarker.index)
    // Only strip if preamble looks like code (contains function/const/export/return patterns)
    if (/\b(?:function|const |let |var |export |return |import |async |class )\b/.test(preamble)) {
      cleaned = cleaned.slice(firstMarker.index).trim()
    }
  }

  cleaned = sanitizeMarkdown(cleaned)

  return cleaned
}
