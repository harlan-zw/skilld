"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../utils/index");
const ast_utils_1 = require("../utils/ast-utils");
const yaml_1 = require("../utils/yaml");
const compat_1 = require("../utils/compat");
const OPTION_VALUE = {
    oneOf: [
        {
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
function areLineBreaksRequired(node, options, first, last) {
    const objectProperties = node.pairs;
    return (objectProperties.length >= options.minProperties ||
        (options.multiline &&
            objectProperties.length > 0 &&
            first.loc.start.line !== last.loc.end.line));
}
exports.default = (0, index_1.createRule)("flow-mapping-curly-newline", {
    meta: {
        docs: {
            description: "enforce consistent line breaks inside braces",
            categories: ["standard"],
            extensionRule: "object-curly-newline",
            layout: true,
        },
        fixable: "whitespace",
        schema: [OPTION_VALUE],
        messages: {
            unexpectedLinebreakBeforeClosingBrace: "Unexpected line break before this closing brace.",
            unexpectedLinebreakAfterOpeningBrace: "Unexpected line break after this opening brace.",
            expectedLinebreakBeforeClosingBrace: "Expected a line break before this closing brace.",
            expectedLinebreakAfterOpeningBrace: "Expected a line break after this opening brace.",
        },
        type: "layout",
    },
    create(context) {
        var _a;
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!((_a = sourceCode.parserServices) === null || _a === void 0 ? void 0 : _a.isYAML)) {
            return {};
        }
        const options = normalizeOptionValue(context.options[0]);
        function check(node) {
            if ((0, yaml_1.isKeyNode)(node)) {
                return;
            }
            const openBrace = sourceCode.getFirstToken(node, (token) => token.value === "{");
            const closeBrace = sourceCode.getLastToken(node, (token) => token.value === "}");
            let first = sourceCode.getTokenAfter(openBrace, {
                includeComments: true,
            });
            let last = sourceCode.getTokenBefore(closeBrace, {
                includeComments: true,
            });
            const needsLineBreaks = areLineBreaksRequired(node, options, first, last);
            const hasCommentsFirstToken = (0, ast_utils_1.isCommentToken)(first);
            const hasCommentsLastToken = (0, ast_utils_1.isCommentToken)(last);
            const hasQuestionsLastToken = (0, ast_utils_1.isQuestion)(last);
            first = sourceCode.getTokenAfter(openBrace);
            last = sourceCode.getTokenBefore(closeBrace);
            if (needsLineBreaks) {
                if ((0, ast_utils_1.isTokenOnSameLine)(openBrace, first)) {
                    context.report({
                        messageId: "expectedLinebreakAfterOpeningBrace",
                        node,
                        loc: openBrace.loc,
                        fix(fixer) {
                            if (hasCommentsFirstToken || (0, yaml_1.hasTabIndent)(context)) {
                                return null;
                            }
                            const indent = (0, yaml_1.incIndent)((0, yaml_1.getActualIndentFromLine)(openBrace.loc.start.line, context), context);
                            return fixer.insertTextAfter(openBrace, `\n${indent}`);
                        },
                    });
                }
                if ((0, ast_utils_1.isTokenOnSameLine)(last, closeBrace)) {
                    context.report({
                        messageId: "expectedLinebreakBeforeClosingBrace",
                        node,
                        loc: closeBrace.loc,
                        fix(fixer) {
                            if (hasCommentsLastToken || (0, yaml_1.hasTabIndent)(context)) {
                                return null;
                            }
                            const indent = (0, yaml_1.getActualIndentFromLine)(closeBrace.loc.start.line, context);
                            return fixer.insertTextBefore(closeBrace, `\n${indent}`);
                        },
                    });
                }
            }
            else {
                const consistent = options.consistent;
                const hasLineBreakBetweenOpenBraceAndFirst = !(0, ast_utils_1.isTokenOnSameLine)(openBrace, first);
                const hasLineBreakBetweenCloseBraceAndLast = !(0, ast_utils_1.isTokenOnSameLine)(last, closeBrace);
                if ((!consistent && hasLineBreakBetweenOpenBraceAndFirst) ||
                    (consistent &&
                        hasLineBreakBetweenOpenBraceAndFirst &&
                        !hasLineBreakBetweenCloseBraceAndLast)) {
                    context.report({
                        messageId: "unexpectedLinebreakAfterOpeningBrace",
                        node,
                        loc: openBrace.loc,
                        fix(fixer) {
                            if (hasCommentsFirstToken || (0, yaml_1.hasTabIndent)(context)) {
                                return null;
                            }
                            return fixer.removeRange([openBrace.range[1], first.range[0]]);
                        },
                    });
                }
                if ((!consistent && hasLineBreakBetweenCloseBraceAndLast) ||
                    (consistent &&
                        !hasLineBreakBetweenOpenBraceAndFirst &&
                        hasLineBreakBetweenCloseBraceAndLast)) {
                    if (hasQuestionsLastToken) {
                        return;
                    }
                    context.report({
                        messageId: "unexpectedLinebreakBeforeClosingBrace",
                        node,
                        loc: closeBrace.loc,
                        fix(fixer) {
                            if (hasCommentsLastToken || (0, yaml_1.hasTabIndent)(context)) {
                                return null;
                            }
                            return fixer.removeRange([last.range[1], closeBrace.range[0]]);
                        },
                    });
                }
            }
        }
        return {
            YAMLMapping(node) {
                if (node.style === "flow") {
                    check(node);
                }
            },
        };
    },
});
