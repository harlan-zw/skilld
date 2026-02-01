"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonc_eslint_parser_1 = require("jsonc-eslint-parser");
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("no-binary-expression", {
    meta: {
        docs: {
            description: "disallow binary expression",
            recommended: ["json", "jsonc", "json5"],
            extensionRule: false,
            layout: false,
        },
        fixable: "code",
        hasSuggestions: false,
        schema: [],
        messages: {
            disallow: "The binary expressions are not allowed.",
        },
        type: "problem",
    },
    create(context) {
        if (!context.sourceCode.parserServices.isJSON) {
            return {};
        }
        return {
            JSONBinaryExpression(node) {
                context.report({
                    loc: node.loc,
                    messageId: "disallow",
                    fix(fixer) {
                        const value = (0, jsonc_eslint_parser_1.getStaticJSONValue)(node);
                        return fixer.replaceTextRange(node.range, JSON.stringify(value));
                    },
                });
            },
        };
    },
});
