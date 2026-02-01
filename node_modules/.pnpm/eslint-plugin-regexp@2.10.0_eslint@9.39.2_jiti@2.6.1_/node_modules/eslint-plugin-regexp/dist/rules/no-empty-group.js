"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("no-empty-group", {
    meta: {
        docs: {
            description: "disallow empty group",
            category: "Possible Errors",
            recommended: true,
        },
        schema: [],
        messages: {
            unexpected: "Unexpected empty group.",
        },
        type: "suggestion",
    },
    create(context) {
        function verifyGroup({ node, getRegexpLocation }, gNode) {
            if (gNode.alternatives.every((alt) => alt.elements.length === 0)) {
                context.report({
                    node,
                    loc: getRegexpLocation(gNode),
                    messageId: "unexpected",
                });
            }
        }
        function createVisitor(regexpContext) {
            return {
                onGroupEnter(gNode) {
                    verifyGroup(regexpContext, gNode);
                },
                onCapturingGroupEnter(cgNode) {
                    verifyGroup(regexpContext, cgNode);
                },
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
