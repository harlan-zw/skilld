"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
exports.default = (0, utils_1.createRule)("no-empty-character-class", {
    meta: {
        docs: {
            description: "disallow character classes that match no characters",
            category: "Possible Errors",
            recommended: true,
        },
        schema: [],
        messages: {
            empty: "This character class matches no characters because it is empty.",
            cannotMatchAny: "This character class cannot match any characters.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor(regexpContext) {
            const { node, getRegexpLocation, flags } = regexpContext;
            return {
                onCharacterClassEnter(ccNode) {
                    if ((0, regexp_ast_analysis_1.matchesNoCharacters)(ccNode, flags)) {
                        context.report({
                            node,
                            loc: getRegexpLocation(ccNode),
                            messageId: ccNode.elements.length
                                ? "cannotMatchAny"
                                : "empty",
                        });
                    }
                },
                onExpressionCharacterClassEnter(ccNode) {
                    if ((0, regexp_ast_analysis_1.matchesNoCharacters)(ccNode, flags)) {
                        context.report({
                            node,
                            loc: getRegexpLocation(ccNode),
                            messageId: "cannotMatchAny",
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
