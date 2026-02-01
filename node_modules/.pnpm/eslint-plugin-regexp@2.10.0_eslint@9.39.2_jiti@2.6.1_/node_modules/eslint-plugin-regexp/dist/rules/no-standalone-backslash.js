"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("no-standalone-backslash", {
    meta: {
        docs: {
            description: "disallow standalone backslashes (`\\`)",
            category: "Best Practices",
            recommended: false,
        },
        schema: [],
        messages: {
            unexpected: "Unexpected standalone backslash (`\\`). It looks like an escape sequence, but it's a single `\\` character pattern.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor({ node, getRegexpLocation, }) {
            return {
                onCharacterEnter(cNode) {
                    if (cNode.value === utils_1.CP_BACK_SLASH && cNode.raw === "\\") {
                        context.report({
                            node,
                            loc: getRegexpLocation(cNode),
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
