"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("prefer-named-backreference", {
    meta: {
        docs: {
            description: "enforce using named backreferences",
            category: "Stylistic Issues",
            recommended: false,
        },
        fixable: "code",
        schema: [],
        messages: {
            unexpected: "Unexpected unnamed backreference.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor({ node, fixReplaceNode, getRegexpLocation, }) {
            return {
                onBackreferenceEnter(bNode) {
                    if (!bNode.ambiguous &&
                        bNode.resolved.name &&
                        !bNode.raw.startsWith("\\k<")) {
                        context.report({
                            node,
                            loc: getRegexpLocation(bNode),
                            messageId: "unexpected",
                            fix: fixReplaceNode(bNode, `\\k<${bNode.resolved.name}>`),
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
