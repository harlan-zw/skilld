"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const eslint_utils_1 = require("@eslint-community/eslint-utils");
exports.default = (0, utils_1.createRule)("no-escape-sequence-in-identifier", {
    meta: {
        docs: {
            description: "disallow escape sequences in identifiers.",
            recommended: ["json", "jsonc", "json5"],
            extensionRule: false,
            layout: false,
        },
        fixable: "code",
        messages: {
            disallow: "Escape sequence in identifiers should not be used.",
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
        };
        function verify(node) {
            const escapeMatcher = new eslint_utils_1.PatternMatcher(/\\u\{[\dA-Fa-f]+\}|\\u\d{4}/gu);
            const text = sourceCode.text.slice(...node.range);
            for (const match of escapeMatcher.execAll(text)) {
                const start = match.index;
                const end = start + match[0].length;
                const range = [
                    start + node.range[0],
                    end + node.range[0],
                ];
                context.report({
                    loc: {
                        start: sourceCode.getLocFromIndex(range[0]),
                        end: sourceCode.getLocFromIndex(range[1]),
                    },
                    messageId: "disallow",
                    fix(fixer) {
                        const codePointStr = match[0][2] === "{"
                            ? text.slice(start + 3, end - 1)
                            : text.slice(start + 2, end);
                        const codePoint = Number(`0x${codePointStr}`);
                        return fixer.replaceTextRange(range, String.fromCodePoint(codePoint));
                    },
                });
            }
        }
    },
});
