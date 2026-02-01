import type { Rule } from "eslint";
import type * as ES from "estree";
import type { RootResult } from "jsdoc-type-pratt-parser";
import * as commentParser from "comment-parser";
import type { Spec } from "comment-parser";
type ParsedComment = ReturnType<typeof commentParser.parse>[number];
export declare class JSDocParams {
    private readonly params;
    isEmpty(): boolean;
    add(paths: string[], param: Spec): void;
    get(paths: {
        name: string | null;
        index: number | null;
    }[]): Spec | null;
}
export declare class JSDocParam extends JSDocParams {
    readonly name: string | null;
    readonly param: Spec;
    constructor(name: string | null, param: Spec);
}
declare const TAGS: {
    param: string[];
    returns: string[];
    type: string[];
};
export declare class JSDoc {
    private readonly parsed;
    private params;
    constructor(parsed: ParsedComment);
    getTag(name: keyof typeof TAGS): Spec | null;
    parseParams(): JSDocParams;
    private genTags;
}
export declare function getJSDoc(node: ES.Expression | ES.VariableDeclarator | ES.FunctionDeclaration | ES.PrivateIdentifier, context: Rule.RuleContext): JSDoc | null;
export declare function parseTypeText(text: string): RootResult | null;
export {};
