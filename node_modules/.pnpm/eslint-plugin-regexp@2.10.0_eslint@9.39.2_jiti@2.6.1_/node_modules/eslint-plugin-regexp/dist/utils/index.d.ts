import type { Alternative, CapturingGroup, CharacterClassElement, Element, Node, Pattern, Quantifier, StringAlternative } from "@eslint-community/regexpp/ast";
import type { RegExpVisitor } from "@eslint-community/regexpp/visitor";
import type { Rule, AST } from "eslint";
import type * as ESTree from "estree";
import type { ReadonlyFlags } from "regexp-ast-analysis";
import type { RuleListener, RuleModule, PartialRuleModule } from "../types";
import type { PatternRange } from "./ast-utils/pattern-source";
import { PatternSource } from "./ast-utils/pattern-source";
import type { CapturingGroupReference } from "./extract-capturing-group-references";
import type { UsageOfPattern } from "./get-usage-of-pattern";
import type { Quant } from "./regexp-ast";
export * from "./unicode";
type RegExpContextBase = {
    getRegexpLocation: (regexpNode: PatternRange, offsets?: [number, number]) => AST.SourceLocation;
    getFlagsLocation: () => AST.SourceLocation;
    getFlagLocation: (flag: string) => AST.SourceLocation;
    fixReplaceNode: (regexpNode: Node, replacement: string | (() => string | null)) => (fixer: Rule.RuleFixer) => Rule.Fix | null;
    fixReplaceQuant: (quantifier: Quantifier, replacement: string | Quant | (() => string | Quant | null)) => (fixer: Rule.RuleFixer) => Rule.Fix | null;
    fixReplaceFlags: (newFlags: string | (() => string | null), includePattern?: boolean) => (fixer: Rule.RuleFixer) => Rule.Fix[] | Rule.Fix | null;
    getUsageOfPattern: () => UsageOfPattern;
    getCapturingGroupReferences: (options?: {
        strictTypes?: boolean;
    }) => CapturingGroupReference[];
    getAllCapturingGroups: () => CapturingGroup[];
    pattern: string;
    patternAst: Pattern;
    patternSource: PatternSource;
    flags: Required<ReadonlyFlags>;
};
export type RegExpContextForLiteral = {
    node: ESTree.RegExpLiteral;
    flagsString: string;
    ownsFlags: true;
    regexpNode: ESTree.RegExpLiteral;
} & RegExpContextBase;
export type RegExpContextForSource = {
    node: ESTree.Expression;
    flagsString: string | null;
    ownsFlags: boolean;
    regexpNode: ESTree.CallExpression;
} & RegExpContextBase;
export type RegExpContext = RegExpContextForLiteral | RegExpContextForSource;
type UnparsableRegExpContextBase = {
    node: ESTree.Expression;
    regexpNode: ESTree.RegExpLiteral | ESTree.CallExpression;
    flags: Required<ReadonlyFlags>;
    flagsString: string | null;
    ownsFlags: boolean;
    getFlagsLocation: () => AST.SourceLocation;
    getFlagLocation: (flag: string) => AST.SourceLocation;
    fixReplaceFlags: (newFlags: string | (() => string | null), includePattern?: boolean) => (fixer: Rule.RuleFixer) => Rule.Fix[] | Rule.Fix | null;
};
export type RegExpContextForInvalid = {
    pattern: string;
    patternSource: PatternSource;
    error: SyntaxError;
} & UnparsableRegExpContextBase;
export type RegExpContextForUnknown = {
    pattern: null;
    patternSource: null;
} & UnparsableRegExpContextBase;
export type UnparsableRegExpContext = RegExpContextForInvalid | RegExpContextForUnknown;
type ParsableRegexpRule = {
    createLiteralVisitor?: (context: RegExpContextForLiteral) => RegExpVisitor.Handlers;
    createSourceVisitor?: (context: RegExpContextForSource) => RegExpVisitor.Handlers;
};
type UnparsableRegexpRule = {
    visitInvalid?: (context: RegExpContextForInvalid) => void;
    visitUnknown?: (context: RegExpContextForUnknown) => void;
};
export declare function createRule(ruleName: string, rule: PartialRuleModule): RuleModule;
type DefineRegexpVisitorRule = UnparsableRegexpRule & (ParsableRegexpRule | {
    createVisitor: (context: RegExpContext) => RegExpVisitor.Handlers;
});
export declare function defineRegexpVisitor(context: Rule.RuleContext, rule: DefineRegexpVisitorRule): RuleListener;
export declare function compositingVisitors(visitor: RuleListener, ...visitors: RuleListener[]): RuleListener;
export declare function mightCreateNewElement(before: string, after: string): boolean;
export declare function fixRemoveCharacterClassElement(context: RegExpContext, element: CharacterClassElement): (fixer: Rule.RuleFixer) => Rule.Fix | null;
export declare function fixRemoveAlternative(context: RegExpContext, alternative: Alternative): (fixer: Rule.RuleFixer) => Rule.Fix | null;
export declare function fixRemoveStringAlternative(context: RegExpContext, alternative: StringAlternative): (fixer: Rule.RuleFixer) => Rule.Fix | null;
export declare function canUnwrapped(node: Element, text: string): boolean;
