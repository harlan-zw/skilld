/**
 * Minimal YAML value escaping/unescaping for our hand-rolled parsers.
 *
 * Handles the characters that break naive `:` splitting and quote stripping:
 * colons, quotes, newlines, backslashes.
 */

/** Characters that require double-quoting in YAML values */
const NEEDS_QUOTING = /[:"'\\\n\r\t#{}[\],&*!|>%@`]/

/**
 * Escape a value for safe YAML emission. Always double-quotes if the value
 * contains any special characters; returns unquoted for simple values.
 */
export function yamlEscape(value: string): string {
  if (!NEEDS_QUOTING.test(value))
    return value
  // Escape backslashes first, then double quotes, then control chars
  const escaped = value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
  return `"${escaped}"`
}

/**
 * Parse a raw YAML value string back to its actual value.
 * Handles double-quoted (with escapes), single-quoted, and unquoted values.
 */
export function yamlUnescape(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed)
    return ''

  // Double-quoted: process escape sequences
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1)
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
  }

  // Single-quoted: no escape processing, just strip quotes
  if (trimmed.startsWith('\'') && trimmed.endsWith('\''))
    return trimmed.slice(1, -1)

  return trimmed
}

/**
 * Parse a YAML `key: value` line, correctly handling colons inside quoted values.
 * Returns [key, value] or null if not a valid KV line.
 */
export function yamlParseKV(line: string): [string, string] | null {
  const trimmed = line.trim()
  // Find the first `: ` or `:\n` or `:$` — the YAML key-value separator
  const colonIdx = trimmed.indexOf(':')
  if (colonIdx === -1)
    return null
  const key = trimmed.slice(0, colonIdx).trim()
  const rawValue = trimmed.slice(colonIdx + 1)
  if (!key)
    return null
  return [key, yamlUnescape(rawValue)]
}
