//#region src/split-text.d.ts
/**
 * Recursive markdown text splitter (LangChain-style)
 */
interface SplitTextOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  separators?: string[];
}
interface TextChunk {
  text: string;
  index: number;
  /** Character range [start, end] in original text */
  range: [number, number];
  /** Line range [startLine, endLine] (1-indexed) */
  lines: [number, number];
}
/**
 * Split text recursively using markdown-aware separators
 */
declare function splitText(text: string, options?: SplitTextOptions): TextChunk[];
//#endregion
export { SplitTextOptions, TextChunk, splitText };
//# sourceMappingURL=split-text.d.mts.map