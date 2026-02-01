"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const regexp_ast_1 = require("../utils/regexp-ast");
function getCombinedQuant(parent, child) {
    if (parent.max === 0 || child.max === 0) {
        return null;
    }
    else if (parent.greedy === child.greedy) {
        const greedy = parent.greedy;
        const a = child.min;
        const b = child.max;
        const c = parent.min;
        const d = parent.max;
        const condition = b === Infinity && c === 0
            ? a <= 1
            : c === d || b * c + 1 >= a * (c + 1);
        if (condition) {
            return {
                min: a * c,
                max: b * d,
                greedy,
            };
        }
        return null;
    }
    return null;
}
function getSimplifiedChildQuant(parent, child) {
    if (parent.max === 0 || child.max === 0) {
        return null;
    }
    else if (parent.greedy !== child.greedy) {
        return null;
    }
    let min = child.min;
    let max = child.max;
    if (min === 0 && parent.min === 0) {
        min = 1;
    }
    if (parent.max === Infinity && (min === 0 || min === 1) && max > 1) {
        max = 1;
    }
    return { min, max, greedy: child.greedy };
}
function isTrivialQuantifier(quant) {
    return quant.min === quant.max && (quant.min === 0 || quant.min === 1);
}
function* iterateSingleQuantifiers(group) {
    for (const { elements } of group.alternatives) {
        if (elements.length === 1) {
            const single = elements[0];
            if (single.type === "Quantifier") {
                yield single;
            }
        }
    }
}
exports.default = (0, utils_1.createRule)("no-trivially-nested-quantifier", {
    meta: {
        docs: {
            description: "disallow nested quantifiers that can be rewritten as one quantifier",
            category: "Best Practices",
            recommended: true,
        },
        fixable: "code",
        schema: [],
        messages: {
            nested: "These two quantifiers are trivially nested and can be replaced with '{{quant}}'.",
            childOne: "This nested quantifier can be removed.",
            childSimpler: "This nested quantifier can be simplified to '{{quant}}'.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor({ node, fixReplaceNode, fixReplaceQuant, getRegexpLocation, }) {
            return {
                onQuantifierEnter(qNode) {
                    if (isTrivialQuantifier(qNode)) {
                        return;
                    }
                    const element = qNode.element;
                    if (element.type !== "Group") {
                        return;
                    }
                    for (const child of iterateSingleQuantifiers(element)) {
                        if (isTrivialQuantifier(child)) {
                            continue;
                        }
                        if (element.alternatives.length === 1) {
                            const quant = getCombinedQuant(qNode, child);
                            if (!quant) {
                                continue;
                            }
                            const quantStr = (0, regexp_ast_1.quantToString)(quant);
                            const replacement = child.element.raw + quantStr;
                            context.report({
                                node,
                                loc: getRegexpLocation(qNode),
                                messageId: "nested",
                                data: { quant: quantStr },
                                fix: fixReplaceNode(qNode, replacement),
                            });
                        }
                        else {
                            const quant = getSimplifiedChildQuant(qNode, child);
                            if (!quant) {
                                continue;
                            }
                            if (quant.min === child.min &&
                                quant.max === child.max) {
                                continue;
                            }
                            if (quant.min === 1 && quant.max === 1) {
                                context.report({
                                    node,
                                    loc: getRegexpLocation(child),
                                    messageId: "childOne",
                                    fix: fixReplaceNode(child, child.element.raw),
                                });
                            }
                            else {
                                quant.greedy = undefined;
                                context.report({
                                    node,
                                    loc: getRegexpLocation(child),
                                    messageId: "childSimpler",
                                    data: { quant: (0, regexp_ast_1.quantToString)(quant) },
                                    fix: fixReplaceQuant(child, quant),
                                });
                            }
                        }
                    }
                },
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
