/**
 * Shared validation helpers composed by per-section validators
 */

import type { SectionValidationWarning } from "./types.ts";

/** Warns if content exceeds 150% of max lines */
export function checkLineCount(content: string, max: number): SectionValidationWarning[] {
  const lines = content.split("\n").length;
  const threshold = Math.round(max * 1.5);
  if (lines > threshold) return [{ warning: `Output ${lines} lines exceeds ${max} max by >50%` }];
  return [];
}

/** Warns if content is fewer than 3 lines */
export function checkSparseness(content: string): SectionValidationWarning[] {
  const lines = content.split("\n").length;
  if (lines < 3) return [{ warning: `Output only ${lines} lines — likely too sparse` }];
  return [];
}

/** Warns if sourced/bullets ratio is below minRatio */
export function checkSourceCoverage(content: string, minRatio = 0.8): SectionValidationWarning[] {
  const bullets = (content.match(/^- /gm) || []).length;
  const sourced = (content.match(/\[source\]/g) || []).length;
  if (bullets > 2 && sourced / bullets < minRatio)
    return [
      {
        warning: `Only ${sourced}/${bullets} items have source citations (need ${Math.round(minRatio * 100)}% coverage)`,
      },
    ];
  return [];
}

/** Warns if source links are missing .skilld/ prefix */
export function checkSourcePaths(content: string): SectionValidationWarning[] {
  const badPaths = content.match(/\[source\]\(\.\/(docs|issues|discussions|releases|pkg|guide)\//g);
  if (badPaths?.length)
    return [{ warning: `${badPaths.length} source links missing .skilld/ prefix` }];
  return [];
}

/** Warns if source links use absolute filesystem paths instead of relative ./.skilld/ paths */
export function checkAbsolutePaths(content: string): SectionValidationWarning[] {
  const absPaths = content.match(/\[source\]\(\/[^)]+\)/g);
  if (absPaths?.length)
    return [
      {
        warning: `${absPaths.length} source links use absolute paths — must use relative ./.skilld/ paths`,
      },
    ];
  return [];
}
