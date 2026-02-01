declare const _default: {
    meta: {
        type: "problem";
        docs: {
            recommended: boolean;
            description: string;
            url: string;
        };
        fixable: "code";
        messages: {
            referenceLikeUrl: string;
        };
    };
    create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../types.js").MarkdownLanguageOptions;
        Code: import("../index.js").MarkdownSourceCode;
        RuleOptions: [];
        Node: import("mdast").Node;
        MessageIds: "referenceLikeUrl";
    }>): {
        definition(node: import("mdast").Definition): void;
        "image, link"(node: Image | Link): void;
        "root:exit"(): void;
    };
};
export default _default;
export type NoReferenceLikeUrlsMessageIds = "referenceLikeUrl";
export type NoReferenceLikeUrlsOptions = [];
export type NoReferenceLikeUrlsRuleDefinition = MarkdownRuleDefinition<{
    RuleOptions: NoReferenceLikeUrlsOptions;
    MessageIds: NoReferenceLikeUrlsMessageIds;
}>;
import type { Image } from "mdast";
import type { Link } from "mdast";
import type { MarkdownRuleDefinition } from "../types.js";
