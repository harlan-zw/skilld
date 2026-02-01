"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonc_eslint_parser_1 = require("jsonc-eslint-parser");
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("no-undefined-value", {
    meta: {
        docs: {
            description: "disallow `undefined`",
            recommended: ["json", "jsonc", "json5"],
            extensionRule: false,
            layout: false,
        },
        schema: [],
        messages: {
            unexpected: "`undefined` is not allowed.",
        },
        type: "problem",
    },
    create(context) {
        if (!context.sourceCode.parserServices.isJSON) {
            return {};
        }
        return {
            JSONIdentifier(node) {
                if (!(0, jsonc_eslint_parser_1.isUndefinedIdentifier)(node)) {
                    return;
                }
                context.report({
                    loc: node.loc,
                    messageId: "unexpected",
                });
            },
        };
    },
});
