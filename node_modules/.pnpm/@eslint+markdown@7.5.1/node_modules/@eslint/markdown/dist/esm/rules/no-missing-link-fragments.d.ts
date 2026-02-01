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
                ignoreCase: {
                    type: "boolean";
                };
                allowPattern: {
                    type: "string";
                };
            };
            additionalProperties: false;
        }[];
        messages: {
            invalidFragment: string;
        };
        defaultOptions: [{
            ignoreCase: true;
            allowPattern: string;
        }];
    };
    create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../types.js").MarkdownLanguageOptions;
        Code: import("../index.js").MarkdownSourceCode;
        RuleOptions: NoMissingLinkFragmentsOptions;
        Node: import("mdast").Node;
        MessageIds: "invalidFragment";
    }>): {
        heading(): void;
        "heading *:not(html)"({ value }: any): void;
        "heading:exit"(): void;
        html(node: import("mdast").Html): void;
        link(node: Link): void;
        "root:exit"(): void;
    };
};
export default _default;
export type NoMissingLinkFragmentsMessageIds = "invalidFragment";
export type NoMissingLinkFragmentsOptions = [{
    ignoreCase?: boolean;
    allowPattern?: string;
}];
export type NoMissingLinkFragmentsRuleDefinition = MarkdownRuleDefinition<{
    RuleOptions: NoMissingLinkFragmentsOptions;
    MessageIds: NoMissingLinkFragmentsMessageIds;
}>;
import type { Link } from "mdast";
import type { MarkdownRuleDefinition } from "../types.js";
