import type { Rule, Scope } from "eslint";
import type * as ES from "estree";
export declare function findVariable(context: Rule.RuleContext, node: ES.Identifier): Scope.Variable | null;
export declare function getPropertyName(context: Rule.RuleContext, node: ES.Property | ES.MemberExpression | ES.MethodDefinition): string | null;
export declare function isParenthesized(context: Rule.RuleContext, node: ES.Node): boolean;
