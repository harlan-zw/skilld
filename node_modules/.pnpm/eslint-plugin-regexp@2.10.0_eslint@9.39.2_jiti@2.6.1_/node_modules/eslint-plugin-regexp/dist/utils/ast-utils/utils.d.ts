import type { Rule, SourceCode, AST, Scope } from "eslint";
import type { ArrowFunctionExpression, CallExpression, Expression, FunctionDeclaration, FunctionExpression, Identifier, Literal, MemberExpression, Node, RegExpLiteral } from "estree";
export declare function getParent<E extends Node>(node: Node | null): E | null;
export declare function findVariable(context: Rule.RuleContext, node: Identifier): Scope.Variable | null;
export declare function getStringIfConstant(context: Rule.RuleContext, node: Node): string | null;
type GetStaticValueResult = {
    value: unknown;
} | {
    value: undefined;
    optional?: true;
};
export declare function getStaticValue(context: Rule.RuleContext, node: Node): GetStaticValueResult | null;
export declare function getScope(context: Rule.RuleContext, currentNode: Node): Scope.Scope;
export declare function findFunction(context: Rule.RuleContext, id: Identifier): FunctionDeclaration | FunctionExpression | ArrowFunctionExpression | null;
export type KnownMethodCall = CallExpression & {
    callee: MemberExpression & {
        object: Expression;
        property: Identifier;
    };
    arguments: Expression[];
    parent: Node;
};
export declare function isKnownMethodCall(node: CallExpression, methods: Record<string, number>): node is KnownMethodCall;
interface BaseElement {
    type: string;
    range: [number, number];
}
export type ReplacementElement = CharacterElement | DollarElement | ReferenceElement;
export interface CharacterElement extends BaseElement {
    type: "CharacterElement";
    value: string;
}
export interface DollarElement extends BaseElement {
    type: "DollarElement";
    kind: "$" | "&" | "`" | "'";
}
export interface ReferenceElement extends BaseElement {
    type: "ReferenceElement";
    ref: number | string;
    refText: string;
}
export declare function parseReplacements(context: Rule.RuleContext, node: Literal): ReplacementElement[];
export declare function getStringValueRange(sourceCode: SourceCode, node: Literal & {
    value: string;
}, startOffset: number, endOffset: number): AST.Range | null;
export declare function isRegexpLiteral(node: Expression): node is RegExpLiteral;
export declare function isStringLiteral(node: Expression): node is Literal & {
    value: string;
};
export declare function getPropertyName(node: MemberExpression, context?: Rule.RuleContext): string | null;
export declare function astRangeToLocation(sourceCode: SourceCode, range: AST.Range): AST.SourceLocation;
export declare function dereferenceOwnedVariable(context: Rule.RuleContext, expression: Expression): Expression;
export declare function dereferenceVariable(context: Rule.RuleContext, expression: Expression): Expression;
export {};
