"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const mention_1 = require("../utils/mention");
const unicode_1 = require("../utils/unicode");
const CONTROL_CHARS = new Map([
    [0, "\\0"],
    [unicode_1.CP_TAB, "\\t"],
    [unicode_1.CP_LF, "\\n"],
    [unicode_1.CP_VT, "\\v"],
    [unicode_1.CP_FF, "\\f"],
    [unicode_1.CP_CR, "\\r"],
]);
const ALLOWED_CONTROL_CHARS = /^\\[0fnrtv]$/u;
exports.default = (0, utils_1.createRule)("no-control-character", {
    meta: {
        docs: {
            description: "disallow control characters",
            category: "Possible Errors",
            recommended: false,
        },
        schema: [],
        messages: {
            unexpected: "Unexpected control character {{ char }}.",
            escape: "Use {{ escape }} instead.",
        },
        type: "suggestion",
        hasSuggestions: true,
    },
    create(context) {
        function createVisitor(regexpContext) {
            const { node, patternSource, getRegexpLocation, fixReplaceNode } = regexpContext;
            function isBadEscapeRaw(raw, cp) {
                return (raw.codePointAt(0) === cp ||
                    raw.startsWith("\\x") ||
                    raw.startsWith("\\u"));
            }
            function isAllowedEscapeRaw(raw) {
                return (ALLOWED_CONTROL_CHARS.test(raw) ||
                    (raw.startsWith("\\") &&
                        ALLOWED_CONTROL_CHARS.test(raw.slice(1))));
            }
            function isBadEscape(char) {
                var _a;
                const range = (_a = patternSource.getReplaceRange(char)) === null || _a === void 0 ? void 0 : _a.range;
                const sourceRaw = range
                    ? context.sourceCode.text.slice(...range)
                    : char.raw;
                if (isAllowedEscapeRaw(char.raw) ||
                    isAllowedEscapeRaw(sourceRaw)) {
                    return false;
                }
                return (isBadEscapeRaw(char.raw, char.value) ||
                    (char.raw.startsWith("\\") &&
                        isBadEscapeRaw(char.raw.slice(1), char.value)));
            }
            return {
                onCharacterEnter(cNode) {
                    if (cNode.value <= 0x1f && isBadEscape(cNode)) {
                        const suggest = [];
                        const allowedEscape = CONTROL_CHARS.get(cNode.value);
                        if (allowedEscape !== undefined) {
                            suggest.push({
                                messageId: "escape",
                                data: { escape: (0, mention_1.mention)(allowedEscape) },
                                fix: fixReplaceNode(cNode, allowedEscape),
                            });
                        }
                        context.report({
                            node,
                            loc: getRegexpLocation(cNode),
                            messageId: "unexpected",
                            data: { char: (0, mention_1.mentionChar)(cNode) },
                            suggest,
                        });
                    }
                },
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
