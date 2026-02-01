import { FetchedDoc, SkillConfig, SkillResult } from "./types.mjs";

//#region src/index.d.ts
/**
 * Generate a skill from a documentation site
 */
declare function generateSkill(config: SkillConfig, onProgress?: (info: {
  url: string;
  count: number;
  phase: 'fetch' | 'index';
}) => void): Promise<SkillResult>;
//#endregion
export { type FetchedDoc, type SkillConfig, type SkillResult, generateSkill };
//# sourceMappingURL=index.d.mts.map