/**
 * E2E tests for the full sync pipeline.
 *
 * Tests real packages against real network (npm, GitHub, llms.txt).
 * Skips LLM phase — only tests resolution → fetch → cache → index → SKILL.md.
 *
 * Uses the real ~/.skilld/ cache (warms it for actual use).
 */

import type { PipelineResult } from './pipeline'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { sanitizeName } from '../../src/agent'
import {
  ensureCacheDir,
  getCacheDir,
  getPackageDbPath,
  getShippedSkills,
} from '../../src/cache'
import { search } from '../../src/retriv'
import { PACKAGES } from './matrix'
import { parseFrontmatter, runPipeline } from './pipeline'

// ── Tests ───────────────────────────────────────────────────────────

describe('e2e sync pipeline', () => {
  const results = new Map<string, PipelineResult>()
  const errors = new Map<string, Error>()

  beforeAll(async () => {
    ensureCacheDir()
    await Promise.allSettled(
      PACKAGES.map(async (pkg) => {
        try {
          results.set(pkg.name, await runPipeline(pkg.name))
        }
        catch (err) {
          errors.set(pkg.name, err as Error)
        }
      }),
    )
  }, 180_000)

  for (const pkg of PACKAGES) {
    describe(pkg.name, () => {
      function get(): PipelineResult {
        const err = errors.get(pkg.name)
        if (err)
          throw err
        const r = results.get(pkg.name)
        if (!r)
          throw new Error(`No result for ${pkg.name}`)
        return r
      }

      // ── Resolution ──

      it('resolves on npm with version', () => {
        const r = get()
        expect(r.resolved.name).toBe(pkg.name)
        expect(r.resolved.version).toMatch(/^\d+\.\d+/)
      })

      it(`repo → ${pkg.expectRepoUrl}`, () => {
        expect(get().resolved.repoUrl).toContain(pkg.expectRepoUrl)
      })

      if (pkg.expectDocsUrl) {
        it(`docsUrl → ${pkg.expectDocsUrl}`, () => {
          expect(get().resolved.docsUrl).toBe(pkg.expectDocsUrl)
        })
      }
      else {
        it('no docsUrl', () => {
          expect(get().resolved.docsUrl).toBeFalsy()
        })
      }

      it('resolution sources', () => {
        const r = get()
        const { expectSources } = pkg

        if (expectSources.gitDocs) {
          expect(r.resolved.gitDocsUrl).toBeTruthy()
          expect(r.resolved.gitRef).toBeTruthy()
        }
        else {
          expect(r.resolved.gitDocsUrl).toBeFalsy()
        }

        if (expectSources.llmsTxt) {
          expect(r.resolved.llmsUrl).toBeTruthy()
        }
        else {
          expect(r.resolved.llmsUrl).toBeFalsy()
        }

        if (expectSources.readme) {
          expect(r.resolved.readmeUrl).toBeTruthy()
        }
      })

      // ── Shipped skills ──

      if (pkg.expectShipped) {
        it('getShippedSkills() returns skills', () => {
          const cwd = process.cwd()
          const shipped = getShippedSkills(pkg.name, cwd)
          expect(shipped.length).toBeGreaterThan(0)
          for (const name of pkg.expectShippedSkills || []) {
            expect(shipped.some(s => s.skillName === name)).toBe(true)
          }
        })

        for (const skillName of pkg.expectShippedSkills || []) {
          it(`shipped skill "${skillName}" has SKILL.md`, () => {
            const cwd = process.cwd()
            const shipped = getShippedSkills(pkg.name, cwd)
            const match = shipped.find(s => s.skillName === skillName)!
            expect(existsSync(join(match.skillDir, 'SKILL.md'))).toBe(true)
          })

          it(`shipped skill "${skillName}" has .skilld/`, () => {
            const cwd = process.cwd()
            const shipped = getShippedSkills(pkg.name, cwd)
            const match = shipped.find(s => s.skillName === skillName)!
            expect(existsSync(join(match.skillDir, '.skilld'))).toBe(true)
          })
        }
      }

      // ── Cache (skip for shipped packages) ──

      if (!pkg.expectShipped) {
        it(`docs type → ${pkg.expectDocsType}`, () => {
          expect(get().docsType).toBe(pkg.expectDocsType)
        })

        it(`≥${pkg.minCacheDocs} cached docs`, () => {
          expect(get().cachedDocsCount).toBeGreaterThanOrEqual(pkg.minCacheDocs)
        })

        it('cache dir exists', () => {
          const r = get()
          expect(existsSync(getCacheDir(pkg.name, r.version))).toBe(true)
        })

        for (const file of pkg.expectCacheFiles) {
          it(`cached: ${file}`, () => {
            const r = get()
            const cacheDir = getCacheDir(pkg.name, r.version)
            expect(existsSync(join(cacheDir, file))).toBe(true)
          })
        }
      }

      // ── SKILL.md (skip for shipped packages) ──

      if (!pkg.expectShipped) {
        it('valid frontmatter', () => {
          const fm = parseFrontmatter(get().skillMd)
          expect(fm.name).toBe(`${sanitizeName(pkg.name)}-skilld`)
          expect(fm.version).toBeTruthy()
          expect(fm.description).toBeTruthy()
        })

        it(`description contains ${pkg.expectDescriptionContains}`, () => {
          const fm = parseFrontmatter(get().skillMd)
          expect(fm.description).toContain(pkg.expectDescriptionContains)
        })

        if (pkg.expectGlobs) {
          it(`globs → ${JSON.stringify(pkg.expectGlobs)}`, () => {
            const fm = parseFrontmatter(get().skillMd)
            expect(fm.globs).toBe(JSON.stringify(pkg.expectGlobs))
          })
        }
      }

      // ── Search index (skip for shipped packages, skip in CI — ONNX model unreliable) ──

      if (!pkg.expectShipped && !process.env.CI) {
        it('search.db exists', () => {
          const r = get()
          // llms.txt-only packages (no linked docs) don't produce a search index
          if (r.docsType === 'llms.txt') {
            return
          }
          expect(existsSync(getPackageDbPath(pkg.name, r.version))).toBe(true)
        })

        if (pkg.searchQuery) {
          it(`search("${pkg.searchQuery.query}") ≥${pkg.searchQuery.minHits} hits`, async () => {
            const r = get()
            const hits = await search(pkg.searchQuery!.query, {
              dbPath: getPackageDbPath(pkg.name, r.version),
              limit: 5,
            })
            expect(hits.length).toBeGreaterThanOrEqual(pkg.searchQuery!.minHits)
          })
        }
      }
    })
  }
})
