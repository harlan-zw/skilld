"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
function isZeroQuantifier(node) {
    return node.min === 0;
}
function isOptional(assertion, quantifier, flags) {
    let element = assertion;
    while (element.parent !== quantifier) {
        const parent = element.parent;
        if (parent.type === "Alternative") {
            for (const e of parent.elements) {
                if (e === element) {
                    continue;
                }
                if (!(0, regexp_ast_analysis_1.isZeroLength)(e, flags)) {
                    return false;
                }
            }
            if (parent.parent.type === "Pattern") {
                throw new Error("The given assertion is not a descendant of the given quantifier.");
            }
            element = parent.parent;
        }
        else {
            if (parent.max > 1 && !(0, regexp_ast_analysis_1.isZeroLength)(parent, flags)) {
                return false;
            }
            element = parent;
        }
    }
    return true;
}
exports.default = (0, utils_1.createRule)("no-optional-assertion", {
    meta: {
        docs: {
            description: "disallow optional assertions",
            category: "Possible Errors",
            recommended: true,
        },
        schema: [],
        messages: {
            optionalAssertion: "This assertion effectively optional and does not change the pattern. Either remove the assertion or change the parent quantifier '{{quantifier}}'.",
        },
        type: "problem",
    },
    create(context) {
        function createVisitor({ node, flags, getRegexpLocation, }) {
            const zeroQuantifierStack = [];
            return {
                onQuantifierEnter(q) {
                    if (isZeroQuantifier(q)) {
                        zeroQuantifierStack.unshift(q);
                    }
                },
                onQuantifierLeave(q) {
                    if (zeroQuantifierStack[0] === q) {
                        zeroQuantifierStack.shift();
                    }
                },
                onAssertionEnter(assertion) {
                    const q = zeroQuantifierStack[0];
                    if (q && isOptional(assertion, q, flags)) {
                        context.report({
                            node,
                            loc: getRegexpLocation(assertion),
                            messageId: "optionalAssertion",
                            data: {
                                quantifier: q.raw.substr(q.element.raw.length),
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
