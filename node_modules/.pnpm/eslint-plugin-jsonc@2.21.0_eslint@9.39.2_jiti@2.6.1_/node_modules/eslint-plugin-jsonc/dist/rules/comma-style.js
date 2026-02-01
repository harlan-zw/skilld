"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const eslint_utils_1 = require("@eslint-community/eslint-utils");
const eslint_ast_utils_1 = require("../utils/eslint-ast-utils");
exports.default = (0, utils_1.createRule)("comma-style", {
    meta: {
        docs: {
            description: "enforce consistent comma style",
            recommended: null,
            extensionRule: true,
            layout: true,
        },
        type: "layout",
        fixable: "code",
        schema: [
            {
                type: "string",
                enum: ["first", "last"],
            },
            {
                type: "object",
                properties: {
                    exceptions: {
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
            unexpectedLineBeforeAndAfterComma: "Bad line breaking before and after ','.",
            expectedCommaFirst: "',' should be placed first.",
            expectedCommaLast: "',' should be placed last.",
        },
    },
    create(context) {
        var _a;
        var _b;
        const sourceCode = context.sourceCode;
        if (!sourceCode.parserServices.isJSON) {
            return {};
        }
        const style = context.options[0] || "last";
        const exceptions = {};
        if (context.options.length === 2 &&
            Object.prototype.hasOwnProperty.call(context.options[1], "exceptions")) {
            (_a = (_b = context.options)[1]) !== null && _a !== void 0 ? _a : (_b[1] = { exceptions: {} });
            const rawExceptions = context.options[1].exceptions;
            for (const [key, value] of Object.entries(rawExceptions)) {
                exceptions[(key.startsWith("JSON")
                    ? key
                    : `JSON${key}`)] = value;
            }
        }
        function getReplacedText(styleType, text) {
            switch (styleType) {
                case "between":
                    return `,${text.replace(eslint_ast_utils_1.LINEBREAK_MATCHER, "")}`;
                case "first":
                    return `${text},`;
                case "last":
                    return `,${text}`;
                default:
                    return "";
            }
        }
        function getFixerFunction(styleType, previousItemToken, commaToken, currentItemToken) {
            const text = sourceCode.text.slice(previousItemToken.range[1], commaToken.range[0]) +
                sourceCode.text.slice(commaToken.range[1], currentItemToken.range[0]);
            const range = [
                previousItemToken.range[1],
                currentItemToken.range[0],
            ];
            return function (fixer) {
                return fixer.replaceTextRange(range, getReplacedText(styleType, text));
            };
        }
        function validateCommaItemSpacing(previousItemToken, commaToken, currentItemToken, reportItem) {
            if ((0, eslint_ast_utils_1.isTokenOnSameLine)(commaToken, currentItemToken) &&
                (0, eslint_ast_utils_1.isTokenOnSameLine)(previousItemToken, commaToken)) {
            }
            else if (!(0, eslint_ast_utils_1.isTokenOnSameLine)(commaToken, currentItemToken) &&
                !(0, eslint_ast_utils_1.isTokenOnSameLine)(previousItemToken, commaToken)) {
                const comment = sourceCode.getCommentsAfter(commaToken)[0];
                const styleType = comment &&
                    comment.type === "Block" &&
                    (0, eslint_ast_utils_1.isTokenOnSameLine)(commaToken, comment)
                    ? style
                    : "between";
                context.report({
                    node: reportItem,
                    loc: commaToken.loc,
                    messageId: "unexpectedLineBeforeAndAfterComma",
                    fix: getFixerFunction(styleType, previousItemToken, commaToken, currentItemToken),
                });
            }
            else if (style === "first" &&
                !(0, eslint_ast_utils_1.isTokenOnSameLine)(commaToken, currentItemToken)) {
                context.report({
                    node: reportItem,
                    loc: commaToken.loc,
                    messageId: "expectedCommaFirst",
                    fix: getFixerFunction(style, previousItemToken, commaToken, currentItemToken),
                });
            }
            else if (style === "last" &&
                (0, eslint_ast_utils_1.isTokenOnSameLine)(commaToken, currentItemToken)) {
                context.report({
                    node: reportItem,
                    loc: commaToken.loc,
                    messageId: "expectedCommaLast",
                    fix: getFixerFunction(style, previousItemToken, commaToken, currentItemToken),
                });
            }
        }
        function validateComma(node, property) {
            const items = node[property];
            const arrayLiteral = node.type === "JSONArrayExpression";
            if (items.length > 1 || arrayLiteral) {
                let previousItemToken = sourceCode.getFirstToken(node);
                items.forEach((item) => {
                    const commaToken = item
                        ? sourceCode.getTokenBefore(item)
                        : previousItemToken;
                    const currentItemToken = item
                        ? sourceCode.getFirstToken(item)
                        : sourceCode.getTokenAfter(commaToken);
                    const reportItem = item || currentItemToken;
                    if ((0, eslint_utils_1.isCommaToken)(commaToken))
                        validateCommaItemSpacing(previousItemToken, commaToken, currentItemToken, reportItem);
                    if (item) {
                        const tokenAfterItem = sourceCode.getTokenAfter(item, eslint_utils_1.isNotClosingParenToken);
                        previousItemToken = tokenAfterItem
                            ? sourceCode.getTokenBefore(tokenAfterItem)
                            : sourceCode.ast.tokens[sourceCode.ast.tokens.length - 1];
                    }
                    else {
                        previousItemToken = currentItemToken;
                    }
                });
                if (arrayLiteral) {
                    const lastToken = sourceCode.getLastToken(node);
                    const nextToLastToken = sourceCode.getTokenBefore(lastToken);
                    if ((0, eslint_utils_1.isCommaToken)(nextToLastToken)) {
                        validateCommaItemSpacing(sourceCode.getTokenBefore(nextToLastToken), nextToLastToken, lastToken, lastToken);
                    }
                }
            }
        }
        const nodes = {};
        if (!exceptions.JSONObjectExpression) {
            nodes.JSONObjectExpression = function (node) {
                validateComma(node, "properties");
            };
        }
        if (!exceptions.JSONArrayExpression) {
            nodes.JSONArrayExpression = function (node) {
                validateComma(node, "elements");
            };
        }
        return nodes;
    },
});
