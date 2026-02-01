"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const mention_1 = require("../utils/mention");
exports.default = (0, utils_1.createRule)("prefer-named-capture-group", {
    meta: {
        docs: {
            description: "enforce using named capture groups",
            category: "Stylistic Issues",
            recommended: false,
        },
        schema: [],
        messages: {
            required: "Capture group {{group}} should be converted to a named or non-capturing group.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor(regexpContext) {
            const { node, getRegexpLocation } = regexpContext;
            return {
                onCapturingGroupEnter(cgNode) {
                    if (cgNode.name === null) {
                        context.report({
                            node,
                            loc: getRegexpLocation(cgNode),
                            messageId: "required",
                            data: {
                                group: (0, mention_1.mention)(cgNode),
                            },
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
