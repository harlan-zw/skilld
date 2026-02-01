"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const refa_1 = require("refa");
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
const fix_simplify_quantifier_1 = require("../utils/fix-simplify-quantifier");
const mention_1 = require("../utils/mention");
const refa_2 = require("../utils/refa");
const regexp_ast_1 = require("../utils/regexp-ast");
const util_1 = require("../utils/util");
function* getStartQuantifiers(root, direction, flags) {
    if (Array.isArray(root)) {
        for (const a of root) {
            yield* getStartQuantifiers(a, direction, flags);
        }
        return;
    }
    switch (root.type) {
        case "Character":
        case "CharacterClass":
        case "CharacterSet":
        case "ExpressionCharacterClass":
        case "Backreference":
            break;
        case "Assertion":
            break;
        case "Alternative": {
            const elements = direction === "ltr" ? root.elements : (0, util_1.reversed)(root.elements);
            for (const e of elements) {
                if ((0, regexp_ast_analysis_1.isEmpty)(e, flags))
                    continue;
                yield* getStartQuantifiers(e, direction, flags);
                break;
            }
            break;
        }
        case "CapturingGroup":
            break;
        case "Group":
            yield* getStartQuantifiers(root.alternatives, direction, flags);
            break;
        case "Quantifier":
            yield root;
            if (root.max === 1) {
                yield* getStartQuantifiers(root.element, direction, flags);
            }
            break;
        default:
            yield (0, util_1.assertNever)(root);
    }
}
const getCache = (0, util_1.cachedFn)((_flags) => new WeakMap());
function getSingleRepeatedChar(element, flags, cache = getCache(flags)) {
    let value = cache.get(element);
    if (value === undefined) {
        value = uncachedGetSingleRepeatedChar(element, flags, cache);
        cache.set(element, value);
    }
    return value;
}
function uncachedGetSingleRepeatedChar(element, flags, cache) {
    switch (element.type) {
        case "Alternative": {
            let total = undefined;
            for (const e of element.elements) {
                const c = getSingleRepeatedChar(e, flags, cache);
                if (total === undefined) {
                    total = c;
                }
                else {
                    total = total.intersect(c);
                }
                if (total.isEmpty)
                    return total;
            }
            return total !== null && total !== void 0 ? total : regexp_ast_analysis_1.Chars.empty(flags);
        }
        case "Assertion":
            return regexp_ast_analysis_1.Chars.empty(flags);
        case "Backreference":
            return regexp_ast_analysis_1.Chars.empty(flags);
        case "Character":
        case "CharacterClass":
        case "CharacterSet":
        case "ExpressionCharacterClass": {
            const set = (0, regexp_ast_analysis_1.toUnicodeSet)(element, flags);
            if (set.accept.isEmpty) {
                return set.chars;
            }
            return set.wordSets
                .map((wordSet) => {
                let total = undefined;
                for (const c of wordSet) {
                    if (total === undefined) {
                        total = c;
                    }
                    else {
                        total = total.intersect(c);
                    }
                    if (total.isEmpty)
                        return total;
                }
                return total !== null && total !== void 0 ? total : regexp_ast_analysis_1.Chars.empty(flags);
            })
                .reduce((a, b) => a.union(b));
        }
        case "CapturingGroup":
        case "Group":
            return element.alternatives
                .map((a) => getSingleRepeatedChar(a, flags, cache))
                .reduce((a, b) => a.union(b));
        case "Quantifier":
            if (element.max === 0)
                return regexp_ast_analysis_1.Chars.empty(flags);
            return getSingleRepeatedChar(element.element, flags, cache);
        default:
            return (0, util_1.assertNever)(element);
    }
}
function getTradingQuantifiersAfter(start, startChar, direction, flags) {
    const results = [];
    (0, regexp_ast_analysis_1.followPaths)(start, "next", startChar, {
        join(states) {
            return refa_1.CharSet.empty(startChar.maximum).union(...states);
        },
        continueAfter(_, state) {
            return !state.isEmpty;
        },
        continueInto(element, state) {
            return element.type !== "Assertion" && !state.isEmpty;
        },
        leave(element, state) {
            switch (element.type) {
                case "Assertion":
                case "Backreference":
                case "Character":
                case "CharacterClass":
                case "CharacterSet":
                case "ExpressionCharacterClass":
                    return state.intersect(getSingleRepeatedChar(element, flags));
                case "CapturingGroup":
                case "Group":
                case "Quantifier":
                    return state;
                default:
                    return (0, util_1.assertNever)(element);
            }
        },
        enter(element, state) {
            if (element.type === "Quantifier" &&
                element.min !== element.max) {
                const qChar = getSingleRepeatedChar(element, flags);
                const intersection = qChar.intersect(state);
                if (!intersection.isEmpty) {
                    results.push({
                        quant: element,
                        quantRepeatedChar: qChar,
                        intersection,
                    });
                }
            }
            return state;
        },
    }, direction);
    return results;
}
exports.default = (0, utils_1.createRule)("no-misleading-capturing-group", {
    meta: {
        docs: {
            description: "disallow capturing groups that do not behave as one would expect",
            category: "Possible Errors",
            recommended: true,
        },
        hasSuggestions: true,
        schema: [
            {
                type: "object",
                properties: {
                    reportBacktrackingEnds: { type: "boolean" },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            removeQuant: "{{quant}} can be removed because it is already included by {{cause}}." +
                " This makes the capturing group misleading, because it actually captures less text than its pattern suggests.",
            replaceQuant: "{{quant}} can be replaced with {{fix}} because of {{cause}}." +
                " This makes the capturing group misleading, because it actually captures less text than its pattern suggests.",
            suggestionRemove: "Remove {{quant}}.",
            suggestionReplace: "Replace {{quant}} with {{fix}}.",
            nonAtomic: "The quantifier {{quant}} is not atomic for the characters {{chars}}, so it might capture fewer characters than expected. This makes the capturing group misleading, because the quantifier will capture fewer characters than its pattern suggests in some edge cases.",
            suggestionNonAtomic: "Make the quantifier atomic by adding {{fix}}. Careful! This is going to change the behavior of the regex in some edge cases.",
            trading: "The quantifier {{quant}} can exchange characters ({{chars}}) with {{other}}. This makes the capturing group misleading, because the quantifier will capture fewer characters than its pattern suggests.",
        },
        type: "problem",
    },
    create(context) {
        var _a, _b;
        const reportBacktrackingEnds = (_b = (_a = context.options[0]) === null || _a === void 0 ? void 0 : _a.reportBacktrackingEnds) !== null && _b !== void 0 ? _b : true;
        function createVisitor(regexpContext) {
            const { node, flags, getRegexpLocation } = regexpContext;
            const parser = (0, refa_2.getParser)(regexpContext);
            function reportStartQuantifiers(capturingGroup) {
                const direction = (0, regexp_ast_analysis_1.getMatchingDirection)(capturingGroup);
                const startQuantifiers = getStartQuantifiers(capturingGroup.alternatives, direction, flags);
                for (const quantifier of startQuantifiers) {
                    const result = (0, regexp_ast_1.canSimplifyQuantifier)(quantifier, flags, parser);
                    if (!result.canSimplify)
                        return;
                    const cause = (0, mention_1.joinEnglishList)(result.dependencies.map((d) => (0, mention_1.mention)(d)));
                    const [replacement, fix] = (0, fix_simplify_quantifier_1.fixSimplifyQuantifier)(quantifier, result, regexpContext);
                    if (quantifier.min === 0) {
                        const removesCapturingGroup = (0, regexp_ast_1.hasCapturingGroup)(quantifier);
                        context.report({
                            node,
                            loc: getRegexpLocation(quantifier),
                            messageId: "removeQuant",
                            data: {
                                quant: (0, mention_1.mention)(quantifier),
                                cause,
                            },
                            suggest: removesCapturingGroup
                                ? undefined
                                : [
                                    {
                                        messageId: "suggestionRemove",
                                        data: {
                                            quant: (0, mention_1.mention)(quantifier),
                                        },
                                        fix,
                                    },
                                ],
                        });
                    }
                    else {
                        context.report({
                            node,
                            loc: getRegexpLocation(quantifier),
                            messageId: "replaceQuant",
                            data: {
                                quant: (0, mention_1.mention)(quantifier),
                                fix: (0, mention_1.mention)(replacement),
                                cause,
                            },
                            suggest: [
                                {
                                    messageId: "suggestionReplace",
                                    data: {
                                        quant: (0, mention_1.mention)(quantifier),
                                        fix: (0, mention_1.mention)(replacement),
                                    },
                                    fix,
                                },
                            ],
                        });
                    }
                }
            }
            function reportTradingEndQuantifiers(capturingGroup) {
                const direction = (0, regexp_ast_analysis_1.getMatchingDirection)(capturingGroup);
                const endQuantifiers = getStartQuantifiers(capturingGroup.alternatives, (0, regexp_ast_analysis_1.invertMatchingDirection)(direction), flags);
                for (const quantifier of endQuantifiers) {
                    if (!quantifier.greedy) {
                        continue;
                    }
                    if (quantifier.min === quantifier.max) {
                        continue;
                    }
                    const qChar = getSingleRepeatedChar(quantifier, flags);
                    if (qChar.isEmpty) {
                        continue;
                    }
                    for (const trader of getTradingQuantifiersAfter(quantifier, qChar, direction, flags)) {
                        if ((0, regexp_ast_analysis_1.hasSomeDescendant)(capturingGroup, trader.quant)) {
                            continue;
                        }
                        if (trader.quant.min >= 1 &&
                            !(0, regexp_ast_analysis_1.isPotentiallyZeroLength)(trader.quant.element, flags))
                            context.report({
                                node,
                                loc: getRegexpLocation(quantifier),
                                messageId: "trading",
                                data: {
                                    quant: (0, mention_1.mention)(quantifier),
                                    other: (0, mention_1.mention)(trader.quant),
                                    chars: (0, refa_2.toCharSetSource)(trader.intersection, flags),
                                },
                            });
                    }
                }
            }
            return {
                onCapturingGroupLeave(capturingGroup) {
                    reportStartQuantifiers(capturingGroup);
                    if (reportBacktrackingEnds) {
                        reportTradingEndQuantifiers(capturingGroup);
                    }
                },
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
