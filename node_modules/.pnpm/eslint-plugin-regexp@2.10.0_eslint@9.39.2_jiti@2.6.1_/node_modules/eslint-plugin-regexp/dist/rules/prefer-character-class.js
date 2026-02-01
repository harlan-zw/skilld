"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
const regex_syntax_1 = require("../utils/regex-syntax");
const util_1 = require("../utils/util");
function findIndex(arr, condFn) {
    return arr.findIndex(condFn);
}
function findLastIndex(arr, condFn) {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (condFn(arr[i], i)) {
            return i;
        }
    }
    return -1;
}
function elementsToCharacterClass(elements) {
    const parts = [];
    elements.forEach((e) => {
        switch (e.type) {
            case "Character":
                if (e.raw === "-") {
                    parts.push("\\-");
                }
                else if (e.raw === "]") {
                    parts.push("\\]");
                }
                else {
                    parts.push(e.raw);
                }
                break;
            case "CharacterClassRange":
            case "CharacterSet":
            case "CharacterClass":
            case "ClassStringDisjunction":
            case "ExpressionCharacterClass":
                parts.push(e.raw);
                break;
            default:
                throw (0, util_1.assertNever)(e);
        }
    });
    if (parts.length > 0 && parts[0].startsWith("^")) {
        parts[0] = `\\${parts[0]}`;
    }
    for (let i = 1; i < parts.length; i++) {
        const prev = parts[i - 1];
        const curr = parts[i];
        const pChar = prev.slice(-1);
        const cChar = curr[0];
        if (regex_syntax_1.RESERVED_DOUBLE_PUNCTUATOR_CHARS.has(cChar) &&
            cChar === pChar &&
            !prev.endsWith(`\\${pChar}`)) {
            parts[i - 1] = `${prev.slice(0, -1)}\\${pChar}`;
        }
    }
    return `[${parts.join("")}]`;
}
function categorizeRawAlts(alternatives, flags) {
    return alternatives.map((alternative) => {
        if (alternative.elements.length === 1) {
            const element = alternative.elements[0];
            if (element.type === "Character" ||
                element.type === "CharacterClass" ||
                element.type === "CharacterSet" ||
                element.type === "ExpressionCharacterClass") {
                const set = (0, regexp_ast_analysis_1.toUnicodeSet)(element, flags);
                if (set.accept.isEmpty) {
                    return {
                        isCharacter: true,
                        alternative,
                        char: set.chars,
                        element,
                    };
                }
            }
        }
        return {
            isCharacter: false,
            alternative,
        };
    });
}
function containsCharacterClass(alts) {
    for (const alt of alts) {
        if (alt.isCharacter && alt.alternative.elements.length === 1) {
            const e = alt.alternative.elements[0];
            if (e.type === "CharacterClass" && !e.negate) {
                return true;
            }
        }
    }
    return false;
}
function toCharacterClassElement(element) {
    switch (element.type) {
        case "Character":
            return [element];
        case "CharacterSet":
            if (element.kind === "any") {
                return null;
            }
            return [element];
        case "CharacterClass":
            if (element.negate) {
                if (element.unicodeSets) {
                    return [element];
                }
                return null;
            }
            return element.elements;
        case "ExpressionCharacterClass":
            return [element];
        default:
            return (0, util_1.assertNever)(element);
    }
}
function parseRawAlts(alternatives, flags) {
    return alternatives.map((a) => {
        if (a.isCharacter) {
            const elements = toCharacterClassElement(a.element);
            if (elements) {
                return {
                    isCharacter: true,
                    elements,
                    char: a.char,
                    raw: a.alternative.raw,
                };
            }
        }
        return {
            isCharacter: false,
            firstChar: (0, regexp_ast_analysis_1.getFirstConsumedChar)(a.alternative, (0, regexp_ast_analysis_1.getMatchingDirection)(a.alternative), flags),
            raw: a.alternative.raw,
        };
    });
}
function optimizeCharacterAlts(alternatives) {
    function merge(a, b) {
        const elements = [...a.elements, ...b.elements];
        return {
            isCharacter: true,
            char: a.char.union(b.char),
            elements,
            raw: elementsToCharacterClass(elements),
        };
    }
    for (let i = 0; i < alternatives.length - 1; i++) {
        let curr = alternatives[i];
        if (!curr.isCharacter) {
            continue;
        }
        let nonCharTotal = undefined;
        for (let j = i + 1; j < alternatives.length; j++) {
            const far = alternatives[j];
            if (far.isCharacter) {
                if (nonCharTotal === undefined ||
                    far.char.isDisjointWith(nonCharTotal)) {
                    curr = merge(curr, far);
                    alternatives.splice(j, 1);
                    j--;
                }
                else {
                    break;
                }
            }
            else {
                if (!far.firstChar.empty) {
                    if (nonCharTotal === undefined) {
                        nonCharTotal = far.firstChar.char;
                    }
                    else {
                        nonCharTotal = nonCharTotal.union(far.firstChar.char);
                    }
                    if (nonCharTotal.isAll) {
                        break;
                    }
                }
                else {
                    break;
                }
            }
        }
        alternatives[i] = curr;
    }
}
function findNonDisjointAlt(alternatives) {
    let total = undefined;
    for (const a of alternatives) {
        if (a.isCharacter) {
            if (total === undefined) {
                total = a.char;
            }
            else {
                if (!total.isDisjointWith(a.char)) {
                    return a;
                }
                total = total.union(a.char);
            }
        }
    }
    return null;
}
function totalIsAll(alternatives) {
    let total = undefined;
    for (const a of alternatives) {
        if (a.isCharacter) {
            if (total === undefined) {
                total = a.char;
            }
            else {
                total = total.union(a.char);
            }
        }
    }
    return total !== undefined && total.isAll;
}
function getParentPrefixAndSuffix(parent) {
    switch (parent.type) {
        case "Assertion":
            return [
                `(?${parent.kind === "lookahead" ? "" : "<"}${parent.negate ? "!" : "="}`,
                ")",
            ];
        case "CapturingGroup":
            if (parent.name !== null) {
                return [`(?<${parent.name}>`, ")"];
            }
            return ["(", ")"];
        case "Group":
            return ["(?:", ")"];
        case "Pattern":
            return ["", ""];
        default:
            return (0, util_1.assertNever)(parent);
    }
}
function minPos(a, b) {
    if (a.column < b.column) {
        return a;
    }
    else if (b.column < a.column) {
        return b;
    }
    return a.line < b.line ? a : b;
}
function maxPos(a, b) {
    if (a.column > b.column) {
        return a;
    }
    else if (b.column > a.column) {
        return b;
    }
    return a.line > b.line ? a : b;
}
exports.default = (0, utils_1.createRule)("prefer-character-class", {
    meta: {
        docs: {
            description: "enforce using character class",
            category: "Stylistic Issues",
            recommended: true,
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    minAlternatives: {
                        type: "integer",
                        minimum: 2,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unexpected: "Unexpected the disjunction of single element alternatives. Use character class '[...]' instead.",
        },
        type: "suggestion",
    },
    create(context) {
        var _a, _b;
        const minCharacterAlternatives = (_b = (_a = context.options[0]) === null || _a === void 0 ? void 0 : _a.minAlternatives) !== null && _b !== void 0 ? _b : 3;
        function createVisitor(regexpContext) {
            const { node, flags, getRegexpLocation, fixReplaceNode } = regexpContext;
            function fixReplaceAlternatives(n, newAlternatives) {
                const [prefix, suffix] = getParentPrefixAndSuffix(n);
                return fixReplaceNode(n, prefix + newAlternatives + suffix);
            }
            function unionRegexpLocations(elements) {
                let { start, end } = getRegexpLocation(elements[0]);
                for (let i = 1; i < elements.length; i++) {
                    const other = getRegexpLocation(elements[1]);
                    start = minPos(start, other.start);
                    end = maxPos(end, other.end);
                }
                return { start, end };
            }
            function process(n) {
                if (n.alternatives.length < 2) {
                    return;
                }
                const alts = categorizeRawAlts(n.alternatives, flags);
                const characterAltsCount = alts.filter((a) => a.isCharacter).length;
                if (characterAltsCount < 2) {
                    return;
                }
                if (alts.every((a) => a.isCharacter) && totalIsAll(alts)) {
                    context.report({
                        node,
                        loc: getRegexpLocation(n),
                        messageId: "unexpected",
                        fix: fixReplaceAlternatives(n, "[^]"),
                    });
                    return;
                }
                const parsedAlts = parseRawAlts(alts, flags);
                if (characterAltsCount >= minCharacterAlternatives ||
                    containsCharacterClass(alts) ||
                    totalIsAll(alts) ||
                    findNonDisjointAlt(parsedAlts)) {
                    optimizeCharacterAlts(parsedAlts);
                    if (parsedAlts.length !== alts.length) {
                        const firstChanged = findIndex(parsedAlts, (a, i) => a.raw !== n.alternatives[i].raw);
                        const lastChanged = findLastIndex(parsedAlts, (a, i) => {
                            const index = n.alternatives.length +
                                i -
                                parsedAlts.length;
                            return a.raw !== n.alternatives[index].raw;
                        });
                        const changedNodes = [
                            n.alternatives[firstChanged],
                            n.alternatives[n.alternatives.length +
                                lastChanged -
                                parsedAlts.length],
                        ];
                        context.report({
                            node,
                            loc: unionRegexpLocations(changedNodes),
                            messageId: "unexpected",
                            fix: fixReplaceAlternatives(n, parsedAlts.map((a) => a.raw).join("|")),
                        });
                    }
                }
            }
            return {
                onPatternEnter: process,
                onGroupEnter: process,
                onCapturingGroupEnter: process,
                onAssertionEnter(aNode) {
                    if (aNode.kind === "lookahead" ||
                        aNode.kind === "lookbehind") {
                        process(aNode);
                    }
                },
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
