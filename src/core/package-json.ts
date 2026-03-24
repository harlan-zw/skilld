import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { applyEdits, modify, parseTree } from 'jsonc-parser'

export interface EditOptions {
  /** Formatting options for inserted content */
  tabSize?: number
  insertSpaces?: boolean
}

const defaultEditOptions: EditOptions = { tabSize: 2, insertSpaces: true }

// ── Cached reader ──────────────────────────────────────────────

const cache = new Map<string, { raw: string, parsed: Record<string, unknown> }>()

/**
 * Read and parse a package.json, returning cached result on repeat calls.
 * Throws if the file does not exist.
 */
export function readPackageJson(pkgPath: string): { raw: string, parsed: Record<string, unknown> } {
  const hit = cache.get(pkgPath)
  if (hit)
    return hit
  const raw = readFileSync(pkgPath, 'utf-8')
  const parsed = JSON.parse(raw) as Record<string, unknown>
  const entry = { raw, parsed }
  cache.set(pkgPath, entry)
  return entry
}

/**
 * Same as readPackageJson but returns null when the file is missing or unparseable.
 */
export function readPackageJsonSafe(pkgPath: string): { raw: string, parsed: Record<string, unknown> } | null {
  if (cache.has(pkgPath))
    return cache.get(pkgPath)!
  if (!existsSync(pkgPath))
    return null
  try {
    return readPackageJson(pkgPath)
  }
  catch {
    return null
  }
}

/**
 * Drop any cached entry so the next read hits disk.
 */
export function invalidatePackageJson(pkgPath: string): void {
  cache.delete(pkgPath)
}

/**
 * Clear all cached entries. Useful in tests.
 */
export function clearPackageJsonCache(): void {
  cache.clear()
}

// ── JSON editing helpers ───────────────────────────────────────

/**
 * Set a value at a JSON path, preserving all surrounding formatting.
 * Returns the modified file content as a string.
 */
export function editJsonProperty(raw: string, path: (string | number)[], value: unknown, options?: EditOptions): string {
  const opts = { ...defaultEditOptions, ...options }
  const edits = modify(raw, path, value, {
    formattingOptions: { tabSize: opts.tabSize!, insertSpaces: opts.insertSpaces! },
  })
  return applyEdits(raw, edits)
}

/**
 * Remove a value at a JSON path, preserving all surrounding formatting.
 */
export function removeJsonProperty(raw: string, path: (string | number)[]): string {
  const edits = modify(raw, path, undefined, {})
  return applyEdits(raw, edits)
}

/**
 * Read a package.json, apply an edit function, write it back, and invalidate the cache.
 * The edit function receives the raw text and parsed object,
 * and returns the new raw text (or null to skip writing).
 */
export function patchPackageJson(
  pkgPath: string,
  editFn: (raw: string, pkg: Record<string, unknown>) => string | null,
): boolean {
  const { raw, parsed } = readPackageJson(pkgPath)
  const result = editFn(raw, parsed)
  if (result === null)
    return false
  writeFileSync(pkgPath, result)
  invalidatePackageJson(pkgPath)
  return true
}

/**
 * Append a value to a JSON array at the given path, preserving formatting.
 * Inserts in sorted order if the array contains strings.
 */
export function appendToJsonArray(raw: string, path: string[], value: string, options?: EditOptions): string {
  const opts = { ...defaultEditOptions, ...options }
  const tree = parseTree(raw)
  if (!tree)
    return editJsonProperty(raw, path, [value], opts)

  // Walk to the target array node
  let node = tree
  for (const key of path) {
    const child = node.children?.find(c =>
      c.type === 'property' && c.children?.[0]?.value === key,
    )
    if (!child?.children?.[1])
      return editJsonProperty(raw, path, [value], opts)
    node = child.children[1]
  }

  if (node.type !== 'array' || !node.children)
    return editJsonProperty(raw, path, [value], opts)

  // Find sorted insertion index (only for string-only arrays)
  const allStrings = node.children.every(c => typeof c.value === 'string')
  let idx = node.children.length
  if (allStrings) {
    const items = node.children.map(c => c.value as string)
    for (let i = 0; i < items.length; i++) {
      if (value.localeCompare(items[i]!) < 0) {
        idx = i
        break
      }
    }
  }

  const edits = modify(raw, [...path, idx], value, {
    formattingOptions: { tabSize: opts.tabSize!, insertSpaces: opts.insertSpaces! },
    isArrayInsertion: true,
  })
  return applyEdits(raw, edits)
}
