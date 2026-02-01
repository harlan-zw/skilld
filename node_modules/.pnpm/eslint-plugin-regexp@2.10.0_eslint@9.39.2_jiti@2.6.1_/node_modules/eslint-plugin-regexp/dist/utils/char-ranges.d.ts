import type { Rule } from "eslint";
import type { JSONSchema4 } from "json-schema";
import type { CharRange } from "refa";
export declare function getAllowedCharRanges(allowedByRuleOption: string | readonly string[] | undefined, context: Rule.RuleContext): readonly CharRange[];
export declare function getAllowedCharValueSchema(): JSONSchema4;
export declare function inRange(ranges: Iterable<CharRange>, min: number, max?: number): boolean;
