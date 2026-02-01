"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const refa_1 = require("refa");
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
const lexicographically_smallest_1 = require("../utils/lexicographically-smallest");
const refa_2 = require("../utils/refa");
const cache = new Map();
function getAllowedChars(flags) {
    (0, refa_2.assertValidFlags)(flags);
    const cacheKey = (flags.ignoreCase ? "i" : "") +
        (flags.unicode ? "u" : "") +
        (flags.unicodeSets ? "v" : "");
    let result = cache.get(cacheKey);
    if (result === undefined) {
        result = {
            allowed: refa_1.JS.createCharSet([
                { kind: "word", negate: false },
                { min: utils_1.CP_SPACE, max: utils_1.CP_SPACE },
                { min: utils_1.CP_PLUS, max: utils_1.CP_PLUS },
                { min: utils_1.CP_MINUS, max: utils_1.CP_MINUS },
                { min: utils_1.CP_STAR, max: utils_1.CP_STAR },
                { min: utils_1.CP_SLASH, max: utils_1.CP_SLASH },
                { min: utils_1.CP_APOSTROPHE, max: utils_1.CP_APOSTROPHE },
                { min: utils_1.CP_QUESTION, max: utils_1.CP_QUESTION },
            ], flags),
            required: regexp_ast_analysis_1.Chars.word(flags),
        };
        cache.set(cacheKey, result);
    }
    return result;
}
function containsOnlyLiterals(element) {
    return !(0, regexp_ast_analysis_1.hasSomeDescendant)(element, (d) => {
        return (d.type === "Backreference" ||
            d.type === "CharacterSet" ||
            (d.type === "Quantifier" && d.max === Infinity) ||
            (d.type === "CharacterClass" && d.negate) ||
            (d.type === "ExpressionCharacterClass" && d.negate));
    }, (d) => d.type !== "Assertion");
}
const lssCache = new WeakMap();
function cachedApproximateLexicographicallySmallest(alternative, parser, flags) {
    let cached = lssCache.get(alternative);
    if (cached === undefined) {
        cached = approximateLexicographicallySmallest(alternative, parser, flags);
        lssCache.set(alternative, cached);
    }
    return cached;
}
const LONGEST_PREFIX_OPTIONS = {
    includeAfter: true,
    onlyInside: true,
    looseGroups: true,
};
function approximateLexicographicallySmallest(alternative, parser, flags) {
    const lss = getLexicographicallySmallestFromAlternative(alternative, parser, flags);
    if (lss !== undefined)
        return lss;
    const prefix = (0, regexp_ast_analysis_1.getLongestPrefix)(alternative, "ltr", flags, LONGEST_PREFIX_OPTIONS);
    return getLexicographicallySmallestFromCharSets(prefix);
}
function getLexicographicallySmallestFromAlternative(alternative, parser, flags) {
    if (alternative.type === "StringAlternative" ||
        hasOnlyCharacters(alternative, flags)) {
        const smallest = [];
        for (const e of alternative.elements) {
            const cs = (0, regexp_ast_analysis_1.toUnicodeSet)(e, flags).chars;
            if (cs.isEmpty)
                return undefined;
            smallest.push(cs.ranges[0].min);
        }
        return smallest;
    }
    if (isOnlyCharacterElements(alternative.elements)) {
        return (0, lexicographically_smallest_1.getLexicographicallySmallestInConcatenation)(alternative.elements.map((e) => (0, regexp_ast_analysis_1.toUnicodeSet)(e, flags)));
    }
    try {
        const result = parser.parseElement(alternative, {
            assertions: "unknown",
            backreferences: "disable",
            maxBackreferenceWords: 4,
            maxNodes: 1000,
        });
        const expression = (0, refa_1.transform)({
            onConcatenation(concat) {
                concat.elements = concat.elements.filter((e) => e.type !== "Unknown");
            },
        }, result.expression);
        const nfa = refa_1.NFA.fromRegex(expression, { maxCharacter: result.maxCharacter }, {}, new refa_1.NFA.LimitedNodeFactory(1000));
        return getLexicographicallySmallestFromNfa(nfa.initial, nfa.finals);
    }
    catch (_a) {
        return undefined;
    }
}
function isOnlyCharacterElements(nodes) {
    return nodes.every((e) => e.type === "Character" ||
        e.type === "CharacterClass" ||
        e.type === "CharacterSet" ||
        e.type === "ExpressionCharacterClass");
}
function hasOnlyCharacters(alternative, flags) {
    return (isOnlyCharacterElements(alternative.elements) &&
        alternative.elements.every((e) => !(0, regexp_ast_analysis_1.hasStrings)(e, flags)));
}
function getLexicographicallySmallestFromNfa(initial, finals) {
    const smallest = [];
    let currentStates = [initial];
    const newStatesSet = new Set();
    const MAX_LENGTH = 1000;
    for (let i = 0; i < MAX_LENGTH; i++) {
        if (currentStates.some((n) => finals.has(n))) {
            return smallest;
        }
        let min = Infinity;
        for (const state of currentStates) {
            state.out.forEach((charSet) => {
                if (!charSet.isEmpty) {
                    min = Math.min(min, charSet.ranges[0].min);
                }
            });
        }
        if (min === Infinity) {
            return undefined;
        }
        smallest.push(min);
        const newStates = [];
        newStatesSet.clear();
        for (const state of currentStates) {
            state.out.forEach((charSet, to) => {
                if (charSet.has(min) && !newStatesSet.has(to)) {
                    newStates.push(to);
                    newStatesSet.add(to);
                }
            });
        }
        currentStates = newStates;
    }
    return undefined;
}
function getLexicographicallySmallestFromCharSets(word) {
    const result = [];
    for (const set of word) {
        if (set.isEmpty)
            break;
        result.push(set.ranges[0].min);
    }
    return result;
}
function compareByteOrder(a, b) {
    if (a === b) {
        return 0;
    }
    return a < b ? -1 : +1;
}
function compareCharSets(a, b) {
    const aRanges = a.ranges;
    const bRanges = b.ranges;
    for (let i = 0; i < aRanges.length && i < bRanges.length; i++) {
        const aR = aRanges[i];
        const bR = bRanges[i];
        if (aR.min !== bR.min)
            return aR.min - bR.min;
        if (aR.max !== bR.max) {
            if (aR.max < bR.max) {
                return i + 1 < aRanges.length ? +1 : -1;
            }
            else {
                return i + 1 < bRanges.length ? -1 : +1;
            }
        }
    }
    return aRanges.length - bRanges.length;
}
function compareCharSetStrings(a, b) {
    const l = Math.min(a.length, b.length);
    for (let i = 0; i < l; i++) {
        const diff = compareCharSets(a[i], b[i]);
        if (diff !== 0) {
            return diff;
        }
    }
    return a.length - b.length;
}
function compareWords(a, b) {
    const l = Math.min(a.length, b.length);
    for (let i = 0; i < l; i++) {
        const aI = a[i];
        const bI = b[i];
        if (aI !== bI)
            return aI - bI;
    }
    return a.length - b.length;
}
function sortAlternatives(alternatives, parser, flags) {
    alternatives.sort((a, b) => {
        const lssDiff = compareWords(cachedApproximateLexicographicallySmallest(a, parser, flags), cachedApproximateLexicographicallySmallest(b, parser, flags));
        if (lssDiff !== 0) {
            return lssDiff;
        }
        const prefixDiff = compareCharSetStrings((0, regexp_ast_analysis_1.getLongestPrefix)(a, "ltr", flags, LONGEST_PREFIX_OPTIONS), (0, regexp_ast_analysis_1.getLongestPrefix)(b, "ltr", flags, LONGEST_PREFIX_OPTIONS));
        if (prefixDiff !== 0) {
            return prefixDiff;
        }
        if (flags.ignoreCase) {
            return (compareByteOrder(a.raw.toUpperCase(), b.raw.toUpperCase()) ||
                compareByteOrder(a.raw, b.raw));
        }
        return compareByteOrder(a.raw, b.raw);
    });
}
function sortStringAlternatives(alternatives, parser, flags) {
    alternatives.sort((a, b) => {
        const lssDiff = compareWords(getLexicographicallySmallestFromAlternative(a, parser, flags), getLexicographicallySmallestFromAlternative(b, parser, flags));
        return lssDiff;
    });
}
function isIntegerString(str) {
    return /^(?:0|[1-9]\d*)$/u.test(str);
}
function trySortNumberAlternatives(alternatives) {
    const runs = getRuns(alternatives, (a) => isIntegerString(a.raw));
    for (const { startIndex, elements } of runs) {
        elements.sort((a, b) => {
            return Number(a.raw) - Number(b.raw);
        });
        alternatives.splice(startIndex, elements.length, ...elements);
    }
}
function getReorderingBounds(original, reorder) {
    if (original.length !== reorder.length) {
        return undefined;
    }
    const len = original.length;
    let first = 0;
    for (; first < len && original[first] === reorder[first]; first++)
        ;
    if (first === len) {
        return undefined;
    }
    let last = len - 1;
    for (; last >= 0 && original[last] === reorder[last]; last--)
        ;
    return [first, last];
}
function getRuns(iter, condFn) {
    const runs = [];
    let elements = [];
    let index = 0;
    for (const item of iter) {
        if (condFn(item)) {
            elements.push(item);
        }
        else {
            if (elements.length > 0) {
                runs.push({ startIndex: index - elements.length, elements });
                elements = [];
            }
        }
        index++;
    }
    if (elements.length > 0) {
        runs.push({ startIndex: index - elements.length, elements });
        elements = [];
    }
    return runs;
}
exports.default = (0, utils_1.createRule)("sort-alternatives", {
    meta: {
        docs: {
            description: "sort alternatives if order doesn't matter",
            category: "Best Practices",
            recommended: false,
        },
        fixable: "code",
        schema: [],
        messages: {
            sort: "The {{alternatives}} can be sorted without affecting the regex.",
        },
        type: "suggestion",
    },
    create(context) {
        const sliceMinLength = 3;
        function createVisitor(regexpContext) {
            const { node, getRegexpLocation, fixReplaceNode, flags } = regexpContext;
            const allowedChars = getAllowedChars(flags);
            const possibleCharsCache = new Map();
            const parser = (0, refa_2.getParser)(regexpContext);
            function getPossibleChars(a) {
                let chars = possibleCharsCache.get(a);
                if (chars === undefined) {
                    chars = (0, regexp_ast_analysis_1.getConsumedChars)(a, flags).chars;
                }
                return chars;
            }
            function trySortRun(run) {
                const alternatives = run.elements;
                if ((0, regexp_ast_analysis_1.canReorder)(alternatives, flags)) {
                    sortAlternatives(alternatives, parser, flags);
                    trySortNumberAlternatives(alternatives);
                }
                else {
                    const consumedChars = regexp_ast_analysis_1.Chars.empty(flags).union(...alternatives.map(getPossibleChars));
                    if (!consumedChars.isDisjointWith(regexp_ast_analysis_1.Chars.digit(flags))) {
                        const runs = getRuns(alternatives, (a) => isIntegerString(a.raw));
                        for (const { startIndex: index, elements } of runs) {
                            if (elements.length > 1 &&
                                (0, regexp_ast_analysis_1.canReorder)(elements, flags)) {
                                trySortNumberAlternatives(elements);
                                alternatives.splice(index, elements.length, ...elements);
                            }
                        }
                    }
                }
                enforceSorted(run, "alternatives of this group");
            }
            function enforceSorted(run, alternatives) {
                const sorted = run.elements;
                const parent = sorted[0].parent;
                const unsorted = parent.alternatives.slice(run.startIndex, run.startIndex + sorted.length);
                const bounds = getReorderingBounds(unsorted, sorted);
                if (!bounds) {
                    return;
                }
                const loc = getRegexpLocation({
                    start: unsorted[bounds[0]].start,
                    end: unsorted[bounds[1]].end,
                });
                context.report({
                    node,
                    loc,
                    messageId: "sort",
                    data: { alternatives },
                    fix: fixReplaceNode(parent, () => {
                        const prefix = parent.raw.slice(0, unsorted[0].start - parent.start);
                        const suffix = parent.raw.slice(unsorted[unsorted.length - 1].end - parent.start);
                        return (prefix + sorted.map((a) => a.raw).join("|") + suffix);
                    }),
                });
            }
            function onParent(parent) {
                if (parent.alternatives.length < 2) {
                    return;
                }
                const runs = getRuns(parent.alternatives, (a) => {
                    if (!containsOnlyLiterals(a)) {
                        return false;
                    }
                    const consumedChars = getPossibleChars(a);
                    if (consumedChars.isEmpty) {
                        return false;
                    }
                    if (!consumedChars.isSubsetOf(allowedChars.allowed)) {
                        return false;
                    }
                    if (consumedChars.isDisjointWith(allowedChars.required)) {
                        return false;
                    }
                    return true;
                });
                if (runs.length === 1 &&
                    runs[0].elements.length === parent.alternatives.length) {
                    trySortRun(runs[0]);
                }
                else {
                    for (const run of runs) {
                        if (run.elements.length >= sliceMinLength &&
                            run.elements.length >= 2) {
                            trySortRun(run);
                        }
                    }
                }
            }
            function onClassStringDisjunction(parent) {
                if (parent.alternatives.length < 2) {
                    return;
                }
                const alternatives = [...parent.alternatives];
                sortStringAlternatives(alternatives, parser, flags);
                trySortNumberAlternatives(alternatives);
                const run = {
                    startIndex: 0,
                    elements: [...alternatives],
                };
                enforceSorted(run, "string alternatives");
            }
            return {
                onGroupEnter: onParent,
                onPatternEnter: onParent,
                onCapturingGroupEnter: onParent,
                onClassStringDisjunctionEnter: onClassStringDisjunction,
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
