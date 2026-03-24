import { readFileSync, writeFileSync } from 'node:fs'
import { applyEdits, modify, parseTree } from 'jsonc-parser'

export interface EditOptions {
  /** Formatting options for inserted content */
  tabSize?: number
  insertSpaces?: boolean
}

const defaultEditOptions: EditOptions = { tabSize: 2, insertSpaces: true }

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
 * Read a package.json, apply an edit function, and write it back.
 * The edit function receives the raw text and parsed object,
 * and returns the new raw text (or null to skip writing).
 */
export function patchPackageJson(
  pkgPath: string,
  editFn: (raw: string, pkg: Record<string, unknown>) => string | null,
): boolean {
  const raw = readFileSync(pkgPath, 'utf-8')
  const pkg = JSON.parse(raw)
  const result = editFn(raw, pkg)
  if (result === null)
    return false
  writeFileSync(pkgPath, result)
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

  // Find sorted insertion index
  const items = node.children.map(c => c.value as string)
  let idx = items.length
  for (let i = 0; i < items.length; i++) {
    if (value.localeCompare(items[i]) < 0) {
      idx = i
      break
    }
  }

  const edits = modify(raw, [...path, idx], value, {
    formattingOptions: { tabSize: opts.tabSize!, insertSpaces: opts.insertSpaces! },
    isArrayInsertion: true,
  })
  return applyEdits(raw, edits)
}
