/**
 * Agent types and interfaces
 */

export type AgentType
  = | 'claude-code'
    | 'cursor'
    | 'windsurf'
    | 'cline'
    | 'codex'
    | 'github-copilot'
    | 'gemini-cli'
    | 'goose'
    | 'amp'
    | 'opencode'
    | 'roo'

export interface SkillMetadata {
  name: string
  version?: string
  /** ISO date string when this version was released */
  releasedAt?: string
  description?: string
}

/**
 * Mapping of packages to file patterns they process.
 * Used to generate skill descriptions with file extension triggers.
 */
export const FILE_PATTERN_MAP: Record<string, string[]> = {
  // Frameworks with custom file extensions
  'vue': ['*.vue'],
  'svelte': ['*.svelte'],
  'astro': ['*.astro'],
  'solid-js': ['*.jsx', '*.tsx'],
  'qwik': ['*.tsx'],
  'marko': ['*.marko'],
  'riot': ['*.riot'],

  // Languages/transpilers
  'typescript': ['*.ts', '*.tsx', '*.mts', '*.cts'],
  'coffeescript': ['*.coffee'],
  'livescript': ['*.ls'],
  'elm': ['*.elm'],

  // CSS preprocessors
  'sass': ['*.scss', '*.sass'],
  'less': ['*.less'],
  'stylus': ['*.styl'],
  'postcss': ['*.css', '*.pcss'],

  // Template engines
  'pug': ['*.pug'],
  'ejs': ['*.ejs'],
  'handlebars': ['*.hbs', '*.handlebars'],
  'mustache': ['*.mustache'],
  'nunjucks': ['*.njk'],
  'liquid': ['*.liquid'],

  // Data formats
  'yaml': ['*.yaml', '*.yml'],
  'js-yaml': ['*.yaml', '*.yml'],
  'toml': ['*.toml'],
  '@iarna/toml': ['*.toml'],
  'json5': ['*.json5'],
  'jsonc-parser': ['*.jsonc'],

  // Markdown
  'markdown-it': ['*.md'],
  'marked': ['*.md'],
  'remark': ['*.md', '*.mdx'],
  '@mdx-js/mdx': ['*.mdx'],

  // GraphQL
  'graphql': ['*.graphql', '*.gql'],
  'graphql-tag': ['*.graphql', '*.gql'],
  '@graphql-codegen/cli': ['*.graphql', '*.gql'],

  // Other
  'prisma': ['*.prisma'],
  '@prisma/client': ['*.prisma'],
  'wasm-pack': ['*.wasm'],
}
