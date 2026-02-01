declare const _default: {
    meta: {
        type: "problem";
        docs: {
            description: string;
            url: string;
        };
        fixable: "code";
        messages: {
            bareUrl: string;
        };
    };
    create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../types.js").MarkdownLanguageOptions;
        Code: import("../index.js").MarkdownSourceCode;
        RuleOptions: [];
        Node: import("mdast").Node;
        MessageIds: "bareUrl";
    }>): {
        ":matches(heading, paragraph, tableCell) html"(node: Html): void;
        ":matches(heading, paragraph, tableCell) link"(node: Link): void;
        "heading:exit"(): void;
        "paragraph:exit"(): void;
        "tableCell:exit"(): void;
        "root:exit"(): void;
    };
};
export default _default;
export type NoBareUrlsMessageIds = "bareUrl";
export type NoBareUrlsOptions = [];
export type NoBareUrlsRuleDefinition = MarkdownRuleDefinition<{
    RuleOptions: NoBareUrlsOptions;
    MessageIds: NoBareUrlsMessageIds;
}>;
import type { Html } from "mdast";
import type { Link } from "mdast";
import type { MarkdownRuleDefinition } from "../types.js";
