declare const _default: {
    meta: {
        type: "problem";
        docs: {
            recommended: boolean;
            description: string;
            url: string;
        };
        schema: {
            type: "object";
            properties: {
                allowLabels: {
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
            allowLabels: any[];
        }];
        messages: {
            notFound: string;
        };
    };
    create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../types.js").MarkdownLanguageOptions;
        Code: MarkdownSourceCode;
        RuleOptions: NoMissingLabelRefsOptions;
        Node: import("mdast").Node;
        MessageIds: "notFound";
    }>): {
        "root:exit"(): void;
        text(node: Text): void;
        definition(node: import("mdast").Definition): void;
    };
};
export default _default;
export type NoMissingLabelRefsMessageIds = "notFound";
export type NoMissingLabelRefsOptions = [{
    allowLabels?: string[];
}];
export type NoMissingLabelRefsRuleDefinition = MarkdownRuleDefinition<{
    RuleOptions: NoMissingLabelRefsOptions;
    MessageIds: NoMissingLabelRefsMessageIds;
}>;
import type { MarkdownSourceCode } from "../language/markdown-source-code.js";
import type { Text } from "mdast";
import type { MarkdownRuleDefinition } from "../types.js";
