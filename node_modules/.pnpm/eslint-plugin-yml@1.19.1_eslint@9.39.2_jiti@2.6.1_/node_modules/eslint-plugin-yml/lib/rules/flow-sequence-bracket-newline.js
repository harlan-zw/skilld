"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../utils/index");
const yaml_1 = require("../utils/yaml");
const ast_utils_1 = require("../utils/ast-utils");
const compat_1 = require("../utils/compat");
exports.default = (0, index_1.createRule)("flow-sequence-bracket-newline", {
    meta: {
        docs: {
            description: "enforce linebreaks after opening and before closing flow sequence brackets",
            categories: ["standard"],
            extensionRule: "array-bracket-newline",
            layout: true,
        },
        fixable: "whitespace",
        schema: [
            {
                oneOf: [
                    {
                        enum: ["always", "never", "consistent"],
                    },
                    {
                        type: "object",
                        properties: {
                            multiline: {
                                type: "boolean",
                            },
                            minItems: {
                                type: ["integer", "null"],
                                minimum: 0,
                            },
                        },
                        additionalProperties: false,
                    },
                ],
            },
        ],
        messages: {
            unexpectedOpeningLinebreak: "There should be no linebreak after '['.",
            unexpectedClosingLinebreak: "There should be no linebreak before ']'.",
            missingOpeningLinebreak: "A linebreak is required after '['.",
            missingClosingLinebreak: "A linebreak is required before ']'.",
        },
        type: "layout",
    },
    create(context) {
        var _a;
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!((_a = sourceCode.parserServices) === null || _a === void 0 ? void 0 : _a.isYAML)) {
            return {};
        }
        function normalizeOptionValue(option) {
            let consistent = false;
            let multiline = false;
            let minItems = 0;
            if (option) {
                if (option === "consistent") {
                    consistent = true;
                    minItems = Number.POSITIVE_INFINITY;
                }
                else if (option === "always" ||
                    (typeof option !== "string" && option.minItems === 0)) {
                    minItems = 0;
                }
                else if (option === "never") {
                    minItems = Number.POSITIVE_INFINITY;
                }
                else {
                    multiline = Boolean(option.multiline);
                    minItems = option.minItems || Number.POSITIVE_INFINITY;
                }
            }
            else {
                consistent = false;
                multiline = true;
                minItems = Number.POSITIVE_INFINITY;
            }
            return { consistent, multiline, minItems };
        }
        function reportNoBeginningLinebreak(node, token) {
            context.report({
                node,
                loc: token.loc,
                messageId: "unexpectedOpeningLinebreak",
                fix(fixer) {
                    if ((0, yaml_1.hasTabIndent)(context)) {
                        return null;
                    }
                    const nextToken = sourceCode.getTokenAfter(token, {
                        includeComments: true,
                    });
                    if ((0, ast_utils_1.isCommentToken)(nextToken)) {
                        return null;
                    }
                    return fixer.removeRange([token.range[1], nextToken.range[0]]);
                },
            });
        }
        function reportNoEndingLinebreak(node, token) {
            context.report({
                node,
                loc: token.loc,
                messageId: "unexpectedClosingLinebreak",
                fix(fixer) {
                    if ((0, yaml_1.hasTabIndent)(context)) {
                        return null;
                    }
                    const previousToken = sourceCode.getTokenBefore(token, {
                        includeComments: true,
                    });
                    if ((0, ast_utils_1.isCommentToken)(previousToken)) {
                        return null;
                    }
                    return fixer.removeRange([previousToken.range[1], token.range[0]]);
                },
            });
        }
        function reportRequiredBeginningLinebreak(node, token) {
            context.report({
                node,
                loc: token.loc,
                messageId: "missingOpeningLinebreak",
                fix(fixer) {
                    if ((0, yaml_1.hasTabIndent)(context)) {
                        return null;
                    }
                    const indent = (0, yaml_1.incIndent)((0, yaml_1.getActualIndentFromLine)(token.loc.start.line, context), context);
                    return fixer.insertTextAfter(token, `\n${indent}`);
                },
            });
        }
        function reportRequiredEndingLinebreak(node, token) {
            context.report({
                node,
                loc: token.loc,
                messageId: "missingClosingLinebreak",
                fix(fixer) {
                    if ((0, yaml_1.hasTabIndent)(context)) {
                        return null;
                    }
                    const indent = (0, yaml_1.getActualIndentFromLine)(token.loc.start.line, context);
                    return fixer.insertTextBefore(token, `\n${indent}`);
                },
            });
        }
        function check(node) {
            if ((0, yaml_1.isKeyNode)(node)) {
                return;
            }
            const elements = node.entries;
            const options = normalizeOptionValue(context.options[0]);
            const openBracket = sourceCode.getFirstToken(node);
            const closeBracket = sourceCode.getLastToken(node);
            const firstIncComment = sourceCode.getTokenAfter(openBracket, {
                includeComments: true,
            });
            const lastIncComment = sourceCode.getTokenBefore(closeBracket, {
                includeComments: true,
            });
            const first = sourceCode.getTokenAfter(openBracket);
            const last = sourceCode.getTokenBefore(closeBracket);
            const needsLinebreaks = elements.length >= options.minItems ||
                (options.multiline &&
                    elements.length > 0 &&
                    firstIncComment.loc.start.line !== lastIncComment.loc.end.line) ||
                (elements.length === 0 &&
                    firstIncComment.type === "Block" &&
                    firstIncComment.loc.start.line !== lastIncComment.loc.end.line &&
                    firstIncComment === lastIncComment) ||
                (options.consistent &&
                    openBracket.loc.end.line !== first.loc.start.line);
            if (needsLinebreaks) {
                if ((0, ast_utils_1.isTokenOnSameLine)(openBracket, first)) {
                    reportRequiredBeginningLinebreak(node, openBracket);
                }
                if ((0, ast_utils_1.isTokenOnSameLine)(last, closeBracket)) {
                    reportRequiredEndingLinebreak(node, closeBracket);
                }
            }
            else {
                if (!(0, ast_utils_1.isTokenOnSameLine)(openBracket, first)) {
                    reportNoBeginningLinebreak(node, openBracket);
                }
                if (!(0, ast_utils_1.isTokenOnSameLine)(last, closeBracket)) {
                    reportNoEndingLinebreak(node, closeBracket);
                }
            }
        }
        return {
            YAMLSequence(node) {
                if (node.style === "flow") {
                    check(node);
                }
            },
        };
    },
});
