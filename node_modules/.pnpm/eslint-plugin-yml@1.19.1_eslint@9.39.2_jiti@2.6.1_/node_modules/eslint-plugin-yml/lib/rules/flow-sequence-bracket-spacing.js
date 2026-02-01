"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../utils/index");
const compat_1 = require("../utils/compat");
const ast_utils_1 = require("../utils/ast-utils");
exports.default = (0, index_1.createRule)("flow-sequence-bracket-spacing", {
    meta: {
        docs: {
            description: "enforce consistent spacing inside flow sequence brackets",
            categories: ["standard"],
            extensionRule: "array-bracket-spacing",
            layout: true,
        },
        type: "layout",
        fixable: "whitespace",
        schema: [
            {
                type: "string",
                enum: ["always", "never"],
            },
            {
                type: "object",
                properties: {
                    singleValue: {
                        type: "boolean",
                    },
                    objectsInArrays: {
                        type: "boolean",
                    },
                    arraysInArrays: {
                        type: "boolean",
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unexpectedSpaceAfter: "There should be no space after '{{tokenValue}}'.",
            unexpectedSpaceBefore: "There should be no space before '{{tokenValue}}'.",
            missingSpaceAfter: "A space is required after '{{tokenValue}}'.",
            missingSpaceBefore: "A space is required before '{{tokenValue}}'.",
        },
    },
    create(context) {
        var _a;
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!((_a = sourceCode.parserServices) === null || _a === void 0 ? void 0 : _a.isYAML)) {
            return {};
        }
        const spaced = context.options[0] === "always";
        function isOptionSet(option) {
            return context.options[1]
                ? context.options[1][option] === !spaced
                : false;
        }
        const options = {
            spaced,
            singleElementException: isOptionSet("singleValue"),
            objectsInArraysException: isOptionSet("objectsInArrays"),
            arraysInArraysException: isOptionSet("arraysInArrays"),
            isOpeningBracketMustBeSpaced(node) {
                if (options.singleElementException && node.entries.length === 1) {
                    return !options.spaced;
                }
                const firstElement = node.entries[0];
                return firstElement &&
                    ((options.objectsInArraysException && isObjectType(firstElement)) ||
                        (options.arraysInArraysException && isArrayType(firstElement)))
                    ? !options.spaced
                    : options.spaced;
            },
            isClosingBracketMustBeSpaced(node) {
                if (options.singleElementException && node.entries.length === 1) {
                    return !options.spaced;
                }
                const lastElement = node.entries[node.entries.length - 1];
                return lastElement &&
                    ((options.objectsInArraysException && isObjectType(lastElement)) ||
                        (options.arraysInArraysException && isArrayType(lastElement)))
                    ? !options.spaced
                    : options.spaced;
            },
        };
        function reportNoBeginningSpace(node, token) {
            const nextToken = sourceCode.getTokenAfter(token);
            context.report({
                node,
                loc: { start: token.loc.end, end: nextToken.loc.start },
                messageId: "unexpectedSpaceAfter",
                data: {
                    tokenValue: token.value,
                },
                fix(fixer) {
                    return fixer.removeRange([token.range[1], nextToken.range[0]]);
                },
            });
        }
        function reportNoEndingSpace(node, token) {
            const previousToken = sourceCode.getTokenBefore(token);
            context.report({
                node,
                loc: { start: previousToken.loc.end, end: token.loc.start },
                messageId: "unexpectedSpaceBefore",
                data: {
                    tokenValue: token.value,
                },
                fix(fixer) {
                    return fixer.removeRange([previousToken.range[1], token.range[0]]);
                },
            });
        }
        function reportRequiredBeginningSpace(node, token) {
            context.report({
                node,
                loc: token.loc,
                messageId: "missingSpaceAfter",
                data: {
                    tokenValue: token.value,
                },
                fix(fixer) {
                    return fixer.insertTextAfter(token, " ");
                },
            });
        }
        function reportRequiredEndingSpace(node, token) {
            context.report({
                node,
                loc: token.loc,
                messageId: "missingSpaceBefore",
                data: {
                    tokenValue: token.value,
                },
                fix(fixer) {
                    return fixer.insertTextBefore(token, " ");
                },
            });
        }
        function isObjectType(node) {
            return node && node.type === "YAMLMapping";
        }
        function isArrayType(node) {
            return node && node.type === "YAMLSequence";
        }
        function validateArraySpacing(node) {
            if (options.spaced && node.entries.length === 0)
                return;
            const first = sourceCode.getFirstToken(node);
            const last = sourceCode.getLastToken(node);
            const second = sourceCode.getTokenAfter(first, {
                includeComments: true,
            });
            const penultimate = sourceCode.getTokenBefore(last, {
                includeComments: true,
            });
            if ((0, ast_utils_1.isTokenOnSameLine)(first, second)) {
                if (options.isOpeningBracketMustBeSpaced(node)) {
                    if (!sourceCode.isSpaceBetweenTokens(first, second))
                        reportRequiredBeginningSpace(node, first);
                }
                else {
                    if (sourceCode.isSpaceBetweenTokens(first, second))
                        reportNoBeginningSpace(node, first);
                }
            }
            if (first !== penultimate && (0, ast_utils_1.isTokenOnSameLine)(penultimate, last)) {
                if (options.isClosingBracketMustBeSpaced(node)) {
                    if (!sourceCode.isSpaceBetweenTokens(penultimate, last))
                        reportRequiredEndingSpace(node, last);
                }
                else {
                    if (sourceCode.isSpaceBetweenTokens(penultimate, last))
                        reportNoEndingSpace(node, last);
                }
            }
        }
        return {
            YAMLSequence(node) {
                if (node.style === "flow") {
                    validateArraySpacing(node);
                }
            },
        };
    },
});
