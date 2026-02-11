/**
 * Unified package registry — single source of truth for package metadata.
 * Consolidates doc overrides, blog presets, and file patterns.
 * Keyed by GitHub 'owner/repo' (source code repo).
 */

export interface BlogRelease {
  version: string
  url: string
  date: string
  title?: string
}

export interface PackageEntry {
  filePatterns?: string[]
  primary?: boolean
}

export interface RepoEntry {
  owner: string
  repo: string
  /** Separate docs repo name (e.g. 'docs' → owner/docs) */
  docsRepo?: string
  /** Path prefix to filter markdown files */
  docsPath?: string
  /** Branch/ref override */
  docsRef?: string
  /** Homepage URL */
  homepage?: string
  /** Packages in this repo */
  packages: Record<string, PackageEntry>
  /** Curated blog release posts */
  blogReleases?: BlogRelease[]
}

// Backwards-compatible types
export interface DocOverride {
  owner: string
  repo: string
  path: string
  ref?: string
  homepage?: string
}

export interface BlogPreset {
  packageName: string
  releases: BlogRelease[]
}

// ── Registry ──

const REPO_REGISTRY: Record<string, RepoEntry> = {
  // ── Frameworks with doc overrides ──

  'vuejs/core': {
    owner: 'vuejs',
    repo: 'core',
    docsRepo: 'docs',
    docsPath: 'src',
    homepage: 'https://vuejs.org',
    packages: {
      'vue': { primary: true, filePatterns: ['*.vue'] },
      '@vue/compiler-core': {},
      '@vue/compiler-dom': {},
      '@vue/reactivity': {},
      '@vue/runtime-core': {},
      '@vue/runtime-dom': {},
      '@vue/shared': {},
    },
    blogReleases: [
      { version: '3.5', url: 'https://blog.vuejs.org/posts/vue-3-5', date: '2024-09-01' },
      { version: '3.4', url: 'https://blog.vuejs.org/posts/vue-3-4', date: '2023-12-28' },
      { version: '3.3', url: 'https://blog.vuejs.org/posts/vue-3-3', date: '2023-05-11' },
      { version: '3.2', url: 'https://blog.vuejs.org/posts/vue-3-2', date: '2021-08-05' },
      { version: '3.1', url: 'https://blog.vuejs.org/posts/vue-3-1', date: '2021-06-07' },
      { version: '3.0', url: 'https://blog.vuejs.org/posts/vue-3-0', date: '2020-09-18' },
    ],
  },

  'tailwindlabs/tailwindcss': {
    owner: 'tailwindlabs',
    repo: 'tailwindcss',
    docsRepo: 'tailwindcss.com',
    docsPath: 'src/docs',
    homepage: 'https://tailwindcss.com',
    packages: {
      tailwindcss: { primary: true },
    },
  },

  'withastro/astro': {
    owner: 'withastro',
    repo: 'astro',
    docsRepo: 'docs',
    docsPath: 'src/content/docs/en',
    homepage: 'https://docs.astro.build',
    packages: {
      astro: { primary: true, filePatterns: ['*.astro'] },
    },
  },

  'vueuse/vueuse': {
    owner: 'vueuse',
    repo: 'vueuse',
    docsPath: 'packages',
    packages: {
      '@vueuse/core': { primary: true },
    },
  },

  // ── Frameworks (file patterns only) ──

  'sveltejs/svelte': {
    owner: 'sveltejs',
    repo: 'svelte',
    packages: {
      svelte: { primary: true, filePatterns: ['*.svelte'] },
    },
  },

  'solidjs/solid': {
    owner: 'solidjs',
    repo: 'solid',
    packages: {
      'solid-js': { primary: true, filePatterns: ['*.jsx', '*.tsx'] },
    },
  },

  'QwikDev/qwik': {
    owner: 'QwikDev',
    repo: 'qwik',
    packages: {
      qwik: { primary: true, filePatterns: ['*.tsx'] },
    },
  },

  'marko-js/marko': {
    owner: 'marko-js',
    repo: 'marko',
    packages: {
      marko: { primary: true, filePatterns: ['*.marko'] },
    },
  },

  'riot/riot': {
    owner: 'riot',
    repo: 'riot',
    packages: {
      riot: { primary: true, filePatterns: ['*.riot'] },
    },
  },

  // ── Languages/transpilers ──

  'microsoft/TypeScript': {
    owner: 'microsoft',
    repo: 'TypeScript',
    packages: {
      typescript: { primary: true, filePatterns: ['*.ts', '*.tsx', '*.mts', '*.cts'] },
    },
  },

  'jashkenas/coffeescript': {
    owner: 'jashkenas',
    repo: 'coffeescript',
    packages: {
      coffeescript: { primary: true, filePatterns: ['*.coffee'] },
    },
  },

  'gkz/LiveScript': {
    owner: 'gkz',
    repo: 'LiveScript',
    packages: {
      livescript: { primary: true, filePatterns: ['*.ls'] },
    },
  },

  'elm/compiler': {
    owner: 'elm',
    repo: 'compiler',
    packages: {
      elm: { primary: true, filePatterns: ['*.elm'] },
    },
  },

  // ── CSS preprocessors ──

  'sass/dart-sass': {
    owner: 'sass',
    repo: 'dart-sass',
    packages: {
      sass: { primary: true, filePatterns: ['*.scss', '*.sass'] },
    },
  },

  'less/less.js': {
    owner: 'less',
    repo: 'less.js',
    packages: {
      less: { primary: true, filePatterns: ['*.less'] },
    },
  },

  'stylus/stylus': {
    owner: 'stylus',
    repo: 'stylus',
    packages: {
      stylus: { primary: true, filePatterns: ['*.styl'] },
    },
  },

  'postcss/postcss': {
    owner: 'postcss',
    repo: 'postcss',
    packages: {
      postcss: { primary: true, filePatterns: ['*.css', '*.pcss'] },
    },
  },

  // ── Template engines ──

  'pugjs/pug': {
    owner: 'pugjs',
    repo: 'pug',
    packages: {
      pug: { primary: true, filePatterns: ['*.pug'] },
    },
  },

  'mde/ejs': {
    owner: 'mde',
    repo: 'ejs',
    packages: {
      ejs: { primary: true, filePatterns: ['*.ejs'] },
    },
  },

  'handlebars-lang/handlebars.js': {
    owner: 'handlebars-lang',
    repo: 'handlebars.js',
    packages: {
      handlebars: { primary: true, filePatterns: ['*.hbs', '*.handlebars'] },
    },
  },

  'janl/mustache.js': {
    owner: 'janl',
    repo: 'mustache.js',
    packages: {
      mustache: { primary: true, filePatterns: ['*.mustache'] },
    },
  },

  'mozilla/nunjucks': {
    owner: 'mozilla',
    repo: 'nunjucks',
    packages: {
      nunjucks: { primary: true, filePatterns: ['*.njk'] },
    },
  },

  'Shopify/liquid': {
    owner: 'Shopify',
    repo: 'liquid',
    packages: {
      liquid: { primary: true, filePatterns: ['*.liquid'] },
    },
  },

  // ── Data formats ──

  'eemeli/yaml': {
    owner: 'eemeli',
    repo: 'yaml',
    packages: {
      yaml: { primary: true, filePatterns: ['*.yaml', '*.yml'] },
    },
  },

  'nodeca/js-yaml': {
    owner: 'nodeca',
    repo: 'js-yaml',
    packages: {
      'js-yaml': { primary: true, filePatterns: ['*.yaml', '*.yml'] },
    },
  },

  'BinaryMuse/toml-node': {
    owner: 'BinaryMuse',
    repo: 'toml-node',
    packages: {
      'toml': { primary: true, filePatterns: ['*.toml'] },
      '@iarna/toml': { filePatterns: ['*.toml'] },
    },
  },

  'json5/json5': {
    owner: 'json5',
    repo: 'json5',
    packages: {
      json5: { primary: true, filePatterns: ['*.json5'] },
    },
  },

  'microsoft/node-jsonc-parser': {
    owner: 'microsoft',
    repo: 'node-jsonc-parser',
    packages: {
      'jsonc-parser': { primary: true, filePatterns: ['*.jsonc'] },
    },
  },

  // ── Markdown ──

  'markdown-it/markdown-it': {
    owner: 'markdown-it',
    repo: 'markdown-it',
    packages: {
      'markdown-it': { primary: true, filePatterns: ['*.md'] },
    },
  },

  'markedjs/marked': {
    owner: 'markedjs',
    repo: 'marked',
    packages: {
      marked: { primary: true, filePatterns: ['*.md'] },
    },
  },

  'remarkjs/remark': {
    owner: 'remarkjs',
    repo: 'remark',
    packages: {
      remark: { primary: true, filePatterns: ['*.md', '*.mdx'] },
    },
  },

  'mdx-js/mdx': {
    owner: 'mdx-js',
    repo: 'mdx',
    packages: {
      '@mdx-js/mdx': { primary: true, filePatterns: ['*.mdx'] },
    },
  },

  // ── GraphQL ──

  'graphql/graphql-js': {
    owner: 'graphql',
    repo: 'graphql-js',
    packages: {
      'graphql': { primary: true, filePatterns: ['*.graphql', '*.gql'] },
      'graphql-tag': { filePatterns: ['*.graphql', '*.gql'] },
    },
  },

  'dotansimha/graphql-code-generator': {
    owner: 'dotansimha',
    repo: 'graphql-code-generator',
    packages: {
      '@graphql-codegen/cli': { primary: true, filePatterns: ['*.graphql', '*.gql'] },
    },
  },

  // ── Other ──

  'prisma/prisma': {
    owner: 'prisma',
    repo: 'prisma',
    packages: {
      'prisma': { primary: true, filePatterns: ['*.prisma'] },
      '@prisma/client': { filePatterns: ['*.prisma'] },
    },
  },

  'nicolo-ribaudo/tc39-proposal-wasm-esm-integration': {
    owner: 'nicolo-ribaudo',
    repo: 'tc39-proposal-wasm-esm-integration',
    packages: {
      'wasm-pack': { primary: true, filePatterns: ['*.wasm'] },
    },
  },
}

