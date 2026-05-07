/**
 * Section registry — single source of truth for what sections exist, what
 * output file each writes to, the merge order in SKILL.md, and how to build
 * a section's `PromptSection` from a `SectionContext`.
 *
 * Adding a new section is one new entry here plus the corresponding section
 * factory file under this directory. No edits to dispatch switches or
 * parallel constant tables.
 */

import type { CustomPrompt, PromptSection, SectionContext } from './types.ts'
import { apiChangesSection } from './api-changes.ts'
import { bestPracticesSection } from './best-practices.ts'
import { customSection } from './custom.ts'

export type SkillSection = 'api-changes' | 'best-practices' | 'custom'

export interface SectionModule {
  id: SkillSection
  /** File the section writes to inside `.skilld/`. */
  outputFile: string
  /** Build the `PromptSection` from context. Return `null` to skip (e.g. `custom` without a user prompt). */
  build: (ctx: SectionContext, customPrompt?: CustomPrompt) => PromptSection | null
}

/** Order of this array is the SKILL.md merge order. */
export const SECTIONS: readonly SectionModule[] = [
  {
    id: 'api-changes',
    outputFile: '_API_CHANGES.md',
    build: ctx => apiChangesSection(ctx),
  },
  {
    id: 'best-practices',
    outputFile: '_BEST_PRACTICES.md',
    build: ctx => bestPracticesSection(ctx),
  },
  {
    id: 'custom',
    outputFile: '_CUSTOM.md',
    build: (ctx, customPrompt) => customPrompt
      ? customSection(customPrompt, ctx.enabledSectionCount, ctx.overheadLines)
      : null,
  },
]

export const SECTION_OUTPUT_FILES = Object.fromEntries(
  SECTIONS.map(s => [s.id, s.outputFile]),
) as Record<SkillSection, string>

export const SECTION_MERGE_ORDER: SkillSection[] = SECTIONS.map(s => s.id)

export function getSectionModule(id: SkillSection): SectionModule | undefined {
  return SECTIONS.find(s => s.id === id)
}
