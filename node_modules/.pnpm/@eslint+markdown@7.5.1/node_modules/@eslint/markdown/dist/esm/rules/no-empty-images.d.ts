declare const _default: {
    meta: {
        type: "problem";
        docs: {
            recommended: boolean;
            description: string;
            url: string;
        };
        messages: {
            emptyImage: string;
        };
    };
    create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../types.js").MarkdownLanguageOptions;
        Code: import("../index.js").MarkdownSourceCode;
        RuleOptions: [];
        Node: import("mdast").Node;
        MessageIds: "emptyImage";
    }>): {
        image(node: import("mdast").Image): void;
    };
};
export default _default;
export type NoEmptyImagesMessageIds = "emptyImage";
export type NoEmptyImagesOptions = [];
export type NoEmptyImagesRuleDefinition = MarkdownRuleDefinition<{
    RuleOptions: NoEmptyImagesOptions;
    MessageIds: NoEmptyImagesMessageIds;
}>;
import type { MarkdownRuleDefinition } from "../types.js";
