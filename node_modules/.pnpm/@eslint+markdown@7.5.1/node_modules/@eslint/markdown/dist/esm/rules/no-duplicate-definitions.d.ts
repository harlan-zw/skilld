declare const _default: {
    meta: {
        type: "problem";
        docs: {
            recommended: boolean;
            description: string;
            url: string;
        };
        messages: {
            duplicateDefinition: string;
            duplicateFootnoteDefinition: string;
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
        RuleOptions: NoDuplicateDefinitionsOptions;
        Node: import("mdast").Node;
        MessageIds: NoDuplicateDefinitionsMessageIds;
    }>): {
        definition(node: Definition): void;
        footnoteDefinition(node: FootnoteDefinition): void;
    };
};
export default _default;
export type NoDuplicateDefinitionsMessageIds = "duplicateDefinition" | "duplicateFootnoteDefinition";
export type NoDuplicateDefinitionsOptions = [{
    allowDefinitions?: string[];
    allowFootnoteDefinitions?: string[];
}];
export type NoDuplicateDefinitionsRuleDefinition = MarkdownRuleDefinition<{
    RuleOptions: NoDuplicateDefinitionsOptions;
    MessageIds: NoDuplicateDefinitionsMessageIds;
}>;
import type { Definition } from "mdast";
import type { FootnoteDefinition } from "mdast";
import type { MarkdownRuleDefinition } from "../types.js";
