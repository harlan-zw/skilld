import type { Rule } from "eslint";
import type { Expression } from "estree";
export declare enum UsageOfPattern {
    partial = 0,
    whole = 1,
    mixed = 2,
    unknown = 3
}
export declare function getUsageOfPattern(node: Expression, context: Rule.RuleContext): UsageOfPattern;
