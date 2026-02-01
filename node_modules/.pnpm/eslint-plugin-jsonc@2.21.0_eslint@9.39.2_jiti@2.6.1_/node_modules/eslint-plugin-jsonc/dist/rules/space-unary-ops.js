"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const eslint_ast_utils_1 = require("../utils/eslint-ast-utils");
exports.default = (0, utils_1.createRule)("space-unary-ops", {
    meta: {
        docs: {
            description: "disallow spaces after unary operators",
            recommended: ["json", "jsonc", "json5"],
            extensionRule: true,
            layout: true,
        },
        fixable: "whitespace",
        type: "layout",
        schema: [
            {
                type: "object",
                properties: {
                    words: {
                        type: "boolean",
                        default: true,
                    },
                    nonwords: {
                        type: "boolean",
                        default: false,
                    },
                    overrides: {
                        type: "object",
                        additionalProperties: {
                            type: "boolean",
                        },
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unexpectedBefore: "Unexpected space before unary operator '{{operator}}'.",
            unexpectedAfter: "Unexpected space after unary operator '{{operator}}'.",
            operator: "Unary operator '{{operator}}' must be followed by whitespace.",
            beforeUnaryExpressions: "Space is required before unary expressions '{{token}}'.",
        },
    },
    create(context) {
        const sourceCode = context.sourceCode;
        if (!sourceCode.parserServices.isJSON) {
            return {};
        }
        const options = context.options[0] || { words: true, nonwords: false };
        function overrideExistsForOperator(operator) {
            return (options.overrides &&
                Object.prototype.hasOwnProperty.call(options.overrides, operator));
        }
        function overrideEnforcesSpaces(operator) {
            var _a;
            return (_a = options.overrides) === null || _a === void 0 ? void 0 : _a[operator];
        }
        function verifyNonWordsHaveSpaces(node, firstToken, secondToken) {
            if ("prefix" in node && node.prefix) {
                if (firstToken.range[1] === secondToken.range[0]) {
                    context.report({
                        node: node,
                        messageId: "operator",
                        data: {
                            operator: firstToken.value,
                        },
                        fix(fixer) {
                            return fixer.insertTextAfter(firstToken, " ");
                        },
                    });
                }
            }
            else {
                if (firstToken.range[1] === secondToken.range[0]) {
                    context.report({
                        node: node,
                        messageId: "beforeUnaryExpressions",
                        data: {
                            token: secondToken.value,
                        },
                        fix(fixer) {
                            return fixer.insertTextBefore(secondToken, " ");
                        },
                    });
                }
            }
        }
        function verifyNonWordsDontHaveSpaces(node, firstToken, secondToken) {
            if ("prefix" in node && node.prefix) {
                if (secondToken.range[0] > firstToken.range[1]) {
                    context.report({
                        node: node,
                        messageId: "unexpectedAfter",
                        data: {
                            operator: firstToken.value,
                        },
                        fix(fixer) {
                            if ((0, eslint_ast_utils_1.canTokensBeAdjacent)(firstToken, secondToken))
                                return fixer.removeRange([
                                    firstToken.range[1],
                                    secondToken.range[0],
                                ]);
                            return null;
                        },
                    });
                }
            }
            else {
                if (secondToken.range[0] > firstToken.range[1]) {
                    context.report({
                        node: node,
                        messageId: "unexpectedBefore",
                        data: {
                            operator: secondToken.value,
                        },
                        fix(fixer) {
                            return fixer.removeRange([
                                firstToken.range[1],
                                secondToken.range[0],
                            ]);
                        },
                    });
                }
            }
        }
        function checkForSpaces(node) {
            const tokens = sourceCode.getFirstTokens(node, 2);
            const firstToken = tokens[0];
            const secondToken = tokens[1];
            const operator = tokens[0].value;
            if (overrideExistsForOperator(operator)) {
                if (overrideEnforcesSpaces(operator))
                    verifyNonWordsHaveSpaces(node, firstToken, secondToken);
                else
                    verifyNonWordsDontHaveSpaces(node, firstToken, secondToken);
            }
            else if (options.nonwords) {
                verifyNonWordsHaveSpaces(node, firstToken, secondToken);
            }
            else {
                verifyNonWordsDontHaveSpaces(node, firstToken, secondToken);
            }
        }
        return {
            JSONUnaryExpression: checkForSpaces,
        };
    },
});
