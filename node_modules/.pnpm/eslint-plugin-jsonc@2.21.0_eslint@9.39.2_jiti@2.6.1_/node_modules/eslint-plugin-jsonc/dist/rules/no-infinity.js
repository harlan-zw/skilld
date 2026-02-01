"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonc_eslint_parser_1 = require("jsonc-eslint-parser");
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("no-infinity", {
    meta: {
        docs: {
            description: "disallow Infinity",
            recommended: ["json", "jsonc"],
            extensionRule: false,
            layout: false,
        },
        messages: {
            disallow: "Infinity should not be used.",
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
                if (node.name === "Infinity") {
                    context.report({
                        loc: node.loc,
                        messageId: "disallow",
                    });
                }
            },
        };
    },
});
