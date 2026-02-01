"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
function isCharElement(node) {
    return (node.type === "Character" ||
        node.type === "CharacterSet" ||
        node.type === "CharacterClass" ||
        node.type === "ExpressionCharacterClass");
}
function isCharLookaround(node) {
    return (node.type === "Assertion" &&
        (node.kind === "lookahead" || node.kind === "lookbehind") &&
        node.alternatives.length === 1 &&
        node.alternatives[0].elements.length === 1 &&
        isCharElement(node.alternatives[0].elements[0]));
}
function escapeRaw(raw) {
    if (/^[&\-^]$/u.test(raw)) {
        return `\\${raw}`;
    }
    return raw;
}
exports.default = (0, utils_1.createRule)("prefer-set-operation", {
    meta: {
        docs: {
            description: "prefer character class set operations instead of lookarounds",
            category: "Best Practices",
            recommended: true,
        },
        fixable: "code",
        schema: [],
        messages: {
            unexpected: "This lookaround can be combined with '{{char}}' using a set operation.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor(regexpContext) {
            const { node, flags, getRegexpLocation, fixReplaceNode } = regexpContext;
            if (!flags.unicodeSets) {
                return {};
            }
            function tryApply(element, assertion, parent) {
                const assertElement = assertion.alternatives[0].elements[0];
                if ((0, regexp_ast_analysis_1.hasStrings)(assertElement, flags)) {
                    return;
                }
                context.report({
                    node,
                    loc: getRegexpLocation(assertion),
                    messageId: "unexpected",
                    data: {
                        char: element.raw,
                    },
                    fix: fixReplaceNode(parent, () => {
                        const op = assertion.negate ? "--" : "&&";
                        const left = escapeRaw(element.raw);
                        const right = escapeRaw(assertElement.raw);
                        const replacement = `[${left}${op}${right}]`;
                        return parent.elements
                            .map((e) => {
                            if (e === assertion) {
                                return "";
                            }
                            else if (e === element) {
                                return replacement;
                            }
                            return e.raw;
                        })
                            .join("");
                    }),
                });
            }
            return {
                onAlternativeEnter(alternative) {
                    const { elements } = alternative;
                    for (let i = 1; i < elements.length; i++) {
                        const a = elements[i - 1];
                        const b = elements[i];
                        if (isCharElement(a) &&
                            isCharLookaround(b) &&
                            b.kind === "lookbehind") {
                            tryApply(a, b, alternative);
                        }
                        if (isCharLookaround(a) &&
                            a.kind === "lookahead" &&
                            isCharElement(b)) {
                            tryApply(b, a, alternative);
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
