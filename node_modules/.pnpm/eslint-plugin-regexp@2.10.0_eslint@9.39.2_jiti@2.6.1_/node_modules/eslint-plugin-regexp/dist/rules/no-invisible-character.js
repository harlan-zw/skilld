"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const refa_1 = require("../utils/refa");
exports.default = (0, utils_1.createRule)("no-invisible-character", {
    meta: {
        docs: {
            description: "disallow invisible raw character",
            category: "Best Practices",
            recommended: true,
        },
        fixable: "code",
        schema: [],
        messages: {
            unexpected: "Unexpected invisible character. Use '{{instead}}' instead.",
        },
        type: "suggestion",
    },
    create(context) {
        const sourceCode = context.sourceCode;
        function createLiteralVisitor({ node, flags, getRegexpLocation, fixReplaceNode, }) {
            return {
                onCharacterEnter(cNode) {
                    if (cNode.raw === " ") {
                        return;
                    }
                    if (cNode.raw.length === 1 && (0, utils_1.isInvisible)(cNode.value)) {
                        const instead = (0, refa_1.toCharSetSource)(cNode.value, flags);
                        context.report({
                            node,
                            loc: getRegexpLocation(cNode),
                            messageId: "unexpected",
                            data: {
                                instead,
                            },
                            fix: fixReplaceNode(cNode, instead),
                        });
                    }
                },
            };
        }
        function verifyString({ node, flags }) {
            const text = sourceCode.getText(node);
            let index = 0;
            for (const c of text) {
                if (c === " ") {
                    continue;
                }
                const cp = c.codePointAt(0);
                if ((0, utils_1.isInvisible)(cp)) {
                    const instead = (0, refa_1.toCharSetSource)(cp, flags);
                    const range = [
                        node.range[0] + index,
                        node.range[0] + index + c.length,
                    ];
                    context.report({
                        node,
                        loc: {
                            start: sourceCode.getLocFromIndex(range[0]),
                            end: sourceCode.getLocFromIndex(range[1]),
                        },
                        messageId: "unexpected",
                        data: {
                            instead,
                        },
                        fix(fixer) {
                            return fixer.replaceTextRange(range, instead);
                        },
                    });
                }
                index += c.length;
            }
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createLiteralVisitor,
            createSourceVisitor(regexpContext) {
                if (regexpContext.node.type === "Literal") {
                    verifyString(regexpContext);
                }
                return {};
            },
        });
    },
});
