import type { Quantifier } from "@eslint-community/regexpp/ast";
import type { Rule } from "eslint";
import type { CanSimplify } from "./regexp-ast";
import type { RegExpContext } from ".";
export declare function fixSimplifyQuantifier(quantifier: Quantifier, result: CanSimplify, { fixReplaceNode }: RegExpContext): [replacement: string, fix: (fixer: Rule.RuleFixer) => Rule.Fix | null];
