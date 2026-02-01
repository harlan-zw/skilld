declare const _default: {
    meta: {
        type: "problem";
        docs: {
            recommended: boolean;
            description: string;
            url: string;
        };
        messages: {
            unusedDefinition: string;
            unusedFootnoteDefinition: string;
        };
        schema: {
            type: "object";
            properties: {
                allowDefinitions: {
                    type: "array";
                    items: {
                        type: "string";
                    };
                    uniqueItems: true;
                };
                allowFootnoteDefinitions: {
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
            allowDefinitions: string[];
            allowFootnoteDefinitions: any[];
        }];
    };
    create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../types.js").MarkdownLanguageOptions;
        Code: import("../index.js").MarkdownSourceCode;
        RuleOptions: NoUnusedDefinitionsOptions;
        Node: import("mdast").Node;
        MessageIds: NoUnusedDefinitionsMessageIds;
    }>): {
        imageReference(node: import("mdast").ImageReference): void;
        linkReference(node: import("mdast").LinkReference): void;
        footnoteReference(node: import("mdast").FootnoteReference): void;
        definition(node: Definition): void;
        footnoteDefinition(node: FootnoteDefinition): void;
        "root:exit"(): void;
    };
};
export default _default;
export type NoUnusedDefinitionsMessageIds = "unusedDefinition" | "unusedFootnoteDefinition";
export type NoUnusedDefinitionsOptions = [{
    allowDefinitions?: string[];
    allowFootnoteDefinitions?: string[];
}];
export type NoUnusedDefinitionsRuleDefinition = MarkdownRuleDefinition<{
    RuleOptions: NoUnusedDefinitionsOptions;
    MessageIds: NoUnusedDefinitionsMessageIds;
}>;
import type { Definition } from "mdast";
import type { FootnoteDefinition } from "mdast";
import type { MarkdownRuleDefinition } from "../types.js";
