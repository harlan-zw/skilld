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
            missingSpace: string;
        };
        schema: {
            type: "object";
            properties: {
                checkClosedHeadings: {
                    type: "boolean";
                };
            };
            additionalProperties: false;
        }[];
        defaultOptions: [{
            checkClosedHeadings: false;
        }];
    };
    create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../types.js").MarkdownLanguageOptions;
        Code: import("../index.js").MarkdownSourceCode;
        RuleOptions: NoMissingAtxHeadingSpaceOptions;
        Node: import("mdast").Node;
        MessageIds: "missingSpace";
    }>): {
        heading(node: import("mdast").Heading): void;
        paragraph(node: import("mdast").Paragraph): void;
    };
};
export default _default;
export type NoMissingAtxHeadingSpaceMessageIds = "missingSpace";
export type NoMissingAtxHeadingSpaceOptions = [{
    checkClosedHeadings?: boolean;
}];
export type NoMissingAtxHeadingSpaceRuleDefinition = MarkdownRuleDefinition<{
    RuleOptions: NoMissingAtxHeadingSpaceOptions;
    MessageIds: NoMissingAtxHeadingSpaceMessageIds;
}>;
import type { MarkdownRuleDefinition } from "../types.js";
