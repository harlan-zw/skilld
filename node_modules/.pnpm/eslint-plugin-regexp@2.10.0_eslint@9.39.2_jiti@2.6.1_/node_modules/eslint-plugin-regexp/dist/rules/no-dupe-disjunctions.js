"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const refa_1 = require("refa");
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
const char_ranges_1 = require("../utils/char-ranges");
const get_usage_of_pattern_1 = require("../utils/get-usage-of-pattern");
const mention_1 = require("../utils/mention");
const partial_parser_1 = require("../utils/partial-parser");
const refa_2 = require("../utils/refa");
const regexp_ast_1 = require("../utils/regexp-ast");
const util_1 = require("../utils/util");
function isStared(node) {
    let max = (0, regexp_ast_analysis_1.getEffectiveMaximumRepetition)(node);
    if (node.type === "Quantifier") {
        max *= node.max;
    }
    return max > 10;
}
function hasNothingAfterNode(node) {
    const md = (0, regexp_ast_analysis_1.getMatchingDirection)(node);
    for (let p = node;; p = p.parent) {
        if (p.type === "Assertion" || p.type === "Pattern") {
            return true;
        }
        if (p.type !== "Alternative") {
            const parent = p.parent;
            if (parent.type === "Quantifier") {
                if (parent.max > 1) {
                    return false;
                }
            }
            else {
                const lastIndex = md === "ltr" ? parent.elements.length - 1 : 0;
                if (parent.elements[lastIndex] !== p) {
                    return false;
                }
            }
        }
    }
}
function containsAssertions(expression) {
    try {
        (0, refa_1.visitAst)(expression, {
            onAssertionEnter() {
                throw new Error();
            },
        });
        return false;
    }
    catch (_a) {
        return true;
    }
}
function containsAssertionsOrUnknowns(expression) {
    try {
        (0, refa_1.visitAst)(expression, {
            onAssertionEnter() {
                throw new Error();
            },
            onUnknownEnter() {
                throw new Error();
            },
        });
        return false;
    }
    catch (_a) {
        return true;
    }
}
function isNonRegular(node) {
    return (0, regexp_ast_analysis_1.hasSomeDescendant)(node, (d) => d.type === "Assertion" || d.type === "Backreference");
}
function toNFA(parser, element) {
    try {
        const { expression, maxCharacter } = parser.parseElement(element, {
            backreferences: "unknown",
            assertions: "parse",
        });
        let e;
        if (containsAssertions(expression)) {
            e = (0, refa_1.transform)(refa_1.Transformers.simplify({
                ignoreAmbiguity: true,
                ignoreOrder: true,
            }), expression);
        }
        else {
            e = expression;
        }
        return {
            nfa: refa_1.NFA.fromRegex(e, { maxCharacter }, { assertions: "disable", unknowns: "disable" }),
            partial: containsAssertionsOrUnknowns(e),
        };
    }
    catch (_a) {
        return {
            nfa: refa_1.NFA.empty({
                maxCharacter: parser.maxCharacter,
            }),
            partial: true,
        };
    }
}
function* iterateNestedAlternatives(alternative) {
    for (const e of alternative.elements) {
        if (e.type === "Group" || e.type === "CapturingGroup") {
            for (const a of e.alternatives) {
                if (e.alternatives.length > 1) {
                    yield a;
                }
                yield* iterateNestedAlternatives(a);
            }
        }
        if (e.type === "CharacterClass" && !e.negate) {
            const nested = [];
            const addToNested = (charElement) => {
                switch (charElement.type) {
                    case "CharacterClassRange": {
                        const min = charElement.min;
                        const max = charElement.max;
                        if (min.value === max.value) {
                            nested.push(charElement);
                        }
                        else if (min.value + 1 === max.value) {
                            nested.push(min, max);
                        }
                        else {
                            nested.push(charElement, min, max);
                        }
                        break;
                    }
                    case "ClassStringDisjunction": {
                        nested.push(...charElement.alternatives);
                        break;
                    }
                    case "CharacterClass": {
                        if (!charElement.negate) {
                            charElement.elements.forEach(addToNested);
                        }
                        else {
                            nested.push(charElement);
                        }
                        break;
                    }
                    case "Character":
                    case "CharacterSet":
                    case "ExpressionCharacterClass": {
                        nested.push(charElement);
                        break;
                    }
                    default:
                        throw (0, util_1.assertNever)(charElement);
                }
            };
            e.elements.forEach(addToNested);
            if (nested.length > 1)
                yield* nested;
        }
    }
}
function* iteratePartialAlternatives(alternative, parser) {
    if (isNonRegular(alternative)) {
        return;
    }
    const maxCharacter = parser.maxCharacter;
    const partialParser = new partial_parser_1.PartialParser(parser, {
        assertions: "throw",
        backreferences: "throw",
    });
    for (const nested of iterateNestedAlternatives(alternative)) {
        try {
            const expression = partialParser.parse(alternative, nested);
            const nfa = refa_1.NFA.fromRegex(expression, { maxCharacter });
            yield { nested, nfa };
        }
        catch (_a) {
        }
    }
}
function unionAll(nfas) {
    if (nfas.length === 0) {
        throw new Error("Cannot union 0 NFAs.");
    }
    else if (nfas.length === 1) {
        return nfas[0];
    }
    const total = nfas[0].copy();
    for (let i = 1; i < nfas.length; i++) {
        total.union(nfas[i]);
    }
    return total;
}
const MAX_DFA_NODES = 100000;
function isSubsetOf(superset, subset) {
    try {
        const a = refa_1.DFA.fromIntersection(superset, subset, new refa_1.DFA.LimitedNodeFactory(MAX_DFA_NODES));
        const b = refa_1.DFA.fromFA(subset, new refa_1.DFA.LimitedNodeFactory(MAX_DFA_NODES));
        a.minimize();
        b.minimize();
        return a.structurallyEqual(b);
    }
    catch (_a) {
        return null;
    }
}
function getSubsetRelation(left, right) {
    try {
        const inter = refa_1.DFA.fromIntersection(left, right, new refa_1.DFA.LimitedNodeFactory(MAX_DFA_NODES));
        inter.minimize();
        const l = refa_1.DFA.fromFA(left, new refa_1.DFA.LimitedNodeFactory(MAX_DFA_NODES));
        l.minimize();
        const r = refa_1.DFA.fromFA(right, new refa_1.DFA.LimitedNodeFactory(MAX_DFA_NODES));
        r.minimize();
        const subset = l.structurallyEqual(inter);
        const superset = r.structurallyEqual(inter);
        if (subset && superset) {
            return 1;
        }
        else if (subset) {
            return 2;
        }
        else if (superset) {
            return 3;
        }
        return 0;
    }
    catch (_a) {
        return 4;
    }
}
function getPartialSubsetRelation(left, leftIsPartial, right, rightIsPartial) {
    const relation = getSubsetRelation(left, right);
    if (!leftIsPartial && !rightIsPartial) {
        return relation;
    }
    if (relation === 0 ||
        relation === 4) {
        return relation;
    }
    if (leftIsPartial && !rightIsPartial) {
        switch (relation) {
            case 1:
                return 3;
            case 2:
                return 0;
            case 3:
                return 3;
            default:
                return (0, util_1.assertNever)(relation);
        }
    }
    if (rightIsPartial && !leftIsPartial) {
        switch (relation) {
            case 1:
                return 2;
            case 2:
                return 2;
            case 3:
                return 0;
            default:
                return (0, util_1.assertNever)(relation);
        }
    }
    return 0;
}
function faToSource(fa, flags) {
    try {
        (0, refa_2.assertValidFlags)(flags);
        return refa_1.JS.toLiteral(fa.toRegex(), { flags }).source;
    }
    catch (_a) {
        return "<ERROR>";
    }
}
function* findDuplicationAstFast(alternatives, flags) {
    const shortCircuit = (a) => {
        return a.type === "CapturingGroup" ? false : null;
    };
    for (let i = 0; i < alternatives.length; i++) {
        const alternative = alternatives[i];
        for (let j = 0; j < i; j++) {
            const other = alternatives[j];
            if ((0, regexp_ast_1.isEqualNodes)(other, alternative, flags, shortCircuit)) {
                yield { type: "Duplicate", alternative, others: [other] };
            }
        }
    }
}
function* findDuplicationAst(alternatives, flags, hasNothingAfter) {
    const isCoveredOptions = {
        flags,
        canOmitRight: hasNothingAfter,
    };
    const isCoveredOptionsNoPrefix = {
        flags,
        canOmitRight: false,
    };
    for (let i = 0; i < alternatives.length; i++) {
        const alternative = alternatives[i];
        for (let j = 0; j < i; j++) {
            const other = alternatives[j];
            if ((0, regexp_ast_1.isCoveredNode)(other, alternative, isCoveredOptions)) {
                if ((0, regexp_ast_1.isEqualNodes)(other, alternative, flags)) {
                    yield {
                        type: "Duplicate",
                        alternative,
                        others: [other],
                    };
                }
                else if (hasNothingAfter &&
                    !(0, regexp_ast_1.isCoveredNode)(other, alternative, isCoveredOptionsNoPrefix)) {
                    yield {
                        type: "PrefixSubset",
                        alternative,
                        others: [other],
                    };
                }
                else {
                    yield { type: "Subset", alternative, others: [other] };
                }
            }
        }
    }
}
function* findPrefixDuplicationNfa(alternatives, parser) {
    if (alternatives.length === 0) {
        return;
    }
    const all = refa_1.NFA.all({ maxCharacter: alternatives[0][0].maxCharacter });
    for (let i = 0; i < alternatives.length; i++) {
        const [nfa, partial, alternative] = alternatives[i];
        if (!partial) {
            const overlapping = alternatives
                .slice(0, i)
                .filter(([otherNfa]) => !(0, refa_1.isDisjointWith)(nfa, otherNfa));
            if (overlapping.length >= 1) {
                const othersNfa = unionAll(overlapping.map(([n]) => n));
                const others = overlapping.map(([, , a]) => a);
                if (isSubsetOf(othersNfa, nfa)) {
                    yield { type: "PrefixSubset", alternative, others };
                }
                else {
                    const nested = tryFindNestedSubsetResult(overlapping.map((o) => [o[0], o[2]]), othersNfa, alternative, parser);
                    if (nested) {
                        yield { ...nested, type: "PrefixNestedSubset" };
                    }
                }
            }
        }
        nfa.append(all);
    }
}
function* findDuplicationNfa(alternatives, flags, { hasNothingAfter, parser, ignoreOverlap }) {
    const previous = [];
    for (let i = 0; i < alternatives.length; i++) {
        const alternative = alternatives[i];
        const { nfa, partial } = toNFA(parser, alternative);
        const overlapping = previous.filter(([otherNfa]) => !(0, refa_1.isDisjointWith)(nfa, otherNfa));
        if (overlapping.length >= 1) {
            const othersNfa = unionAll(overlapping.map(([n]) => n));
            const othersPartial = overlapping.some(([, p]) => p);
            const others = overlapping.map(([, , a]) => a);
            const relation = getPartialSubsetRelation(nfa, partial, othersNfa, othersPartial);
            switch (relation) {
                case 1:
                    if (others.length === 1) {
                        yield {
                            type: "Duplicate",
                            alternative,
                            others: [others[0]],
                        };
                    }
                    else {
                        yield { type: "Subset", alternative, others };
                    }
                    break;
                case 2:
                    yield { type: "Subset", alternative, others };
                    break;
                case 3: {
                    const reorder = (0, regexp_ast_analysis_1.canReorder)([alternative, ...others], flags);
                    if (reorder) {
                        for (const other of others) {
                            yield {
                                type: "Subset",
                                alternative: other,
                                others: [alternative],
                            };
                        }
                    }
                    else {
                        yield { type: "Superset", alternative, others };
                    }
                    break;
                }
                case 0:
                case 4: {
                    const nested = tryFindNestedSubsetResult(overlapping.map((o) => [o[0], o[2]]), othersNfa, alternative, parser);
                    if (nested) {
                        yield nested;
                        break;
                    }
                    if (!ignoreOverlap) {
                        yield {
                            type: "Overlap",
                            alternative,
                            others,
                            overlap: refa_1.NFA.fromIntersection(nfa, othersNfa),
                        };
                    }
                    break;
                }
                default:
                    throw (0, util_1.assertNever)(relation);
            }
        }
        previous.push([nfa, partial, alternative]);
    }
    if (hasNothingAfter) {
        yield* findPrefixDuplicationNfa(previous, parser);
    }
}
function tryFindNestedSubsetResult(others, othersNfa, alternative, parser) {
    const disjointElements = new Set();
    for (const { nested, nfa: nestedNfa } of iteratePartialAlternatives(alternative, parser)) {
        if ((0, regexp_ast_analysis_1.hasSomeAncestor)(nested, (a) => disjointElements.has(a))) {
            continue;
        }
        if ((0, refa_1.isDisjointWith)(othersNfa, nestedNfa)) {
            disjointElements.add(nested);
            continue;
        }
        if (isSubsetOf(othersNfa, nestedNfa)) {
            return {
                type: "NestedSubset",
                alternative,
                nested,
                others: others
                    .filter((o) => !(0, refa_1.isDisjointWith)(o[0], nestedNfa))
                    .map((o) => o[1]),
            };
        }
    }
    return undefined;
}
function* findDuplication(alternatives, flags, options) {
    if (options.fastAst) {
        yield* findDuplicationAstFast(alternatives, flags);
    }
    else {
        yield* findDuplicationAst(alternatives, flags, options.hasNothingAfter);
    }
    if (!options.noNfa) {
        yield* findDuplicationNfa(alternatives, flags, options);
    }
}
const RESULT_TYPE_ORDER = [
    "Duplicate",
    "Subset",
    "NestedSubset",
    "PrefixSubset",
    "PrefixNestedSubset",
    "Superset",
    "Overlap",
];
function deduplicateResults(unsorted, { reportExp }) {
    const results = [...unsorted].sort((a, b) => RESULT_TYPE_ORDER.indexOf(a.type) -
        RESULT_TYPE_ORDER.indexOf(b.type));
    const seen = new Map();
    return results.filter(({ alternative, type }) => {
        const firstSeen = seen.get(alternative);
        if (firstSeen === undefined) {
            seen.set(alternative, type);
            return true;
        }
        if (reportExp &&
            firstSeen === "PrefixSubset" &&
            type !== "PrefixSubset") {
            seen.set(alternative, type);
            return true;
        }
        return false;
    });
}
function mentionNested(nested) {
    if (nested.type === "Alternative" || nested.type === "StringAlternative") {
        return (0, mention_1.mention)(nested);
    }
    return (0, mention_1.mentionChar)(nested);
}
function fixRemoveNestedAlternative(context, alternative) {
    switch (alternative.type) {
        case "Alternative":
            return (0, utils_1.fixRemoveAlternative)(context, alternative);
        case "StringAlternative":
            return (0, utils_1.fixRemoveStringAlternative)(context, alternative);
        case "Character":
        case "CharacterClassRange":
        case "CharacterSet":
        case "CharacterClass":
        case "ExpressionCharacterClass":
        case "ClassStringDisjunction": {
            if (alternative.parent.type !== "CharacterClass") {
                return () => null;
            }
            return (0, utils_1.fixRemoveCharacterClassElement)(context, alternative);
        }
        default:
            throw (0, util_1.assertNever)(alternative);
    }
}
exports.default = (0, utils_1.createRule)("no-dupe-disjunctions", {
    meta: {
        docs: {
            description: "disallow duplicate disjunctions",
            category: "Possible Errors",
            recommended: true,
        },
        hasSuggestions: true,
        schema: [
            {
                type: "object",
                properties: {
                    report: {
                        type: "string",
                        enum: ["all", "trivial", "interesting"],
                    },
                    reportExponentialBacktracking: {
                        enum: ["none", "certain", "potential"],
                    },
                    reportUnreachable: {
                        enum: ["certain", "potential"],
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            duplicate: "Unexpected duplicate alternative. This alternative can be removed.{{cap}}{{exp}}",
            subset: "Unexpected useless alternative. This alternative is a strict subset of {{others}} and can be removed.{{cap}}{{exp}}",
            nestedSubset: "Unexpected useless element. All paths of {{root}} that go through {{nested}} are a strict subset of {{others}}. This element can be removed.{{cap}}{{exp}}",
            prefixSubset: "Unexpected useless alternative. This alternative is already covered by {{others}} and can be removed.{{cap}}",
            prefixNestedSubset: "Unexpected useless element. All paths of {{root}} that go through {{nested}} are already covered by {{others}}. This element can be removed.{{cap}}",
            superset: "Unexpected superset. This alternative is a superset of {{others}}. It might be possible to remove the other alternative(s).{{cap}}{{exp}}",
            overlap: "Unexpected overlap. This alternative overlaps with {{others}}. The overlap is {{expr}}.{{cap}}{{exp}}",
            remove: "Remove the {{alternative}} {{type}}.",
            replaceRange: "Replace {{range}} with {{replacement}}.",
        },
        type: "suggestion",
    },
    create(context) {
        var _a, _b, _c, _d, _e, _f;
        const reportExponentialBacktracking = (_b = (_a = context.options[0]) === null || _a === void 0 ? void 0 : _a.reportExponentialBacktracking) !== null && _b !== void 0 ? _b : "potential";
        const reportUnreachable = (_d = (_c = context.options[0]) === null || _c === void 0 ? void 0 : _c.reportUnreachable) !== null && _d !== void 0 ? _d : "certain";
        const report = (_f = (_e = context.options[0]) === null || _e === void 0 ? void 0 : _e.report) !== null && _f !== void 0 ? _f : "trivial";
        const allowedRanges = (0, char_ranges_1.getAllowedCharRanges)(undefined, context);
        function createVisitor(regexpContext) {
            const { flags, node, getRegexpLocation, getUsageOfPattern } = regexpContext;
            const parser = (0, refa_2.getParser)(regexpContext);
            function getFilterInfo(parentNode) {
                const usage = getUsageOfPattern();
                let stared;
                if (isStared(parentNode)) {
                    stared = 1;
                }
                else if (usage === get_usage_of_pattern_1.UsageOfPattern.partial ||
                    usage === get_usage_of_pattern_1.UsageOfPattern.mixed) {
                    stared = 2;
                }
                else {
                    stared = 0;
                }
                let nothingAfter;
                if (!hasNothingAfterNode(parentNode)) {
                    nothingAfter = 0;
                }
                else if (usage === get_usage_of_pattern_1.UsageOfPattern.partial ||
                    usage === get_usage_of_pattern_1.UsageOfPattern.mixed) {
                    nothingAfter = 2;
                }
                else {
                    nothingAfter = 1;
                }
                let reportExp;
                switch (reportExponentialBacktracking) {
                    case "none":
                        reportExp = false;
                        break;
                    case "certain":
                        reportExp = stared === 1;
                        break;
                    case "potential":
                        reportExp = stared !== 0;
                        break;
                    default:
                        (0, util_1.assertNever)(reportExponentialBacktracking);
                }
                let reportPrefix;
                switch (reportUnreachable) {
                    case "certain":
                        reportPrefix = nothingAfter === 1;
                        break;
                    case "potential":
                        reportPrefix = nothingAfter !== 0;
                        break;
                    default:
                        (0, util_1.assertNever)(reportUnreachable);
                }
                return { stared, nothingAfter, reportExp, reportPrefix };
            }
            function verify(parentNode) {
                const info = getFilterInfo(parentNode);
                const rawResults = findDuplication(parentNode.alternatives, flags, {
                    fastAst: false,
                    noNfa: false,
                    ignoreOverlap: !info.reportExp && report !== "all",
                    hasNothingAfter: info.reportPrefix,
                    parser,
                });
                let results = filterResults([...rawResults], info);
                results = deduplicateResults(results, info);
                results.forEach((result) => reportResult(result, info));
            }
            function filterResults(results, { nothingAfter, reportExp, reportPrefix }) {
                switch (report) {
                    case "all": {
                        return results;
                    }
                    case "trivial": {
                        return results.filter(({ type }) => {
                            switch (type) {
                                case "Duplicate":
                                case "Subset":
                                case "NestedSubset":
                                    return true;
                                case "Overlap":
                                case "Superset":
                                    return reportExp;
                                case "PrefixSubset":
                                case "PrefixNestedSubset":
                                    return reportPrefix;
                                default:
                                    throw (0, util_1.assertNever)(type);
                            }
                        });
                    }
                    case "interesting": {
                        return results.filter(({ type }) => {
                            switch (type) {
                                case "Duplicate":
                                case "Subset":
                                case "NestedSubset":
                                    return true;
                                case "Overlap":
                                    return reportExp;
                                case "Superset":
                                    return (reportExp ||
                                        nothingAfter === 0);
                                case "PrefixSubset":
                                case "PrefixNestedSubset":
                                    return reportPrefix;
                                default:
                                    throw (0, util_1.assertNever)(type);
                            }
                        });
                    }
                    default:
                        throw (0, util_1.assertNever)(report);
                }
            }
            function printChar(char) {
                if ((0, char_ranges_1.inRange)(allowedRanges, char)) {
                    return String.fromCodePoint(char);
                }
                if (char === 0)
                    return "\\0";
                if (char <= 0xff)
                    return `\\x${char.toString(16).padStart(2, "0")}`;
                if (char <= 0xffff)
                    return `\\u${char.toString(16).padStart(4, "0")}`;
                return `\\u{${char.toString(16)}}`;
            }
            function getSuggestions(result) {
                if (result.type === "Overlap" || result.type === "Superset") {
                    return [];
                }
                const alternative = result.type === "NestedSubset" ||
                    result.type === "PrefixNestedSubset"
                    ? result.nested
                    : result.alternative;
                const containsCapturingGroup = (0, regexp_ast_analysis_1.hasSomeDescendant)(alternative, (d) => d.type === "CapturingGroup");
                if (containsCapturingGroup) {
                    return [];
                }
                if (alternative.type === "Character" &&
                    alternative.parent.type === "CharacterClassRange") {
                    const range = alternative.parent;
                    let replacement;
                    if (range.min.value + 1 === range.max.value) {
                        replacement =
                            range.min === alternative
                                ? range.max.raw
                                : range.min.raw;
                    }
                    else {
                        if (range.min === alternative) {
                            const min = printChar(range.min.value + 1);
                            replacement = `${min}-${range.max.raw}`;
                        }
                        else {
                            const max = printChar(range.max.value - 1);
                            replacement = `${range.min.raw}-${max}`;
                        }
                    }
                    return [
                        {
                            messageId: "replaceRange",
                            data: {
                                range: (0, mention_1.mentionChar)(range),
                                replacement: (0, mention_1.mention)(replacement),
                            },
                            fix: regexpContext.fixReplaceNode(range, replacement),
                        },
                    ];
                }
                return [
                    {
                        messageId: "remove",
                        data: {
                            alternative: mentionNested(alternative),
                            type: alternative.type === "Alternative"
                                ? "alternative"
                                : "element",
                        },
                        fix: fixRemoveNestedAlternative(regexpContext, alternative),
                    },
                ];
            }
            function reportResult(result, { stared }) {
                let exp;
                if (stared === 1) {
                    exp =
                        " This ambiguity is likely to cause exponential backtracking.";
                }
                else if (stared === 2) {
                    exp =
                        " This ambiguity might cause exponential backtracking.";
                }
                else {
                    exp = "";
                }
                const reportAlternative = result.type === "NestedSubset" ||
                    result.type === "PrefixNestedSubset"
                    ? result.nested
                    : result.alternative;
                const loc = getRegexpLocation(reportAlternative);
                const cap = (0, regexp_ast_analysis_1.hasSomeDescendant)(reportAlternative, (d) => d.type === "CapturingGroup")
                    ? " Careful! This alternative contains capturing groups which might be difficult to remove."
                    : "";
                const others = (0, mention_1.mention)(result.others.map((a) => a.raw).join("|"));
                const suggest = getSuggestions(result);
                switch (result.type) {
                    case "Duplicate":
                        context.report({
                            node,
                            loc,
                            messageId: "duplicate",
                            data: { exp, cap, others },
                            suggest,
                        });
                        break;
                    case "Subset":
                        context.report({
                            node,
                            loc,
                            messageId: "subset",
                            data: { exp, cap, others },
                            suggest,
                        });
                        break;
                    case "NestedSubset":
                        context.report({
                            node,
                            loc,
                            messageId: "nestedSubset",
                            data: {
                                exp,
                                cap,
                                others,
                                root: (0, mention_1.mention)(result.alternative),
                                nested: mentionNested(result.nested),
                            },
                            suggest,
                        });
                        break;
                    case "PrefixSubset":
                        context.report({
                            node,
                            loc,
                            messageId: "prefixSubset",
                            data: { exp, cap, others },
                            suggest,
                        });
                        break;
                    case "PrefixNestedSubset":
                        context.report({
                            node,
                            loc,
                            messageId: "prefixNestedSubset",
                            data: {
                                exp,
                                cap,
                                others,
                                root: (0, mention_1.mention)(result.alternative),
                                nested: mentionNested(result.nested),
                            },
                            suggest,
                        });
                        break;
                    case "Superset":
                        context.report({
                            node,
                            loc,
                            messageId: "superset",
                            data: { exp, cap, others },
                            suggest,
                        });
                        break;
                    case "Overlap":
                        context.report({
                            node,
                            loc,
                            messageId: "overlap",
                            data: {
                                exp,
                                cap,
                                others,
                                expr: (0, mention_1.mention)(faToSource(result.overlap, flags)),
                            },
                            suggest,
                        });
                        break;
                    default:
                        throw (0, util_1.assertNever)(result);
                }
            }
            return {
                onPatternEnter: verify,
                onGroupEnter: verify,
                onCapturingGroupEnter: verify,
                onAssertionEnter(aNode) {
                    if (aNode.kind === "lookahead" ||
                        aNode.kind === "lookbehind") {
                        verify(aNode);
                    }
                },
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
