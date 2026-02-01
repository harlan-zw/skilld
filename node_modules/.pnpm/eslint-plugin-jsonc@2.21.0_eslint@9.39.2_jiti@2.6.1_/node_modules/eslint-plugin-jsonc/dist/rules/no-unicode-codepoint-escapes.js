"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const eslint_utils_1 = require("@eslint-community/eslint-utils");
exports.default = (0, utils_1.createRule)("no-unicode-codepoint-escapes", {
    meta: {
        docs: {
            description: "disallow Unicode code point escape sequences.",
            recommended: ["json", "jsonc", "json5"],
            extensionRule: false,
            layout: false,
        },
        fixable: "code",
        messages: {
            disallow: "Unicode code point escape sequence should not be used.",
        },
        schema: [],
        type: "problem",
    },
    create(context) {
        const sourceCode = context.sourceCode;
        if (!sourceCode.parserServices.isJSON) {
            return {};
        }
        return {
            JSONIdentifier(node) {
                verify(node);
            },
            JSONLiteral(node) {
                if (typeof node.value === "string") {
                    verify(node);
                }
            },
            JSONTemplateElement(node) {
                verify(node);
            },
        };
        function verify(node) {
            const codePointEscapeMatcher = new eslint_utils_1.PatternMatcher(/\\u\{[\dA-Fa-f]+\}/gu);
            const text = sourceCode.text.slice(...node.range);
            for (const match of codePointEscapeMatcher.execAll(text)) {
                const start = match.index;
                const end = start + match[0].length;
                const range = [start + node.range[0], end + node.range[0]];
                context.report({
                    loc: {
                        start: sourceCode.getLocFromIndex(range[0]),
                        end: sourceCode.getLocFromIndex(range[1]),
                    },
                    messageId: "disallow",
                    fix(fixer) {
                        const codePointStr = text.slice(start + 3, end - 1);
                        let codePoint = Number(`0x${codePointStr}`);
                        let replacement = null;
                        if (codePoint <= 0xffff) {
                            replacement = toHex(codePoint);
                        }
                        else {
                            codePoint -= 0x10000;
                            const highSurrogate = (codePoint >> 10) + 0xd800;
                            const lowSurrogate = (codePoint % 0x400) + 0xdc00;
                            replacement = `${toHex(highSurrogate)}\\u${toHex(lowSurrogate)}`;
                        }
                        return fixer.replaceTextRange([range[0] + 2, range[1]], replacement);
                    },
                });
            }
        }
        function toHex(num) {
            return `0000${num.toString(16).toUpperCase()}`.substr(-4);
        }
    },
});
