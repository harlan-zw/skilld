declare const _default: {
    meta: {
        type: "problem";
        docs: {
            recommended: boolean;
            description: string;
            url: string;
        };
        messages: {
            missingLanguage: string;
            disallowedLanguage: string;
        };
        schema: {
            type: "object";
            properties: {
                required: {
                    type: "array";
                    items: {
                        type: "string";
                    };
                    uniqueItems: true;
                };
            };
            additionalProperties: false;
        }[];
        defaultOptions: [{
            required: any[];
        }];
    };
    create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../types.js").MarkdownLanguageOptions;
        Code: import("../index.js").MarkdownSourceCode;
        RuleOptions: FencedCodeLanguageOptions;
        Node: import("mdast").Node;
        MessageIds: FencedCodeLanguageMessageIds;
    }>): {
        code(node: import("mdast").Code): void;
    };
};
export default _default;
export type FencedCodeLanguageMessageIds = "missingLanguage" | "disallowedLanguage";
export type FencedCodeLanguageOptions = [{
    required?: string[];
}];
export type FencedCodeLanguageRuleDefinition = MarkdownRuleDefinition<{
    RuleOptions: FencedCodeLanguageOptions;
    MessageIds: FencedCodeLanguageMessageIds;
}>;
import type { MarkdownRuleDefinition } from "../types.js";
