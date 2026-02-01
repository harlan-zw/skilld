"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
const regexp_ast_1 = require("../utils/regexp-ast");
exports.default = (0, utils_1.createRule)("confusing-quantifier", {
    meta: {
        docs: {
            description: "disallow confusing quantifiers",
            category: "Best Practices",
            recommended: true,
            default: "warn",
        },
        schema: [],
        messages: {
            confusing: "This quantifier is confusing because its minimum is {{min}} but it can match the empty string. Maybe replace it with `{{proposal}}` to reflect that it can match the empty string?",
        },
        type: "problem",
    },
    create(context) {
        function createVisitor({ node, flags, getRegexpLocation, }) {
            return {
                onQuantifierEnter(qNode) {
                    if (qNode.min > 0 &&
                        (0, regexp_ast_analysis_1.isPotentiallyEmpty)(qNode.element, flags)) {
                        const proposal = (0, regexp_ast_1.quantToString)({ ...qNode, min: 0 });
                        context.report({
                            node,
                            loc: getRegexpLocation(qNode, (0, regexp_ast_1.getQuantifierOffsets)(qNode)),
                            messageId: "confusing",
                            data: {
                                min: String(qNode.min),
                                proposal,
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
