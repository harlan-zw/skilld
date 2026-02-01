"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const mention_1 = require("../utils/mention");
const regex_syntax_1 = require("../utils/regex-syntax");
const segmenter = new Intl.Segmenter();
function startsWithSurrogate(s) {
    if (s.length < 2) {
        return false;
    }
    const h = s.charCodeAt(0);
    const l = s.charCodeAt(1);
    return h >= 0xd800 && h <= 0xdbff && l >= 0xdc00 && l <= 0xdfff;
}
function getProblem(grapheme, flags) {
    if (grapheme.length > 2 ||
        (grapheme.length === 2 && !startsWithSurrogate(grapheme))) {
        return "Multi";
    }
    else if (!flags.unicode &&
        !flags.unicodeSets &&
        startsWithSurrogate(grapheme)) {
        return "Surrogate";
    }
    return null;
}
function getGraphemeBeforeQuant(quant) {
    const alt = quant.parent;
    let start = quant.start;
    for (let i = alt.elements.indexOf(quant) - 1; i >= 0; i--) {
        const e = alt.elements[i];
        if (e.type === "Character" && !(0, regex_syntax_1.isEscapeSequence)(e.raw)) {
            start = e.start;
        }
        else {
            break;
        }
    }
    const before = alt.raw.slice(start - alt.start, quant.element.end - alt.start);
    const segments = [...segmenter.segment(before)];
    const segment = segments[segments.length - 1];
    return segment.segment;
}
function getGraphemeProblems(cc, flags) {
    const offset = cc.negate ? 2 : 1;
    const ignoreElements = cc.elements.filter((element) => element.type === "CharacterClass" ||
        element.type === "ExpressionCharacterClass" ||
        element.type === "ClassStringDisjunction");
    const problems = [];
    for (const { segment, index } of segmenter.segment(cc.raw.slice(offset, -1))) {
        const problem = getProblem(segment, flags);
        if (problem !== null) {
            const start = offset + index + cc.start;
            const end = start + segment.length;
            if (ignoreElements.some((ignore) => ignore.start <= start && end <= ignore.end)) {
                continue;
            }
            problems.push({
                grapheme: segment,
                problem,
                start,
                end,
                elements: cc.elements.filter((e) => e.start < end && e.end > start),
            });
        }
    }
    return problems;
}
function getGraphemeProblemsFix(problems, cc, flags) {
    if (cc.negate) {
        return null;
    }
    if (!problems.every((p) => p.start === p.elements[0].start &&
        p.end === p.elements[p.elements.length - 1].end)) {
        return null;
    }
    const prefixGraphemes = problems.map((p) => p.grapheme);
    let ccRaw = cc.raw;
    for (let i = problems.length - 1; i >= 0; i--) {
        const { start, end } = problems[i];
        ccRaw = ccRaw.slice(0, start - cc.start) + ccRaw.slice(end - cc.start);
    }
    if (flags.unicodeSets) {
        const prefix = prefixGraphemes.join("|");
        return `[\\q{${prefix}}${ccRaw.slice(1, -1)}]`;
    }
    if (ccRaw.startsWith("[^")) {
        ccRaw = `[\\${ccRaw.slice(1)}`;
    }
    const prefix = prefixGraphemes.sort((a, b) => b.length - a.length).join("|");
    let fix = prefix;
    let singleAlternative = problems.length === 1;
    if (ccRaw !== "[]") {
        fix += `|${ccRaw}`;
        singleAlternative = false;
    }
    if (singleAlternative && cc.parent.type === "Alternative") {
        return fix;
    }
    if (cc.parent.type === "Alternative" && cc.parent.elements.length === 1) {
        return fix;
    }
    return `(?:${fix})`;
}
exports.default = (0, utils_1.createRule)("no-misleading-unicode-character", {
    meta: {
        docs: {
            description: "disallow multi-code-point characters in character classes and quantifiers",
            category: "Possible Errors",
            recommended: true,
        },
        schema: [
            {
                type: "object",
                properties: {
                    fixable: { type: "boolean" },
                },
                additionalProperties: false,
            },
        ],
        fixable: "code",
        hasSuggestions: true,
        messages: {
            characterClass: "The character(s) {{ graphemes }} are all represented using multiple {{ unit }}.{{ uFlag }}",
            quantifierMulti: "The character {{ grapheme }} is represented using multiple Unicode code points. The quantifier only applies to the last code point {{ last }} and not to the whole character.",
            quantifierSurrogate: "The character {{ grapheme }} is represented using a surrogate pair. The quantifier only applies to the tailing surrogate {{ last }} and not to the whole character.",
            fixCharacterClass: "Move the character(s) {{ graphemes }} outside the character class.",
            fixQuantifier: "Wrap a group around {{ grapheme }}.",
        },
        type: "problem",
    },
    create(context) {
        var _a, _b;
        const fixable = (_b = (_a = context.options[0]) === null || _a === void 0 ? void 0 : _a.fixable) !== null && _b !== void 0 ? _b : false;
        function makeFix(fix, messageId, data) {
            if (fixable) {
                return { fix };
            }
            return {
                suggest: [{ messageId, data, fix }],
            };
        }
        function createVisitor(regexpContext) {
            const { node, patternSource, flags, getRegexpLocation, fixReplaceNode, } = regexpContext;
            return {
                onCharacterClassEnter(ccNode) {
                    const problems = getGraphemeProblems(ccNode, flags);
                    if (problems.length === 0) {
                        return;
                    }
                    const range = {
                        start: problems[0].start,
                        end: problems[problems.length - 1].end,
                    };
                    const fix = getGraphemeProblemsFix(problems, ccNode, flags);
                    const graphemes = problems
                        .map((p) => (0, mention_1.mention)(p.grapheme))
                        .join(", ");
                    const uFlag = problems.every((p) => p.problem === "Surrogate");
                    context.report({
                        node,
                        loc: getRegexpLocation(range),
                        messageId: "characterClass",
                        data: {
                            graphemes,
                            unit: flags.unicode || flags.unicodeSets
                                ? "code points"
                                : "char codes",
                            uFlag: uFlag ? " Use the `u` flag." : "",
                        },
                        ...makeFix(fixReplaceNode(ccNode, () => fix), "fixCharacterClass", { graphemes }),
                    });
                },
                onQuantifierEnter(qNode) {
                    if (qNode.element.type !== "Character") {
                        return;
                    }
                    const grapheme = getGraphemeBeforeQuant(qNode);
                    const problem = getProblem(grapheme, flags);
                    if (problem === null) {
                        return;
                    }
                    context.report({
                        node,
                        loc: getRegexpLocation(qNode),
                        messageId: `quantifier${problem}`,
                        data: {
                            grapheme: (0, mention_1.mention)(grapheme),
                            last: (0, mention_1.mentionChar)(qNode.element),
                        },
                        ...makeFix((fixer) => {
                            const range = patternSource.getReplaceRange({
                                start: qNode.element.end - grapheme.length,
                                end: qNode.element.end,
                            });
                            if (!range) {
                                return null;
                            }
                            return range.replace(fixer, `(?:${grapheme})`);
                        }, "fixQuantifier", { grapheme: (0, mention_1.mention)(grapheme) }),
                    });
                },
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
