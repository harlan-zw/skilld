/**
 * `skilld assemble` — merge pasted LLM output back into SKILL.md
 *
 * Auto-discovers skill directories with pending output files when run without arguments.
 */

import type { SkillSection } from '../agent/index.ts'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import * as p from '@clack/prompts'
import { defineCommand } from 'citty'
import { join, relative, resolve } from 'pathe'
import { cleanSectionOutput } from '../agent/clis/index.ts'
import {
  extractMarkedSections,
  getSectionValidator,
  SECTION_MERGE_ORDER,
  SECTION_OUTPUT_FILES,
  wrapSection,
} from '../agent/index.ts'
import { iterateSkills } from '../core/skills.ts'

const OUTPUT_FILE_SET = new Set(Object.values(SECTION_OUTPUT_FILES))

/**
 * Find installed skill dirs that have pending section output files.
 */
function discoverSkillDirsWithOutputs(): string[] {
  const dirs: string[] = []
  for (const skill of iterateSkills({})) {
    if (readdirSync(skill.dir).some(f => OUTPUT_FILE_SET.has(f)))
      dirs.push(skill.dir)
  }
  return dirs
}

export async function assembleCommand(dir: string | undefined): Promise<void> {
  const cwd = process.cwd()

  let dirs: string[]
  if (dir) {
    dirs = [resolve(cwd, dir)]
  }
  else {
    // Check cwd first — if it has SKILL.md + output files, use it
    if (existsSync(join(cwd, 'SKILL.md'))
      && readdirSync(cwd).some(f => OUTPUT_FILE_SET.has(f))) {
      dirs = [cwd]
    }
    else {
      dirs = discoverSkillDirsWithOutputs()
      if (dirs.length === 0) {
        p.log.error('No skill directories with output files found. Run `skilld add` first.')
        return
      }
    }
  }

  for (const targetDir of dirs)
    assembleDir(targetDir, cwd)
}

function assembleDir(targetDir: string, cwd: string): void {
  if (!existsSync(targetDir)) {
    p.log.error(`Directory not found: ${targetDir}`)
    return
  }

  const skillMdPath = join(targetDir, 'SKILL.md')
  if (!existsSync(skillMdPath)) {
    p.log.error(`No SKILL.md found in ${targetDir}`)
    return
  }

  const existingSkillMd = readFileSync(skillMdPath, 'utf-8')

  // Find and read section output files
  const sections: Array<{ section: SkillSection, content: string }> = []
  const warnings: string[] = []

  for (const [section, outputFile] of Object.entries(SECTION_OUTPUT_FILES) as Array<[SkillSection, string]>) {
    const filePath = join(targetDir, outputFile)
    if (!existsSync(filePath))
      continue

    const raw = readFileSync(filePath, 'utf-8').trim()
    if (!raw) {
      p.log.warn(`Empty file: ${outputFile}`)
      continue
    }

    const cleaned = cleanSectionOutput(raw)
    if (!cleaned) {
      const missing: string[] = []
      if (!/^##\s/m.test(raw))
        missing.push('h2 heading (## ...)')
      if (!/^- (?:BREAKING|DEPRECATED|NEW): /m.test(raw))
        missing.push('change label (- BREAKING/DEPRECATED/NEW: ...)')
      if (!/\[source\]/.test(raw))
        missing.push('[source] link')
      p.log.warn(`${outputFile}: content rejected — missing ${missing.join(', ')}`)
      continue
    }

    const validator = getSectionValidator(section)
    if (validator) {
      for (const w of validator(cleaned))
        warnings.push(`${section}: ${w.warning}`)
    }

    sections.push({ section, content: cleaned })
    p.log.success(`Loaded ${outputFile}`)
  }

  if (sections.length === 0) {
    p.log.warn(`No section output files in ${relative(cwd, targetDir)}. Expected: ${Object.values(SECTION_OUTPUT_FILES).join(', ')}`)
    return
  }

  for (const w of warnings)
    p.log.warn(`\x1B[33m${w}\x1B[0m`)

  // Wrap each section with comment markers
  const wrappedSections: Array<{ section: SkillSection, wrapped: string }> = []
  for (const section of SECTION_MERGE_ORDER) {
    const result = sections.find(s => s.section === section)
    if (result)
      wrappedSections.push({ section, wrapped: wrapSection(section, result.content) })
  }

  // Try marker-based replacement first (re-assembly of previously assembled SKILL.md)
  const existingMarkers = extractMarkedSections(existingSkillMd)
  let newSkillMd: string

  if (existingMarkers.size > 0) {
    // Replace existing marked sections in-place, append new ones at the end
    newSkillMd = existingSkillMd
    // Process in reverse offset order to preserve indices
    const replacements = wrappedSections
      .filter(s => existingMarkers.has(s.section))
      .sort((a, b) => existingMarkers.get(b.section)!.start - existingMarkers.get(a.section)!.start)
    for (const { section, wrapped } of replacements) {
      const { start, end } = existingMarkers.get(section)!
      newSkillMd = newSkillMd.slice(0, start) + wrapped + newSkillMd.slice(end)
    }
    // Append sections that don't have existing markers
    const newSections = wrappedSections.filter(s => !existingMarkers.has(s.section))
    if (newSections.length > 0)
      newSkillMd = `${newSkillMd.trimEnd()}\n\n${newSections.map(s => s.wrapped).join('\n\n')}\n`
  }
  else {
    // First assembly — find header boundary and append all sections
    const body = wrappedSections.map(s => s.wrapped).join('\n\n')
    const fmEnd = existingSkillMd.indexOf('\n---\n', 4)
    const afterFm = fmEnd !== -1 ? existingSkillMd.slice(fmEnd + 5) : existingSkillMd

    const firstLlmHeading = body.match(/^## .+$/m)?.[0]
    let headerPart = afterFm
    if (firstLlmHeading) {
      const idx = afterFm.indexOf(firstLlmHeading)
      if (idx !== -1)
        headerPart = afterFm.slice(0, idx)
    }

    const fmPart = fmEnd !== -1 ? existingSkillMd.slice(0, fmEnd + 5) : ''
    const cleanHeader = headerPart.trimEnd()
    newSkillMd = fmPart
      ? `${fmPart}${cleanHeader}\n\n${body}\n`
      : `${cleanHeader}\n\n${body}\n`
  }

  writeFileSync(skillMdPath, newSkillMd)
  p.log.success(`Updated ${relative(cwd, skillMdPath)} with ${sections.length} section(s)`)
}

export const assembleCommandDef = defineCommand({
  meta: { name: 'assemble', description: 'Merge enhancement output files into SKILL.md' },
  args: {
    dir: {
      type: 'positional',
      description: 'Skill directory with output files (auto-discovers installed skills)',
      required: false,
    },
  },
  async run({ args }) {
    await assembleCommand(args.dir)
  },
})
