declare const _default: {
    meta: {
        type: "problem";
        docs: {
            recommended: boolean;
            description: string;
            url: string;
        };
        messages: {
            invalidLabelRef: string;
        };
    };
    create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../types.js").MarkdownLanguageOptions;
        Code: MarkdownSourceCode;
        RuleOptions: [];
        Node: import("mdast").Node;
        MessageIds: "invalidLabelRef";
    }>): {
        text(node: Text): void;
    };
};
export default _default;
export type NoInvalidLabelRefsMessageIds = "invalidLabelRef";
export type NoInvalidLabelRefsOptions = [];
export type NoInvalidLabelRefsRuleDefinition = MarkdownRuleDefinition<{
    RuleOptions: NoInvalidLabelRefsOptions;
    MessageIds: NoInvalidLabelRefsMessageIds;
}>;
import type { MarkdownSourceCode } from "../language/markdown-source-code.js";
import type { Text } from "mdast";
import type { MarkdownRuleDefinition } from "../types.js";
