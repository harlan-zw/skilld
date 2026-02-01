"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const compat_1 = require("../utils/compat");
const ast_utils_1 = require("../utils/ast-utils");
exports.default = (0, utils_1.createRule)("comma-style", {
    meta: {
        docs: {
            description: "enforce consistent comma style in array",
            categories: ["standard"],
            extensionRule: "comma-style",
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
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!sourceCode.parserServices?.isTOML) {
            return {};
        }
        const style = context.options[0] || "last";
        const exceptions = {};
        if (context.options.length === 2 &&
            Object.prototype.hasOwnProperty.call(context.options[1], "exceptions")) {
            (_a = context.options)[1] ?? (_a[1] = { exceptions: {} });
            const rawExceptions = context.options[1].exceptions;
            const keys = Object.keys(rawExceptions);
            for (let i = 0; i < keys.length; i++)
                exceptions[keys[i]] = rawExceptions[keys[i]];
        }
        function getReplacedText(styleType, text) {
            switch (styleType) {
                case "between":
                    return `,${text.replace(ast_utils_1.LINEBREAK_MATCHER, "")}`;
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
            if ((0, ast_utils_1.isTokenOnSameLine)(commaToken, currentItemToken) &&
                (0, ast_utils_1.isTokenOnSameLine)(previousItemToken, commaToken)) {
            }
            else if (!(0, ast_utils_1.isTokenOnSameLine)(commaToken, currentItemToken) &&
                !(0, ast_utils_1.isTokenOnSameLine)(previousItemToken, commaToken)) {
                const comment = sourceCode.getCommentsAfter(commaToken)[0];
                const styleType = comment &&
                    comment.type === "Block" &&
                    (0, ast_utils_1.isTokenOnSameLine)(commaToken, comment)
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
                !(0, ast_utils_1.isTokenOnSameLine)(commaToken, currentItemToken)) {
                context.report({
                    node: reportItem,
                    loc: commaToken.loc,
                    messageId: "expectedCommaFirst",
                    fix: getFixerFunction(style, previousItemToken, commaToken, currentItemToken),
                });
            }
            else if (style === "last" &&
                (0, ast_utils_1.isTokenOnSameLine)(commaToken, currentItemToken)) {
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
            const arrayLiteral = node.type === "TOMLArray";
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
                    if ((0, ast_utils_1.isCommaToken)(commaToken))
                        validateCommaItemSpacing(previousItemToken, commaToken, currentItemToken, reportItem);
                    if (item) {
                        const tokenAfterItem = sourceCode.getTokenAfter(item, ast_utils_1.isNotClosingParenToken);
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
                    if ((0, ast_utils_1.isCommaToken)(nextToLastToken)) {
                        validateCommaItemSpacing(sourceCode.getTokenBefore(nextToLastToken), nextToLastToken, lastToken, lastToken);
                    }
                }
            }
        }
        const nodes = {};
        if (!exceptions.ObjectExpression && !exceptions.TOMLInlineTable) {
            nodes.TOMLInlineTable = function (node) {
                validateComma(node, "body");
            };
        }
        if (!exceptions.ArrayExpression && !exceptions.TOMLArray) {
            nodes.TOMLArray = function (node) {
                validateComma(node, "elements");
            };
        }
        return nodes;
    },
});
