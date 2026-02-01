"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const regexp_ast_1 = require("../utils/regexp-ast");
exports.default = (0, utils_1.createRule)("no-useless-two-nums-quantifier", {
    meta: {
        docs: {
            description: "disallow unnecessary `{n,m}` quantifier",
            category: "Best Practices",
            recommended: true,
        },
        fixable: "code",
        schema: [],
        messages: {
            unexpected: "Unexpected quantifier '{{expr}}'.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor({ node, getRegexpLocation, fixReplaceQuant, }) {
            return {
                onQuantifierEnter(qNode) {
                    if (qNode.min === qNode.max) {
                        const [startOffset, endOffset] = (0, regexp_ast_1.getQuantifierOffsets)(qNode);
                        const text = qNode.raw.slice(startOffset, endOffset);
                        if (!/^\{\d+,\d+\}$/u.test(text)) {
                            return;
                        }
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
                            fix: fixReplaceQuant(qNode, `{${qNode.min}}`),
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
