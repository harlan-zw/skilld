import type { RegExpLiteral, Pattern } from "@eslint-community/regexpp/ast";
import type { Rule } from "eslint";
import type { Expression } from "estree";
export declare function getRegExpNodeFromExpression(node: Expression, context: Rule.RuleContext): RegExpLiteral | Pattern | null;
