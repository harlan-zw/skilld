/**
 * E2E test matrix — package specs and expected outputs.
 *
 * Each entry defines what a package should resolve to, what files get cached,
 * and what the emitted SKILL.md should contain.
 *
 * Add a row here to test a new package through the full sync pipeline.
 */

// ── Types ───────────────────────────────────────────────────────────

export interface PackageSpec {
  name: string

  // ── Resolution expectations ──
  /** GitHub repo URL pattern (substring match) */
  expectRepoUrl: string
  /** Package has a docs homepage URL */
  expectDocsUrl: string | null
  /** Resolution sources that should succeed */
  expectSources: {
    npm: true
    gitDocs: boolean
    llmsTxt: boolean
    readme: boolean
  }

  // ── Cache expectations ──
  /** Docs type that should be used (highest priority source that resolved) */
  expectDocsType: 'docs' | 'llms.txt' | 'readme'
  /** Files or patterns expected in ~/.skilld/references/<pkg>@<ver>/ */
  expectCacheFiles: string[]
  /** Minimum total doc files (.md + .txt) in cache */
  minCacheDocs: number

  // ── SKILL.md expectations ──
  /** Expected globs from FILE_PATTERN_MAP (undefined = none) */
  expectGlobs?: string[]
  /** Expected description pattern — either glob-based or import-based */
  expectDescriptionContains: string

  // ── Search expectations ──
  /** Query + minimum hits to verify search index works */
  searchQuery?: { query: string, minHits: number }

  // ── Shipped skills expectations ──
  /** Package ships skills/ directory — skip cache/search tests */
  expectShipped?: boolean
  /** Expected skill names inside skills/ directory */
  expectShippedSkills?: string[]
}

// ── Matrix ──────────────────────────────────────────────────────────

export const PACKAGES: PackageSpec[] = [
  // ── nuxt ──────────────────────────────────────────────────────────
  // Big framework, git docs with 150+ files, llms.txt also available.
  // Git docs win because they're checked first.
  {
    name: 'nuxt',
    expectRepoUrl: 'github.com/nuxt/nuxt',
    expectDocsUrl: 'https://nuxt.com',
    expectSources: { npm: true, gitDocs: true, llmsTxt: true, readme: false },
    expectDocsType: 'docs',
    expectCacheFiles: [
      'docs/1.getting-started/01.introduction.md',
      'docs/1.getting-started/10.data-fetching.md',
      'docs/3.guide/1.concepts/3.auto-imports.md',
      'docs/4.api/2.composables/use-fetch.md',
    ],
    minCacheDocs: 100,
    expectDescriptionContains: '"nuxt"',
    searchQuery: { query: 'composable', minHits: 1 },
  },

  // ── vue ───────────────────────────────────────────────────────────
  // Core runtime — npm name is "vue" but repo is vuejs/core.
  // No git docs/ folder in the package, but llms.txt at vuejs.org.
  // llms.txt has linked .md files → downloads into docs/.
  {
    name: 'vue',
    expectRepoUrl: 'github.com/vuejs/core',
    expectDocsUrl: 'https://vuejs.org',
    expectSources: { npm: true, gitDocs: true, llmsTxt: true, readme: true },
    expectDocsType: 'docs',
    expectCacheFiles: [
      'src/guide/essentials/reactivity-fundamentals.md',
      'src/api/reactivity-core.md',
      'src/style-guide/rules-essential.md',
    ],
    minCacheDocs: 50,
    expectGlobs: ['*.vue'],
    expectDescriptionContains: '*.vue',
    searchQuery: { query: 'reactivity', minHits: 1 },
  },

  // ── vite ──────────────────────────────────────────────────────────
  // Build tool — has both git docs and llms.txt. Git docs win.
  {
    name: 'vite',
    expectRepoUrl: 'github.com/vitejs/vite',
    expectDocsUrl: 'https://vite.dev',
    expectSources: { npm: true, gitDocs: true, llmsTxt: true, readme: true },
    expectDocsType: 'docs',
    expectCacheFiles: [
      'docs/config/shared-options.md',
      'docs/guide/features.md',
      'docs/guide/api-plugin.md',
      'docs/guide/ssr.md',
    ],
    minCacheDocs: 30,
    expectDescriptionContains: '"vite"',
    searchQuery: { query: 'plugin', minHits: 1 },
  },

  // ── zod ───────────────────────────────────────────────────────────
  // Schema library — git docs discovered in packages/docs/content/ (monorepo).
  // Also has llms.txt at zod.dev. Git docs win because checked first.
  {
    name: 'zod',
    expectRepoUrl: 'github.com/colinhacks/zod',
    expectDocsUrl: 'https://zod.dev',
    expectSources: { npm: true, gitDocs: true, llmsTxt: true, readme: true },
    expectDocsType: 'docs',
    expectCacheFiles: [
      'packages/docs/content/basics.mdx',
      'packages/docs/content/api.mdx',
    ],
    minCacheDocs: 10,
    expectDescriptionContains: '"zod"',
  },

  // ── @clack/prompts ────────────────────────────────────────────────
  // CLI prompts library — no git docs, no llms.txt. README only.
  {
    name: '@clack/prompts',
    expectRepoUrl: 'github.com/bombshell-dev/clack',
    expectDocsUrl: 'https://bomb.sh/docs/clack/basics/getting-started/',
    expectSources: { npm: true, gitDocs: false, llmsTxt: false, readme: true },
    expectDocsType: 'readme',
    expectCacheFiles: [
      'docs/README.md',
    ],
    minCacheDocs: 1,
    expectDescriptionContains: '"@clack/prompts"',
  },

  // ── citty ─────────────────────────────────────────────────────────
  // Tiny CLI framework — no docs URL, no llms.txt. README only.
  {
    name: 'citty',
    expectRepoUrl: 'github.com/unjs/citty',
    expectDocsUrl: null,
    expectSources: { npm: true, gitDocs: false, llmsTxt: false, readme: true },
    expectDocsType: 'readme',
    expectCacheFiles: [
      'docs/README.md',
    ],
    minCacheDocs: 1,
    expectDescriptionContains: '"citty"',
  },

  // ── mdream ────────────────────────────────────────────────────────
  // Small utility — no docs URL, no llms.txt. README only.
  {
    name: 'mdream',
    expectRepoUrl: 'github.com/harlan-zw/mdream',
    expectDocsUrl: null,
    expectSources: { npm: true, gitDocs: false, llmsTxt: false, readme: true },
    expectDocsType: 'readme',
    expectCacheFiles: [
      'docs/README.md',
    ],
    minCacheDocs: 1,
    expectDescriptionContains: '"mdream"',
  },

  // ── @slidev/cli ────────────────────────────────────────────────────
  // Ships its own skills/ directory in the npm package (55 files).
  // Also has git docs, llms.txt, and readme — all sources resolve.
  // Shipped skills take priority — no cache, no generated SKILL.md, no search.db.
  {
    name: '@slidev/cli',
    expectRepoUrl: 'github.com/slidevjs/slidev',
    expectDocsUrl: 'https://sli.dev',
    expectSources: { npm: true, gitDocs: true, llmsTxt: true, readme: true },
    expectDocsType: 'docs',
    expectCacheFiles: [
      'docs/guide/index.md',
    ],
    minCacheDocs: 10,
    expectDescriptionContains: '"@slidev/cli"',
    searchQuery: { query: 'slide', minHits: 1 },
  },
]
