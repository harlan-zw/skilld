declare const _default: {
    meta: {
        type: "problem";
        docs: {
            recommended: boolean;
            description: string;
            url: string;
        };
        messages: {
            emptyDefinition: string;
            emptyFootnoteDefinition: string;
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
                checkFootnoteDefinitions: {
                    type: "boolean";
                };
            };
            additionalProperties: false;
        }[];
        defaultOptions: [{
            allowDefinitions: string[];
            allowFootnoteDefinitions: any[];
            checkFootnoteDefinitions: true;
        }];
    };
    create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../types.js").MarkdownLanguageOptions;
        Code: import("../index.js").MarkdownSourceCode;
        RuleOptions: NoEmptyDefinitionsOptions;
        Node: import("mdast").Node;
        MessageIds: NoEmptyDefinitionsMessageIds;
    }>): {
        definition(node: import("mdast").Definition): void;
        footnoteDefinition(node: import("mdast").FootnoteDefinition): void;
    };
};
export default _default;
export type NoEmptyDefinitionsMessageIds = "emptyDefinition" | "emptyFootnoteDefinition";
export type NoEmptyDefinitionsOptions = [{
    allowDefinitions?: string[];
    allowFootnoteDefinitions?: string[];
    checkFootnoteDefinitions?: boolean;
}];
export type NoEmptyDefinitionsRuleDefinition = MarkdownRuleDefinition<{
    RuleOptions: NoEmptyDefinitionsOptions;
    MessageIds: NoEmptyDefinitionsMessageIds;
}>;
import type { MarkdownRuleDefinition } from "../types.js";
