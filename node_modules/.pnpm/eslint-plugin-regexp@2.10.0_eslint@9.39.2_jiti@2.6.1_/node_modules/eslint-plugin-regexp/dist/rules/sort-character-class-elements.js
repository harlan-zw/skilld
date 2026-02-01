"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
const lexicographically_smallest_1 = require("../utils/lexicographically-smallest");
const mention_1 = require("../utils/mention");
const DEFAULT_ORDER = [
    "\\s",
    "\\w",
    "\\d",
    "\\p",
    "*",
    "\\q",
    "[]",
];
function getCharacterClassElementKind(node) {
    if (node.type === "CharacterSet") {
        return node.kind === "word"
            ? "\\w"
            : node.kind === "digit"
                ? "\\d"
                : node.kind === "space"
                    ? "\\s"
                    : "\\p";
    }
    if (node.type === "ClassStringDisjunction") {
        return "\\q";
    }
    if (node.type === "CharacterClass" ||
        node.type === "ExpressionCharacterClass") {
        return "[]";
    }
    return "*";
}
function getLexicographicallySmallestFromElement(node, flags) {
    const us = node.type === "CharacterSet" && node.negate
        ? (0, regexp_ast_analysis_1.toUnicodeSet)({ ...node, negate: false }, flags)
        : (0, regexp_ast_analysis_1.toUnicodeSet)(node, flags);
    return (0, lexicographically_smallest_1.getLexicographicallySmallest)(us) || [];
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
exports.default = (0, utils_1.createRule)("sort-character-class-elements", {
    meta: {
        docs: {
            description: "enforces elements order in character class",
            category: "Stylistic Issues",
            recommended: false,
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    order: {
                        type: "array",
                        items: {
                            enum: [
                                "\\s",
                                "\\w",
                                "\\d",
                                "\\p",
                                "*",
                                "\\q",
                                "[]",
                            ],
                        },
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            sortElements: "Expected character class elements to be in ascending order. {{next}} should be before {{prev}}.",
        },
        type: "layout",
    },
    create(context) {
        var _a, _b;
        const orderOption = { "*": Infinity };
        ((_b = (_a = context.options[0]) === null || _a === void 0 ? void 0 : _a.order) !== null && _b !== void 0 ? _b : DEFAULT_ORDER).forEach((o, i) => {
            orderOption[o] = i + 1;
        });
        function createVisitor({ node, flags, getRegexpLocation, patternSource, }) {
            return {
                onCharacterClassEnter(ccNode) {
                    const prevList = [];
                    for (const next of ccNode.elements) {
                        if (prevList.length) {
                            const prev = prevList[0];
                            if (!isValidOrder(prev, next, flags)) {
                                let moveTarget = prev;
                                for (const p of prevList) {
                                    if (isValidOrder(p, next, flags)) {
                                        break;
                                    }
                                    else {
                                        moveTarget = p;
                                    }
                                }
                                context.report({
                                    node,
                                    loc: getRegexpLocation(next),
                                    messageId: "sortElements",
                                    data: {
                                        next: (0, mention_1.mention)(next),
                                        prev: (0, mention_1.mention)(moveTarget),
                                    },
                                    *fix(fixer) {
                                        const nextRange = patternSource.getReplaceRange(next);
                                        const targetRange = patternSource.getReplaceRange(moveTarget);
                                        if (!targetRange || !nextRange) {
                                            return;
                                        }
                                        yield targetRange.insertBefore(fixer, escapeRaw(next, moveTarget));
                                        yield nextRange.remove(fixer);
                                    },
                                });
                            }
                        }
                        prevList.unshift(next);
                    }
                },
            };
        }
        function isValidOrder(prev, next, flags) {
            var _a, _b;
            const prevKind = getCharacterClassElementKind(prev);
            const nextKind = getCharacterClassElementKind(next);
            const prevOrder = (_a = orderOption[prevKind]) !== null && _a !== void 0 ? _a : orderOption["*"];
            const nextOrder = (_b = orderOption[nextKind]) !== null && _b !== void 0 ? _b : orderOption["*"];
            if (prevOrder < nextOrder) {
                return true;
            }
            else if (prevOrder > nextOrder) {
                return false;
            }
            const prevOrderShortCircuit = DEFAULT_ORDER.indexOf(prevKind);
            const nextOrderShortCircuit = DEFAULT_ORDER.indexOf(nextKind);
            if (prevOrderShortCircuit < nextOrderShortCircuit) {
                return true;
            }
            else if (prevOrderShortCircuit > nextOrderShortCircuit) {
                return false;
            }
            if (prev.type === "CharacterSet" &&
                prev.kind === "property" &&
                next.type === "CharacterSet" &&
                next.kind === "property") {
                return isValidOrderForUnicodePropertyCharacterSet(prev, next);
            }
            const prevWord = getLexicographicallySmallestFromElement(prev, flags);
            const nextWord = getLexicographicallySmallestFromElement(next, flags);
            if (compareWords(prevWord, nextWord) <= 0) {
                return true;
            }
            return false;
        }
        function isValidOrderForUnicodePropertyCharacterSet(prev, next) {
            if (prev.key < next.key) {
                return true;
            }
            else if (prev.key > next.key) {
                return false;
            }
            if (prev.value) {
                if (next.value) {
                    if (prev.value <= next.value) {
                        return true;
                    }
                    return false;
                }
                return false;
            }
            return true;
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
function escapeRaw(node, target) {
    let raw = node.raw;
    if (raw.startsWith("-")) {
        const parent = target.parent;
        const elements = parent.elements;
        const prev = elements[elements.indexOf(target) - 1];
        if (prev &&
            (prev.type === "Character" || prev.type === "CharacterSet")) {
            raw = `\\${raw}`;
        }
    }
    else if (raw.startsWith("^")) {
        const parent = target.parent;
        const elements = parent.elements;
        if (elements[0] === target) {
            raw = `\\${raw}`;
        }
    }
    if (target.raw.startsWith("-")) {
        if (node.type === "Character" || node.type === "CharacterSet") {
            raw = `${raw}\\`;
        }
    }
    return raw;
}
