"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const refa_1 = require("refa");
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
const mention_1 = require("../utils/mention");
const refa_2 = require("../utils/refa");
const util_1 = require("../utils/util");
function groupElements(elements, flags) {
    const duplicates = [];
    const characters = new Map();
    const characterRanges = new Map();
    const characterSetAndClasses = new Map();
    function addToGroup(group, key, element) {
        const current = group.get(key);
        if (current !== undefined) {
            duplicates.push({ element: current, duplicate: element });
        }
        else {
            group.set(key, element);
        }
    }
    for (const e of elements) {
        if (e.type === "Character") {
            const charSet = (0, regexp_ast_analysis_1.toCharSet)(e, flags);
            const key = charSet.ranges[0].min;
            addToGroup(characters, key, e);
        }
        else if (e.type === "CharacterClassRange") {
            const charSet = (0, regexp_ast_analysis_1.toCharSet)(e, flags);
            const key = buildRangeKey(charSet);
            addToGroup(characterRanges, key, e);
        }
        else if (e.type === "CharacterSet" ||
            e.type === "CharacterClass" ||
            e.type === "ClassStringDisjunction" ||
            e.type === "ExpressionCharacterClass") {
            const key = e.raw;
            addToGroup(characterSetAndClasses, key, e);
        }
        else {
            (0, util_1.assertNever)(e);
        }
    }
    return {
        duplicates,
        characters: [...characters.values()],
        characterRanges: [...characterRanges.values()],
        characterSetAndClasses: [...characterSetAndClasses.values()],
    };
    function buildRangeKey(rangeCharSet) {
        return rangeCharSet.ranges
            .map((r) => String.fromCodePoint(r.min, r.max))
            .join(",");
    }
}
function inRange({ min, max }, char) {
    return min <= char && char <= max;
}
exports.default = (0, utils_1.createRule)("no-dupe-characters-character-class", {
    meta: {
        type: "suggestion",
        docs: {
            description: "disallow duplicate characters in the RegExp character class",
            category: "Best Practices",
            recommended: true,
        },
        fixable: "code",
        schema: [],
        messages: {
            duplicate: "Unexpected duplicate {{duplicate}}.",
            duplicateNonObvious: "Unexpected duplicate. {{duplicate}} is a duplicate of {{element}}.",
            subset: "{{subsetElement}} is already included in {{element}}.",
            subsetOfMany: "{{subsetElement}} is already included by the elements {{elements}}.",
            overlap: "Unexpected overlap of {{elementA}} and {{elementB}} was found '{{overlap}}'.",
        },
    },
    create(context) {
        function reportDuplicate(regexpContext, duplicate, element) {
            const { node, getRegexpLocation } = regexpContext;
            if (duplicate.raw === element.raw) {
                context.report({
                    node,
                    loc: getRegexpLocation(duplicate),
                    messageId: "duplicate",
                    data: {
                        duplicate: (0, mention_1.mentionChar)(duplicate),
                    },
                    fix: (0, utils_1.fixRemoveCharacterClassElement)(regexpContext, duplicate),
                });
            }
            else {
                context.report({
                    node,
                    loc: getRegexpLocation(duplicate),
                    messageId: "duplicateNonObvious",
                    data: {
                        duplicate: (0, mention_1.mentionChar)(duplicate),
                        element: (0, mention_1.mentionChar)(element),
                    },
                    fix: (0, utils_1.fixRemoveCharacterClassElement)(regexpContext, duplicate),
                });
            }
        }
        function reportOverlap({ node, getRegexpLocation }, element, intersectElement, overlap) {
            context.report({
                node,
                loc: getRegexpLocation(element),
                messageId: "overlap",
                data: {
                    elementA: (0, mention_1.mentionChar)(element),
                    elementB: (0, mention_1.mentionChar)(intersectElement),
                    overlap,
                },
            });
        }
        function reportSubset(regexpContext, subsetElement, element) {
            const { node, getRegexpLocation } = regexpContext;
            context.report({
                node,
                loc: getRegexpLocation(subsetElement),
                messageId: "subset",
                data: {
                    subsetElement: (0, mention_1.mentionChar)(subsetElement),
                    element: (0, mention_1.mentionChar)(element),
                },
                fix: (0, utils_1.fixRemoveCharacterClassElement)(regexpContext, subsetElement),
            });
        }
        function reportSubsetOfMany(regexpContext, subsetElement, elements) {
            const { node, getRegexpLocation } = regexpContext;
            context.report({
                node,
                loc: getRegexpLocation(subsetElement),
                messageId: "subsetOfMany",
                data: {
                    subsetElement: (0, mention_1.mentionChar)(subsetElement),
                    elements: `'${elements
                        .map((e) => e.raw)
                        .join("")}' (${elements.map(mention_1.mentionChar).join(", ")})`,
                },
                fix: (0, utils_1.fixRemoveCharacterClassElement)(regexpContext, subsetElement),
            });
        }
        function createVisitor(regexpContext) {
            const { flags } = regexpContext;
            return {
                onCharacterClassEnter(ccNode) {
                    const { duplicates, characters, characterRanges, characterSetAndClasses, } = groupElements(ccNode.elements, flags);
                    const elementsOtherThanCharacter = [
                        ...characterRanges,
                        ...characterSetAndClasses,
                    ];
                    const subsets = new Set();
                    for (const { element, duplicate } of duplicates) {
                        reportDuplicate(regexpContext, duplicate, element);
                        subsets.add(duplicate);
                    }
                    for (const char of characters) {
                        for (const other of elementsOtherThanCharacter) {
                            if ((0, regexp_ast_analysis_1.toUnicodeSet)(other, flags).chars.has(char.value)) {
                                reportSubset(regexpContext, char, other);
                                subsets.add(char);
                                break;
                            }
                        }
                    }
                    for (const element of elementsOtherThanCharacter) {
                        for (const other of elementsOtherThanCharacter) {
                            if (element === other || subsets.has(other)) {
                                continue;
                            }
                            if ((0, regexp_ast_analysis_1.toUnicodeSet)(element, flags).isSubsetOf((0, regexp_ast_analysis_1.toUnicodeSet)(other, flags))) {
                                reportSubset(regexpContext, element, other);
                                subsets.add(element);
                                break;
                            }
                        }
                    }
                    const characterTotal = (0, regexp_ast_analysis_1.toUnicodeSet)(characters.filter((c) => !subsets.has(c)), flags);
                    for (const element of elementsOtherThanCharacter) {
                        if (subsets.has(element)) {
                            continue;
                        }
                        const totalOthers = characterTotal.union(...elementsOtherThanCharacter
                            .filter((e) => !subsets.has(e) && e !== element)
                            .map((e) => (0, regexp_ast_analysis_1.toUnicodeSet)(e, flags)));
                        const elementCharSet = (0, regexp_ast_analysis_1.toUnicodeSet)(element, flags);
                        if (elementCharSet.isSubsetOf(totalOthers)) {
                            const superSetElements = ccNode.elements
                                .filter((e) => !subsets.has(e) && e !== element)
                                .filter((e) => !(0, regexp_ast_analysis_1.toUnicodeSet)(e, flags).isDisjointWith(elementCharSet));
                            reportSubsetOfMany(regexpContext, element, superSetElements);
                            subsets.add(element);
                        }
                    }
                    for (let i = 0; i < characterRanges.length; i++) {
                        const range = characterRanges[i];
                        if (subsets.has(range)) {
                            continue;
                        }
                        for (let j = i + 1; j < elementsOtherThanCharacter.length; j++) {
                            const other = elementsOtherThanCharacter[j];
                            if (range === other || subsets.has(other)) {
                                continue;
                            }
                            const intersection = (0, regexp_ast_analysis_1.toUnicodeSet)(range, flags).intersect((0, regexp_ast_analysis_1.toUnicodeSet)(other, flags));
                            if (intersection.isEmpty) {
                                continue;
                            }
                            const interestingRanges = intersection.chars.ranges.filter((r) => inRange(r, range.min.value) ||
                                inRange(r, range.max.value));
                            (0, refa_2.assertValidFlags)(flags);
                            const interest = refa_1.JS.createCharSet(interestingRanges, flags);
                            if (!interest.isEmpty) {
                                reportOverlap(regexpContext, range, other, (0, refa_2.toCharSetSource)(interest, flags));
                                break;
                            }
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
