import type { Rule } from "eslint";
import type { ArrayPattern, CallExpression, Expression, ForOfStatement, Identifier, MemberExpression, ObjectPattern } from "estree";
export type ExpressionReference = {
    type: "unused";
    node: Expression;
} | {
    type: "unknown";
    node: Expression;
} | {
    type: "exported";
    node: Expression;
} | {
    type: "member";
    node: Expression;
    memberExpression: MemberExpression;
} | {
    type: "destructuring";
    node: Expression;
    pattern: ObjectPattern | ArrayPattern;
} | {
    type: "argument";
    node: Expression;
    callExpression: CallExpression;
} | {
    type: "call";
    node: Expression;
} | {
    type: "iteration";
    node: Expression;
    for: ForOfStatement;
};
export declare function extractExpressionReferences(node: Expression, context: Rule.RuleContext): Iterable<ExpressionReference>;
export declare function extractExpressionReferencesForVariable(node: Identifier, context: Rule.RuleContext): Iterable<ExpressionReference>;
