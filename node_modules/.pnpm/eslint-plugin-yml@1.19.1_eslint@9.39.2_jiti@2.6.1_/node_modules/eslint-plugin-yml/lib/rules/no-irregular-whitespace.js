"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../utils/index");
const compat_1 = require("../utils/compat");
const ALL_IRREGULARS = /[\v\f\u0085\u00a0\u1680\u180e\u2000-\u200b\u2028\u2029\u202f\u205f\u3000\ufeff]/u;
const IRREGULAR_WHITESPACE = /[\v\f\u0085\u00a0\u1680\u180e\u2000-\u200b\u202f\u205f\u3000\ufeff]+/gu;
const IRREGULAR_LINE_TERMINATORS = /[\u2028\u2029]/gu;
exports.default = (0, index_1.createRule)("no-irregular-whitespace", {
    meta: {
        docs: {
            description: "disallow irregular whitespace",
            categories: ["recommended", "standard"],
            extensionRule: "no-irregular-whitespace",
            layout: false,
        },
        schema: [
            {
                type: "object",
                properties: {
                    skipComments: {
                        type: "boolean",
                        default: false,
                    },
                    skipQuotedScalars: {
                        type: "boolean",
                        default: true,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            disallow: "Irregular whitespace not allowed.",
        },
        type: "problem",
    },
    create(context) {
        var _a;
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!((_a = sourceCode.parserServices) === null || _a === void 0 ? void 0 : _a.isYAML)) {
            return {};
        }
        let errorIndexes = [];
        const options = context.options[0] || {};
        const skipComments = Boolean(options.skipComments);
        const skipQuotedScalars = options.skipQuotedScalars !== false;
        function removeWhitespaceError(node) {
            const [startIndex, endIndex] = node.range;
            errorIndexes = errorIndexes.filter((errorIndex) => errorIndex < startIndex || endIndex <= errorIndex);
        }
        function removeInvalidNodeErrorsInScalar(node) {
            if (skipQuotedScalars &&
                (node.style === "double-quoted" || node.style === "single-quoted")) {
                if (ALL_IRREGULARS.test(sourceCode.getText(node))) {
                    removeWhitespaceError(node);
                }
            }
        }
        function removeInvalidNodeErrorsInComment(node) {
            if (ALL_IRREGULARS.test(node.value)) {
                removeWhitespaceError(node);
            }
        }
        function checkForIrregularWhitespace() {
            const source = sourceCode.getText();
            let match;
            while ((match = IRREGULAR_WHITESPACE.exec(source)) !== null) {
                errorIndexes.push(match.index);
            }
            while ((match = IRREGULAR_LINE_TERMINATORS.exec(source)) !== null) {
                errorIndexes.push(match.index);
            }
        }
        checkForIrregularWhitespace();
        if (!errorIndexes.length) {
            return {};
        }
        return {
            YAMLScalar: removeInvalidNodeErrorsInScalar,
            "Program:exit"() {
                if (skipComments) {
                    sourceCode.getAllComments().forEach(removeInvalidNodeErrorsInComment);
                }
                for (const errorIndex of errorIndexes) {
                    context.report({
                        loc: sourceCode.getLocFromIndex(errorIndex),
                        messageId: "disallow",
                    });
                }
            },
        };
    },
});
