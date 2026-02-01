"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
function isLookaround(node) {
    return (node.type === "Assertion" &&
        (node.kind === "lookahead" || node.kind === "lookbehind"));
}
function getTriviallyNestedAssertion(node) {
    const alternatives = node.alternatives;
    if (alternatives.length === 1) {
        const elements = alternatives[0].elements;
        if (elements.length === 1) {
            const element = elements[0];
            if (element.type === "Assertion") {
                return element;
            }
        }
    }
    return null;
}
function getNegatedRaw(assertion) {
    if (assertion.kind === "word") {
        return assertion.negate ? "\\b" : "\\B";
    }
    else if (assertion.kind === "lookahead") {
        return `(?${assertion.negate ? "=" : "!"}${assertion.raw.slice(3)}`;
    }
    else if (assertion.kind === "lookbehind") {
        return `(?<${assertion.negate ? "=" : "!"}${assertion.raw.slice(4)}`;
    }
    return null;
}
exports.default = (0, utils_1.createRule)("no-trivially-nested-assertion", {
    meta: {
        docs: {
            description: "disallow trivially nested assertions",
            category: "Best Practices",
            recommended: true,
        },
        fixable: "code",
        schema: [],
        messages: {
            unexpected: "Unexpected trivially nested assertion.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor({ node, fixReplaceNode, getRegexpLocation, }) {
            return {
                onAssertionEnter(aNode) {
                    if (aNode.parent.type === "Quantifier") {
                        return;
                    }
                    if (!isLookaround(aNode)) {
                        return;
                    }
                    const nested = getTriviallyNestedAssertion(aNode);
                    if (nested === null) {
                        return;
                    }
                    if (aNode.negate &&
                        isLookaround(nested) &&
                        nested.negate &&
                        (0, regexp_ast_analysis_1.hasSomeDescendant)(nested, (d) => d.type === "CapturingGroup")) {
                        return;
                    }
                    const replacement = aNode.negate
                        ? getNegatedRaw(nested)
                        : nested.raw;
                    if (replacement === null) {
                        return;
                    }
                    context.report({
                        node,
                        loc: getRegexpLocation(aNode),
                        messageId: "unexpected",
                        fix: fixReplaceNode(aNode, replacement),
                    });
                },
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
