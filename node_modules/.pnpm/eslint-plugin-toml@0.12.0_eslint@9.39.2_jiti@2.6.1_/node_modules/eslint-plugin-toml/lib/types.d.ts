import type { JSONSchema4 } from "json-schema";
import type { Rule } from "eslint";
import type { AST } from "toml-eslint-parser";
export interface RuleListener {
    TOMLTopLevelTable?: (node: AST.TOMLTopLevelTable) => void;
    "TOMLTopLevelTable:exit"?: (node: AST.TOMLTopLevelTable) => void;
    TOMLTable?: (node: AST.TOMLTable) => void;
    "TOMLTable:exit"?: (node: AST.TOMLTable) => void;
    TOMLKeyValue?: (node: AST.TOMLKeyValue) => void;
    "TOMLKeyValue:exit"?: (node: AST.TOMLKeyValue) => void;
    TOMLKey?: (node: AST.TOMLKey) => void;
    "TOMLKey:exit"?: (node: AST.TOMLKey) => void;
    TOMLBare?: (node: AST.TOMLBare) => void;
    "TOMLBare:exit"?: (node: AST.TOMLBare) => void;
    TOMLQuoted?: (node: AST.TOMLQuoted) => void;
    "TOMLQuoted:exit"?: (node: AST.TOMLQuoted) => void;
    TOMLValue?: (node: AST.TOMLValue) => void;
    "TOMLValue:exit"?: (node: AST.TOMLValue) => void;
    TOMLArray?: (node: AST.TOMLArray) => void;
    "TOMLArray:exit"?: (node: AST.TOMLArray) => void;
    TOMLInlineTable?: (node: AST.TOMLInlineTable) => void;
    "TOMLInlineTable:exit"?: (node: AST.TOMLInlineTable) => void;
    Program?: (node: AST.TOMLProgram) => void;
    "Program:exit"?: (node: AST.TOMLProgram) => void;
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
        default?: "error" | "warn";
        extensionRule: string | false;
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
export interface RuleContext {
    id: string;
    options: any[];
    parserPath: string;
    parserServices?: {
        isTOML?: true;
        parseError?: any;
    };
    getAncestors(): AST.TOMLNode[];
    getFilename(): string;
    getSourceCode(): SourceCode;
    report(descriptor: ReportDescriptor): void;
}
export declare namespace SourceCode {
    function splitLines(text: string): string[];
}
export type TOMLToken = AST.Token | AST.Comment;
export type TOMLNodeOrToken = AST.TOMLNode | TOMLToken;
export interface SourceCode {
    text: string;
    ast: AST.TOMLProgram;
    lines: string[];
    hasBOM: boolean;
    parserServices?: {
        isTOML?: true;
        parseError?: any;
    };
    visitorKeys: {
        [nodeType: string]: string[];
    };
    getText(node?: TOMLNodeOrToken, beforeCount?: number, afterCount?: number): string;
    getLines(): string[];
    getAllComments(): AST.Comment[];
    getComments(node: TOMLNodeOrToken): {
        leading: AST.Comment[];
        trailing: AST.Comment[];
    };
    getNodeByRangeIndex(index: number): AST.TOMLNode | null;
    isSpaceBetweenTokens(first: TOMLToken, second: TOMLToken): boolean;
    getLocFromIndex(index: number): AST.Position;
    getIndexFromLoc(loc: AST.Position): number;
    getTokenByRangeStart(offset: number, options?: {
        includeComments?: boolean;
    }): TOMLToken | null;
    getFirstToken(node: AST.TOMLNode | AST.Token): AST.Token;
    getFirstToken(node: AST.TOMLNode, options?: CursorWithSkipOptions): TOMLToken | null;
    getFirstTokens(node: AST.TOMLNode, options?: CursorWithCountOptions): TOMLToken[];
    getLastToken(node: AST.TOMLNode): AST.Token;
    getLastToken(node: AST.TOMLNode, options?: CursorWithSkipOptions): TOMLToken | null;
    getLastTokens(node: AST.TOMLNode, options?: CursorWithCountOptions): TOMLToken[];
    getTokenBefore(node: TOMLNodeOrToken): AST.Token | null;
    getTokenBefore(node: TOMLNodeOrToken, options?: CursorWithSkipOptions): TOMLToken | null;
    getTokensBefore(node: TOMLNodeOrToken, options?: CursorWithCountOptions): TOMLToken[];
    getTokenAfter(node: TOMLNodeOrToken): AST.Token | null;
    getTokenAfter(node: TOMLNodeOrToken, options?: CursorWithSkipOptions): TOMLToken | null;
    getTokensAfter(node: TOMLNodeOrToken, options?: CursorWithCountOptions): TOMLToken[];
    getFirstTokenBetween(left: TOMLNodeOrToken, right: TOMLNodeOrToken, options?: CursorWithSkipOptions): TOMLToken | null;
    getFirstTokensBetween(left: TOMLNodeOrToken, right: TOMLNodeOrToken, options?: CursorWithCountOptions): TOMLToken[];
    getLastTokenBetween(left: TOMLNodeOrToken, right: TOMLNodeOrToken, options?: CursorWithSkipOptions): TOMLToken | null;
    getLastTokensBetween(left: TOMLNodeOrToken, right: TOMLNodeOrToken, options?: CursorWithCountOptions): TOMLToken[];
    getTokensBetween(left: TOMLNodeOrToken, right: TOMLNodeOrToken, padding?: number | FilterPredicate | CursorWithCountOptions): TOMLToken[];
    getTokens(node: AST.TOMLNode, beforeCount?: number, afterCount?: number): TOMLToken[];
    getTokens(node: AST.TOMLNode, options: FilterPredicate | CursorWithCountOptions): TOMLToken[];
    commentsExistBetween(left: TOMLNodeOrToken, right: TOMLNodeOrToken): boolean;
    getCommentsBefore(nodeOrToken: TOMLNodeOrToken): AST.Comment[];
    getCommentsAfter(nodeOrToken: TOMLNodeOrToken): AST.Comment[];
    getCommentsInside(node: AST.TOMLNode): AST.Comment[];
}
type FilterPredicate = (tokenOrComment: TOMLToken) => boolean;
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
    node: TOMLNodeOrToken;
} | {
    loc: SourceLocation | {
        line: number;
        column: number;
    };
};
export interface RuleFixer {
    insertTextAfter(nodeOrToken: TOMLNodeOrToken, text: string): Fix;
    insertTextAfterRange(range: AST.Range, text: string): Fix;
    insertTextBefore(nodeOrToken: TOMLNodeOrToken, text: string): Fix;
    insertTextBeforeRange(range: AST.Range, text: string): Fix;
    remove(nodeOrToken: TOMLNodeOrToken): Fix;
    removeRange(range: AST.Range): Fix;
    replaceText(nodeOrToken: TOMLNodeOrToken, text: string): Fix;
    replaceTextRange(range: Readonly<AST.Range>, text: string): Fix;
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
