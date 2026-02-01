"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
function getCapturingGroupOuterSource(node) {
    const first = node.alternatives[0];
    const last = node.alternatives[node.alternatives.length - 1];
    const innerStart = first.start - node.start;
    const innerEnd = last.end - node.start;
    return [node.raw.slice(0, innerStart), node.raw.slice(innerEnd)];
}
function getFixedNode(regexpNode, alt) {
    var _a;
    let quant;
    if (regexpNode.alternatives.at(0) === alt) {
        quant = "??";
    }
    else if (regexpNode.alternatives.at(-1) === alt) {
        quant = "?";
    }
    else {
        return null;
    }
    const innerAlternatives = regexpNode.alternatives
        .filter((a) => a !== alt)
        .map((a) => a.raw)
        .join("|");
    let replacement = `(?:${innerAlternatives})${quant}`;
    if (regexpNode.type === "CapturingGroup") {
        const [before, after] = getCapturingGroupOuterSource(regexpNode);
        replacement = `${before}${replacement}${after}`;
    }
    else if (((_a = regexpNode.parent) === null || _a === void 0 ? void 0 : _a.type) === "Quantifier") {
        replacement = `(?:${replacement})`;
    }
    return replacement;
}
exports.default = (0, utils_1.createRule)("no-empty-alternative", {
    meta: {
        docs: {
            description: "disallow alternatives without elements",
            category: "Possible Errors",
            recommended: true,
            default: "warn",
        },
        schema: [],
        hasSuggestions: true,
        messages: {
            empty: "This empty alternative might be a mistake. If not, use a quantifier instead.",
            suggest: "Use a quantifier instead.",
        },
        type: "problem",
    },
    create(context) {
        function createVisitor({ node, getRegexpLocation, fixReplaceNode, }) {
            function verifyAlternatives(regexpNode, suggestFixer) {
                if (regexpNode.alternatives.length >= 2) {
                    for (let i = 0; i < regexpNode.alternatives.length; i++) {
                        const alt = regexpNode.alternatives[i];
                        const isLast = i === regexpNode.alternatives.length - 1;
                        if (alt.elements.length === 0) {
                            const index = alt.start;
                            const loc = isLast
                                ? getRegexpLocation({
                                    start: index - 1,
                                    end: index,
                                })
                                : getRegexpLocation({
                                    start: index,
                                    end: index + 1,
                                });
                            const fixed = suggestFixer(alt);
                            context.report({
                                node,
                                loc,
                                messageId: "empty",
                                suggest: fixed
                                    ? [
                                        {
                                            messageId: "suggest",
                                            fix: fixReplaceNode(regexpNode, fixed),
                                        },
                                    ]
                                    : undefined,
                            });
                            return;
                        }
                    }
                }
            }
            return {
                onGroupEnter: (gNode) => verifyAlternatives(gNode, (alt) => getFixedNode(gNode, alt)),
                onCapturingGroupEnter: (cgNode) => verifyAlternatives(cgNode, (alt) => getFixedNode(cgNode, alt)),
                onPatternEnter: (pNode) => verifyAlternatives(pNode, (alt) => getFixedNode(pNode, alt)),
                onClassStringDisjunctionEnter: (csdNode) => verifyAlternatives(csdNode, () => null),
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
