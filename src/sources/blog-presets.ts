/**
 * Blog release presets for packages
 * Registry of curated blog release posts with versions and publication dates
 * Extensible for Vue, React, Svelte, and other packages
 */

export interface BlogRelease {
  version: string // Semantic version (e.g., "3.5")
  url: string // Full blog post URL
  date: string // ISO date (YYYY-MM-DD) for sorting
  title?: string // Optional fallback title
}

export interface BlogPreset {
  packageName: string
  releases: BlogRelease[]
}

/**
 * Dictionary of blog presets for packages with curated blog releases
 * Each entry maps a package name to its blog release history
 */
export const BLOG_PRESETS: Record<string, BlogPreset> = {
  vue: {
    packageName: 'vue',
    releases: [
      { version: '3.5', url: 'https://blog.vuejs.org/posts/vue-3-5', date: '2024-09-01' },
      { version: '3.4', url: 'https://blog.vuejs.org/posts/vue-3-4', date: '2023-12-28' },
      { version: '3.3', url: 'https://blog.vuejs.org/posts/vue-3-3', date: '2023-05-11' },
      { version: '3.2', url: 'https://blog.vuejs.org/posts/vue-3-2', date: '2021-08-05' },
      { version: '3.1', url: 'https://blog.vuejs.org/posts/vue-3-1', date: '2021-06-07' },
      { version: '3.0', url: 'https://blog.vuejs.org/posts/vue-3-0', date: '2020-09-18' },
    ],
  },
  // Future: 'react', 'svelte', etc.
}

/**
 * Get blog preset for a package, or undefined if not available
 */
export function getBlogPreset(packageName: string): BlogPreset | undefined {
  return BLOG_PRESETS[packageName]
}
