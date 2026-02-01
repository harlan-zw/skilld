"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("no-potentially-useless-backreference", {
    meta: {
        docs: {
            description: "disallow backreferences that reference a group that might not be matched",
            category: "Possible Errors",
            recommended: true,
            default: "warn",
        },
        schema: [],
        messages: {
            potentiallyUselessBackreference: "Some paths leading to the backreference do not go through the referenced capturing group or the captured text might be reset before reaching the backreference.",
        },
        type: "problem",
    },
    create(context) {
        function createVisitor({ node, flags, getRegexpLocation, }) {
            return {
                onBackreferenceEnter(backreference) {
                    if ((0, regexp_ast_analysis_1.isEmptyBackreference)(backreference, flags)) {
                        return;
                    }
                    if (!(0, regexp_ast_analysis_1.isStrictBackreference)(backreference)) {
                        context.report({
                            node,
                            loc: getRegexpLocation(backreference),
                            messageId: "potentiallyUselessBackreference",
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
