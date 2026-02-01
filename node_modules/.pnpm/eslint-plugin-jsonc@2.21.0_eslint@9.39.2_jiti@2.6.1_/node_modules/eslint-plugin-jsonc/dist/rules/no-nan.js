"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonc_eslint_parser_1 = require("jsonc-eslint-parser");
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("no-nan", {
    meta: {
        docs: {
            description: "disallow NaN",
            recommended: ["json", "jsonc"],
            extensionRule: false,
            layout: false,
        },
        messages: {
            disallow: "NaN should not be used.",
        },
        schema: [],
        type: "problem",
    },
    create(context) {
        if (!context.sourceCode.parserServices.isJSON) {
            return {};
        }
        return {
            JSONIdentifier(node) {
                if (!(0, jsonc_eslint_parser_1.isNumberIdentifier)(node)) {
                    return;
                }
                if (node.name === "NaN") {
                    context.report({
                        loc: node.loc,
                        messageId: "disallow",
                    });
                }
            },
        };
    },
});
