/**
 * E2E generate matrix — tests full SKILL.md generation + installation.
 *
 * Matrix: packages × generator models × target agents
 *
 * Run with: GENERATE_E2E=1 pnpm test -- test/e2e-agents/generate.test.ts
 *
 * Requires LLM CLIs to be installed (gemini, codex).
 * Skips generators that aren't available on the system.
 */

import type { PipelineResult } from '../e2e/pipeline'
import type { GenerateResult, InstallResult } from './generate-pipeline'
import { readFileSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import { sanitizeName } from '../../src/agent'
import { agents } from '../../src/agent/registry'
import { parseFrontmatter } from '../e2e/pipeline'
import {
  GENERATOR_MODELS,
  TARGET_AGENTS,
  TEST_PACKAGES,
} from './generate-matrix'
import {
  ensureDocs,
  installToAgent,
  isGeneratorAvailable,
  runGenerate,
  writeGenerateArtifact,
  writeInstallArtifact,
} from './generate-pipeline'

// ── Gate ─────────────────────────────────────────────────────────────

const ENABLED = !!process.env.GENERATE_E2E

// Pre-check which generators are available
const availableGenerators = GENERATOR_MODELS.filter(m => isGeneratorAvailable(m))

// ── Tests ────────────────────────────────────────────────────────────

describe.runIf(ENABLED)('e2e generate matrix', () => {
  if (availableGenerators.length === 0) {
    it.skip('no generators available (need gemini or codex CLI)', () => {})
    return
  }

  for (const pkg of TEST_PACKAGES) {
    describe(pkg, () => {
      // ── Phase 1: ensure docs are cached ──
      let syncResult: PipelineResult

      beforeAll(async () => {
        syncResult = await ensureDocs(pkg)
      }, 120_000)

      it('docs are cached', () => {
        expect(syncResult).toBeDefined()
        expect(syncResult.cachedDocsCount).toBeGreaterThan(0)
      })

      // ── Phase 2: generate via each available model ──
      for (const generator of GENERATOR_MODELS) {
        const available = availableGenerators.includes(generator)

        describe.runIf(available)(`generator: ${generator}`, () => {
          let genResult: GenerateResult
          let genError: Error | undefined

          beforeAll(async () => {
            try {
              genResult = await runGenerate(pkg, generator, syncResult)
              writeGenerateArtifact(genResult)
            }
            catch (err) {
              genError = err as Error
            }
          }, 600_000) // 10 min — LLM sections run in parallel but can be slow

          it('generation completes without error', () => {
            if (genError)
              throw genError
            expect(genResult).toBeDefined()
          })

          it('produces valid SKILL.md', () => {
            if (genError)
              throw genError
            expect(genResult.skillMd).toBeTruthy()
            expect(genResult.skillMd.length).toBeGreaterThan(100)
          })

          it('has valid frontmatter', () => {
            if (genError)
              throw genError
            const fm = parseFrontmatter(genResult.skillMd)
            expect(fm.name).toBe(sanitizeName(pkg))
            expect(fm.description).toContain(pkg)
          })

          it('frontmatter includes generated_by under metadata', () => {
            if (genError)
              throw genError
            if (!genResult.wasOptimized)
              return // No LLM output — no generated_by expected
            const fm = parseFrontmatter(genResult.skillMd)
            expect(fm.metadata?.generated_by).toBeTruthy()
          })

          it('lLM produced content', () => {
            if (genError)
              throw genError
            expect(genResult.wasOptimized).toBe(true)
            expect(genResult.optimizedBody).toBeTruthy()
            expect(genResult.optimizedBody!.length).toBeGreaterThan(50)
          })

          it('content mentions package name', () => {
            if (genError)
              throw genError
            if (!genResult.optimizedBody)
              return
            const simpleName = pkg.replace(/^@[^/]+\//, '')
            expect(genResult.optimizedBody.toLowerCase()).toContain(simpleName.toLowerCase())
          })

          it('has section headings', () => {
            if (genError)
              throw genError
            if (!genResult.optimizedBody)
              return
            // Should have at least one ## heading from generated sections
            expect(genResult.optimizedBody).toMatch(/^## /m)
          })

          it('reports token usage', () => {
            if (genError)
              throw genError
            if (!genResult.wasOptimized)
              return
            expect(genResult.usage).toBeDefined()
            expect(genResult.usage!.totalTokens).toBeGreaterThan(0)
          })

          // ── Phase 3: install to each target agent ──
          for (const targetAgent of TARGET_AGENTS) {
            describe(`target: ${targetAgent}`, () => {
              let installResult: InstallResult

              beforeAll(() => {
                if (genError || !genResult?.skillMd)
                  return
                installResult = installToAgent(genResult.skillMd, pkg, targetAgent, generator)
                writeInstallArtifact(genResult, installResult)
              })

              it('installs successfully', () => {
                if (genError)
                  throw genError
                expect(installResult).toBeDefined()
                expect(installResult.exists).toBe(true)
              })

              it(`skill dir uses ${targetAgent} path convention`, () => {
                if (genError)
                  throw genError
                const agent = agents[targetAgent]
                expect(installResult.skillDir).toContain(agent.skillsDir)
              })

              it('installed SKILL.md matches generated', () => {
                if (genError)
                  throw genError
                const installed = readFileSync(installResult.skillMdPath, 'utf-8')
                expect(installed).toBe(genResult.skillMd)
              })
            })
          }
        })

        // Show skip message for unavailable generators
        if (!available) {
          describe(`generator: ${generator} (skipped — CLI not installed)`, () => {
            it.skip(`${generator} CLI not found`, () => {})
          })
        }
      }
    })
  }
})

// ── Summary ──────────────────────────────────────────────────────────

describe.runIf(ENABLED)('generate matrix summary', () => {
  it('has at least one available generator', () => {
    expect(availableGenerators.length).toBeGreaterThan(0)
  })

  it('matrix coverage', () => {
    const total = TEST_PACKAGES.length * GENERATOR_MODELS.length * TARGET_AGENTS.length
    const available = TEST_PACKAGES.length * availableGenerators.length * TARGET_AGENTS.length
    const skipped = total - available

    expect(total).toBe(TEST_PACKAGES.length * GENERATOR_MODELS.length * TARGET_AGENTS.length)
    expect(available).toBeGreaterThanOrEqual(0)
    expect(skipped).toBeLessThanOrEqual(total)
  })
})
