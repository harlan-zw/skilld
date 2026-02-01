"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eslint_utils_1 = require("@eslint-community/eslint-utils");
const jsonc_eslint_parser_1 = require("jsonc-eslint-parser");
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("no-parenthesized", {
    meta: {
        docs: {
            description: "disallow parentheses around the expression",
            recommended: ["json", "jsonc", "json5"],
            extensionRule: false,
            layout: false,
        },
        fixable: "code",
        hasSuggestions: false,
        schema: [],
        messages: {
            disallow: "Parentheses around expression should not be used.",
        },
        type: "problem",
    },
    create(context) {
        const sourceCode = context.sourceCode;
        if (!sourceCode.parserServices.isJSON) {
            return {};
        }
        const handlers = {
            JSONArrayExpression: handler,
            JSONBinaryExpression: handler,
            JSONIdentifier: handler,
            JSONLiteral: handler,
            JSONObjectExpression: handler,
            JSONTemplateLiteral: handler,
            JSONUnaryExpression: handler,
        };
        return handlers;
        function handler(node) {
            if (!(0, jsonc_eslint_parser_1.isExpression)(node) || !(0, eslint_utils_1.isParenthesized)(node, sourceCode)) {
                return;
            }
            const leftParen = sourceCode.getTokenBefore(node);
            const rightParen = sourceCode.getTokenAfter(node);
            context.report({
                loc: leftParen.loc,
                messageId: "disallow",
                fix,
            });
            context.report({
                loc: rightParen.loc,
                messageId: "disallow",
                fix,
            });
            function fix(fixer) {
                const parent = node.parent;
                if (!parent) {
                    return [];
                }
                if (parent.type !== "JSONArrayExpression" &&
                    parent.type !== "JSONExpressionStatement" &&
                    parent.type !== "JSONProperty") {
                    return [];
                }
                return [
                    fixer.removeRange(leftParen.range),
                    fixer.removeRange(rightParen.range),
                ];
            }
        }
    },
});
