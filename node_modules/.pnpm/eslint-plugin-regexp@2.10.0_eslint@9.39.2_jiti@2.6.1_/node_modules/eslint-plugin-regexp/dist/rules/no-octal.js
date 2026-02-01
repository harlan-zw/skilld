"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const regex_syntax_1 = require("../utils/regex-syntax");
exports.default = (0, utils_1.createRule)("no-octal", {
    meta: {
        docs: {
            description: "disallow octal escape sequence",
            category: "Best Practices",
            recommended: false,
        },
        schema: [],
        messages: {
            unexpected: "Unexpected octal escape sequence '{{expr}}'.",
            replaceHex: "Replace the octal escape sequence with a hexadecimal escape sequence.",
        },
        type: "suggestion",
        hasSuggestions: true,
    },
    create(context) {
        function createVisitor({ node, fixReplaceNode, getRegexpLocation, }) {
            return {
                onCharacterEnter(cNode) {
                    if (cNode.raw === "\\0") {
                        return;
                    }
                    if (!(0, regex_syntax_1.isOctalEscape)(cNode.raw)) {
                        return;
                    }
                    const report = cNode.raw.startsWith("\\0") ||
                        !(cNode.parent.type === "CharacterClass" ||
                            cNode.parent.type === "CharacterClassRange");
                    if (report) {
                        context.report({
                            node,
                            loc: getRegexpLocation(cNode),
                            messageId: "unexpected",
                            data: {
                                expr: cNode.raw,
                            },
                            suggest: [
                                {
                                    messageId: "replaceHex",
                                    fix: fixReplaceNode(cNode, () => {
                                        return `\\x${cNode.value
                                            .toString(16)
                                            .padStart(2, "0")}`;
                                    }),
                                },
                            ],
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
