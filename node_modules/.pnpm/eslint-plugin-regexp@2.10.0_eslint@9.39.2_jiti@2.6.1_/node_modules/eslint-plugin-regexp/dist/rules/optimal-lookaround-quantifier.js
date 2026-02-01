"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
const mention_1 = require("../utils/mention");
function* extractInvalidQuantifiers(alternatives, kind) {
    for (const { elements } of alternatives) {
        if (elements.length > 0) {
            const lastIndex = kind === "lookahead" ? elements.length - 1 : 0;
            const last = elements[lastIndex];
            switch (last.type) {
                case "Quantifier":
                    if (last.min !== last.max) {
                        if ((0, regexp_ast_analysis_1.hasSomeDescendant)(last.element, (d) => d.type === "CapturingGroup")) {
                        }
                        else {
                            yield last;
                        }
                    }
                    break;
                case "Group":
                    yield* extractInvalidQuantifiers(last.alternatives, kind);
                    break;
                default:
                    break;
            }
        }
    }
}
const END_START_PHRASE = {
    lookahead: "end",
    lookbehind: "start",
};
exports.default = (0, utils_1.createRule)("optimal-lookaround-quantifier", {
    meta: {
        docs: {
            description: "disallow the alternatives of lookarounds that end with a non-constant quantifier",
            category: "Best Practices",
            recommended: true,
            default: "warn",
        },
        schema: [],
        hasSuggestions: true,
        messages: {
            remove: "The quantified expression {{expr}} at the {{endOrStart}} of the expression tree should only be matched a constant number of times. The expression can be removed without affecting the lookaround.",
            replacedWith: "The quantified expression {{expr}} at the {{endOrStart}} of the expression tree should only be matched a constant number of times. The expression can be replaced with {{replacer}} without affecting the lookaround.",
            suggestRemove: "Remove the expression.",
            suggestReplace: "Replace the expression with {{replacer}}.",
        },
        type: "problem",
    },
    create(context) {
        function createVisitor({ node, getRegexpLocation, fixReplaceNode, }) {
            return {
                onAssertionEnter(aNode) {
                    if (aNode.kind === "lookahead" ||
                        aNode.kind === "lookbehind") {
                        const endOrStart = END_START_PHRASE[aNode.kind];
                        const quantifiers = extractInvalidQuantifiers(aNode.alternatives, aNode.kind);
                        for (const q of quantifiers) {
                            const replacer = q.min === 0
                                ? ""
                                : q.min === 1
                                    ? `'${q.element.raw}' (no quantifier)`
                                    : `'${q.element.raw}{${q.min}}'`;
                            context.report({
                                node,
                                loc: getRegexpLocation(q),
                                messageId: q.min === 0 ? "remove" : "replacedWith",
                                data: {
                                    expr: (0, mention_1.mention)(q),
                                    endOrStart,
                                    replacer,
                                },
                                suggest: [
                                    {
                                        messageId: q.min === 0
                                            ? "suggestRemove"
                                            : "suggestReplace",
                                        data: {
                                            replacer,
                                        },
                                        fix: fixReplaceNode(q, () => {
                                            if (q.min === 0) {
                                                return "";
                                            }
                                            else if (q.min === 1) {
                                                return q.element.raw;
                                            }
                                            return `${q.element.raw}{${q.min}}`;
                                        }),
                                    },
                                ],
                            });
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
