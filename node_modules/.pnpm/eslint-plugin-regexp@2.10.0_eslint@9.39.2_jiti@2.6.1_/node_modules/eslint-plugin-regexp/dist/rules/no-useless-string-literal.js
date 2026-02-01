"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const regex_syntax_1 = require("../utils/regex-syntax");
exports.default = (0, utils_1.createRule)("no-useless-string-literal", {
    meta: {
        docs: {
            description: "disallow string disjunction of single characters in `\\q{...}`",
            category: "Best Practices",
            recommended: true,
        },
        schema: [],
        messages: {
            unexpected: "Unexpected string disjunction of single character.",
        },
        type: "suggestion",
        fixable: "code",
    },
    create(context) {
        function createVisitor(regexpContext) {
            const { node, getRegexpLocation, fixReplaceNode, pattern } = regexpContext;
            return {
                onStringAlternativeEnter(saNode) {
                    if (saNode.elements.length === 1) {
                        const csdNode = saNode.parent;
                        context.report({
                            node,
                            loc: getRegexpLocation(saNode),
                            messageId: "unexpected",
                            fix: fixReplaceNode(csdNode, () => {
                                const alternativesText = csdNode.alternatives
                                    .filter((alt) => alt !== saNode)
                                    .map((alt) => alt.raw)
                                    .join("|");
                                if (!alternativesText.length) {
                                    const escape = isNeedEscapeForAdjacentPreviousCharacter(csdNode, saNode) ||
                                        isNeedEscapeForAdjacentNextCharacter(csdNode, saNode)
                                        ? "\\"
                                        : "";
                                    return `${escape}${saNode.raw}`;
                                }
                                if (csdNode.parent.type ===
                                    "ClassIntersection" ||
                                    csdNode.parent.type === "ClassSubtraction") {
                                    const escape = saNode.raw === "^" ? "\\" : "";
                                    return String.raw `[${escape}${saNode.raw}\q{${alternativesText}}]`;
                                }
                                const escape = isNeedEscapeForAdjacentPreviousCharacter(csdNode, saNode)
                                    ? "\\"
                                    : "";
                                return String.raw `${escape}${saNode.raw}\q{${alternativesText}}`;
                            }),
                        });
                    }
                },
            };
            function isNeedEscapeForAdjacentPreviousCharacter(disjunction, character) {
                const char = character.raw;
                if (regex_syntax_1.RESERVED_DOUBLE_PUNCTUATOR_CHARS.has(char) &&
                    pattern[disjunction.start - 1] === char) {
                    return true;
                }
                return (char === "^" &&
                    disjunction.parent.type === "CharacterClass" &&
                    disjunction.parent.start === disjunction.start - 1);
            }
            function isNeedEscapeForAdjacentNextCharacter(disjunction, character) {
                const char = character.raw;
                return (regex_syntax_1.RESERVED_DOUBLE_PUNCTUATOR_CHARS.has(char) &&
                    pattern[disjunction.end] === char);
            }
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
