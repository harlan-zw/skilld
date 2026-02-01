"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const eslint_ast_utils_1 = require("../utils/eslint-ast-utils");
exports.default = (0, utils_1.createRule)("array-bracket-spacing", {
    meta: {
        docs: {
            description: "disallow or enforce spaces inside of brackets",
            recommended: null,
            extensionRule: true,
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
        const sourceCode = context.sourceCode;
        if (!sourceCode.parserServices.isJSON) {
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
                if (options.singleElementException && node.elements.length === 1) {
                    return !options.spaced;
                }
                const firstElement = node.elements[0];
                return firstElement &&
                    ((options.objectsInArraysException && isObjectType(firstElement)) ||
                        (options.arraysInArraysException && isArrayType(firstElement)))
                    ? !options.spaced
                    : options.spaced;
            },
            isClosingBracketMustBeSpaced(node) {
                if (options.singleElementException && node.elements.length === 1) {
                    return !options.spaced;
                }
                const lastElement = node.elements[node.elements.length - 1];
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
                node: node,
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
                node: node,
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
                node: node,
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
                node: node,
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
            return node && node.type === "JSONObjectExpression";
        }
        function isArrayType(node) {
            return node && node.type === "JSONArrayExpression";
        }
        function validateArraySpacing(node) {
            if (options.spaced && node.elements.length === 0)
                return;
            const first = sourceCode.getFirstToken(node);
            const second = sourceCode.getFirstToken(node, 1);
            const last = sourceCode.getLastToken(node);
            const penultimate = sourceCode.getTokenBefore(last);
            if ((0, eslint_ast_utils_1.isTokenOnSameLine)(first, second)) {
                if (options.isOpeningBracketMustBeSpaced(node)) {
                    if (!sourceCode.isSpaceBetween(first, second))
                        reportRequiredBeginningSpace(node, first);
                }
                else {
                    if (sourceCode.isSpaceBetween(first, second))
                        reportNoBeginningSpace(node, first);
                }
            }
            if (first !== penultimate && (0, eslint_ast_utils_1.isTokenOnSameLine)(penultimate, last)) {
                if (options.isClosingBracketMustBeSpaced(node)) {
                    if (!sourceCode.isSpaceBetween(penultimate, last))
                        reportRequiredEndingSpace(node, last);
                }
                else {
                    if (sourceCode.isSpaceBetween(penultimate, last))
                        reportNoEndingSpace(node, last);
                }
            }
        }
        return {
            JSONArrayExpression: validateArraySpacing,
        };
    },
});
