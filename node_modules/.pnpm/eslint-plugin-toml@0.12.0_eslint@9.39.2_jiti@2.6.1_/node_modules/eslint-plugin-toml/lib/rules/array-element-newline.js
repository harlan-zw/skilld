"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const compat_1 = require("../utils/compat");
const ast_utils_1 = require("../utils/ast-utils");
exports.default = (0, utils_1.createRule)("array-element-newline", {
    meta: {
        docs: {
            description: "enforce line breaks between array elements",
            categories: ["standard"],
            extensionRule: "array-element-newline",
        },
        type: "layout",
        fixable: "whitespace",
        schema: {
            definitions: {
                basicConfig: {
                    oneOf: [
                        {
                            type: "string",
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
            },
            type: "array",
            items: [
                {
                    oneOf: [
                        {
                            $ref: "#/definitions/basicConfig",
                        },
                        {
                            type: "object",
                            properties: {
                                ArrayExpression: {
                                    $ref: "#/definitions/basicConfig",
                                },
                                ArrayPattern: {
                                    $ref: "#/definitions/basicConfig",
                                },
                                TOMLArray: {
                                    $ref: "#/definitions/basicConfig",
                                },
                            },
                            additionalProperties: false,
                            minProperties: 1,
                        },
                    ],
                },
            ],
        },
        messages: {
            unexpectedLineBreak: "There should be no linebreak here.",
            missingLineBreak: "There should be a linebreak after this element.",
        },
    },
    create(context) {
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!sourceCode.parserServices?.isTOML) {
            return {};
        }
        function normalizeOptionValue(providedOption) {
            let consistent = false;
            let multiline = false;
            let minItems;
            const option = providedOption || "always";
            if (!option ||
                option === "always" ||
                (typeof option === "object" && option.minItems === 0)) {
                minItems = 0;
            }
            else if (option === "never") {
                minItems = Number.POSITIVE_INFINITY;
            }
            else if (option === "consistent") {
                consistent = true;
                minItems = Number.POSITIVE_INFINITY;
            }
            else {
                multiline = Boolean(option.multiline);
                minItems = option.minItems || Number.POSITIVE_INFINITY;
            }
            return { consistent, multiline, minItems };
        }
        function normalizeOptions(options) {
            if (options && (options.ArrayExpression || options.TOMLArray)) {
                let expressionOptions;
                if (options.ArrayExpression)
                    expressionOptions = normalizeOptionValue(options.ArrayExpression);
                if (options.TOMLArray)
                    expressionOptions = normalizeOptionValue(options.TOMLArray);
                return {
                    TOMLArray: expressionOptions,
                };
            }
            const value = normalizeOptionValue(options);
            return { TOMLArray: value };
        }
        function reportNoLineBreak(token) {
            const tokenBefore = sourceCode.getTokenBefore(token, {
                includeComments: true,
            });
            context.report({
                loc: {
                    start: tokenBefore.loc.end,
                    end: token.loc.start,
                },
                messageId: "unexpectedLineBreak",
                fix(fixer) {
                    if ((0, ast_utils_1.isCommentToken)(tokenBefore))
                        return null;
                    if (!(0, ast_utils_1.isTokenOnSameLine)(tokenBefore, token))
                        return fixer.replaceTextRange([tokenBefore.range[1], token.range[0]], " ");
                    const twoTokensBefore = sourceCode.getTokenBefore(tokenBefore, {
                        includeComments: true,
                    });
                    if ((0, ast_utils_1.isCommentToken)(twoTokensBefore))
                        return null;
                    return fixer.replaceTextRange([twoTokensBefore.range[1], tokenBefore.range[0]], "");
                },
            });
        }
        function reportRequiredLineBreak(token) {
            const tokenBefore = sourceCode.getTokenBefore(token, {
                includeComments: true,
            });
            context.report({
                loc: {
                    start: tokenBefore.loc.end,
                    end: token.loc.start,
                },
                messageId: "missingLineBreak",
                fix(fixer) {
                    return fixer.replaceTextRange([tokenBefore.range[1], token.range[0]], "\n");
                },
            });
        }
        function check(node) {
            const elements = node.elements;
            const normalizedOptions = normalizeOptions(context.options[0]);
            const options = normalizedOptions[node.type];
            if (!options)
                return;
            let elementBreak = false;
            if (options.multiline) {
                elementBreak = elements
                    .filter((element) => element !== null)
                    .some((element) => element.loc.start.line !== element.loc.end.line);
            }
            let linebreaksCount = 0;
            for (let i = 0; i < node.elements.length; i++) {
                const element = node.elements[i];
                const previousElement = elements[i - 1];
                if (i === 0 || element === null || previousElement === null)
                    continue;
                const commaToken = sourceCode.getFirstTokenBetween(previousElement, element, ast_utils_1.isCommaToken);
                const lastTokenOfPreviousElement = sourceCode.getTokenBefore(commaToken);
                const firstTokenOfCurrentElement = sourceCode.getTokenAfter(commaToken);
                if (!(0, ast_utils_1.isTokenOnSameLine)(lastTokenOfPreviousElement, firstTokenOfCurrentElement))
                    linebreaksCount++;
            }
            const needsLinebreaks = elements.length >= options.minItems ||
                (options.multiline && elementBreak) ||
                (options.consistent &&
                    linebreaksCount > 0 &&
                    linebreaksCount < node.elements.length);
            elements.forEach((element, i) => {
                const previousElement = elements[i - 1];
                if (i === 0 || element === null || previousElement === null)
                    return;
                const commaToken = sourceCode.getFirstTokenBetween(previousElement, element, ast_utils_1.isCommaToken);
                const lastTokenOfPreviousElement = sourceCode.getTokenBefore(commaToken);
                const firstTokenOfCurrentElement = sourceCode.getTokenAfter(commaToken);
                if (needsLinebreaks) {
                    if ((0, ast_utils_1.isTokenOnSameLine)(lastTokenOfPreviousElement, firstTokenOfCurrentElement))
                        reportRequiredLineBreak(firstTokenOfCurrentElement);
                }
                else {
                    if (!(0, ast_utils_1.isTokenOnSameLine)(lastTokenOfPreviousElement, firstTokenOfCurrentElement))
                        reportNoLineBreak(firstTokenOfCurrentElement);
                }
            });
        }
        return {
            TOMLArray: check,
        };
    },
});
