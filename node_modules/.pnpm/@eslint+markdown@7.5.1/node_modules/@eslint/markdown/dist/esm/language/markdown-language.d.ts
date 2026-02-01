/**
 * Markdown Language Object
 * @implements {Language}
 */
export class MarkdownLanguage implements Language {
    /**
     * Creates a new instance.
     * @param {Object} options The options to use for this instance.
     * @param {ParserMode} [options.mode] The Markdown parser mode to use.
     */
    constructor({ mode }?: {
        mode?: ParserMode;
    });
    /**
     * The type of file to read.
     * @type {"text"}
     */
    fileType: "text";
    /**
     * The line number at which the parser starts counting.
     * @type {0|1}
     */
    lineStart: 0 | 1;
    /**
     * The column number at which the parser starts counting.
     * @type {0|1}
     */
    columnStart: 0 | 1;
    /**
     * The name of the key that holds the type of the node.
     * @type {string}
     */
    nodeTypeKey: string;
    /**
     * Default language options. User-defined options are merged with this object.
     * @type {MarkdownLanguageOptions}
     */
    defaultLanguageOptions: MarkdownLanguageOptions;
    /**
     * Validates the language options.
     * @param {MarkdownLanguageOptions} languageOptions The language options to validate.
     * @returns {void}
     * @throws {Error} When the language options are invalid.
     */
    validateLanguageOptions(languageOptions: MarkdownLanguageOptions): void;
    /**
     * Parses the given file into an AST.
     * @param {File} file The virtual file to parse.
     * @param {MarkdownLanguageContext} context The options to use for parsing.
     * @returns {ParseResult<Root>} The result of parsing.
     */
    parse(file: File, context: MarkdownLanguageContext): ParseResult<Root>;
    /**
     * Creates a new `MarkdownSourceCode` object from the given information.
     * @param {File} file The virtual file to create a `MarkdownSourceCode` object from.
     * @param {OkParseResult<Root>} parseResult The result returned from `parse()`.
     * @returns {MarkdownSourceCode} The new `MarkdownSourceCode` object.
     */
    createSourceCode(file: File, parseResult: OkParseResult<Root>): MarkdownSourceCode;
    #private;
}
export type Extensions = Options["extensions"];
export type MdastExtensions = Options["mdastExtensions"];
export type ParserMode = "commonmark" | "gfm";
import type { Language } from "@eslint/core";
import type { MarkdownLanguageOptions } from "../types.js";
import type { File } from "@eslint/core";
import type { MarkdownLanguageContext } from "../types.js";
import type { Root } from "mdast";
import type { ParseResult } from "@eslint/core";
import type { OkParseResult } from "@eslint/core";
import { MarkdownSourceCode } from "./markdown-source-code.js";
import type { Options } from "mdast-util-from-markdown";
