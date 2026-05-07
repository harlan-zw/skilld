/**
 * Section runner — shared seam for "run a model and turn output into a SectionResult".
 *
 * Both the spawn-based CLI path (claude/gemini/codex) and the in-process pi-ai path
 * compose three steps: prepareSection → run model → finalizeSection. The model run
 * itself differs (process vs API call); everything around it is shared here.
 */

import type { SkillSection } from '../prompts/index.ts'
import type { CliAdapter, SectionResult, StreamProgress, ValidationWarning } from './types.ts'
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'pathe'
import { isWindows } from 'std-env'
import { getSectionValidator, SECTION_OUTPUT_FILES } from '../prompts/index.ts'
import { cleanSectionOutput } from './clean-output.ts'

/**
 * Strategy for running one section through a model. Two real adapters today:
 * `cliExecutor` (subprocess via `spawnCliAndStream`) and `piAiExecutor`
 * (in-process agent loop via `optimizeSectionPiAi`). The lifecycle around
 * `run` (prepareSection → run → finalizeSection) is identical for both.
 */
export interface SectionExecutor {
  /** When true, finalizeSection runs the prompt-injection cleanup pass. */
  cliCleanup: boolean
  run: (opts: {
    section: SkillSection
    prompt: string
    skillDir: string
    skilldDir: string
    timeout: number
    debug?: boolean
    onProgress?: (progress: StreamProgress) => void
  }) => Promise<RawRunOutput>
}

/** What a model run produces, before file/cleanup/validation. */
export interface RawRunOutput {
  /** Accumulated text from the run (stdout for CLIs, in-memory for pi-ai). */
  text: string
  /** Content the LLM tried to Write (fallback when host blocks Write tool). */
  writeContent?: string
  usage?: { input: number, output: number }
  cost?: number
  /** Stderr from a process run; undefined for in-memory runs. */
  stderr?: string
  /** Process exit code; undefined or 0 for successful in-memory runs. */
  exitCode?: number
  /** Raw stream-json lines for debug logging; CLI only. */
  rawLines?: string[]
}

/** Clear stale output and write the prompt file for debugging. */
export function prepareSection(opts: {
  section: SkillSection
  prompt: string
  outputPath: string
  skilldDir: string
}): void {
  if (existsSync(opts.outputPath))
    unlinkSync(opts.outputPath)
  writeFileSync(join(opts.skilldDir, `PROMPT_${opts.section}.md`), opts.prompt)
}

/**
 * Turn a RawRunOutput into a SectionResult: resolve final text (file > writeContent > stdout),
 * clean, validate, and write debug logs. CLI runs additionally pass `cliCleanup` to enforce
 * prompt-injection defense (delete unexpected files in skilldDir).
 */
export function finalizeSection(opts: {
  section: SkillSection
  raw: RawRunOutput
  outputFile: string
  outputPath: string
  skilldDir: string
  debug: boolean
  /** When set, runs the prompt-injection file cleanup pass. CLI-only. */
  cliCleanup?: { preExistingFiles: Set<string> }
}): SectionResult {
  const { section, raw, outputFile, outputPath, skilldDir, debug, cliCleanup } = opts

  if (cliCleanup) {
    for (const entry of readdirSync(skilldDir)) {
      if (entry === outputFile || cliCleanup.preExistingFiles.has(entry))
        continue
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

  const logsDir = join(skilldDir, 'logs')
  const logName = section.toUpperCase().replace(/-/g, '_')

  const fileText = existsSync(outputPath) ? readFileSync(outputPath, 'utf-8') : ''
  const text = (fileText || raw.writeContent || raw.text).trim()

  const stderr = raw.stderr ?? ''
  const code = raw.exitCode ?? 0
  if (debug || (stderr && (!text || code !== 0))) {
    mkdirSync(logsDir, { recursive: true })
    if (stderr)
      writeFileSync(join(logsDir, `${logName}.stderr.log`), stderr)
  }
  if (debug) {
    mkdirSync(logsDir, { recursive: true })
    if (raw.rawLines?.length)
      writeFileSync(join(logsDir, `${logName}.jsonl`), raw.rawLines.join('\n'))
    if (text)
      writeFileSync(join(logsDir, `${logName}.md`), text)
  }

  if (!text && code !== 0) {
    return { section, content: '', wasOptimized: false, error: stderr.trim() || `CLI exited with code ${code}` }
  }

  const content = text ? cleanSectionOutput(text) : ''
  if (content)
    writeFileSync(outputPath, content)

  const validator = getSectionValidator(section)
  const rawWarnings = content && validator ? validator(content) : []
  const warnings: ValidationWarning[] = rawWarnings.map(w => ({ section, warning: w.warning }))

  return {
    section,
    content,
    wasOptimized: !!content,
    warnings: warnings.length ? warnings : undefined,
    usage: raw.usage,
    cost: raw.cost,
  }
}

/**
 * Spawn a CLI process, stream stream-json from stdout, parse via the adapter, and resolve
 * with raw run output. The stdin prompt, env, cwd, timeout, and event dispatch all live here;
 * adapters only declare argv shape and event parsing.
 */
export function spawnCliAndStream(opts: {
  adapter: CliAdapter
  cliModel: string
  prompt: string
  skillDir: string
  skilldDir: string
  symlinkDirs: string[]
  timeout: number
  debug?: boolean
  section: SkillSection
  onProgress?: (progress: StreamProgress) => void
}): Promise<RawRunOutput> {
  const { adapter, cliModel, prompt, skillDir, skilldDir, symlinkDirs, timeout, debug, section, onProgress } = opts
  const args = adapter.buildArgs(cliModel, skillDir, symlinkDirs)
  const parseEvent = adapter.parseEvent

  return new Promise<RawRunOutput>((resolve) => {
    const proc = spawn(adapter.cli, args, {
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

    function applyEvent(evt: ReturnType<typeof parseEvent>): void {
      switch (evt.kind) {
        case 'text':
          if (evt.delta)
            accumulatedText += evt.delta
          if (evt.full !== undefined)
            accumulatedText = evt.full
          break
        case 'tool-call': {
          if (evt.writeContent)
            lastWriteContent = evt.writeContent
          const chunk = evt.hint ? `[${evt.tool}: ${evt.hint}]` : `[${evt.tool}]`
          onProgress?.({ chunk, type: 'reasoning', text: '', reasoning: chunk, section })
          break
        }
        case 'done':
          if (evt.usage)
            usage = evt.usage
          if (evt.cost != null)
            cost = evt.cost
          break
        case 'error':
        case 'noop':
          break
      }
    }

    proc.stdout.on('data', (chunk: Buffer) => {
      buffer += chunk.toString()
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        if (!line.trim())
          continue
        if (debug)
          rawLines.push(line)
        applyEvent(parseEvent(line))
      }
    })

    let stderr = ''
    proc.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
    })

    proc.on('close', (code) => {
      if (buffer.trim())
        applyEvent(parseEvent(buffer))
      resolve({
        text: accumulatedText,
        writeContent: lastWriteContent || undefined,
        usage,
        cost,
        stderr,
        exitCode: code ?? 0,
        rawLines: debug ? rawLines : undefined,
      })
    })

    proc.on('error', (err) => {
      resolve({ text: '', stderr: err.message, exitCode: 1 })
    })
  })
}
