/**
 * Markdown sanitizer for prompt injection defense.
 *
 * Strips injection vectors from untrusted markdown before it reaches
 * agent-readable files (cached references, SKILL.md, search output).
 *
 * Threat model: agent instruction injection, not browser XSS.
 * Lightweight regex-based — markdown is consumed as text by AI agents.
 */

/** Zero-width and invisible formatting characters used to hide text from human review */
const ZERO_WIDTH_RE = /[\u200B\u200C\uFEFF\u2060\u200D\u061C\u180E\u200E\u200F\u2028\u2029]/gu

/** HTML comments (single-line and multi-line) */
const HTML_COMMENT_RE = /<!--[\s\S]*?-->/g

/**
 * Agent directive tags — stripped globally (including inside code blocks).
 * These are never legitimate in any context; they're purely injection vectors.
 */
const AGENT_DIRECTIVE_TAGS = [
  'system',
  'instructions',
  'override',
  'prompt',
  'context',
  'role',
  'user-prompt',
  'assistant',
  'tool-use',
  'tool-result',
  'system-prompt',
  'human',
  'admin',
]

/**
 * Dangerous HTML tags — stripped only outside fenced code blocks.
 * May appear legitimately in code examples (e.g. `<script setup>` in Vue docs).
 */
const DANGEROUS_HTML_TAGS = [
  'script',
  'iframe',
  'style',
  'meta',
  'object',
  'embed',
  'form',
]
/**
 * Decode HTML entity-encoded angle brackets so tag stripping catches encoded variants.
 * Only decodes < and > (named, decimal, hex) — minimal to avoid false positives.
 */
function decodeAngleBracketEntities(text: string): string {
  return text
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#0*60;/g, '<')
    .replace(/&#0*62;/g, '>')
    .replace(/&#x0*3c;/gi, '<')
    .replace(/&#x0*3e;/gi, '>')
}

/** Strip paired and standalone instances of the given tag names */
function stripTags(text: string, tags: string[]): string {
  if (!tags.length)
    return text
  const tagGroup = tags.join('|')
  // First strip paired tags with content between them
  const pairedRe = new RegExp(`<(${tagGroup})(\\s[^>]*)?>([\\s\\S]*?)<\\/\\1>`, 'gi')
  let result = text.replace(pairedRe, '')
  // Then strip any remaining standalone open/close/self-closing tags
  const standaloneRe = new RegExp(`<\\/?(${tagGroup})(\\s[^>]*)?\\/?>`, 'gi')
  result = result.replace(standaloneRe, '')
  return result
}

/** External image markdown: ![alt](https://...) or ![alt](http://...) */
const EXTERNAL_IMAGE_RE = /!\[([^\]]*)\]\(https?:\/\/[^)]+\)/gi

/**
 * External link markdown: [text](https://...) or [text](http://...)
 * Preserves relative links and anchors.
 */
const EXTERNAL_LINK_RE = /\[([^\]]*)\]\((https?:\/\/[^)]+)\)/gi

/** Dangerous URI protocols in links/images — match entire [text](protocol:...) */
const DANGEROUS_PROTOCOL_RE = /!?\[([^\]]*)\]\(\s*(javascript|data|vbscript|file)\s*:[^)]*\)/gi
const DANGEROUS_PROTOCOL_ENCODED_RE = /!?\[([^\]]*)\]\(\s*(?:(?:j|%6a|%4a)(?:a|%61|%41)(?:v|%76|%56)(?:a|%61|%41)(?:s|%73|%53)(?:c|%63|%43)(?:r|%72|%52)(?:i|%69|%49)(?:p|%70|%50)(?:t|%74|%54)|(?:d|%64|%44)(?:a|%61|%41)(?:t|%74|%54)(?:a|%61|%41)|(?:v|%76|%56)(?:b|%62|%42)(?:s|%73|%53)(?:c|%63|%43)(?:r|%72|%52)(?:i|%69|%49)(?:p|%70|%50)(?:t|%74|%54))\s*:[^)]*\)/gi

/** Directive-style lines that look like agent instructions */
const DIRECTIVE_LINE_RE = /^[ \t]*(SYSTEM|OVERRIDE|INSTRUCTION|NOTE TO AI|IGNORE PREVIOUS|IGNORE ALL PREVIOUS|DISREGARD|FORGET ALL|NEW INSTRUCTIONS?|IMPORTANT SYSTEM|ADMIN OVERRIDE)\s*[:>].*/gim

