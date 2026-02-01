import type { Rule, AST, SourceCode } from "eslint";
import type { Expression, Literal, RegExpLiteral } from "estree";
export interface PatternRange {
    readonly start: number;
    readonly end: number;
}
export declare class PatternReplaceRange {
    range: AST.Range;
    type: "RegExp" | "SingleQuotedString" | "DoubleQuotedString";
    constructor(range: AST.Range, type: PatternReplaceRange["type"]);
    static fromLiteral(node: Literal, sourceCode: SourceCode, nodeRange: PatternRange, range: PatternRange): PatternReplaceRange | null;
    getAstLocation(sourceCode: SourceCode): AST.SourceLocation;
    escape(text: string): string;
    replace(fixer: Rule.RuleFixer, text: string): Rule.Fix;
    remove(fixer: Rule.RuleFixer): Rule.Fix;
    insertAfter(fixer: Rule.RuleFixer, text: string): Rule.Fix;
    insertBefore(fixer: Rule.RuleFixer, text: string): Rule.Fix;
}
export interface RegExpValue {
    readonly source: string;
    readonly flags: string;
    readonly ownedNode: RegExpLiteral | null;
}
export declare class PatternSource {
    private readonly sourceCode;
    readonly node: Expression;
    readonly value: string;
    private readonly segments;
    readonly regexpValue: RegExpValue | null;
    isStringValue(): this is PatternSource & {
        readonly regexpValue: null;
    };
    private constructor();
    static fromExpression(context: Rule.RuleContext, expression: Expression): PatternSource | null;
    private static fromRegExpObject;
    static fromRegExpLiteral(context: Rule.RuleContext, expression: RegExpLiteral): PatternSource;
    private getSegment;
    private getSegments;
    getReplaceRange(range: PatternRange): PatternReplaceRange | null;
    getAstRange(range: PatternRange): AST.Range;
    getAstLocation(range: PatternRange): AST.SourceLocation;
    getOwnedRegExpLiterals(): readonly RegExpLiteral[];
}
