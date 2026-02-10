/**
 * Generate test matrix — cross-product of packages × generator models × target agents.
 *
 * Tests the full SKILL.md generation + installation flow:
 * - Generator axis: which LLM model produces the skill content
 * - Target agent axis: where the skill gets installed
 * - Package axis: representative packages (small set for speed)
 *
 * Gated behind GENERATE_E2E=1 env var (LLM calls are slow + costly).
 */

import type { OptimizeModel } from '../../src/agent/clis'
import type { AgentType } from '../../src/agent/types'

// ── Types ───────────────────────────────────────────────────────────

export interface GenerateSpec {
  /** Package to generate skill for */
  package: string
  /** LLM model used to generate SKILL.md content */
  generator: OptimizeModel
  /** Target agent where skill gets installed */
  targetAgent: AgentType
}

// ── Axes ────────────────────────────────────────────────────────────

/** Target agents we're validating installation for */
export const TARGET_AGENTS: AgentType[] = ['gemini-cli', 'codex', 'opencode']

/** Generator models to test — each must have a CLI_MODELS entry */
export const GENERATOR_MODELS: OptimizeModel[] = ['gemini-2.5-flash', 'codex']

/**
 * Small, representative packages for fast tests:
 * - citty: tiny, README-only, fast to process
 * - zod: medium, has git docs, good coverage
 */
export const TEST_PACKAGES = ['citty', 'zod'] as const

// ── Matrix ──────────────────────────────────────────────────────────

/** Full cross-product: 2 packages × 2 generators × 3 targets = 12 specs */
export const GENERATE_MATRIX: GenerateSpec[] = TEST_PACKAGES.flatMap(pkg =>
  GENERATOR_MODELS.flatMap(generator =>
    TARGET_AGENTS.map(targetAgent => ({
      package: pkg,
      generator,
      targetAgent,
    })),
  ),
)

/** LLM sections to generate (skip 'custom' — requires user input) */
export const GENERATE_SECTIONS = ['llm-gaps', 'best-practices', 'api'] as const
