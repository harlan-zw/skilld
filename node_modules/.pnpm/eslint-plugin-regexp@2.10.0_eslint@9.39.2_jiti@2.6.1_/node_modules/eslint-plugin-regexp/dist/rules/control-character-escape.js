"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const utils_2 = require("../utils/ast-utils/utils");
const mention_1 = require("../utils/mention");
const CONTROL_CHARS = new Map([
    [0, "\\0"],
    [utils_1.CP_TAB, "\\t"],
    [utils_1.CP_LF, "\\n"],
    [utils_1.CP_VT, "\\v"],
    [utils_1.CP_FF, "\\f"],
    [utils_1.CP_CR, "\\r"],
]);
function isRegExpLiteralAt({ node, patternSource }, at) {
    if ((0, utils_2.isRegexpLiteral)(node)) {
        return true;
    }
    const replaceRange = patternSource.getReplaceRange(at);
    if (replaceRange && replaceRange.type === "RegExp") {
        return true;
    }
    return false;
}
exports.default = (0, utils_1.createRule)("control-character-escape", {
    meta: {
        docs: {
            description: "enforce consistent escaping of control characters",
            category: "Best Practices",
            recommended: true,
        },
        fixable: "code",
        schema: [],
        messages: {
            unexpected: "Unexpected control character escape {{actual}}. Use '{{expected}}' instead.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor(regexpContext) {
            const { node, getRegexpLocation, fixReplaceNode } = regexpContext;
            return {
                onCharacterEnter(cNode) {
                    if (cNode.parent.type === "CharacterClassRange") {
                        return;
                    }
                    const expectedRaw = CONTROL_CHARS.get(cNode.value);
                    if (expectedRaw === undefined) {
                        return;
                    }
                    if (cNode.raw === expectedRaw) {
                        return;
                    }
                    if (!isRegExpLiteralAt(regexpContext, cNode) &&
                        cNode.raw === String.fromCodePoint(cNode.value)) {
                        return;
                    }
                    context.report({
                        node,
                        loc: getRegexpLocation(cNode),
                        messageId: "unexpected",
                        data: {
                            actual: (0, mention_1.mentionChar)(cNode),
                            expected: expectedRaw,
                        },
                        fix: fixReplaceNode(cNode, expectedRaw),
                    });
                },
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
