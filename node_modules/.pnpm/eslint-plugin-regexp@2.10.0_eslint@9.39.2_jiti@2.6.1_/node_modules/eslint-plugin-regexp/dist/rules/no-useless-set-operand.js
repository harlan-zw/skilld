"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
function getFlatElements(node) {
    if (node.type === "ClassStringDisjunction") {
        return node.alternatives;
    }
    if (node.type === "CharacterClass") {
        const nested = [];
        const addElement = (element) => {
            if (element.type === "ClassStringDisjunction") {
                nested.push(...element.alternatives);
            }
            else if (element.type === "CharacterClass") {
                if (!element.negate) {
                    nested.push(...element.elements);
                }
                nested.push(element);
            }
            else {
                nested.push(element);
            }
        };
        node.elements.forEach(addElement);
        return nested;
    }
    return [];
}
function removeDescendant(root, e) {
    let { start, end } = e;
    if (e.type === "StringAlternative") {
        if (e.parent.alternatives.length === 1) {
            e = e.parent;
            start = e.start;
            end = e.end;
        }
        else {
            if (e.parent.alternatives.at(-1) === e) {
                start--;
            }
            else {
                end++;
            }
        }
    }
    const before = root.raw.slice(0, start - root.start);
    const after = root.raw.slice(end - root.start);
    return before + after;
}
exports.default = (0, utils_1.createRule)("no-useless-set-operand", {
    meta: {
        docs: {
            description: "disallow unnecessary elements in expression character classes",
            category: "Best Practices",
            recommended: true,
        },
        schema: [],
        messages: {
            intersectionDisjoint: "'{{left}}' and '{{right}}' are disjoint, so the result of the intersection is always going to be the empty set.",
            intersectionSubset: "'{{sub}}' is a subset of '{{super}}', so the result of the intersection is always going to be '{{sub}}'.",
            intersectionRemove: "'{{expr}}' can be removed without changing the result of the intersection.",
            subtractionDisjoint: "'{{left}}' and '{{right}}' are disjoint, so the subtraction doesn't do anything.",
            subtractionSubset: "'{{left}}' is a subset of '{{right}}', so the result of the subtraction is always going to be the empty set.",
            subtractionRemove: "'{{expr}}' can be removed without changing the result of the subtraction.",
        },
        fixable: "code",
        type: "suggestion",
    },
    create(context) {
        function createVisitor(regexpContext) {
            const { node, flags, getRegexpLocation, fixReplaceNode } = regexpContext;
            if (!flags.unicodeSets) {
                return {};
            }
            function fixRemoveExpression(expr) {
                if (expr.parent.type === "ExpressionCharacterClass") {
                    const cc = expr.parent;
                    return fixReplaceNode(cc, cc.negate ? "[^]" : "[]");
                }
                return fixReplaceNode(expr, "[]");
            }
            return {
                onClassIntersectionEnter(iNode) {
                    const leftSet = (0, regexp_ast_analysis_1.toUnicodeSet)(iNode.left, flags);
                    const rightSet = (0, regexp_ast_analysis_1.toUnicodeSet)(iNode.right, flags);
                    if (leftSet.isDisjointWith(rightSet)) {
                        context.report({
                            node,
                            loc: getRegexpLocation(iNode),
                            messageId: "intersectionDisjoint",
                            data: {
                                left: iNode.left.raw,
                                right: iNode.right.raw,
                            },
                            fix: fixRemoveExpression(iNode),
                        });
                        return;
                    }
                    if (leftSet.isSubsetOf(rightSet)) {
                        context.report({
                            node,
                            loc: getRegexpLocation(iNode),
                            messageId: "intersectionSubset",
                            data: {
                                sub: iNode.left.raw,
                                super: iNode.right.raw,
                            },
                            fix: fixReplaceNode(iNode, iNode.left.raw),
                        });
                        return;
                    }
                    if (rightSet.isSubsetOf(leftSet)) {
                        context.report({
                            node,
                            loc: getRegexpLocation(iNode),
                            messageId: "intersectionSubset",
                            data: {
                                sub: iNode.right.raw,
                                super: iNode.left.raw,
                            },
                            fix: fixReplaceNode(iNode, iNode.right.raw),
                        });
                        return;
                    }
                    const toRemoveRight = getFlatElements(iNode.right).filter((e) => leftSet.isDisjointWith((0, regexp_ast_analysis_1.toUnicodeSet)(e, flags)));
                    const toRemoveLeft = getFlatElements(iNode.left).filter((e) => rightSet.isDisjointWith((0, regexp_ast_analysis_1.toUnicodeSet)(e, flags)));
                    for (const e of [...toRemoveRight, ...toRemoveLeft]) {
                        context.report({
                            node,
                            loc: getRegexpLocation(e),
                            messageId: "subtractionRemove",
                            data: {
                                expr: e.raw,
                            },
                            fix: fixReplaceNode(iNode, removeDescendant(iNode, e)),
                        });
                    }
                },
                onClassSubtractionEnter(sNode) {
                    const leftSet = (0, regexp_ast_analysis_1.toUnicodeSet)(sNode.left, flags);
                    const rightSet = (0, regexp_ast_analysis_1.toUnicodeSet)(sNode.right, flags);
                    if (leftSet.isDisjointWith(rightSet)) {
                        context.report({
                            node,
                            loc: getRegexpLocation(sNode),
                            messageId: "subtractionDisjoint",
                            data: {
                                left: sNode.left.raw,
                                right: sNode.right.raw,
                            },
                            fix: fixReplaceNode(sNode, sNode.left.raw),
                        });
                        return;
                    }
                    if (leftSet.isSubsetOf(rightSet)) {
                        context.report({
                            node,
                            loc: getRegexpLocation(sNode),
                            messageId: "subtractionSubset",
                            data: {
                                left: sNode.left.raw,
                                right: sNode.right.raw,
                            },
                            fix: fixRemoveExpression(sNode),
                        });
                        return;
                    }
                    const toRemove = getFlatElements(sNode.right).filter((e) => leftSet.isDisjointWith((0, regexp_ast_analysis_1.toUnicodeSet)(e, flags)));
                    for (const e of toRemove) {
                        context.report({
                            node,
                            loc: getRegexpLocation(e),
                            messageId: "subtractionRemove",
                            data: {
                                expr: e.raw,
                            },
                            fix: fixReplaceNode(sNode, removeDescendant(sNode, e)),
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
