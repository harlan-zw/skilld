"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../utils/index");
const compat_1 = require("../utils/compat");
const ast_utils_1 = require("../utils/ast-utils");
exports.default = (0, index_1.createRule)("flow-mapping-curly-spacing", {
    meta: {
        docs: {
            description: "enforce consistent spacing inside braces",
            categories: ["standard"],
            extensionRule: "object-curly-spacing",
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
                    arraysInObjects: {
                        type: "boolean",
                    },
                    objectsInObjects: {
                        type: "boolean",
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            requireSpaceBefore: "A space is required before '{{token}}'.",
            requireSpaceAfter: "A space is required after '{{token}}'.",
            unexpectedSpaceBefore: "There should be no space before '{{token}}'.",
            unexpectedSpaceAfter: "There should be no space after '{{token}}'.",
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
            arraysInObjectsException: isOptionSet("arraysInObjects"),
            objectsInObjectsException: isOptionSet("objectsInObjects"),
            isOpeningCurlyBraceMustBeSpaced(second) {
                var _a;
                const targetPenultimateType = options.arraysInObjectsException && (0, ast_utils_1.isOpeningBracketToken)(second)
                    ? "YAMLSequence"
                    : options.objectsInObjectsException && (0, ast_utils_1.isOpeningBraceToken)(second)
                        ? "YAMLMapping"
                        : null;
                return targetPenultimateType &&
                    ((_a = sourceCode.getNodeByRangeIndex(second.range[0])) === null || _a === void 0 ? void 0 : _a.type) ===
                        targetPenultimateType
                    ? !options.spaced
                    : options.spaced;
            },
            isClosingCurlyBraceMustBeSpaced(penultimate) {
                var _a;
                const targetPenultimateType = options.arraysInObjectsException && (0, ast_utils_1.isClosingBracketToken)(penultimate)
                    ? "YAMLSequence"
                    : options.objectsInObjectsException &&
                        (0, ast_utils_1.isClosingBraceToken)(penultimate)
                        ? "YAMLMapping"
                        : null;
                return targetPenultimateType &&
                    ((_a = sourceCode.getNodeByRangeIndex(penultimate.range[0])) === null || _a === void 0 ? void 0 : _a.type) ===
                        targetPenultimateType
                    ? !options.spaced
                    : options.spaced;
            },
        };
        function reportNoBeginningSpace(node, token) {
            const nextToken = sourceCode.getTokenAfter(token, {
                includeComments: true,
            });
            context.report({
                node,
                loc: { start: token.loc.end, end: nextToken.loc.start },
                messageId: "unexpectedSpaceAfter",
                data: {
                    token: token.value,
                },
                fix(fixer) {
                    return fixer.removeRange([token.range[1], nextToken.range[0]]);
                },
            });
        }
        function reportNoEndingSpace(node, token) {
            const previousToken = sourceCode.getTokenBefore(token, {
                includeComments: true,
            });
            context.report({
                node,
                loc: { start: previousToken.loc.end, end: token.loc.start },
                messageId: "unexpectedSpaceBefore",
                data: {
                    token: token.value,
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
                messageId: "requireSpaceAfter",
                data: {
                    token: token.value,
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
                messageId: "requireSpaceBefore",
                data: {
                    token: token.value,
                },
                fix(fixer) {
                    return fixer.insertTextBefore(token, " ");
                },
            });
        }
        function validateBraceSpacing(node, first, second, penultimate, last) {
            if ((0, ast_utils_1.isTokenOnSameLine)(first, second)) {
                const firstSpaced = sourceCode.isSpaceBetweenTokens(first, second);
                if (options.isOpeningCurlyBraceMustBeSpaced(second)) {
                    if (!firstSpaced)
                        reportRequiredBeginningSpace(node, first);
                }
                else {
                    if (firstSpaced && second.type !== "Line")
                        reportNoBeginningSpace(node, first);
                }
            }
            if ((0, ast_utils_1.isTokenOnSameLine)(penultimate, last)) {
                const lastSpaced = sourceCode.isSpaceBetweenTokens(penultimate, last);
                if (options.isClosingCurlyBraceMustBeSpaced(penultimate)) {
                    if (!lastSpaced)
                        reportRequiredEndingSpace(node, last);
                }
                else {
                    if (lastSpaced)
                        reportNoEndingSpace(node, last);
                }
            }
        }
        function getClosingBraceOfObject(node) {
            const lastProperty = node.pairs[node.pairs.length - 1];
            return sourceCode.getTokenAfter(lastProperty, ast_utils_1.isClosingBraceToken);
        }
        function checkForObject(node) {
            if (node.pairs.length === 0)
                return;
            const first = sourceCode.getFirstToken(node);
            const last = getClosingBraceOfObject(node);
            const second = sourceCode.getTokenAfter(first, {
                includeComments: true,
            });
            const penultimate = sourceCode.getTokenBefore(last, {
                includeComments: true,
            });
            validateBraceSpacing(node, first, second, penultimate, last);
        }
        return {
            YAMLMapping(node) {
                if (node.style === "flow") {
                    checkForObject(node);
                }
            },
        };
    },
});
