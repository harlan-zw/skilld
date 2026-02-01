export namespace processor {
    export namespace meta {
        let name: string;
        let version: string;
    }
    export { preprocess };
    export { postprocess };
    export { SUPPORTS_AUTOFIX as supportsAutofix };
}
export type Message = Linter.LintMessage;
export type Fix = Rule.Fix;
export type Range = AST.Range;
/**
 * Extracts lintable code blocks from Markdown text.
 * @param {string} sourceText The text of the file.
 * @param {string} filename The filename of the file.
 * @returns {Array<{ filename: string, text: string }>} Source code blocks to lint.
 */
declare function preprocess(sourceText: string, filename: string): Array<{
    filename: string;
    text: string;
}>;
/**
 * Transforms generated messages for output.
 * @param {Array<Message[]>} messages An array containing one array of messages
 *     for each code block returned from `preprocess`.
 * @param {string} filename The filename of the file
 * @returns {Message[]} A flattened array of messages with mapped locations.
 */
declare function postprocess(messages: Array<Message[]>, filename: string): Message[];
declare const SUPPORTS_AUTOFIX: true;
import type { Linter } from "eslint";
import type { Rule } from "eslint";
import type { AST } from "eslint";
export {};
