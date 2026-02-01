"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
const mention_1 = require("../utils/mention");
const regexp_ast_1 = require("../utils/regexp-ast");
function isTrivialAssertion(assertion, dir, flags) {
    if (assertion.kind !== "word") {
        if ((0, regexp_ast_analysis_1.getMatchingDirectionFromAssertionKind)(assertion.kind) !== dir) {
            return true;
        }
    }
    if (assertion.kind === "lookahead" || assertion.kind === "lookbehind") {
        if ((0, regexp_ast_analysis_1.isPotentiallyEmpty)(assertion.alternatives, flags)) {
            return true;
        }
    }
    const look = regexp_ast_analysis_1.FirstConsumedChars.toLook((0, regexp_ast_analysis_1.getFirstConsumedChar)(assertion, dir, flags));
    if (look.char.isEmpty || look.char.isAll) {
        return true;
    }
    const after = (0, regexp_ast_analysis_1.getFirstCharAfter)(assertion, dir, flags);
    if (!after.edge) {
        if (look.exact && look.char.isSupersetOf(after.char)) {
            return true;
        }
        if (look.char.isDisjointWith(after.char)) {
            return true;
        }
    }
    return false;
}
function* getNextElements(start, dir, flags) {
    let element = start;
    for (;;) {
        const parent = element.parent;
        if (parent.type === "CharacterClass" ||
            parent.type === "CharacterClassRange" ||
            parent.type === "ClassIntersection" ||
            parent.type === "ClassSubtraction" ||
            parent.type === "StringAlternative") {
            return;
        }
        if (parent.type === "Quantifier") {
            if (parent.max === 1) {
                element = parent;
                continue;
            }
            else {
                return;
            }
        }
        const elements = parent.elements;
        const index = elements.indexOf(element);
        const inc = dir === "ltr" ? 1 : -1;
        for (let i = index + inc; i >= 0 && i < elements.length; i += inc) {
            const e = elements[i];
            yield e;
            if (!(0, regexp_ast_analysis_1.isZeroLength)(e, flags)) {
                return;
            }
        }
        const grandParent = parent.parent;
        if ((grandParent.type === "Group" ||
            grandParent.type === "CapturingGroup" ||
            (grandParent.type === "Assertion" &&
                (0, regexp_ast_analysis_1.getMatchingDirectionFromAssertionKind)(grandParent.kind) !==
                    dir)) &&
            grandParent.alternatives.length === 1) {
            element = grandParent;
            continue;
        }
        return;
    }
}
function tryFindContradictionIn(element, dir, condition, flags) {
    if (condition(element)) {
        return true;
    }
    if (element.type === "CapturingGroup" || element.type === "Group") {
        let some = false;
        element.alternatives.forEach((a) => {
            if (tryFindContradictionInAlternative(a, dir, condition, flags)) {
                some = true;
            }
        });
        return some;
    }
    if (element.type === "Quantifier" && element.max === 1) {
        return tryFindContradictionIn(element.element, dir, condition, flags);
    }
    if (element.type === "Assertion" &&
        (element.kind === "lookahead" || element.kind === "lookbehind") &&
        (0, regexp_ast_analysis_1.getMatchingDirectionFromAssertionKind)(element.kind) === dir) {
        element.alternatives.forEach((a) => tryFindContradictionInAlternative(a, dir, condition, flags));
    }
    return false;
}
function tryFindContradictionInAlternative(alternative, dir, condition, flags) {
    if (condition(alternative)) {
        return true;
    }
    const { elements } = alternative;
    const first = dir === "ltr" ? 0 : elements.length;
    const inc = dir === "ltr" ? 1 : -1;
    for (let i = first; i >= 0 && i < elements.length; i += inc) {
        const e = elements[i];
        if (tryFindContradictionIn(e, dir, condition, flags)) {
            return true;
        }
        if (!(0, regexp_ast_analysis_1.isZeroLength)(e, flags)) {
            break;
        }
    }
    return false;
}
function disjoint(a, b) {
    if (a.edge && b.edge) {
        return false;
    }
    return a.char.isDisjointWith(b.char);
}
exports.default = (0, utils_1.createRule)("no-contradiction-with-assertion", {
    meta: {
        docs: {
            description: "disallow elements that contradict assertions",
            category: "Possible Errors",
            recommended: true,
        },
        schema: [],
        messages: {
            alternative: "The alternative {{ alt }} can never be entered because it contradicts with the assertion {{ assertion }}. Either change the alternative or assertion to resolve the contradiction.",
            cannotEnterQuantifier: "The quantifier {{ quant }} can never be entered because its element contradicts with the assertion {{ assertion }}. Change or remove the quantifier or change the assertion to resolve the contradiction.",
            alwaysEnterQuantifier: "The quantifier {{ quant }} is always entered despite having a minimum of 0. This is because the assertion {{ assertion }} contradicts with the element(s) after the quantifier. Either set the minimum to 1 ({{ newQuant }}) or change the assertion.",
            removeQuantifier: "Remove the quantifier.",
            changeQuantifier: "Change the quantifier to {{ newQuant }}.",
        },
        hasSuggestions: true,
        type: "problem",
    },
    create(context) {
        function createVisitor(regexpContext) {
            const { node, flags, getRegexpLocation, fixReplaceQuant, fixReplaceNode, } = regexpContext;
            function analyseAssertion(assertion, dir) {
                if (isTrivialAssertion(assertion, dir, flags)) {
                    return;
                }
                const assertionLook = regexp_ast_analysis_1.FirstConsumedChars.toLook((0, regexp_ast_analysis_1.getFirstConsumedChar)(assertion, dir, flags));
                for (const element of getNextElements(assertion, dir, flags)) {
                    if (tryFindContradictionIn(element, dir, contradicts, flags)) {
                        break;
                    }
                }
                function contradictsAlternative(alternative) {
                    let consumed = (0, regexp_ast_analysis_1.getFirstConsumedChar)(alternative, dir, flags);
                    if (consumed.empty) {
                        consumed = regexp_ast_analysis_1.FirstConsumedChars.concat([
                            consumed,
                            (0, regexp_ast_analysis_1.getFirstConsumedCharAfter)(alternative, dir, flags),
                        ], flags);
                    }
                    const look = regexp_ast_analysis_1.FirstConsumedChars.toLook(consumed);
                    if (disjoint(assertionLook, look)) {
                        context.report({
                            node,
                            loc: getRegexpLocation(alternative),
                            messageId: "alternative",
                            data: {
                                assertion: (0, mention_1.mention)(assertion),
                                alt: (0, mention_1.mention)(alternative),
                            },
                        });
                        return true;
                    }
                    return false;
                }
                function contradictsQuantifier(quant) {
                    if (quant.max === 0) {
                        return false;
                    }
                    if (quant.min !== 0) {
                        return false;
                    }
                    const consumed = (0, regexp_ast_analysis_1.getFirstConsumedChar)(quant.element, dir, flags);
                    const look = regexp_ast_analysis_1.FirstConsumedChars.toLook(consumed);
                    if (disjoint(assertionLook, look)) {
                        context.report({
                            node,
                            loc: getRegexpLocation(quant),
                            messageId: "cannotEnterQuantifier",
                            data: {
                                assertion: (0, mention_1.mention)(assertion),
                                quant: (0, mention_1.mention)(quant),
                            },
                            suggest: [
                                {
                                    messageId: "removeQuantifier",
                                    fix: fixReplaceNode(quant, ""),
                                },
                            ],
                        });
                        return true;
                    }
                    const after = (0, regexp_ast_analysis_1.getFirstCharAfter)(quant, dir, flags);
                    if (disjoint(assertionLook, after)) {
                        const newQuant = (0, regexp_ast_1.quantToString)({ ...quant, min: 1 });
                        context.report({
                            node,
                            loc: getRegexpLocation(quant),
                            messageId: "alwaysEnterQuantifier",
                            data: {
                                assertion: (0, mention_1.mention)(assertion),
                                quant: (0, mention_1.mention)(quant),
                                newQuant,
                            },
                            suggest: [
                                {
                                    messageId: "changeQuantifier",
                                    data: { newQuant },
                                    fix: fixReplaceQuant(quant, {
                                        min: 1,
                                        max: quant.max,
                                    }),
                                },
                            ],
                        });
                        return true;
                    }
                    return false;
                }
                function contradicts(element) {
                    if (element.type === "Alternative") {
                        return contradictsAlternative(element);
                    }
                    else if (element.type === "Quantifier") {
                        return contradictsQuantifier(element);
                    }
                    return false;
                }
            }
            return {
                onAssertionEnter(assertion) {
                    analyseAssertion(assertion, "ltr");
                    analyseAssertion(assertion, "rtl");
                },
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