// ── Reverse index (auto-generated) ──

const PACKAGE_TO_REPO_MAP: Record<string, string> = {}

for (const [repoKey, entry] of Object.entries(REPO_REGISTRY)) {
  for (const packageName of Object.keys(entry.packages)) {
    PACKAGE_TO_REPO_MAP[packageName] = repoKey
  }
}

// ── Backwards-compatible helpers ──

export function getDocOverride(packageName: string): DocOverride | undefined {
  const repoKey = PACKAGE_TO_REPO_MAP[packageName]
  if (!repoKey)
    return undefined
  const entry = REPO_REGISTRY[repoKey]
  if (!entry?.docsRepo && !entry?.docsPath)
    return undefined

  return {
    owner: entry.owner,
    repo: entry.docsRepo || entry.repo,
    path: entry.docsPath || '',
    ref: entry.docsRef,
    homepage: entry.homepage,
  }
}

export function getBlogPreset(packageName: string): BlogPreset | undefined {
  const repoKey = PACKAGE_TO_REPO_MAP[packageName]
  if (!repoKey)
    return undefined
  const entry = REPO_REGISTRY[repoKey]
  if (!entry?.blogReleases)
    return undefined

  return {
    packageName,
    releases: entry.blogReleases,
  }
}

export function getFilePatterns(packageName: string): string[] | undefined {
  const repoKey = PACKAGE_TO_REPO_MAP[packageName]
  if (!repoKey)
    return undefined
  return REPO_REGISTRY[repoKey]?.packages[packageName]?.filePatterns
}

// ── New APIs ──

export function getRepoEntry(repoKey: string): RepoEntry | undefined {
  return REPO_REGISTRY[repoKey]
}

export function getRepoKeyForPackage(packageName: string): string | undefined {
  return PACKAGE_TO_REPO_MAP[packageName]
}

export function getRelatedPackages(packageName: string): string[] {
  const repoKey = PACKAGE_TO_REPO_MAP[packageName]
  if (!repoKey)
    return []
  const entry = REPO_REGISTRY[repoKey]
  if (!entry)
    return []
  return Object.keys(entry.packages)
}
