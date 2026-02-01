"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const regex_syntax_1 = require("../utils/regex-syntax");
exports.default = (0, utils_1.createRule)("hexadecimal-escape", {
    meta: {
        docs: {
            description: "enforce consistent usage of hexadecimal escape",
            category: "Stylistic Issues",
            recommended: false,
        },
        fixable: "code",
        schema: [
            {
                enum: ["always", "never"],
            },
        ],
        messages: {
            expectedHexEscape: "Expected hexadecimal escape ('{{hexEscape}}'), but {{unexpectedKind}} escape ('{{rejectEscape}}') is used.",
            unexpectedHexEscape: "Unexpected hexadecimal escape ('{{hexEscape}}').",
        },
        type: "suggestion",
    },
    create(context) {
        const always = context.options[0] !== "never";
        function verifyForAlways({ node, getRegexpLocation, fixReplaceNode }, kind, cNode) {
            if (kind !== regex_syntax_1.EscapeSequenceKind.unicode &&
                kind !== regex_syntax_1.EscapeSequenceKind.unicodeCodePoint) {
                return;
            }
            const hexEscape = `\\x${cNode.value.toString(16).padStart(2, "0")}`;
            context.report({
                node,
                loc: getRegexpLocation(cNode),
                messageId: "expectedHexEscape",
                data: {
                    hexEscape,
                    unexpectedKind: kind,
                    rejectEscape: cNode.raw,
                },
                fix: fixReplaceNode(cNode, hexEscape),
            });
        }
        function verifyForNever({ node, getRegexpLocation, fixReplaceNode }, kind, cNode) {
            if (kind !== regex_syntax_1.EscapeSequenceKind.hexadecimal) {
                return;
            }
            context.report({
                node,
                loc: getRegexpLocation(cNode),
                messageId: "unexpectedHexEscape",
                data: {
                    hexEscape: cNode.raw,
                },
                fix: fixReplaceNode(cNode, () => `\\u00${cNode.raw.slice(2)}`),
            });
        }
        const verify = always ? verifyForAlways : verifyForNever;
        function createVisitor(regexpContext) {
            return {
                onCharacterEnter(cNode) {
                    if (cNode.value > 0xff) {
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
