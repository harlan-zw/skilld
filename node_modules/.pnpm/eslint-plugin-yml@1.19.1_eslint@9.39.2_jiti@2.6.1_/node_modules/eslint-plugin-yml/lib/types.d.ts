import type { JSONSchema4 } from "json-schema";
import type { Rule } from "eslint";
import type { AST } from "yaml-eslint-parser";
export interface RuleListener {
    YAMLDocument?: (node: AST.YAMLDocument) => void;
    "YAMLDocument:exit"?: (node: AST.YAMLDocument) => void;
    YAMLDirective?: (node: AST.YAMLDirective) => void;
    "YAMLDirective:exit"?: (node: AST.YAMLDirective) => void;
    YAMLAnchor?: (node: AST.YAMLAnchor) => void;
    "YAMLAnchor:exit"?: (node: AST.YAMLAnchor) => void;
    YAMLTag?: (node: AST.YAMLTag) => void;
    "YAMLTag:exit"?: (node: AST.YAMLTag) => void;
    YAMLMapping?: (node: AST.YAMLMapping) => void;
    "YAMLMapping:exit"?: (node: AST.YAMLMapping) => void;
    YAMLPair?: (node: AST.YAMLPair) => void;
    "YAMLPair:exit"?: (node: AST.YAMLPair) => void;
    YAMLSequence?: (node: AST.YAMLSequence) => void;
    "YAMLSequence:exit"?: (node: AST.YAMLSequence) => void;
    YAMLScalar?: (node: AST.YAMLScalar) => void;
    "YAMLScalar:exit"?: (node: AST.YAMLScalar) => void;
    YAMLAlias?: (node: AST.YAMLAlias) => void;
    "YAMLAlias:exit"?: (node: AST.YAMLAlias) => void;
    YAMLWithMeta?: (node: AST.YAMLWithMeta) => void;
    "YAMLWithMeta:exit"?: (node: AST.YAMLWithMeta) => void;
    Program?: (node: AST.YAMLProgram) => void;
    "Program:exit"?: (node: AST.YAMLProgram) => void;
    [key: string]: ((node: never) => void) | undefined;
}
export interface RuleModule {
    meta: RuleMetaData;
    create(context: Rule.RuleContext): RuleListener;
}
export interface RuleMetaData {
    docs: {
        description: string;
        categories: ("recommended" | "standard")[] | null;
        url: string;
        ruleId: string;
        ruleName: string;
        default?: "error" | "warn";
        extensionRule: string | false;
        layout: boolean;
    };
    messages: {
        [messageId: string]: string;
    };
    fixable?: "code" | "whitespace";
    hasSuggestions?: boolean;
    schema: JSONSchema4 | JSONSchema4[];
    deprecated?: boolean;
    replacedBy?: string[];
    type: "problem" | "suggestion" | "layout";
}
export interface PartialRuleModule {
    meta: PartialRuleMetaData;
    create(context: RuleContext, params: {
        customBlock: boolean;
    }): RuleListener;
}
export interface PartialRuleMetaData {
    docs: {
        description: string;
        categories: ("recommended" | "standard")[] | null;
        replacedBy?: [];
        default?: "error" | "warn";
        extensionRule: string | false;
        layout: boolean;
    };
    messages: {
        [messageId: string]: string;
    };
    fixable?: "code" | "whitespace";
    hasSuggestions?: boolean;
    schema: JSONSchema4 | JSONSchema4[];
    deprecated?: boolean;
    type: "problem" | "suggestion" | "layout";
}
export type YMLSettings = {
    indent?: number;
};
export interface RuleContext {
    id: string;
    options: any[];
    settings: {
        yml?: YMLSettings;
        [name: string]: any;
    };
    parserPath: string;
    parserServices: {
        isYAML?: true;
        parseError?: any;
    };
    getAncestors(): AST.YAMLNode[];
    getFilename(): string;
    getSourceCode(): SourceCode;
    report(descriptor: ReportDescriptor): void;
}
export declare namespace SourceCode {
    function splitLines(text: string): string[];
}
export type YAMLToken = AST.Token | AST.Comment;
export type YAMLNodeOrToken = AST.YAMLNode | YAMLToken;
export interface SourceCode {
    text: string;
    ast: AST.YAMLProgram;
    lines: string[];
    hasBOM: boolean;
    parserServices?: {
        isYAML?: true;
        parseError?: any;
    };
    visitorKeys: {
        [nodeType: string]: string[];
    };
    getText(node?: YAMLNodeOrToken, beforeCount?: number, afterCount?: number): string;
    getLines(): string[];
    getAllComments(): AST.Comment[];
    getComments(node: YAMLNodeOrToken): {
        leading: AST.Comment[];
        trailing: AST.Comment[];
    };
    getNodeByRangeIndex(index: number): AST.YAMLNode | null;
    isSpaceBetweenTokens(first: YAMLToken, second: YAMLToken): boolean;
    getLocFromIndex(index: number): AST.Position;
    getIndexFromLoc(loc: AST.Position): number;
    getTokenByRangeStart(offset: number, options?: {
        includeComments?: boolean;
    }): YAMLToken | null;
    getFirstToken(node: AST.YAMLNode): AST.Token;
    getFirstToken(node: AST.YAMLNode, options?: CursorWithSkipOptions): YAMLToken | null;
    getFirstTokens(node: AST.YAMLNode, options?: CursorWithCountOptions): YAMLToken[];
    getLastToken(node: AST.YAMLNode): AST.Token;
    getLastToken(node: AST.YAMLNode, options?: CursorWithSkipOptions): YAMLToken | null;
    getLastTokens(node: AST.YAMLNode, options?: CursorWithCountOptions): YAMLToken[];
    getTokenBefore(node: YAMLNodeOrToken): AST.Token | null;
    getTokenBefore(node: YAMLNodeOrToken, options?: CursorWithSkipOptions): YAMLToken | null;
    getTokensBefore(node: YAMLNodeOrToken, options?: CursorWithCountOptions): YAMLToken[];
    getTokenAfter(node: YAMLNodeOrToken): AST.Token | null;
    getTokenAfter(node: YAMLNodeOrToken, options?: CursorWithSkipOptions): YAMLToken | null;
    getTokensAfter(node: YAMLNodeOrToken, options?: CursorWithCountOptions): YAMLToken[];
    getFirstTokenBetween(left: YAMLNodeOrToken, right: YAMLNodeOrToken, options?: CursorWithSkipOptions): YAMLToken | null;
    getFirstTokensBetween(left: YAMLNodeOrToken, right: YAMLNodeOrToken, options?: CursorWithCountOptions): YAMLToken[];
    getLastTokenBetween(left: YAMLNodeOrToken, right: YAMLNodeOrToken, options?: CursorWithSkipOptions): YAMLToken | null;
    getLastTokensBetween(left: YAMLNodeOrToken, right: YAMLNodeOrToken, options?: CursorWithCountOptions): YAMLToken[];
    getTokensBetween(left: YAMLNodeOrToken, right: YAMLNodeOrToken, padding?: number | FilterPredicate | CursorWithCountOptions): YAMLToken[];
    getTokens(node: AST.YAMLNode, beforeCount?: number, afterCount?: number): YAMLToken[];
    getTokens(node: AST.YAMLNode, options: FilterPredicate | CursorWithCountOptions): YAMLToken[];
    commentsExistBetween(left: YAMLNodeOrToken, right: YAMLNodeOrToken): boolean;
    getCommentsBefore(nodeOrToken: YAMLNodeOrToken): AST.Comment[];
    getCommentsAfter(nodeOrToken: YAMLNodeOrToken): AST.Comment[];
    getCommentsInside(node: AST.YAMLNode): AST.Comment[];
}
type FilterPredicate = (tokenOrComment: YAMLToken) => boolean;
type CursorWithSkipOptions = number | FilterPredicate | {
    includeComments?: boolean;
    filter?: FilterPredicate;
    skip?: number;
};
type CursorWithCountOptions = number | FilterPredicate | {
    includeComments?: boolean;
    filter?: FilterPredicate;
    count?: number;
};
interface ReportDescriptorOptionsBase {
    data?: {
        [key: string]: string;
    };
    fix?: null | ((fixer: RuleFixer) => null | Fix | IterableIterator<Fix> | Fix[]);
}
type SuggestionDescriptorMessage = {
    desc: string;
} | {
    messageId: string;
};
type SuggestionReportDescriptor = SuggestionDescriptorMessage & ReportDescriptorOptionsBase;
interface ReportDescriptorOptions extends ReportDescriptorOptionsBase {
    suggest?: SuggestionReportDescriptor[] | null;
}
type ReportDescriptor = ReportDescriptorMessage & ReportDescriptorLocation & ReportDescriptorOptions;
type ReportDescriptorMessage = {
    message: string;
} | {
    messageId: string;
};
type ReportDescriptorLocation = {
    node: YAMLNodeOrToken;
} | {
    loc: SourceLocation | {
        line: number;
        column: number;
    };
};
export interface RuleFixer {
    insertTextAfter(nodeOrToken: YAMLNodeOrToken, text: string): Fix;
    insertTextAfterRange(range: AST.Range, text: string): Fix;
    insertTextBefore(nodeOrToken: YAMLNodeOrToken, text: string): Fix;
    insertTextBeforeRange(range: AST.Range, text: string): Fix;
    remove(nodeOrToken: YAMLNodeOrToken): Fix;
    removeRange(range: AST.Range): Fix;
    replaceText(nodeOrToken: YAMLNodeOrToken, text: string): Fix;
    replaceTextRange(range: AST.Range, text: string): Fix;
}
export interface Fix {
    range: AST.Range;
    text: string;
}
interface SourceLocation {
    start: AST.Position;
    end: AST.Position;
}
export {};
