"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexpp_1 = require("@eslint-community/regexpp");
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
const UTF16_MAX = 0xffff;
function isSyntacticallyCompatible(pattern) {
    const INCOMPATIBLE = {};
    let uPattern;
    try {
        uPattern = new regexpp_1.RegExpParser().parsePattern(pattern.raw, undefined, undefined, { unicode: true });
    }
    catch (_a) {
        return false;
    }
    try {
        (0, regexpp_1.visitRegExpAST)(pattern, {
            onCharacterEnter(node) {
                if (/^\\(?![bfnrtv])[A-Za-z]$/u.test(node.raw)) {
                    throw INCOMPATIBLE;
                }
            },
        });
        (0, regexpp_1.visitRegExpAST)(uPattern, {
            onCharacterEnter(node) {
                if (node.value > UTF16_MAX &&
                    (node.parent.type === "CharacterClass" ||
                        node.parent.type === "CharacterClassRange")) {
                    throw INCOMPATIBLE;
                }
            },
            onQuantifierEnter(node) {
                if (node.element.type === "Character" &&
                    node.element.value > UTF16_MAX) {
                    throw INCOMPATIBLE;
                }
            },
        });
    }
    catch (error) {
        if (error === INCOMPATIBLE) {
            return false;
        }
        throw error;
    }
    return uPattern;
}
const HIGH_SURROGATES = { min: 0xd800, max: 0xdbff };
const LOW_SURROGATES = { min: 0xdc00, max: 0xdfff };
const SURROGATES = { min: 0xd800, max: 0xdfff };
const ASTRAL = { min: 0x10000, max: 0x10ffff };
function rangeEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        const x = a[i];
        const y = b[i];
        if (x.min !== y.min || x.max !== y.max) {
            return false;
        }
    }
    return true;
}
function isChar(node) {
    return (node.type === "Character" ||
        node.type === "CharacterClass" ||
        node.type === "CharacterSet");
}
function isCompatibleCharLike(char, flags, uFlags) {
    const cs = (0, regexp_ast_analysis_1.toUnicodeSet)(char, flags);
    if (!cs.isDisjointWith(SURROGATES)) {
        return false;
    }
    const uCs = (0, regexp_ast_analysis_1.toUnicodeSet)(char, uFlags);
    return rangeEqual(cs.chars.ranges, uCs.chars.ranges);
}
function isCompatibleQuantifier(q, flags, uFlags) {
    if (!isChar(q.element)) {
        return undefined;
    }
    if (isCompatibleCharLike(q.element, flags, uFlags)) {
        return true;
    }
    if (q.min > 1 || q.max !== Infinity) {
        return undefined;
    }
    const cs = (0, regexp_ast_analysis_1.toUnicodeSet)(q.element, flags);
    if (!cs.isSupersetOf(SURROGATES)) {
        return false;
    }
    const uCs = (0, regexp_ast_analysis_1.toUnicodeSet)(q.element, uFlags);
    if (!uCs.isSupersetOf(SURROGATES) || !uCs.isSupersetOf(ASTRAL)) {
        return false;
    }
    if (!rangeEqual(cs.chars.ranges, uCs.without(ASTRAL).chars.ranges)) {
        return false;
    }
    const before = (0, regexp_ast_analysis_1.getFirstCharAfter)(q, "rtl", flags).char;
    if (!before.isDisjointWith(HIGH_SURROGATES)) {
        return false;
    }
    const after = (0, regexp_ast_analysis_1.getFirstCharAfter)(q, "ltr", flags).char;
    if (!after.isDisjointWith(LOW_SURROGATES)) {
        return false;
    }
    return true;
}
function isSemanticallyCompatible(regexpContext, uPattern) {
    const surrogatePositions = new Set();
    (0, regexpp_1.visitRegExpAST)(uPattern, {
        onCharacterEnter(node) {
            if (node.value > UTF16_MAX) {
                for (let i = node.start; i < node.end; i++) {
                    surrogatePositions.add(i);
                }
            }
        },
    });
    const pattern = regexpContext.patternAst;
    const flags = regexpContext.flags;
    const uFlags = (0, regexp_ast_analysis_1.toCache)({ ...flags, unicode: true });
    const skip = new Set();
    return !(0, regexp_ast_analysis_1.hasSomeDescendant)(pattern, (n) => {
        if (n.type === "Character" && surrogatePositions.has(n.start)) {
            return false;
        }
        if (n.type === "Assertion" &&
            n.kind === "word" &&
            flags.ignoreCase) {
            return true;
        }
        if (isChar(n)) {
            return !isCompatibleCharLike(n, flags, uFlags);
        }
        if (n.type === "Quantifier") {
            const result = isCompatibleQuantifier(n, flags, uFlags);
            if (result !== undefined) {
                skip.add(n);
                return !result;
            }
        }
        return false;
    }, (n) => {
        return n.type !== "CharacterClass" && !skip.has(n);
    });
}
function isCompatible(regexpContext) {
    const uPattern = isSyntacticallyCompatible(regexpContext.patternAst);
    if (!uPattern) {
        return false;
    }
    return isSemanticallyCompatible(regexpContext, uPattern);
}
exports.default = (0, utils_1.createRule)("require-unicode-regexp", {
    meta: {
        docs: {
            description: "enforce the use of the `u` flag",
            category: "Best Practices",
            recommended: false,
        },
        schema: [],
        fixable: "code",
        messages: {
            require: "Use the 'u' flag.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor(regexpContext) {
            const { node, flags, flagsString, getFlagsLocation, fixReplaceFlags, } = regexpContext;
            if (flagsString === null) {
                return {};
            }
            if (!flags.unicode && !flags.unicodeSets) {
                context.report({
                    node,
                    loc: getFlagsLocation(),
                    messageId: "require",
                    fix: fixReplaceFlags(() => {
                        if (!isCompatible(regexpContext)) {
                            return null;
                        }
                        return `${flagsString}u`;
                    }),
                });
            }
            return {};
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
