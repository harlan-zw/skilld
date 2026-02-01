declare const _default: {
    meta: {
        type: "problem";
        docs: {
            recommended: boolean;
            description: string;
            url: string;
        };
        messages: {
            skippedHeading: string;
        };
        schema: {
            type: "object";
            properties: {
                frontmatterTitle: {
                    type: "string";
                };
            };
            additionalProperties: false;
        }[];
        defaultOptions: [{
            frontmatterTitle: string;
        }];
    };
    create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../types.js").MarkdownLanguageOptions;
        Code: import("../index.js").MarkdownSourceCode;
        RuleOptions: HeadingIncrementOptions;
        Node: import("mdast").Node;
        MessageIds: "skippedHeading";
    }>): {
        yaml(node: import("mdast").Yaml): void;
        toml(node: import("../types.js").Toml): void;
        json(node: import("../types.js").Json): void;
        heading(node: import("mdast").Heading): void;
    };
};
export default _default;
export type HeadingIncrementMessageIds = "skippedHeading";
export type HeadingIncrementOptions = [{
    frontmatterTitle?: string;
}];
export type HeadingIncrementRuleDefinition = MarkdownRuleDefinition<{
    RuleOptions: HeadingIncrementOptions;
    MessageIds: HeadingIncrementMessageIds;
}>;
import type { MarkdownRuleDefinition } from "../types.js";
