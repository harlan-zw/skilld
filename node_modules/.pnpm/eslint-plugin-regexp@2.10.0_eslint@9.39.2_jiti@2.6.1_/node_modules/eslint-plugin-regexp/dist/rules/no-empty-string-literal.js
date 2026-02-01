"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("no-empty-string-literal", {
    meta: {
        docs: {
            description: "disallow empty string literals in character classes",
            category: "Best Practices",
            recommended: true,
        },
        schema: [],
        messages: {
            unexpected: "Unexpected empty string literal.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor(regexpContext) {
            const { node, getRegexpLocation } = regexpContext;
            return {
                onClassStringDisjunctionEnter(csdNode) {
                    if (csdNode.alternatives.every((alt) => alt.elements.length === 0)) {
                        context.report({
                            node,
                            loc: getRegexpLocation(csdNode),
                            messageId: "unexpected",
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
