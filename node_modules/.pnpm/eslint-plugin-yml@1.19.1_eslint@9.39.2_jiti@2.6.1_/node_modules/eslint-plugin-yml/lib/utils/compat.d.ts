import type { RuleContext, SourceCode } from "../types";
import type { Rule, SourceCode as ESLintSourceCode } from "eslint";
export declare function getSourceCode(context: RuleContext): SourceCode;
export declare function getSourceCode(context: Rule.RuleContext): ESLintSourceCode;
export declare function getFilename(context: RuleContext | Rule.RuleContext): string;
