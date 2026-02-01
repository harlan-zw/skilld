"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
const mention_1 = require("../utils/mention");
function isSmallLetterRange(node) {
    return (node.type === "CharacterClassRange" &&
        node.min.value === utils_1.CP_SMALL_A &&
        node.max.value === utils_1.CP_SMALL_Z);
}
function isCapitalLetterRange(node) {
    return (node.type === "CharacterClassRange" &&
        node.min.value === utils_1.CP_CAPITAL_A &&
        node.max.value === utils_1.CP_CAPITAL_Z);
}
function isDigitRangeOrSet(node) {
    return ((node.type === "CharacterClassRange" &&
        node.min.value === utils_1.CP_DIGIT_ZERO &&
        node.max.value === utils_1.CP_DIGIT_NINE) ||
        (node.type === "CharacterSet" && node.kind === "digit" && !node.negate));
}
function isUnderscoreCharacter(node) {
    return node.type === "Character" && node.value === utils_1.CP_LOW_LINE;
}
exports.default = (0, utils_1.createRule)("prefer-w", {
    meta: {
        docs: {
            description: "enforce using `\\w`",
            category: "Stylistic Issues",
            recommended: true,
        },
        fixable: "code",
        schema: [],
        messages: {
            unexpected: "Unexpected {{type}} {{expr}}. Use '{{instead}}' instead.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor({ node, flags, getRegexpLocation, fixReplaceNode, patternSource, }) {
            return {
                onCharacterClassEnter(ccNode) {
                    const charSet = (0, regexp_ast_analysis_1.toUnicodeSet)(ccNode, flags);
                    let predefined = undefined;
                    const word = regexp_ast_analysis_1.Chars.word(flags);
                    if (charSet.equals(word)) {
                        predefined = "\\w";
                    }
                    else if (charSet.equals(word.negate())) {
                        predefined = "\\W";
                    }
                    if (predefined) {
                        context.report({
                            node,
                            loc: getRegexpLocation(ccNode),
                            messageId: "unexpected",
                            data: {
                                type: "character class",
                                expr: (0, mention_1.mention)(ccNode),
                                instead: predefined,
                            },
                            fix: fixReplaceNode(ccNode, predefined),
                        });
                        return;
                    }
                    const lowerAToZ = [];
                    const capitalAToZ = [];
                    const digit = [];
                    const underscore = [];
                    for (const element of ccNode.elements) {
                        if (isSmallLetterRange(element)) {
                            lowerAToZ.push(element);
                            if (flags.ignoreCase) {
                                capitalAToZ.push(element);
                            }
                        }
                        else if (isCapitalLetterRange(element)) {
                            capitalAToZ.push(element);
                            if (flags.ignoreCase) {
                                lowerAToZ.push(element);
                            }
                        }
                        else if (isDigitRangeOrSet(element)) {
                            digit.push(element);
                        }
                        else if (isUnderscoreCharacter(element)) {
                            underscore.push(element);
                        }
                    }
                    if (lowerAToZ.length &&
                        capitalAToZ.length &&
                        digit.length &&
                        underscore.length) {
                        const unexpectedElements = [
                            ...new Set([
                                ...lowerAToZ,
                                ...capitalAToZ,
                                ...digit,
                                ...underscore,
                            ]),
                        ].sort((a, b) => a.start - b.start);
                        context.report({
                            node,
                            loc: getRegexpLocation(ccNode),
                            messageId: "unexpected",
                            data: {
                                type: "character class ranges",
                                expr: `'[${unexpectedElements
                                    .map((e) => e.raw)
                                    .join("")}]'`,
                                instead: "\\w",
                            },
                            fix(fixer) {
                                const fixes = [];
                                for (const element of unexpectedElements) {
                                    const range = patternSource.getReplaceRange(element);
                                    if (!range) {
                                        return null;
                                    }
                                    if (fixes.length === 0) {
                                        fixes.push(range.replace(fixer, "\\w"));
                                    }
                                    else {
                                        fixes.push(range.remove(fixer));
                                    }
                                }
                                return fixes;
                            },
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
