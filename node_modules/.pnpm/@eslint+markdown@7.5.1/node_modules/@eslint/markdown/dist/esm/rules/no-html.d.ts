declare const _default: {
    meta: {
        type: "problem";
        docs: {
            description: string;
            url: string;
        };
        messages: {
            disallowedElement: string;
        };
        schema: {
            type: "object";
            properties: {
                allowed: {
                    type: "array";
                    items: {
                        type: "string";
                    };
                    uniqueItems: true;
                };
                allowedIgnoreCase: {
                    type: "boolean";
                };
            };
            additionalProperties: false;
        }[];
        defaultOptions: [{
            allowed: any[];
            allowedIgnoreCase: false;
        }];
    };
    create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../types.js").MarkdownLanguageOptions;
        Code: import("../index.js").MarkdownSourceCode;
        RuleOptions: NoHtmlOptions;
        Node: import("mdast").Node;
        MessageIds: "disallowedElement";
    }>): {
        html(node: import("mdast").Html): void;
    };
};
export default _default;
export type NoHtmlMessageIds = "disallowedElement";
export type NoHtmlOptions = [{
    allowed?: string[];
    allowedIgnoreCase?: boolean;
}];
export type NoHtmlRuleDefinition = MarkdownRuleDefinition<{
    RuleOptions: NoHtmlOptions;
    MessageIds: NoHtmlMessageIds;
}>;
import type { MarkdownRuleDefinition } from "../types.js";
