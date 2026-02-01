"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("no-empty-lookarounds-assertion", {
    meta: {
        docs: {
            description: "disallow empty lookahead assertion or empty lookbehind assertion",
            category: "Possible Errors",
            recommended: true,
        },
        schema: [],
        messages: {
            unexpected: "Unexpected empty {{kind}}. It will trivially {{result}} all inputs.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor({ node, flags, getRegexpLocation, }) {
            return {
                onAssertionEnter(aNode) {
                    if (aNode.kind !== "lookahead" &&
                        aNode.kind !== "lookbehind") {
                        return;
                    }
                    if ((0, regexp_ast_analysis_1.isPotentiallyEmpty)(aNode.alternatives, flags)) {
                        context.report({
                            node,
                            loc: getRegexpLocation(aNode),
                            messageId: "unexpected",
                            data: {
                                kind: aNode.kind,
                                result: aNode.negate ? "reject" : "accept",
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
