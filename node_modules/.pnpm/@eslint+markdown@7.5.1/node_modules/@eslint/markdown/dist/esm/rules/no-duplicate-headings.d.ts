declare const _default: {
    meta: {
        type: "problem";
        docs: {
            description: string;
            url: string;
        };
        messages: {
            duplicateHeading: string;
        };
        schema: {
            type: "object";
            properties: {
                checkSiblingsOnly: {
                    type: "boolean";
                };
            };
            additionalProperties: false;
        }[];
        defaultOptions: [{
            checkSiblingsOnly: false;
        }];
    };
    create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../types.js").MarkdownLanguageOptions;
        Code: import("../index.js").MarkdownSourceCode;
        RuleOptions: NoDuplicateHeadingsOptions;
        Node: import("mdast").Node;
        MessageIds: "duplicateHeading";
    }>): {
        heading(node: import("mdast").Heading): void;
        "heading *"({ type, value }: any): void;
        "heading:exit"(node: import("mdast").Heading): void;
    };
};
export default _default;
export type NoDuplicateHeadingsMessageIds = "duplicateHeading";
export type NoDuplicateHeadingsOptions = [{
    checkSiblingsOnly?: boolean;
}];
export type NoDuplicateHeadingsRuleDefinition = MarkdownRuleDefinition<{
    RuleOptions: NoDuplicateHeadingsOptions;
    MessageIds: NoDuplicateHeadingsMessageIds;
}>;
import type { MarkdownRuleDefinition } from "../types.js";
