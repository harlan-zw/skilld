/**
 * Recursive markdown text splitter (LangChain-style)
 */

const MARKDOWN_SEPARATORS = [
  '\n## ',
  '\n### ',
  '\n#### ',
  '\n##### ',
  '\n###### ',
  '```\n\n',
  '\n\n***\n\n',
  '\n\n---\n\n',
  '\n\n___\n\n',
  '\n\n',
  '\n',
  ' ',
  '',
]

export interface SplitTextOptions {
  chunkSize?: number
  chunkOverlap?: number
  separators?: string[]
}

export interface TextChunk {
  text: string
  index: number
  /** Character range [start, end] in original text */
  range: [number, number]
  /** Line range [startLine, endLine] (1-indexed) */
  lines: [number, number]
}

/**
 * Convert character offset to line number (1-indexed)
 */
function offsetToLine(text: string, offset: number): number {
  let line = 1
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text[i] === '\n')
      line++
  }
  return line
}

/**
 * Split text recursively using markdown-aware separators
 */
export function splitText(
  text: string,
  options: SplitTextOptions = {},
): TextChunk[] {
  const {
    chunkSize = 1000,
    chunkOverlap = 200,
    separators = MARKDOWN_SEPARATORS,
  } = options

  if (text.length <= chunkSize) {
    const endLine = offsetToLine(text, text.length)
    return [{ text, index: 0, range: [0, text.length], lines: [1, endLine] }]
  }

  const chunks = splitRecursive(text, chunkSize, separators)
  return mergeChunks(chunks, chunkSize, chunkOverlap, text)
}

function splitRecursive(
  text: string,
  chunkSize: number,
  separators: string[],
): string[] {
  if (text.length <= chunkSize || separators.length === 0) {
    return [text]
  }

  const separator = separators.find(sep => sep === '' || text.includes(sep))
  if (!separator && separator !== '') {
    return [text]
  }

  const parts = separator === '' ? [...text] : text.split(separator)
  const results: string[] = []

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!
    const withSep = i < parts.length - 1 && separator !== ''
      ? part + separator
      : part

    if (withSep.length <= chunkSize) {
      results.push(withSep)
    }
    else {
      // Recurse with remaining separators
      const subParts = splitRecursive(withSep, chunkSize, separators.slice(1))
      results.push(...subParts)
    }
  }

  return results
}

function mergeChunks(
  parts: string[],
  chunkSize: number,
  chunkOverlap: number,
  originalText: string,
): TextChunk[] {
  const chunks: TextChunk[] = []
  let current = ''
  let currentStart = 0

  for (const part of parts) {
    if (current.length + part.length <= chunkSize) {
      current += part
    }
    else {
      if (current) {
        const start = originalText.indexOf(current, currentStart)
        const actualStart = start >= 0 ? start : currentStart
        const actualEnd = actualStart + current.length
        chunks.push({
          text: current,
          index: chunks.length,
          range: [actualStart, actualEnd],
          lines: [offsetToLine(originalText, actualStart), offsetToLine(originalText, actualEnd)],
        })
        currentStart = Math.max(0, actualStart + current.length - chunkOverlap)
      }

      // Start new chunk, possibly with overlap from previous
      if (chunkOverlap > 0 && current.length > chunkOverlap) {
        const overlap = current.slice(-chunkOverlap)
        current = overlap + part
      }
      else {
        current = part
      }
    }
  }

  // Don't forget the last chunk
  if (current) {
    const start = originalText.indexOf(current, currentStart)
    const actualStart = start >= 0 ? start : currentStart
    const actualEnd = start >= 0 ? start + current.length : originalText.length
    chunks.push({
      text: current,
      index: chunks.length,
      range: [actualStart, actualEnd],
      lines: [offsetToLine(originalText, actualStart), offsetToLine(originalText, actualEnd)],
    })
  }

  return chunks
}
