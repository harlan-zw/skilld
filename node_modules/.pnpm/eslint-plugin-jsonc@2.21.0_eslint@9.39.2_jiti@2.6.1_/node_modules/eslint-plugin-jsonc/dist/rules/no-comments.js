"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("no-comments", {
    meta: {
        docs: {
            description: "disallow comments",
            recommended: ["json"],
            extensionRule: false,
            layout: false,
        },
        schema: [],
        messages: {
            unexpected: "Unexpected comment.",
        },
        type: "problem",
    },
    create(context) {
        const sourceCode = context.sourceCode;
        if (!sourceCode.parserServices.isJSON) {
            return {};
        }
        return {
            Program() {
                for (const comment of sourceCode.getAllComments()) {
                    context.report({
                        loc: comment.loc,
                        messageId: "unexpected",
                    });
                }
            },
        };
    },
});
