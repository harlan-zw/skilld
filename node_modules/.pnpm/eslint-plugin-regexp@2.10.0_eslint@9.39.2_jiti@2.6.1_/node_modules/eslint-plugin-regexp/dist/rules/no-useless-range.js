"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("no-useless-range", {
    meta: {
        docs: {
            description: "disallow unnecessary character ranges",
            category: "Best Practices",
            recommended: true,
        },
        fixable: "code",
        schema: [],
        messages: {
            unexpected: "Unexpected unnecessary character ranges. The hyphen is unnecessary.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor({ node, fixReplaceNode, getRegexpLocation, }) {
            return {
                onCharacterClassRangeEnter(ccrNode) {
                    if (ccrNode.min.value !== ccrNode.max.value &&
                        ccrNode.min.value + 1 !== ccrNode.max.value) {
                        return;
                    }
                    context.report({
                        node,
                        loc: getRegexpLocation(ccrNode),
                        messageId: "unexpected",
                        fix: fixReplaceNode(ccrNode, () => {
                            const parent = ccrNode.parent;
                            const rawBefore = parent.raw.slice(0, ccrNode.start - parent.start);
                            const rawAfter = parent.raw.slice(ccrNode.end - parent.start);
                            if (/\\(?:x[\dA-Fa-f]?|u[\dA-Fa-f]{0,3})?$/u.test(rawBefore)) {
                                return null;
                            }
                            let text = ccrNode.min.raw;
                            if (ccrNode.min.value < ccrNode.max.value) {
                                if (ccrNode.max.raw === "-") {
                                    text += `\\-`;
                                }
                                else {
                                    text += `${ccrNode.max.raw}`;
                                }
                            }
                            if (rawAfter.startsWith("-")) {
                                text += "\\";
                            }
                            return text;
                        }),
                    });
                },
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
