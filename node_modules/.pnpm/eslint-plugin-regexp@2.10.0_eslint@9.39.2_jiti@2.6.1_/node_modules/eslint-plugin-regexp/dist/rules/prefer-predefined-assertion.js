"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
function getCharacters(lookaround) {
    if (lookaround.alternatives.length === 1) {
        const alt = lookaround.alternatives[0];
        if (alt.elements.length === 1) {
            const first = alt.elements[0];
            if (first.type === "CharacterSet" ||
                first.type === "CharacterClass" ||
                first.type === "ExpressionCharacterClass") {
                return first;
            }
        }
    }
    return null;
}
exports.default = (0, utils_1.createRule)("prefer-predefined-assertion", {
    meta: {
        docs: {
            description: "prefer predefined assertion over equivalent lookarounds",
            category: "Best Practices",
            recommended: true,
        },
        fixable: "code",
        schema: [],
        messages: {
            replace: "This lookaround assertion can be replaced with {{kind}} ('{{expr}}').",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor(regexpContext) {
            const { node, flags, getRegexpLocation, fixReplaceNode } = regexpContext;
            const word = regexp_ast_analysis_1.Chars.word(flags);
            const nonWord = regexp_ast_analysis_1.Chars.word(flags).negate();
            function replaceWordAssertion(aNode, wordNegated) {
                const direction = (0, regexp_ast_analysis_1.getMatchingDirectionFromAssertionKind)(aNode.kind);
                let lookaroundNegated = aNode.negate;
                if (wordNegated) {
                    const after = (0, regexp_ast_analysis_1.getFirstCharAfter)(aNode, direction, flags);
                    const hasNextCharacter = !after.edge;
                    if (hasNextCharacter) {
                        lookaroundNegated = !lookaroundNegated;
                    }
                    else {
                        return;
                    }
                }
                const before = (0, regexp_ast_analysis_1.getFirstCharAfter)(aNode, (0, regexp_ast_analysis_1.invertMatchingDirection)(direction), flags);
                if (before.edge) {
                    return;
                }
                let otherNegated;
                if (before.char.isSubsetOf(word)) {
                    otherNegated = false;
                }
                else if (before.char.isSubsetOf(nonWord)) {
                    otherNegated = true;
                }
                else {
                    return;
                }
                let kind = undefined;
                let replacement = undefined;
                if (lookaroundNegated === otherNegated) {
                    kind = "a negated word boundary assertion";
                    replacement = "\\B";
                }
                else {
                    kind = "a word boundary assertion";
                    replacement = "\\b";
                }
                if (kind && replacement) {
                    context.report({
                        node,
                        loc: getRegexpLocation(aNode),
                        messageId: "replace",
                        data: { kind, expr: replacement },
                        fix: fixReplaceNode(aNode, replacement),
                    });
                }
            }
            function replaceEdgeAssertion(aNode, lineAssertion) {
                if (!aNode.negate) {
                    return;
                }
                if (flags.multiline === lineAssertion) {
                    const replacement = aNode.kind === "lookahead" ? "$" : "^";
                    context.report({
                        node,
                        loc: getRegexpLocation(aNode),
                        messageId: "replace",
                        data: { kind: "an edge assertion", expr: replacement },
                        fix: fixReplaceNode(aNode, replacement),
                    });
                }
            }
            return {
                onAssertionEnter(aNode) {
                    if (aNode.kind !== "lookahead" &&
                        aNode.kind !== "lookbehind") {
                        return;
                    }
                    const chars = getCharacters(aNode);
                    if (chars === null) {
                        return;
                    }
                    if (chars.type === "CharacterSet") {
                        if (chars.kind === "word") {
                            replaceWordAssertion(aNode, chars.negate);
                            return;
                        }
                        if (chars.kind === "any") {
                            replaceEdgeAssertion(aNode, !flags.dotAll);
                            return;
                        }
                    }
                    const set = (0, regexp_ast_analysis_1.toUnicodeSet)(chars, flags);
                    if (!set.accept.isEmpty) {
                        return;
                    }
                    const charSet = set.chars;
                    if (charSet.isAll) {
                        replaceEdgeAssertion(aNode, false);
                    }
                    else if (charSet.equals(word)) {
                        replaceWordAssertion(aNode, false);
                    }
                    else if (charSet.equals(nonWord)) {
                        replaceWordAssertion(aNode, true);
                    }
                },
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
