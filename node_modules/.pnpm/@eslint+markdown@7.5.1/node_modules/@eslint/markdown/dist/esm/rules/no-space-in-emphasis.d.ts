declare const _default: {
    meta: {
        type: "problem";
        docs: {
            recommended: boolean;
            description: string;
            url: string;
        };
        fixable: "whitespace";
        messages: {
            spaceInEmphasis: string;
        };
        schema: {
            type: "object";
            properties: {
                checkStrikethrough: {
                    type: "boolean";
                };
            };
            additionalProperties: false;
        }[];
        defaultOptions: [{
            checkStrikethrough: false;
        }];
    };
    create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../types.js").MarkdownLanguageOptions;
        Code: import("../index.js").MarkdownSourceCode;
        RuleOptions: NoSpaceInEmphasisOptions;
        Node: import("mdast").Node;
        MessageIds: "spaceInEmphasis";
    }>): {
        "heading, paragraph, tableCell"(node: Heading | Paragraph | TableCell): void;
        ":matches(heading, paragraph, tableCell) > text"(node: Text): void;
        ":matches(heading, paragraph, tableCell):exit"(node: Heading | Paragraph | TableCell): void;
    };
};
export default _default;
export type NoSpaceInEmphasisMessageIds = "spaceInEmphasis";
export type NoSpaceInEmphasisOptions = [{
    checkStrikethrough?: boolean;
}];
export type NoSpaceInEmphasisRuleDefinition = MarkdownRuleDefinition<{
    RuleOptions: NoSpaceInEmphasisOptions;
    MessageIds: NoSpaceInEmphasisMessageIds;
}>;
import type { Heading } from "mdast";
import type { Paragraph } from "mdast";
import type { TableCell } from "mdast";
import type { Text } from "mdast";
import type { MarkdownRuleDefinition } from "../types.js";
