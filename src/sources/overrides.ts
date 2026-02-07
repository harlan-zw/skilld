/**
 * Hardcoded overrides for packages whose docs live in a different repo
 * than what npm registry points to.
 */

export interface DocOverride {
  /** GitHub owner */
  owner: string
  /** GitHub repo */
  repo: string
  /** Path prefix to filter markdown files (e.g. 'src') */
  path: string
  /** Branch or ref to use (default: 'main') */
  ref?: string
  /** Homepage/docs URL */
  homepage?: string
}

/**
 * Map of package name -> doc source override.
 * Keyed by npm package name.
 */
export const DOC_OVERRIDES: Record<string, DocOverride> = {
  'vue': {
    owner: 'vuejs',
    repo: 'docs',
    path: 'src',
    homepage: 'https://vuejs.org',
  },
  'tailwindcss': {
    owner: 'tailwindlabs',
    repo: 'tailwindcss.com',
    path: 'src/docs',
    homepage: 'https://tailwindcss.com',
  },
  'astro': {
    owner: 'withastro',
    repo: 'docs',
    path: 'src/content/docs/en',
    homepage: 'https://docs.astro.build',
  },
  '@vueuse/core': {
    owner: 'vueuse',
    repo: 'vueuse',
    path: 'packages',
  },
}

export function getDocOverride(packageName: string): DocOverride | undefined {
  return DOC_OVERRIDES[packageName]
}
