import type { Rule } from "eslint";
import type { ForOfStatement, AssignmentProperty, Expression, MemberExpression, Pattern } from "estree";
export type PropertyReference = {
    type: "unknown";
    node: Pattern | AssignmentProperty | Expression | ForOfStatement;
    extractPropertyReferences?: () => Iterable<PropertyReference>;
} | {
    type: "member";
    name: string;
    node: MemberExpression;
    extractPropertyReferences: () => Iterable<PropertyReference>;
} | {
    type: "destructuring";
    name: string;
    node: AssignmentProperty | Pattern;
    extractPropertyReferences: () => Iterable<PropertyReference>;
} | {
    type: "iteration";
    node: ForOfStatement;
    extractPropertyReferences: () => Iterable<PropertyReference>;
};
export declare function extractPropertyReferences(node: Expression, context: Rule.RuleContext): Iterable<PropertyReference>;
export declare function extractPropertyReferencesForPattern(node: Pattern, context: Rule.RuleContext): Iterable<PropertyReference>;
