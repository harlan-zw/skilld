"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const refa_1 = require("refa");
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
const get_usage_of_pattern_1 = require("../utils/get-usage-of-pattern");
const mention_1 = require("../utils/mention");
const regexp_ast_1 = require("../utils/regexp-ast");
const util_1 = require("../utils/util");
const ELEMENT_ORDER = {
    Character: 1,
    CharacterClassRange: 2,
    CharacterSet: 3,
    CharacterClass: 4,
    ExpressionCharacterClass: 5,
    ClassStringDisjunction: 6,
    StringAlternative: 7,
};
function findUseless(elements, getChars, other) {
    const get = (0, util_1.cachedFn)(getChars);
    const sortedElements = [...elements]
        .reverse()
        .sort((a, b) => ELEMENT_ORDER[a.type] - ELEMENT_ORDER[b.type]);
    const useless = new Set();
    for (const e of sortedElements) {
        const cs = get(e);
        if (cs.isSubsetOf(other)) {
            useless.add(e);
            continue;
        }
        const otherElements = elements.filter((o) => o !== e && !useless.has(o));
        const total = other.union(...otherElements.map(get));
        if (cs.isSubsetOf(total)) {
            useless.add(e);
            continue;
        }
    }
    return useless;
}
function without(iter, set) {
    const result = [];
    for (const item of iter) {
        if (!set.has(item)) {
            result.push(item);
        }
    }
    return result;
}
function removeAll(fixer, patternSource, nodes) {
    const charSet = refa_1.CharSet.empty(Number.MAX_SAFE_INTEGER).union(nodes.map((n) => {
        let min = n.start;
        let max = n.end - 1;
        if (n.type === "StringAlternative") {
            const parent = n.parent;
            if (parent.alternatives.length === 1 ||
                parent.alternatives.every((a) => nodes.includes(a))) {
                min = parent.start;
                max = parent.end - 1;
            }
            else {
                const isFirst = parent.alternatives.at(0) === n;
                if (isFirst) {
                    max++;
                }
                else {
                    min--;
                }
            }
        }
        return { min, max };
    }));
    const sorted = charSet.ranges.map(({ min, max }) => ({ start: min, end: max + 1 }));
    let pattern = patternSource.value;
    let removed = 0;
    for (const { start, end } of sorted) {
        pattern =
            pattern.slice(0, start - removed) + pattern.slice(end - removed);
        removed += end - start;
    }
    const range = patternSource.getReplaceRange({
        start: 0,
        end: patternSource.value.length,
    });
    if (range) {
        return range.replace(fixer, pattern);
    }
    return null;
}
function getIgnoreCaseFlagsString(flags) {
    if (flags.includes("i")) {
        return flags;
    }
    for (let i = 0; i < flags.length; i++) {
        if (flags[i] > "i") {
            return `${flags.slice(0, i)}i${flags.slice(i)}`;
        }
    }
    return `${flags}i`;
}
exports.default = (0, utils_1.createRule)("use-ignore-case", {
    meta: {
        docs: {
            description: "use the `i` flag if it simplifies the pattern",
            category: "Best Practices",
            recommended: true,
        },
        fixable: "code",
        schema: [],
        messages: {
            unexpected: "The character class(es) {{ classes }} can be simplified using the `i` flag.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor(regexpContext) {
            const { node, flags, ownsFlags, flagsString, patternAst, patternSource, getUsageOfPattern, getFlagsLocation, fixReplaceFlags, } = regexpContext;
            if (!ownsFlags || flagsString === null) {
                return {};
            }
            if (flags.ignoreCase) {
                return {};
            }
            if (getUsageOfPattern() === get_usage_of_pattern_1.UsageOfPattern.partial) {
                return {};
            }
            if ((0, regexp_ast_1.isCaseVariant)(patternAst, flags)) {
                return {};
            }
            const uselessElements = [];
            const ccs = [];
            return {
                onCharacterClassEnter(ccNode) {
                    const elements = ccNode.elements.flatMap((e) => {
                        if (e.type === "ClassStringDisjunction") {
                            return e.alternatives;
                        }
                        return [e];
                    });
                    const invariantElement = elements.filter((e) => !(0, regexp_ast_1.isCaseVariant)(e, flags));
                    if (invariantElement.length === elements.length) {
                        return;
                    }
                    const empty = refa_1.JS.UnicodeSet.empty(regexp_ast_analysis_1.Chars.maxChar(flags));
                    const invariant = empty.union(...invariantElement.map((e) => (0, regexp_ast_analysis_1.toUnicodeSet)(e, flags)));
                    let variantElements = without(elements, new Set(invariantElement));
                    const alwaysUseless = findUseless(variantElements, (e) => (0, regexp_ast_analysis_1.toUnicodeSet)(e, flags), invariant);
                    variantElements = without(variantElements, alwaysUseless);
                    const iFlags = (0, regexp_ast_1.getIgnoreCaseFlags)(flags);
                    const useless = findUseless(variantElements, (e) => (0, regexp_ast_analysis_1.toUnicodeSet)(e, iFlags), invariant);
                    uselessElements.push(...useless);
                    ccs.push(ccNode);
                },
                onPatternLeave() {
                    if (uselessElements.length === 0) {
                        return;
                    }
                    context.report({
                        node,
                        loc: getFlagsLocation(),
                        messageId: "unexpected",
                        data: {
                            classes: ccs.map((cc) => (0, mention_1.mention)(cc)).join(", "),
                        },
                        fix(fixer) {
                            const patternFix = removeAll(fixer, patternSource, uselessElements);
                            if (!patternFix) {
                                return null;
                            }
                            const flagsFix = fixReplaceFlags(getIgnoreCaseFlagsString(flagsString), false)(fixer);
                            if (!flagsFix) {
                                return null;
                            }
                            const fix = [patternFix];
                            if (Array.isArray(flagsFix)) {
                                fix.push(...flagsFix);
                            }
                            else {
                                fix.push(flagsFix);
                            }
                            return fix;
                        },
                    });
                },
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
