/**
 * Detect packages from framework presets (e.g., Nuxt modules in nuxt.config)
 * These are string literals in config arrays, not imports — the import scanner misses them.
 */

import type { PackageUsage } from './detect-imports.ts'
import { readFile } from 'node:fs/promises'
import { parseSync } from 'oxc-parser'
import { join } from 'pathe'

const NUXT_CONFIG_FILES = ['nuxt.config.ts', 'nuxt.config.js', 'nuxt.config.mjs']
const NUXT_ECOSYSTEM = ['vue', 'nitro', 'h3']

async function findNuxtConfig(cwd: string): Promise<{ path: string, content: string } | null> {
  for (const name of NUXT_CONFIG_FILES) {
    const path = join(cwd, name)
    const content = await readFile(path, 'utf8').catch(() => null)
    if (content)
      return { path, content }
  }
  return null
}

/**
 * Walk AST node to find all string values inside a `modules` array property.
 * Handles: defineNuxtConfig({ modules: [...] }) and export default { modules: [...] }
 */
export function extractModuleStrings(node: any): string[] {
  if (!node || typeof node !== 'object')
    return []

  // Found a Property with key "modules" and an ArrayExpression value
  if (node.type === 'Property' && !node.computed
    && (node.key?.type === 'Identifier' && node.key.name === 'modules')
    && node.value?.type === 'ArrayExpression') { return node.value.elements.filter((el: any) => el?.type === 'Literal' && typeof el.value === 'string').map((el: any) => el.value as string) }

  // Recurse into arrays and object values
  const results: string[] = []
  if (Array.isArray(node)) {
    for (const child of node)
      results.push(...extractModuleStrings(child))
  }
  else {
    for (const key of Object.keys(node)) {
      if (key === 'start' || key === 'end' || key === 'type')
        continue
      const val = node[key]
      if (val && typeof val === 'object')
        results.push(...extractModuleStrings(val))
    }
  }
  return results
}

/**
 * Detect Nuxt modules from nuxt.config.{ts,js,mjs}
 */
export async function detectNuxtModules(cwd: string): Promise<PackageUsage[]> {
  const config = await findNuxtConfig(cwd)
  if (!config)
    return []

  const result = parseSync(config.path, config.content)
  const modules = extractModuleStrings(result.program)

  // Dedupe and build results
  const seen = new Set<string>()
  const packages: PackageUsage[] = []

  for (const mod of modules) {
    if (!seen.has(mod)) {
      seen.add(mod)
      packages.push({ name: mod, count: 0, source: 'preset' })
    }
  }

  // Add core ecosystem packages
  for (const pkg of NUXT_ECOSYSTEM) {
    if (!seen.has(pkg)) {
      seen.add(pkg)
      packages.push({ name: pkg, count: 0, source: 'preset' })
    }
  }

  return packages
}

/**
 * Run all preset detectors and merge results
 */
export async function detectPresetPackages(cwd: string): Promise<PackageUsage[]> {
  // Currently only Nuxt, but extensible for other frameworks
  return detectNuxtModules(cwd)
}
