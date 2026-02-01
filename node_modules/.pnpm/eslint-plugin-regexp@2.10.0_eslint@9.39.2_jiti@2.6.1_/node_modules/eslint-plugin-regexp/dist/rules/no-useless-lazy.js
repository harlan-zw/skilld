"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
function makeGreedy({ patternSource }, qNode) {
    return (fixer) => {
        if (qNode.greedy) {
            return null;
        }
        const range = patternSource.getReplaceRange({
            start: qNode.end - 1,
            end: qNode.end,
        });
        if (!range) {
            return null;
        }
        return range.remove(fixer);
    };
}
function getLazyLoc({ getRegexpLocation }, qNode) {
    const offset = qNode.raw.length - 1;
    return getRegexpLocation(qNode, [offset, offset + 1]);
}
exports.default = (0, utils_1.createRule)("no-useless-lazy", {
    meta: {
        docs: {
            description: "disallow unnecessarily non-greedy quantifiers",
            category: "Best Practices",
            recommended: true,
        },
        fixable: "code",
        schema: [],
        messages: {
            constant: "Unexpected non-greedy constant quantifier.",
            possessive: "Unexpected non-greedy constant quantifier. The quantifier is effectively possessive, so it doesn't matter whether it is greedy or not.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor(regexpContext) {
            const { node, flags } = regexpContext;
            return {
                onQuantifierEnter(qNode) {
                    if (qNode.greedy) {
                        return;
                    }
                    if (qNode.min === qNode.max) {
                        context.report({
                            node,
                            loc: getLazyLoc(regexpContext, qNode),
                            messageId: "constant",
                            fix: makeGreedy(regexpContext, qNode),
                        });
                        return;
                    }
                    const matchingDir = (0, regexp_ast_analysis_1.getMatchingDirection)(qNode);
                    const firstChar = (0, regexp_ast_analysis_1.getFirstConsumedChar)(qNode.element, matchingDir, flags);
                    if (!firstChar.empty) {
                        const after = (0, regexp_ast_analysis_1.getFirstCharAfter)(qNode, matchingDir, flags);
                        if (firstChar.char.isDisjointWith(after.char)) {
                            context.report({
                                node,
                                loc: getLazyLoc(regexpContext, qNode),
                                messageId: "possessive",
                                fix: makeGreedy(regexpContext, qNode),
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
