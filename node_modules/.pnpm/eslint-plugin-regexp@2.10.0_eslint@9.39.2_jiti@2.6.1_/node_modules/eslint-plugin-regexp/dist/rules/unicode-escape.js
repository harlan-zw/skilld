"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const regex_syntax_1 = require("../utils/regex-syntax");
exports.default = (0, utils_1.createRule)("unicode-escape", {
    meta: {
        docs: {
            description: "enforce consistent usage of unicode escape or unicode codepoint escape",
            category: "Stylistic Issues",
            recommended: false,
        },
        fixable: "code",
        schema: [
            {
                enum: ["unicodeCodePointEscape", "unicodeEscape"],
            },
        ],
        messages: {
            expectedUnicodeCodePointEscape: "Expected unicode code point escape ('{{unicodeCodePointEscape}}'), but unicode escape ('{{unicodeEscape}}') is used.",
            expectedUnicodeEscape: "Expected unicode escape ('{{unicodeEscape}}'), but unicode code point escape ('{{unicodeCodePointEscape}}') is used.",
        },
        type: "suggestion",
    },
    create(context) {
        const preferUnicodeCodePointEscape = context.options[0] !== "unicodeEscape";
        function verifyForUnicodeCodePointEscape({ node, getRegexpLocation, fixReplaceNode }, kind, cNode) {
            if (kind !== regex_syntax_1.EscapeSequenceKind.unicode) {
                return;
            }
            const unicodeCodePointEscape = `\\u{${cNode.value.toString(16)}}`;
            context.report({
                node,
                loc: getRegexpLocation(cNode),
                messageId: "expectedUnicodeCodePointEscape",
                data: {
                    unicodeCodePointEscape,
                    unicodeEscape: cNode.raw,
                },
                fix: fixReplaceNode(cNode, unicodeCodePointEscape),
            });
        }
        function verifyForUnicodeEscape({ node, getRegexpLocation, fixReplaceNode }, kind, cNode) {
            if (kind !== regex_syntax_1.EscapeSequenceKind.unicodeCodePoint) {
                return;
            }
            const unicodeEscape = `\\u${cNode.value
                .toString(16)
                .padStart(4, "0")}`;
            context.report({
                node,
                loc: getRegexpLocation(cNode),
                messageId: "expectedUnicodeEscape",
                data: {
                    unicodeEscape,
                    unicodeCodePointEscape: cNode.raw,
                },
                fix: fixReplaceNode(cNode, unicodeEscape),
            });
        }
        const verify = preferUnicodeCodePointEscape
            ? verifyForUnicodeCodePointEscape
            : verifyForUnicodeEscape;
        function createVisitor(regexpContext) {
            const { flags } = regexpContext;
            if (!flags.unicode && !flags.unicodeSets) {
                return {};
            }
            return {
                onCharacterEnter(cNode) {
                    if (cNode.value >= 0x10000) {
                        return;
                    }
                    const kind = (0, regex_syntax_1.getEscapeSequenceKind)(cNode.raw);
                    if (!kind) {
                        return;
                    }
                    verify(regexpContext, kind, cNode);
                },
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
