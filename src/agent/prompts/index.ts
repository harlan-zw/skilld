/**
 * Prompt presets
 */

import type { PromptPreset } from './types'
import { detailedPreset } from './detailed'
import { minimalPreset } from './minimal'
import { simplePreset } from './simple'

export type { PromptPreset } from './types'

export { detailedPreset } from './detailed'
export { minimalPreset } from './minimal'
export { simplePreset } from './simple'

/** All available presets */
export const presets: Record<string, PromptPreset> = {
  detailed: detailedPreset,
  simple: simplePreset,
  minimal: minimalPreset,
}

/** Default preset */
export const defaultPreset = simplePreset

/**
 * Get preset by ID
 */
export function getPreset(id: string): PromptPreset | undefined {
  return presets[id]
}

/**
 * Build prompt using a preset
 */
export function buildPrompt(
  packageName: string,
  packageDocs: string,
  presetId: string = 'simple',
): string {
  const preset = presets[presetId] || defaultPreset
  return preset.build(packageName, packageDocs)
}