/** Base64 blob: 100+ chars of pure base64 alphabet on a single line */
const BASE64_BLOB_RE = /^[A-Z0-9+/=]{100,}$/gim

/** Unicode escape spam: 4+ consecutive \uXXXX sequences */
const UNICODE_ESCAPE_SPAM_RE = /(\\u[\dA-Fa-f]{4}){4,}/g

/**
 * Process content outside of fenced code blocks.
 * Uses a line-by-line state machine to properly track fence boundaries,
 * handling nested fences, mismatched lengths, and mixed backtick/tilde fences.
 * Unclosed fences are treated as non-code for security (prevents bypass via malformed fences).
 */
export function processOutsideCodeBlocks(content: string, fn: (text: string) => string): string {
  const lines = content.split('\n')
  const result: string[] = []
  let nonCodeBuffer: string[] = []
  let codeBuffer: string[] = []
  let inCodeBlock = false
  let fenceChar = ''
  let fenceLen = 0

  function flushNonCode() {
    if (nonCodeBuffer.length > 0) {
      result.push(fn(nonCodeBuffer.join('\n')))
      nonCodeBuffer = []
    }
  }

  for (const line of lines) {
    const trimmed = line.trimStart()

    if (!inCodeBlock) {
      const match = trimmed.match(/^(`{3,}|~{3,})/)
      if (match) {
        flushNonCode()
        inCodeBlock = true
        fenceChar = match[1][0]!
        fenceLen = match[1].length
        codeBuffer = [line]
        continue
      }
      nonCodeBuffer.push(line)
    }
    else {
      const match = trimmed.match(/^(`{3,}|~{3,})\s*$/)
      if (match && match[1][0] === fenceChar && match[1].length >= fenceLen) {
        // Properly closed — emit code block as-is
        result.push(codeBuffer.join('\n'))
        result.push(line)
        codeBuffer = []
        inCodeBlock = false
        fenceChar = ''
        fenceLen = 0
        continue
      }
      codeBuffer.push(line)
    }
  }

  flushNonCode()

  // Unclosed fence: treat as non-code so sanitization still applies
  if (inCodeBlock && codeBuffer.length > 0) {
    result.push(fn(codeBuffer.join('\n')))
  }

  return result.join('\n')
}

/**
 * Sanitize markdown content to strip prompt injection vectors.
 * Applied at every markdown emission point (cache writes, SKILL.md, search output).
 */
export function sanitizeMarkdown(content: string): string {
  if (!content)
    return content

  // Layer 1: Strip zero-width characters (global, including in code blocks)
  let result = content.replace(ZERO_WIDTH_RE, '')

  // Layer 2: Strip HTML comments (global, including in code blocks)
  result = result.replace(HTML_COMMENT_RE, '')

  // Layer 3a: Strip agent directive tags globally (never legitimate, even in code blocks)
  result = stripTags(result, AGENT_DIRECTIVE_TAGS)

  // Layers 3b-8: Only outside fenced code blocks
  result = processOutsideCodeBlocks(result, (text) => {
    // Layer 3b: Decode entities + strip remaining dangerous tags (HTML + entity-encoded agent directives)
    let t = decodeAngleBracketEntities(text)
    t = stripTags(t, [...AGENT_DIRECTIVE_TAGS, ...DANGEROUS_HTML_TAGS])

    // Layer 4: Strip external images (exfil via query params)
    t = t.replace(EXTERNAL_IMAGE_RE, '')

    // Layer 5: Convert external links to plain text
    t = t.replace(EXTERNAL_LINK_RE, '$1')

    // Layer 6: Strip dangerous protocols (raw and URL-encoded)
    t = t.replace(DANGEROUS_PROTOCOL_RE, '')
    t = t.replace(DANGEROUS_PROTOCOL_ENCODED_RE, '')

    // Layer 7: Strip directive-style lines
    t = t.replace(DIRECTIVE_LINE_RE, '')

    // Layer 8: Strip encoded payloads
    t = t.replace(BASE64_BLOB_RE, '')
    t = t.replace(UNICODE_ESCAPE_SPAM_RE, '')

    return t
  })

  return result
}

// --- Markdown repair ---

