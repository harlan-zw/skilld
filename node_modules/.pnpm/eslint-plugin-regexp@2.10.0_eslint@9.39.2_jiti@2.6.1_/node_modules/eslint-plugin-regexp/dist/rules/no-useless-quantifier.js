"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("no-useless-quantifier", {
    meta: {
        docs: {
            description: "disallow quantifiers that can be removed",
            category: "Best Practices",
            recommended: true,
        },
        fixable: "code",
        schema: [],
        messages: {
            constOne: "Unexpected useless quantifier.",
            empty: "Unexpected useless quantifier. The quantified element doesn't consume or assert characters.",
            emptyQuestionMark: "Unexpected useless quantifier. The quantified element can already accept the empty string, so this quantifier is redundant.",
            zeroLength: "Unexpected useless quantifier. The quantified element doesn't consume characters.",
            remove: "Remove the '{{quant}}' quantifier.",
        },
        type: "suggestion",
        hasSuggestions: true,
    },
    create(context) {
        function createVisitor(regexpContext) {
            const { node, flags, getRegexpLocation, fixReplaceNode } = regexpContext;
            function fixRemoveQuant(qNode) {
                return fixReplaceNode(qNode, () => {
                    const text = qNode.element.raw;
                    return (0, utils_1.canUnwrapped)(qNode, text) ? text : null;
                });
            }
            function suggestRemoveQuant(qNode) {
                const quant = qNode.raw.slice(qNode.element.end - qNode.start);
                return {
                    messageId: "remove",
                    data: { quant },
                    fix: fixReplaceNode(qNode, () => {
                        const text = qNode.element.raw;
                        return (0, utils_1.canUnwrapped)(qNode, text) ? text : null;
                    }),
                };
            }
            return {
                onQuantifierEnter(qNode) {
                    if (qNode.min === 1 && qNode.max === 1) {
                        context.report({
                            node,
                            loc: getRegexpLocation(qNode),
                            messageId: "constOne",
                            fix: fixRemoveQuant(qNode),
                        });
                        return;
                    }
                    if ((0, regexp_ast_analysis_1.isEmpty)(qNode.element, flags)) {
                        context.report({
                            node,
                            loc: getRegexpLocation(qNode),
                            messageId: "empty",
                            suggest: [suggestRemoveQuant(qNode)],
                        });
                        return;
                    }
                    if (qNode.min === 0 &&
                        qNode.max === 1 &&
                        qNode.greedy &&
                        (0, regexp_ast_analysis_1.isPotentiallyEmpty)(qNode.element, flags)) {
                        context.report({
                            node,
                            loc: getRegexpLocation(qNode),
                            messageId: "emptyQuestionMark",
                            suggest: [suggestRemoveQuant(qNode)],
                        });
                        return;
                    }
                    if (qNode.min >= 1 && (0, regexp_ast_analysis_1.isZeroLength)(qNode.element, flags)) {
                        context.report({
                            node,
                            loc: getRegexpLocation(qNode),
                            messageId: "zeroLength",
                            suggest: [suggestRemoveQuant(qNode)],
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
