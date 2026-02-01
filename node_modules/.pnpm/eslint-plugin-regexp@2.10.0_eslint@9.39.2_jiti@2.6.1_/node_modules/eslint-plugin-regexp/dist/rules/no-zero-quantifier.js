"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("no-zero-quantifier", {
    meta: {
        docs: {
            description: "disallow quantifiers with a maximum of zero",
            category: "Best Practices",
            recommended: true,
        },
        schema: [],
        messages: {
            unexpected: "Unexpected zero quantifier. The quantifier and its quantified element can be removed without affecting the pattern.",
            withCapturingGroup: "Unexpected zero quantifier. The quantifier and its quantified element do not affecting the pattern. Try to remove the elements but be careful because it contains at least one capturing group.",
            remove: "Remove this zero quantifier.",
        },
        type: "suggestion",
        hasSuggestions: true,
    },
    create(context) {
        function createVisitor(regexpContext) {
            const { node, getRegexpLocation, fixReplaceNode, patternAst } = regexpContext;
            return {
                onQuantifierEnter(qNode) {
                    if (qNode.max === 0) {
                        const containCapturingGroup = (0, regexp_ast_analysis_1.hasSomeDescendant)(qNode, (n) => n.type === "CapturingGroup");
                        if (containCapturingGroup) {
                            context.report({
                                node,
                                loc: getRegexpLocation(qNode),
                                messageId: "withCapturingGroup",
                            });
                        }
                        else {
                            const suggest = [];
                            if (patternAst.raw === qNode.raw) {
                                suggest.push({
                                    messageId: "remove",
                                    fix: fixReplaceNode(qNode, "(?:)"),
                                });
                            }
                            else if ((0, utils_1.canUnwrapped)(qNode, "")) {
                                suggest.push({
                                    messageId: "remove",
                                    fix: fixReplaceNode(qNode, ""),
                                });
                            }
                            context.report({
                                node,
                                loc: getRegexpLocation(qNode),
                                messageId: "unexpected",
                                suggest,
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
