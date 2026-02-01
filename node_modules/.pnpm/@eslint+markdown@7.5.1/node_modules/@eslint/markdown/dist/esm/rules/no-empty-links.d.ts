declare const _default: {
    meta: {
        type: "problem";
        docs: {
            recommended: boolean;
            description: string;
            url: string;
        };
        messages: {
            emptyLink: string;
        };
    };
    create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../types.js").MarkdownLanguageOptions;
        Code: import("../index.js").MarkdownSourceCode;
        RuleOptions: [];
        Node: import("mdast").Node;
        MessageIds: "emptyLink";
    }>): {
        link(node: import("mdast").Link): void;
    };
};
export default _default;
export type NoEmptyLinksMessageIds = "emptyLink";
export type NoEmptyLinksOptions = [];
export type NoEmptyLinksRuleDefinition = MarkdownRuleDefinition<{
    RuleOptions: NoEmptyLinksOptions;
    MessageIds: NoEmptyLinksMessageIds;
}>;
import type { MarkdownRuleDefinition } from "../types.js";
