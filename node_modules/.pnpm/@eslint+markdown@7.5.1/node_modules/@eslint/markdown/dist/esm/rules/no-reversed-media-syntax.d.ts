declare const _default: {
    meta: {
        type: "problem";
        docs: {
            recommended: boolean;
            description: string;
            url: string;
        };
        fixable: "code";
        messages: {
            reversedSyntax: string;
        };
    };
    create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../types.js").MarkdownLanguageOptions;
        Code: import("../index.js").MarkdownSourceCode;
        RuleOptions: [];
        Node: import("mdast").Node;
        MessageIds: "reversedSyntax";
    }>): {
        ":matches(heading, paragraph, tableCell) :matches(html, image, imageReference, inlineCode, linkReference)"(node: Html | Image | ImageReference | InlineCode | LinkReference): void;
        ":matches(heading, paragraph, tableCell):exit"(node: Heading | Paragraph | TableCell): void;
    };
};
export default _default;
export type NoReversedMediaSyntaxMessageIds = "reversedSyntax";
export type NoReversedMediaSyntaxOptions = [];
export type NoReversedMediaSyntaxRuleDefinition = MarkdownRuleDefinition<{
    RuleOptions: NoReversedMediaSyntaxOptions;
    MessageIds: NoReversedMediaSyntaxMessageIds;
}>;
import type { Html } from "mdast";
import type { Image } from "mdast";
import type { ImageReference } from "mdast";
import type { InlineCode } from "mdast";
import type { LinkReference } from "mdast";
import type { Heading } from "mdast";
import type { Paragraph } from "mdast";
import type { TableCell } from "mdast";
import type { MarkdownRuleDefinition } from "../types.js";
