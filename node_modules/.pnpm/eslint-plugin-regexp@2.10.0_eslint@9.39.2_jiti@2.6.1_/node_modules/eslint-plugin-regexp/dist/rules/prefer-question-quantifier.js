"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const mention_1 = require("../utils/mention");
const regexp_ast_1 = require("../utils/regexp-ast");
exports.default = (0, utils_1.createRule)("prefer-question-quantifier", {
    meta: {
        docs: {
            description: "enforce using `?` quantifier",
            category: "Stylistic Issues",
            recommended: true,
        },
        fixable: "code",
        schema: [],
        messages: {
            unexpected: "Unexpected quantifier '{{expr}}'. Use '?' instead.",
            unexpectedGroup: "Unexpected group {{expr}}. Use '{{instead}}' instead.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor({ node, getRegexpLocation, fixReplaceQuant, fixReplaceNode, }) {
            return {
                onQuantifierEnter(qNode) {
                    if (qNode.min === 0 && qNode.max === 1) {
                        const [startOffset, endOffset] = (0, regexp_ast_1.getQuantifierOffsets)(qNode);
                        const text = qNode.raw.slice(startOffset, endOffset);
                        if (text !== "?") {
                            context.report({
                                node,
                                loc: getRegexpLocation(qNode, [
                                    startOffset,
                                    endOffset,
                                ]),
                                messageId: "unexpected",
                                data: {
                                    expr: text,
                                },
                                fix: fixReplaceQuant(qNode, "?"),
                            });
                        }
                    }
                },
                onGroupEnter(gNode) {
                    const lastAlt = gNode.alternatives[gNode.alternatives.length - 1];
                    if (!lastAlt.elements.length) {
                        const alternatives = gNode.alternatives.slice(0, -1);
                        while (alternatives.length > 0) {
                            if (!alternatives[alternatives.length - 1].elements
                                .length) {
                                alternatives.pop();
                                continue;
                            }
                            break;
                        }
                        if (!alternatives.length) {
                            return;
                        }
                        let reportNode = gNode;
                        const instead = `(?:${alternatives
                            .map((ne) => ne.raw)
                            .join("|")})?`;
                        if (gNode.parent.type === "Quantifier") {
                            if (gNode.parent.greedy &&
                                gNode.parent.min === 0 &&
                                gNode.parent.max === 1) {
                                reportNode = gNode.parent;
                            }
                            else {
                                return;
                            }
                        }
                        context.report({
                            node,
                            loc: getRegexpLocation(reportNode),
                            messageId: "unexpectedGroup",
                            data: {
                                expr: (0, mention_1.mention)(reportNode),
                                instead,
                            },
                            fix: fixReplaceNode(reportNode, instead),
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
