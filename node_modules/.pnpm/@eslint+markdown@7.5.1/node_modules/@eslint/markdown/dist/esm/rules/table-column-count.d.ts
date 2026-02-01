declare const _default: {
    meta: {
        type: "problem";
        docs: {
            recommended: boolean;
            description: string;
            url: string;
        };
        messages: {
            extraCells: string;
            missingCells: string;
        };
        schema: {
            type: "object";
            properties: {
                checkMissingCells: {
                    type: "boolean";
                };
            };
            additionalProperties: false;
        }[];
        defaultOptions: [{
            checkMissingCells: false;
        }];
    };
    create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../types.js").MarkdownLanguageOptions;
        Code: import("../index.js").MarkdownSourceCode;
        RuleOptions: TableColumnCountOptions;
        Node: import("mdast").Node;
        MessageIds: TableColumnCountMessageIds;
    }>): {
        table(node: import("mdast").Table): void;
    };
};
export default _default;
export type TableColumnCountMessageIds = "extraCells" | "missingCells";
export type TableColumnCountOptions = [{
    checkMissingCells?: boolean;
}];
export type TableColumnCountRuleDefinition = MarkdownRuleDefinition<{
    RuleOptions: TableColumnCountOptions;
    MessageIds: TableColumnCountMessageIds;
}>;
import type { MarkdownRuleDefinition } from "../types.js";
