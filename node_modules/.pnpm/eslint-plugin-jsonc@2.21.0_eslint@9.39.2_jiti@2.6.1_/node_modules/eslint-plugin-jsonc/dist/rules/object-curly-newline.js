"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const eslint_utils_1 = require("@eslint-community/eslint-utils");
const eslint_ast_utils_1 = require("../utils/eslint-ast-utils");
const OPTION_VALUE = {
    oneOf: [
        {
            type: "string",
            enum: ["always", "never"],
        },
        {
            type: "object",
            properties: {
                multiline: {
                    type: "boolean",
                },
                minProperties: {
                    type: "integer",
                    minimum: 0,
                },
                consistent: {
                    type: "boolean",
                },
            },
            additionalProperties: false,
            minProperties: 1,
        },
    ],
};
function normalizeOptionValue(value) {
    let multiline = false;
    let minProperties = Number.POSITIVE_INFINITY;
    let consistent = false;
    if (value) {
        if (value === "always") {
            minProperties = 0;
        }
        else if (value === "never") {
            minProperties = Number.POSITIVE_INFINITY;
        }
        else {
            multiline = Boolean(value.multiline);
            minProperties = value.minProperties || Number.POSITIVE_INFINITY;
            consistent = Boolean(value.consistent);
        }
    }
    else {
        consistent = true;
    }
    return { multiline, minProperties, consistent };
}
function isObject(value) {
    return typeof value === "object" && value !== null;
}
function isNodeSpecificOption(option) {
    return isObject(option) || typeof option === "string";
}
function normalizeOptions(options) {
    if (isObject(options) && Object.values(options).some(isNodeSpecificOption)) {
        return {
            JSONObjectExpression: normalizeOptionValue(options.ObjectExpression),
        };
    }
    const value = normalizeOptionValue(options);
    return {
        JSONObjectExpression: value,
    };
}
function areLineBreaksRequired(node, options, first, last) {
    const objectProperties = node.properties;
    return (objectProperties.length >= options.minProperties ||
        (options.multiline &&
            objectProperties.length > 0 &&
            first.loc.start.line !== last.loc.end.line));
}
exports.default = (0, utils_1.createRule)("object-curly-newline", {
    meta: {
        docs: {
            description: "enforce consistent line breaks inside braces",
            recommended: null,
            extensionRule: true,
            layout: true,
        },
        type: "layout",
        fixable: "whitespace",
        schema: [
            {
                oneOf: [
                    OPTION_VALUE,
                    {
                        type: "object",
                        properties: {
                            ObjectExpression: OPTION_VALUE,
                            ObjectPattern: OPTION_VALUE,
                            ImportDeclaration: OPTION_VALUE,
                            ExportDeclaration: OPTION_VALUE,
                        },
                        additionalProperties: false,
                        minProperties: 1,
                    },
                ],
            },
        ],
        messages: {
            unexpectedLinebreakBeforeClosingBrace: "Unexpected line break before this closing brace.",
            unexpectedLinebreakAfterOpeningBrace: "Unexpected line break after this opening brace.",
            expectedLinebreakBeforeClosingBrace: "Expected a line break before this closing brace.",
            expectedLinebreakAfterOpeningBrace: "Expected a line break after this opening brace.",
        },
    },
    create(context) {
        const sourceCode = context.sourceCode;
        if (!sourceCode.parserServices.isJSON) {
            return {};
        }
        const normalizedOptions = normalizeOptions(context.options[0]);
        function check(node) {
            const options = normalizedOptions[node.type];
            const openBrace = sourceCode.getFirstToken(node, eslint_utils_1.isOpeningBraceToken);
            const closeBrace = sourceCode.getLastToken(node, eslint_utils_1.isClosingBraceToken);
            let first = sourceCode.getTokenAfter(openBrace, {
                includeComments: true,
            });
            let last = sourceCode.getTokenBefore(closeBrace, {
                includeComments: true,
            });
            const needsLineBreaks = areLineBreaksRequired(node, options, first, last);
            const hasCommentsFirstToken = (0, eslint_utils_1.isCommentToken)(first);
            const hasCommentsLastToken = (0, eslint_utils_1.isCommentToken)(last);
            first = sourceCode.getTokenAfter(openBrace);
            last = sourceCode.getTokenBefore(closeBrace);
            if (needsLineBreaks) {
                if ((0, eslint_ast_utils_1.isTokenOnSameLine)(openBrace, first)) {
                    context.report({
                        messageId: "expectedLinebreakAfterOpeningBrace",
                        node: node,
                        loc: openBrace.loc,
                        fix(fixer) {
                            if (hasCommentsFirstToken)
                                return null;
                            return fixer.insertTextAfter(openBrace, "\n");
                        },
                    });
                }
                if ((0, eslint_ast_utils_1.isTokenOnSameLine)(last, closeBrace)) {
                    context.report({
                        messageId: "expectedLinebreakBeforeClosingBrace",
                        node: node,
                        loc: closeBrace.loc,
                        fix(fixer) {
                            if (hasCommentsLastToken)
                                return null;
                            return fixer.insertTextBefore(closeBrace, "\n");
                        },
                    });
                }
            }
            else {
                const consistent = options.consistent;
                const hasLineBreakBetweenOpenBraceAndFirst = !(0, eslint_ast_utils_1.isTokenOnSameLine)(openBrace, first);
                const hasLineBreakBetweenCloseBraceAndLast = !(0, eslint_ast_utils_1.isTokenOnSameLine)(last, closeBrace);
                if ((!consistent && hasLineBreakBetweenOpenBraceAndFirst) ||
                    (consistent &&
                        hasLineBreakBetweenOpenBraceAndFirst &&
                        !hasLineBreakBetweenCloseBraceAndLast)) {
                    context.report({
                        messageId: "unexpectedLinebreakAfterOpeningBrace",
                        node: node,
                        loc: openBrace.loc,
                        fix(fixer) {
                            if (hasCommentsFirstToken)
                                return null;
                            return fixer.removeRange([openBrace.range[1], first.range[0]]);
                        },
                    });
                }
                if ((!consistent && hasLineBreakBetweenCloseBraceAndLast) ||
                    (consistent &&
                        !hasLineBreakBetweenOpenBraceAndFirst &&
                        hasLineBreakBetweenCloseBraceAndLast)) {
                    context.report({
                        messageId: "unexpectedLinebreakBeforeClosingBrace",
                        node: node,
                        loc: closeBrace.loc,
                        fix(fixer) {
                            if (hasCommentsLastToken)
                                return null;
                            return fixer.removeRange([last.range[1], closeBrace.range[0]]);
                        },
                    });
                }
            }
        }
        return {
            JSONObjectExpression: check,
        };
    },
});
