"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("no-empty-capturing-group", {
    meta: {
        docs: {
            description: "disallow capturing group that captures empty.",
            category: "Possible Errors",
            recommended: true,
        },
        schema: [],
        messages: {
            unexpected: "Unexpected capture empty.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor({ node, flags, getRegexpLocation, }) {
            return {
                onCapturingGroupEnter(cgNode) {
                    if ((0, regexp_ast_analysis_1.isZeroLength)(cgNode, flags)) {
                        context.report({
                            node,
                            loc: getRegexpLocation(cgNode),
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
