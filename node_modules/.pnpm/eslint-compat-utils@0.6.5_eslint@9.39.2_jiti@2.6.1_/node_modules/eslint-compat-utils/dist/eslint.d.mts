import * as eslint from 'eslint';
import * as eslintUnsupportedApi from 'eslint/use-at-your-own-risk';

type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
type ESLintType = typeof eslint.ESLint;
type LegacyESLintType = typeof eslintUnsupportedApi.LegacyESLint;
type LegacyESLint = IfAny<LegacyESLintType, ESLintType, LegacyESLintType>;
/**
 * Get ESLint class
 */
declare function getESLint(): ESLintType;
/**
 * Get LegacyESLint class
 */
declare function getLegacyESLint(): LegacyESLint;

export { getESLint, getLegacyESLint };
export type { LegacyESLint };
