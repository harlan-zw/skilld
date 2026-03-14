import type { FeaturesConfig } from "../../../core/config.ts";

export interface ReferenceWeight {
  name: string;
  path: string;
  /** 1-10 usefulness score for this section */
  score: number;
  /** What this reference is useful for in this section */
  useFor: string;
}

export interface SectionValidationWarning {
  warning: string;
}

export interface PromptSection {
  task?: string;
  format?: string;
  rules?: string[];
  /** Per-reference usefulness ratings to guide LLM attention */
  referenceWeights?: ReferenceWeight[];
  /** Validate generated content for this section */
  validate?: (content: string) => SectionValidationWarning[];
}

export interface SectionContext {
  packageName: string;
  version?: string;
  hasIssues?: boolean;
  hasDiscussions?: boolean;
  hasReleases?: boolean;
  hasChangelog?: string | false;
  /** Whether a docs directory exists in .skilld/ */
  hasDocs?: boolean;
  /** Key files from the package (e.g., dist/pkg.d.ts) — empty when no pkg dir (git skills) */
  pkgFiles?: string[];
  features?: FeaturesConfig;
  /** Total number of enabled sections — used to adjust per-section line budgets */
  enabledSectionCount?: number;
  /** Number of release files — used for adaptive API changes budget */
  releaseCount?: number;
}

export interface CustomPrompt {
  heading: string;
  body: string;
}
