//#region src/types.d.ts
interface SkillConfig {
  /** Base URL or llms.txt URL */
  url: string;
  /** Output directory for skill files */
  outputDir?: string;
  /** Chunk size in characters */
  chunkSize?: number;
  /** Chunk overlap in characters */
  chunkOverlap?: number;
  /** Max pages to fetch */
  maxPages?: number;
  /** Skip llms.txt check and always crawl */
  skipLlmsTxt?: boolean;
  /** Embedding model */
  model?: string;
}
interface SkillResult {
  /** Site name (hostname) */
  siteName: string;
  /** Path to SKILL.md */
  skillPath: string;
  /** Path to references directory */
  referencesDir: string;
  /** Path to search database */
  dbPath: string;
  /** Number of chunks indexed */
  chunkCount: number;
}
interface FetchedDoc {
  url: string;
  title: string;
  content: string;
}
//#endregion
export { FetchedDoc, SkillConfig, SkillResult };
//# sourceMappingURL=types.d.mts.map