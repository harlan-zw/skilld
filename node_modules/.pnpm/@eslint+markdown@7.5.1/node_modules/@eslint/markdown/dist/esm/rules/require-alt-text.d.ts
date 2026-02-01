declare const _default: {
    meta: {
        type: "problem";
        docs: {
            recommended: boolean;
            description: string;
            url: string;
        };
        messages: {
            altTextRequired: string;
        };
    };
    create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../types.js").MarkdownLanguageOptions;
        Code: import("../index.js").MarkdownSourceCode;
        RuleOptions: [];
        Node: import("mdast").Node;
        MessageIds: "altTextRequired";
    }>): {
        "image, imageReference"(node: Image | ImageReference): void;
        html(node: import("mdast").Html): void;
    };
};
export default _default;
export type RequireAltTextMessageIds = "altTextRequired";
export type RequireAltTextOptions = [];
export type RequireAltTextRuleDefinition = MarkdownRuleDefinition<{
    RuleOptions: RequireAltTextOptions;
    MessageIds: RequireAltTextMessageIds;
}>;
import type { Image } from "mdast";
import type { ImageReference } from "mdast";
import type { MarkdownRuleDefinition } from "../types.js";
