"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const regexp_ast_1 = require("../utils/regexp-ast");
exports.default = (0, utils_1.createRule)("prefer-plus-quantifier", {
    meta: {
        docs: {
            description: "enforce using `+` quantifier",
            category: "Stylistic Issues",
            recommended: true,
        },
        fixable: "code",
        schema: [],
        messages: {
            unexpected: "Unexpected quantifier '{{expr}}'. Use '+' instead.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor({ node, getRegexpLocation, fixReplaceQuant, }) {
            return {
                onQuantifierEnter(qNode) {
                    if (qNode.min === 1 && qNode.max === Infinity) {
                        const [startOffset, endOffset] = (0, regexp_ast_1.getQuantifierOffsets)(qNode);
                        const text = qNode.raw.slice(startOffset, endOffset);
                        if (text !== "+") {
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
                                fix: fixReplaceQuant(qNode, "+"),
                            });
                        }
                    }
                },
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