/** Heading missing space after #: `##Heading` → `## Heading` */
const HEADING_NO_SPACE_RE = /^(#{1,6})([^\s#])/gm

/** 3+ consecutive blank lines → 2 */
const EXCESSIVE_BLANKS_RE = /\n{4,}/g

/** Trailing whitespace on lines (preserve intentional double-space line breaks) */
const TRAILING_WHITESPACE_RE = /[ \t]+$/gm

/**
 * Close unclosed fenced code blocks.
 * Walks line-by-line tracking open/close state.
 */
function closeUnclosedCodeBlocks(content: string): string {
  const lines = content.split('\n')
  const result: string[] = []
  let inCodeBlock = false
  let fence = ''

  for (const line of lines) {
    const trimmed = line.trimStart()
    if (!inCodeBlock) {
      const match = trimmed.match(/^(`{3,}|~{3,})/)
      if (match) {
        inCodeBlock = true
        fence = match[1][0]!.repeat(match[1].length)
      }
    }
    else {
      // Check for closing fence (same char, at least same length)
      const match = trimmed.match(/^(`{3,}|~{3,})\s*$/)
      if (match && match[1][0] === fence[0] && match[1].length >= fence.length) {
        inCodeBlock = false
        fence = ''
      }
      else {
        // New fence opener inside unclosed block (same char, same length, with lang tag)
        // LLMs commonly forget to close a code block before starting a new one
        const openMatch = trimmed.match(/^(`{3,}|~{3,})\S/)
        if (openMatch && openMatch[1][0] === fence[0] && openMatch[1].length === fence.length) {
          result.push(fence)
          // fence char/length stays the same since both match
        }
      }
    }
    result.push(line)
  }

  // If still inside a code block, close it
  if (inCodeBlock) {
    // Ensure trailing newline before closing fence
    if (result.length > 0 && result[result.length - 1] !== '')
      result.push('')
    result.push(fence)
  }

  return result.join('\n')
}

/**
 * Close unclosed inline code spans.
 * Scans each line for unmatched backtick(s) and appends closing backtick(s).
 * Tracks fenced code blocks internally to handle any fence length.
 */
function closeUnclosedInlineCode(content: string): string {
  const lines = content.split('\n')
  let inFence = false
  let fenceChar = ''
  let fenceLen = 0

  return lines.map((line) => {
    const trimmed = line.trimStart()
    if (!inFence) {
      const m = trimmed.match(/^(`{3,}|~{3,})/)
      if (m) {
        inFence = true
        fenceChar = m[1][0]!
        fenceLen = m[1].length
        return line
      }
    }
    else {
      const m = trimmed.match(/^(`{3,}|~{3,})\s*$/)
      if (m && m[1][0] === fenceChar && m[1].length >= fenceLen) {
        inFence = false
      }
      return line
    }

    // Outside fenced code blocks — fix unclosed inline backticks
    let i = 0
    while (i < line.length) {
      if (line[i] === '`') {
        const seqStart = i
        while (i < line.length && line[i] === '`') i++
        const seqLen = i - seqStart
        let found = false
        let j = i
        while (j < line.length) {
          if (line[j] === '`') {
            const closeStart = j
            while (j < line.length && line[j] === '`') j++
            if (j - closeStart === seqLen) {
              found = true
              i = j
              break
            }
          }
          else {
            j++
          }
        }
        if (!found) {
          line = `${line}${'`'.repeat(seqLen)}`
          i = line.length
        }
      }
      else {
        i++
      }
    }
    return line
  }).join('\n')
}

/**
 * Repair broken markdown syntax.
 * Fixes common issues in fetched documentation:
 * - Unclosed fenced code blocks
 * - Unclosed inline code spans
 * - Missing space after heading # markers
 * - Excessive consecutive blank lines
 * - Trailing whitespace
 */
export function repairMarkdown(content: string): string {
  if (!content)
    return content

  let result = content

  // Fix unclosed fenced code blocks (must run before other line-level fixes)
  result = closeUnclosedCodeBlocks(result)

  // Fix unclosed inline code spans
  result = closeUnclosedInlineCode(result)

  // Fix heading spacing (only outside code blocks)
  result = processOutsideCodeBlocks(result, text =>
    text.replace(HEADING_NO_SPACE_RE, '$1 $2'))

  // Normalize excessive blank lines
  result = result.replace(EXCESSIVE_BLANKS_RE, '\n\n\n')

  // Strip trailing whitespace
  result = result.replace(TRAILING_WHITESPACE_RE, '')

  return result
}
