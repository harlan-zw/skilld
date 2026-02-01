/**
 * Markdown Source Code Object
 * @extends {TextSourceCodeBase<{LangOptions: MarkdownLanguageOptions, RootNode: Root, SyntaxElementWithLoc: Node, ConfigNode: { value: string; position: Position }}>}
 */
export class MarkdownSourceCode extends TextSourceCodeBase<{
    LangOptions: MarkdownLanguageOptions;
    RootNode: Root;
    SyntaxElementWithLoc: Node;
    ConfigNode: {
        value: string;
        position: Position;
    };
}> {
    /**
     * Creates a new instance.
     * @param {Object} options The options for the instance.
     * @param {string} options.text The source code text.
     * @param {Root} options.ast The root AST node.
     */
    constructor({ text, ast }: {
        text: string;
        ast: Root;
    });
    /**
     * Returns an array of all inline configuration nodes found in the
     * source code.
     * @returns {Array<InlineConfigComment>} An array of all inline configuration nodes.
     */
    getInlineConfigNodes(): Array<InlineConfigComment>;
    /**
     * Returns an all directive nodes that enable or disable rules along with any problems
     * encountered while parsing the directives.
     * @returns {{problems:Array<FileProblem>,directives:Array<Directive>}} Information
     *      that ESLint needs to further process the directives.
     */
    getDisableDirectives(): {
        problems: Array<FileProblem>;
        directives: Array<Directive>;
    };
    /**
     * Returns inline rule configurations along with any problems
     * encountered while parsing the configurations.
     * @returns {{problems:Array<FileProblem>,configs:Array<{config:{rules:RulesConfig},loc:Position}>}} Information
     *      that ESLint needs to further process the rule configurations.
     */
    applyInlineConfig(): {
        problems: Array<FileProblem>;
        configs: Array<{
            config: {
                rules: RulesConfig;
            };
            loc: Position;
        }>;
    };
    #private;
}
import type { MarkdownLanguageOptions } from "../types.js";
import type { Root } from "mdast";
import type { Node } from "mdast";
import type { Position } from "unist";
import { TextSourceCodeBase } from "@eslint/plugin-kit";
/**
 * Represents an inline config comment in the source code.
 */
declare class InlineConfigComment {
    /**
     * Creates a new instance.
     * @param {Object} options The options for the instance.
     * @param {string} options.value The comment text.
     * @param {Position} options.position The position of the comment in the source code.
     */
    constructor({ value, position }: {
        value: string;
        position: Position;
    });
    /**
     * The comment text.
     * @type {string}
     */
    value: string;
    /**
     * The position of the comment in the source code.
     * @type {Position}
     */
    position: Position;
}
import type { FileProblem } from "@eslint/core";
import { Directive } from "@eslint/plugin-kit";
import type { RulesConfig } from "@eslint/core";
export {};
