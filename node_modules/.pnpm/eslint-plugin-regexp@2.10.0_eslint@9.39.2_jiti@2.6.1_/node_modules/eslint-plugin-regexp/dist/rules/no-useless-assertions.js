"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
const mention_1 = require("../utils/mention");
const util_1 = require("../utils/util");
function containsAssertion(n) {
    return (0, regexp_ast_analysis_1.hasSomeDescendant)(n, (d) => d.type === "Assertion");
}
function isSingleCharacterAssertion(assertion, direction, flags) {
    switch (assertion.kind) {
        case "word":
            return false;
        case "start":
            return direction === "rtl";
        case "end":
            return direction === "ltr";
        default:
            break;
    }
    if ((0, regexp_ast_analysis_1.getMatchingDirectionFromAssertionKind)(assertion.kind) !== direction) {
        return false;
    }
    return assertion.alternatives.every((alt) => {
        if (!containsAssertion(alt)) {
            const range = (0, regexp_ast_analysis_1.getLengthRange)(alt, flags);
            return range.min === 1 && range.max === 1;
        }
        let consumed = false;
        let asserted = false;
        const elements = direction === "ltr" ? alt.elements : [...alt.elements].reverse();
        for (const e of elements) {
            if (!consumed) {
                if (e.type === "Assertion" &&
                    isSingleCharacterAssertion(e, direction, flags)) {
                    asserted = true;
                    continue;
                }
                if (containsAssertion(e)) {
                    return false;
                }
                const range = (0, regexp_ast_analysis_1.getLengthRange)(e, flags);
                if (range.max === 0) {
                    continue;
                }
                else if (range.min === 1 && range.max === 1) {
                    consumed = true;
                }
                else {
                    return false;
                }
            }
            else {
                const otherDir = (0, regexp_ast_analysis_1.invertMatchingDirection)(direction);
                if (e.type === "Assertion" &&
                    isSingleCharacterAssertion(e, otherDir, flags)) {
                    continue;
                }
                return false;
            }
        }
        return consumed || asserted;
    });
}
function firstLookCharsIntersection(a, b) {
    const char = a.char.intersect(b.char);
    return {
        char: a.char.intersect(b.char),
        exact: (a.exact && b.exact) || char.isEmpty,
        edge: a.edge && b.edge,
    };
}
function createReorderingGetFirstCharAfter(forbidden) {
    function hasForbidden(element) {
        if (element.type === "Assertion" && forbidden.has(element)) {
            return true;
        }
        for (const f of forbidden) {
            if ((0, regexp_ast_analysis_1.hasSomeDescendant)(element, f)) {
                return true;
            }
        }
        return false;
    }
    return (afterThis, direction, flags) => {
        let result = (0, regexp_ast_analysis_1.getFirstCharAfter)(afterThis, direction, flags);
        if (afterThis.parent.type === "Alternative") {
            const { elements } = afterThis.parent;
            const inc = direction === "ltr" ? -1 : +1;
            const start = elements.indexOf(afterThis);
            for (let i = start + inc; i >= 0 && i < elements.length; i += inc) {
                const other = elements[i];
                if (!(0, regexp_ast_analysis_1.isZeroLength)(other, flags)) {
                    break;
                }
                if (hasForbidden(other)) {
                    break;
                }
                const otherResult = regexp_ast_analysis_1.FirstConsumedChars.toLook((0, regexp_ast_analysis_1.getFirstConsumedChar)(other, direction, flags));
                result = firstLookCharsIntersection(result, otherResult);
            }
        }
        return result;
    };
}
function removeAlternative(alternative) {
    const parent = alternative.parent;
    if (parent.alternatives.length > 1) {
        let { start, end } = alternative;
        if (parent.alternatives[0] === alternative) {
            end++;
        }
        else {
            start--;
        }
        const before = parent.raw.slice(0, start - parent.start);
        const after = parent.raw.slice(end - parent.start);
        return [parent, before + after];
    }
    switch (parent.type) {
        case "Pattern":
            return [parent, "[]"];
        case "Assertion": {
            const assertionParent = parent.parent;
            if (parent.negate) {
                return [
                    assertionParent.type === "Quantifier"
                        ? assertionParent
                        : parent,
                    "",
                ];
            }
            if (assertionParent.type === "Quantifier") {
                if (assertionParent.min === 0) {
                    return [assertionParent, ""];
                }
                return removeAlternative(assertionParent.parent);
            }
            return removeAlternative(assertionParent);
        }
        case "CapturingGroup": {
            const before = parent.raw.slice(0, alternative.start - parent.start);
            const after = parent.raw.slice(alternative.end - parent.start);
            return [parent, `${before}[]${after}`];
        }
        case "Group": {
            const groupParent = parent.parent;
            if (groupParent.type === "Quantifier") {
                if (groupParent.min === 0) {
                    return [groupParent, ""];
                }
                return removeAlternative(groupParent.parent);
            }
            return removeAlternative(groupParent);
        }
        default:
            return (0, util_1.assertNever)(parent);
    }
}
const messages = {
    alwaysRejectByChar: "{{assertion}} will always reject because it is {{followedOrPreceded}} by a character.",
    alwaysAcceptByChar: "{{assertion}} will always accept because it is never {{followedOrPreceded}} by a character.",
    alwaysRejectByNonLineTerminator: "{{assertion}} will always reject because it is {{followedOrPreceded}} by a non-line-terminator character.",
    alwaysAcceptByLineTerminator: "{{assertion}} will always accept because it is {{followedOrPreceded}} by a line-terminator character.",
    alwaysAcceptByLineTerminatorOrEdge: "{{assertion}} will always accept because it is {{followedOrPreceded}} by a line-terminator character or the {{startOrEnd}} of the input string.",
    alwaysAcceptOrRejectFollowedByWord: "{{assertion}} will always {{acceptOrReject}} because it is preceded by a non-word character and followed by a word character.",
    alwaysAcceptOrRejectFollowedByNonWord: "{{assertion}} will always {{acceptOrReject}} because it is preceded by a non-word character and followed by a non-word character.",
    alwaysAcceptOrRejectPrecededByWordFollowedByNonWord: "{{assertion}} will always {{acceptOrReject}} because it is preceded by a word character and followed by a non-word character.",
    alwaysAcceptOrRejectPrecededByWordFollowedByWord: "{{assertion}} will always {{acceptOrReject}} because it is preceded by a word character and followed by a word character.",
    alwaysForLookaround: "The {{kind}} {{assertion}} will always {{acceptOrReject}}.",
    alwaysForNegativeLookaround: "The negative {{kind}} {{assertion}} will always {{acceptOrReject}}.",
    acceptSuggestion: "Remove the assertion. (Replace with empty string.)",
    rejectSuggestion: "Remove branch of the assertion. (Replace with empty set.)",
};
exports.default = (0, utils_1.createRule)("no-useless-assertions", {
    meta: {
        docs: {
            description: "disallow assertions that are known to always accept (or reject)",
            category: "Possible Errors",
            recommended: true,
        },
        hasSuggestions: true,
        schema: [],
        messages,
        type: "problem",
    },
    create(context) {
        function createVisitor({ node, flags, getRegexpLocation, fixReplaceNode, }) {
            const reported = new Set();
            function replaceWithEmptyString(assertion) {
                if (assertion.parent.type === "Quantifier") {
                    return fixReplaceNode(assertion.parent, "");
                }
                return fixReplaceNode(assertion, "");
            }
            function replaceWithEmptySet(assertion) {
                if (assertion.parent.type === "Quantifier") {
                    if (assertion.parent.min === 0) {
                        return fixReplaceNode(assertion.parent, "");
                    }
                    const [element, replacement] = removeAlternative(assertion.parent.parent);
                    return fixReplaceNode(element, replacement);
                }
                const [element, replacement] = removeAlternative(assertion.parent);
                return fixReplaceNode(element, replacement);
            }
            function report(assertion, messageId, data) {
                reported.add(assertion);
                const { acceptOrReject } = data;
                context.report({
                    node,
                    loc: getRegexpLocation(assertion),
                    messageId,
                    data: {
                        assertion: (0, mention_1.mention)(assertion),
                        ...data,
                    },
                    suggest: [
                        {
                            messageId: `${acceptOrReject}Suggestion`,
                            fix: acceptOrReject === "accept"
                                ? replaceWithEmptyString(assertion)
                                : replaceWithEmptySet(assertion),
                        },
                    ],
                });
            }
            function verifyStartOrEnd(assertion, getFirstCharAfterFn) {
                const direction = (0, regexp_ast_analysis_1.getMatchingDirectionFromAssertionKind)(assertion.kind);
                const next = getFirstCharAfterFn(assertion, direction, flags);
                const followedOrPreceded = assertion.kind === "end" ? "followed" : "preceded";
                const lineTerminator = regexp_ast_analysis_1.Chars.lineTerminator(flags);
                if (next.edge) {
                    if (!flags.multiline) {
                        if (next.char.isEmpty) {
                            report(assertion, "alwaysAcceptByChar", {
                                followedOrPreceded,
                                acceptOrReject: "accept",
                            });
                        }
                    }
                    else {
                        if (next.char.isSubsetOf(lineTerminator)) {
                            report(assertion, "alwaysAcceptByLineTerminatorOrEdge", {
                                followedOrPreceded,
                                startOrEnd: assertion.kind,
                                acceptOrReject: "accept",
                            });
                        }
                    }
                }
                else {
                    if (!flags.multiline) {
                        report(assertion, "alwaysRejectByChar", {
                            followedOrPreceded,
                            acceptOrReject: "reject",
                        });
                    }
                    else {
                        if (next.char.isDisjointWith(lineTerminator)) {
                            report(assertion, "alwaysRejectByNonLineTerminator", {
                                followedOrPreceded,
                                acceptOrReject: "reject",
                            });
                        }
                        else if (next.char.isSubsetOf(lineTerminator)) {
                            report(assertion, "alwaysAcceptByLineTerminator", {
                                followedOrPreceded,
                                acceptOrReject: "accept",
                            });
                        }
                    }
                }
            }
            function verifyWordBoundary(assertion, getFirstCharAfterFn) {
                const word = regexp_ast_analysis_1.Chars.word(flags);
                const next = getFirstCharAfterFn(assertion, "ltr", flags);
                const prev = getFirstCharAfterFn(assertion, "rtl", flags);
                const nextIsWord = next.char.isSubsetOf(word) && !next.edge;
                const prevIsWord = prev.char.isSubsetOf(word) && !prev.edge;
                const nextIsNonWord = next.char.isDisjointWith(word);
                const prevIsNonWord = prev.char.isDisjointWith(word);
                const accept = assertion.negate ? "reject" : "accept";
                const reject = assertion.negate ? "accept" : "reject";
                if (prevIsNonWord) {
                    if (nextIsWord) {
                        report(assertion, "alwaysAcceptOrRejectFollowedByWord", {
                            acceptOrReject: accept,
                        });
                    }
                    if (nextIsNonWord) {
                        report(assertion, "alwaysAcceptOrRejectFollowedByNonWord", {
                            acceptOrReject: reject,
                        });
                    }
                }
                if (prevIsWord) {
                    if (nextIsNonWord) {
                        report(assertion, "alwaysAcceptOrRejectPrecededByWordFollowedByNonWord", {
                            acceptOrReject: accept,
                        });
                    }
                    if (nextIsWord) {
                        report(assertion, "alwaysAcceptOrRejectPrecededByWordFollowedByWord", {
                            acceptOrReject: reject,
                        });
                    }
                }
            }
            function verifyLookaround(assertion, getFirstCharAfterFn) {
                if ((0, regexp_ast_analysis_1.isPotentiallyEmpty)(assertion.alternatives, flags)) {
                    return;
                }
                const direction = (0, regexp_ast_analysis_1.getMatchingDirectionFromAssertionKind)(assertion.kind);
                const after = getFirstCharAfterFn(assertion, direction, flags);
                const firstOf = regexp_ast_analysis_1.FirstConsumedChars.toLook((0, regexp_ast_analysis_1.getFirstConsumedChar)(assertion.alternatives, direction, flags));
                const accept = assertion.negate ? "reject" : "accept";
                const reject = assertion.negate ? "accept" : "reject";
                if (after.char.isDisjointWith(firstOf.char) &&
                    !(after.edge && firstOf.edge)) {
                    report(assertion, assertion.negate
                        ? "alwaysForNegativeLookaround"
                        : "alwaysForLookaround", {
                        kind: assertion.kind,
                        acceptOrReject: reject,
                    });
                }
                const edgeSubset = firstOf.edge || !after.edge;
                if (firstOf.exact &&
                    edgeSubset &&
                    after.char.isSubsetOf(firstOf.char) &&
                    isSingleCharacterAssertion(assertion, (0, regexp_ast_analysis_1.getMatchingDirectionFromAssertionKind)(assertion.kind), flags)) {
                    report(assertion, assertion.negate
                        ? "alwaysForNegativeLookaround"
                        : "alwaysForLookaround", {
                        kind: assertion.kind,
                        acceptOrReject: accept,
                    });
                }
            }
            function verifyAssertion(assertion, getFirstCharAfterFn) {
                switch (assertion.kind) {
                    case "start":
                    case "end":
                        verifyStartOrEnd(assertion, getFirstCharAfterFn);
                        break;
                    case "word":
                        verifyWordBoundary(assertion, getFirstCharAfterFn);
                        break;
                    case "lookahead":
                    case "lookbehind":
                        verifyLookaround(assertion, getFirstCharAfterFn);
                        break;
                    default:
                        throw (0, util_1.assertNever)(assertion);
                }
            }
            const allAssertions = [];
            return {
                onAssertionEnter(assertion) {
                    verifyAssertion(assertion, regexp_ast_analysis_1.getFirstCharAfter);
                    allAssertions.push(assertion);
                },
                onPatternLeave() {
                    const reorderingGetFirstCharAfter = createReorderingGetFirstCharAfter(reported);
                    for (const assertion of allAssertions) {
                        if (!reported.has(assertion)) {
                            verifyAssertion(assertion, reorderingGetFirstCharAfter);
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
