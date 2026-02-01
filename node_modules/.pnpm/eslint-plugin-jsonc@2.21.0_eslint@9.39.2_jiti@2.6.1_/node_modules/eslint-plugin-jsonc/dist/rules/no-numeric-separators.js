"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("no-numeric-separators", {
    meta: {
        docs: {
            description: "disallow numeric separators",
            recommended: ["json", "jsonc", "json5"],
            extensionRule: false,
            layout: false,
        },
        fixable: "code",
        schema: [],
        messages: {
            unexpected: "Numeric separators are not allowed.",
        },
        type: "problem",
    },
    create(context) {
        const sourceCode = context.sourceCode;
        if (!sourceCode.parserServices.isJSON) {
            return {};
        }
        return {
            JSONLiteral(node) {
                if (typeof node.value !== "number") {
                    return;
                }
                const text = sourceCode.text.slice(...node.range);
                if (text.includes("_")) {
                    context.report({
                        loc: node.loc,
                        messageId: "unexpected",
                        fix(fixer) {
                            return fixer.replaceTextRange(node.range, text.replace(/_/g, ""));
                        },
                    });
                }
            },
        };
    },
});
