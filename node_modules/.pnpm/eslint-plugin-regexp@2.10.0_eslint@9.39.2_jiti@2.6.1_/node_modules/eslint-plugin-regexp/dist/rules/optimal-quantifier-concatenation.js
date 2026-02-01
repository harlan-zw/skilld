"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
const fix_simplify_quantifier_1 = require("../utils/fix-simplify-quantifier");
const mention_1 = require("../utils/mention");
const refa_1 = require("../utils/refa");
const regexp_ast_1 = require("../utils/regexp-ast");
const util_1 = require("../utils/util");
const EMPTY_UTF16 = {
    char: regexp_ast_analysis_1.Chars.empty({}),
    complete: false,
};
const EMPTY_UNICODE = {
    char: regexp_ast_analysis_1.Chars.empty({ unicode: true }),
    complete: false,
};
function getSingleConsumedChar(element, flags) {
    const empty = flags.unicode || flags.unicodeSets ? EMPTY_UNICODE : EMPTY_UTF16;
    switch (element.type) {
        case "Alternative":
            if (element.elements.length === 1) {
                return getSingleConsumedChar(element.elements[0], flags);
            }
            return empty;
        case "Character":
        case "CharacterSet":
        case "CharacterClass":
        case "ExpressionCharacterClass": {
            const set = (0, regexp_ast_analysis_1.toUnicodeSet)(element, flags);
            return {
                char: set.chars,
                complete: set.accept.isEmpty,
            };
        }
        case "Group":
        case "CapturingGroup": {
            const results = element.alternatives.map((a) => getSingleConsumedChar(a, flags));
            return {
                char: empty.char.union(...results.map((r) => r.char)),
                complete: results.every((r) => r.complete),
            };
        }
        case "Assertion":
        case "Backreference":
        case "Quantifier":
            return empty;
        default:
            return (0, util_1.assertNever)(element);
    }
}
function quantAddConst(quant, constant) {
    return {
        min: quant.min + constant,
        max: quant.max + constant,
        greedy: quant.greedy,
    };
}
function quantize(element, quant) {
    if (quant.min === 0 && quant.max === 0) {
        return "";
    }
    if (quant.min === 1 && quant.max === 1) {
        return element.raw;
    }
    return element.raw + (0, regexp_ast_1.quantToString)(quant);
}
function isGroupOrCharacter(element) {
    switch (element.type) {
        case "Group":
        case "CapturingGroup":
        case "Character":
        case "CharacterClass":
        case "CharacterSet":
        case "ExpressionCharacterClass":
            return true;
        case "Assertion":
        case "Backreference":
        case "Quantifier":
            return false;
        default:
            return (0, util_1.assertNever)(element);
    }
}
function getQuantifiersReplacement(left, right, flags) {
    if (left.min === left.max || right.min === right.max) {
        return null;
    }
    if (left.greedy !== right.greedy) {
        return null;
    }
    const lSingle = getSingleConsumedChar(left.element, flags);
    const rSingle = getSingleConsumedChar(right.element, flags);
    const lPossibleChar = lSingle.complete
        ? lSingle.char
        : (0, regexp_ast_analysis_1.getConsumedChars)(left.element, flags).chars;
    const rPossibleChar = rSingle.complete
        ? rSingle.char
        : (0, regexp_ast_analysis_1.getConsumedChars)(right.element, flags).chars;
    const greedy = left.greedy;
    let lQuant, rQuant;
    if (lSingle.complete &&
        rSingle.complete &&
        lSingle.char.equals(rSingle.char)) {
        lQuant = {
            min: left.min + right.min,
            max: left.max + right.max,
            greedy,
        };
        rQuant = { min: 0, max: 0, greedy };
    }
    else if (right.max === Infinity &&
        rSingle.char.isSupersetOf(lPossibleChar)) {
        lQuant = {
            min: left.min,
            max: left.min,
            greedy,
        };
        rQuant = right;
    }
    else if (left.max === Infinity &&
        lSingle.char.isSupersetOf(rPossibleChar)) {
        lQuant = left;
        rQuant = {
            min: right.min,
            max: right.min,
            greedy,
        };
    }
    else {
        return null;
    }
    const raw = quantize(left.element, lQuant) + quantize(right.element, rQuant);
    let messageId;
    if (lQuant.max === 0 &&
        right.max === rQuant.max &&
        right.min === rQuant.min) {
        messageId = "removeLeft";
    }
    else if (rQuant.max === 0 &&
        left.max === lQuant.max &&
        left.min === lQuant.min) {
        messageId = "removeRight";
    }
    else {
        messageId = "replace";
    }
    return { type: "Both", raw, messageId };
}
function asRepeatedElement(element) {
    if (element.type === "Quantifier") {
        if (element.min === element.max &&
            element.min > 0 &&
            isGroupOrCharacter(element.element)) {
            return {
                type: "Repeated",
                element: element.element,
                min: element.min,
            };
        }
    }
    else if (isGroupOrCharacter(element)) {
        return { type: "Repeated", element, min: 1 };
    }
    return null;
}
function getQuantifierRepeatedElementReplacement(pair, flags) {
    const [left, right] = pair;
    const lSingle = getSingleConsumedChar(left.element, flags);
    if (!lSingle.complete) {
        return null;
    }
    const rSingle = getSingleConsumedChar(right.element, flags);
    if (!rSingle.complete) {
        return null;
    }
    if (!rSingle.char.equals(lSingle.char)) {
        return null;
    }
    let elementRaw, quant;
    if (left.type === "Quantifier") {
        elementRaw = left.element.raw;
        quant = quantAddConst(left, right.min);
    }
    else if (right.type === "Quantifier") {
        elementRaw = right.element.raw;
        quant = quantAddConst(right, left.min);
    }
    else {
        throw new Error();
    }
    const raw = elementRaw + (0, regexp_ast_1.quantToString)(quant);
    return { type: "Both", messageId: "combine", raw };
}
function getNestedReplacement(dominate, nested, flags) {
    if (dominate.greedy !== nested.greedy) {
        return null;
    }
    if (dominate.max < Infinity || nested.min === nested.max) {
        return null;
    }
    const single = getSingleConsumedChar(dominate.element, flags);
    if (single.char.isEmpty) {
        return null;
    }
    const nestedPossible = (0, regexp_ast_analysis_1.getConsumedChars)(nested.element, flags);
    if (single.char.isSupersetOf(nestedPossible.chars)) {
        const { min } = nested;
        if (min === 0) {
            return {
                type: "Nested",
                messageId: "nestedRemove",
                raw: "",
                nested,
                dominate,
            };
        }
        return {
            type: "Nested",
            messageId: "nestedReplace",
            raw: quantize(nested.element, { ...nested, max: min }),
            nested,
            dominate,
        };
    }
    return null;
}
function* nestedQuantifiers(root, direction) {
    switch (root.type) {
        case "Alternative":
            if (root.elements.length > 0) {
                const index = direction === "start" ? 0 : root.elements.length - 1;
                yield* nestedQuantifiers(root.elements[index], direction);
            }
            break;
        case "CapturingGroup":
        case "Group":
            for (const a of root.alternatives) {
                yield* nestedQuantifiers(a, direction);
            }
            break;
        case "Quantifier":
            yield root;
            if (root.max === 1) {
                yield* nestedQuantifiers(root.element, direction);
            }
            break;
        default:
            break;
    }
}
function ignoreReplacement(left, right, result) {
    if (left.type === "Quantifier") {
        if (left.raw.length + right.raw.length <= result.raw.length &&
            isGroupOrCharacter(right) &&
            left.min === 0 &&
            left.max === 1) {
            return true;
        }
    }
    if (right.type === "Quantifier") {
        if (left.raw.length + right.raw.length <= result.raw.length &&
            isGroupOrCharacter(left) &&
            right.min === 0 &&
            right.max === 1) {
            return true;
        }
    }
    return false;
}
function getReplacement(left, right, flags) {
    if (left.type === "Quantifier" && right.type === "Quantifier") {
        const result = getQuantifiersReplacement(left, right, flags);
        if (result && !ignoreReplacement(left, right, result))
            return result;
    }
    if (left.type === "Quantifier") {
        const rightRep = asRepeatedElement(right);
        if (rightRep) {
            const result = getQuantifierRepeatedElementReplacement([left, rightRep], flags);
            if (result && !ignoreReplacement(left, right, result))
                return result;
        }
    }
    if (right.type === "Quantifier") {
        const leftRep = asRepeatedElement(left);
        if (leftRep) {
            const result = getQuantifierRepeatedElementReplacement([leftRep, right], flags);
            if (result && !ignoreReplacement(left, right, result))
                return result;
        }
    }
    if (left.type === "Quantifier" && left.max === Infinity) {
        for (const nested of nestedQuantifiers(right, "start")) {
            const result = getNestedReplacement(left, nested, flags);
            if (result)
                return result;
        }
    }
    if (right.type === "Quantifier" && right.max === Infinity) {
        for (const nested of nestedQuantifiers(left, "end")) {
            const result = getNestedReplacement(right, nested, flags);
            if (result)
                return result;
        }
    }
    return null;
}
function getLoc(left, right, { patternSource }) {
    return patternSource.getAstLocation({
        start: Math.min(left.start, right.start),
        end: Math.max(left.end, right.end),
    });
}
function getCapturingGroupStack(element) {
    let result = "";
    for (let p = element.parent; p.type !== "Pattern"; p = p.parent) {
        if (p.type === "CapturingGroup") {
            const id = p.start;
            result += String.fromCodePoint(32 + id);
        }
    }
    return result;
}
exports.default = (0, utils_1.createRule)("optimal-quantifier-concatenation", {
    meta: {
        docs: {
            description: "require optimal quantifiers for concatenated quantifiers",
            category: "Best Practices",
            recommended: true,
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    capturingGroups: {
                        enum: ["ignore", "report"],
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            combine: "{{left}} and {{right}} can be combined into one quantifier {{fix}}.{{cap}}",
            removeLeft: "{{left}} can be removed because it is already included by {{right}}.{{cap}}",
            removeRight: "{{right}} can be removed because it is already included by {{left}}.{{cap}}",
            replace: "{{left}} and {{right}} can be replaced with {{fix}}.{{cap}}",
            nestedRemove: "{{nested}} can be removed because of {{dominate}}.{{cap}}",
            nestedReplace: "{{nested}} can be replaced with {{fix}} because of {{dominate}}.{{cap}}",
            removeQuant: "{{quant}} can be removed because it is already included by {{cause}}.{{cap}}",
            replaceQuant: "{{quant}} can be replaced with {{fix}} because of {{cause}}.{{cap}}",
        },
        type: "suggestion",
    },
    create(context) {
        var _a, _b;
        const cgReporting = (_b = (_a = context.options[0]) === null || _a === void 0 ? void 0 : _a.capturingGroups) !== null && _b !== void 0 ? _b : "report";
        function createVisitor(regexpContext) {
            const { node, flags, getRegexpLocation, fixReplaceNode } = regexpContext;
            const parser = (0, refa_1.getParser)(regexpContext);
            const simplifiedAlready = [];
            function isSimplifiedAlready(element) {
                return simplifiedAlready.some((q) => {
                    return (0, regexp_ast_analysis_1.hasSomeDescendant)(q, element);
                });
            }
            return {
                onQuantifierEnter(quantifier) {
                    const result = (0, regexp_ast_1.canSimplifyQuantifier)(quantifier, flags, parser);
                    if (!result.canSimplify)
                        return;
                    const quantStack = getCapturingGroupStack(quantifier);
                    const crossesCapturingGroup = result.dependencies.some((e) => getCapturingGroupStack(e) !== quantStack);
                    const removesCapturingGroup = quantifier.min === 0 && (0, regexp_ast_1.hasCapturingGroup)(quantifier);
                    const involvesCapturingGroup = removesCapturingGroup || crossesCapturingGroup;
                    if (involvesCapturingGroup &&
                        cgReporting === "ignore") {
                        return;
                    }
                    simplifiedAlready.push(quantifier, ...result.dependencies);
                    const cause = (0, mention_1.joinEnglishList)(result.dependencies.map((d) => (0, mention_1.mention)(d)));
                    const [replacement, fix] = (0, fix_simplify_quantifier_1.fixSimplifyQuantifier)(quantifier, result, regexpContext);
                    if (quantifier.min === 0) {
                        const cap = involvesCapturingGroup
                            ? removesCapturingGroup
                                ? " This cannot be fixed automatically because it removes a capturing group."
                                : " This cannot be fixed automatically because it involves a capturing group."
                            : "";
                        context.report({
                            node,
                            loc: getRegexpLocation(quantifier),
                            messageId: "removeQuant",
                            data: {
                                quant: (0, mention_1.mention)(quantifier),
                                cause,
                                cap,
                            },
                            fix: involvesCapturingGroup ? undefined : fix,
                        });
                    }
                    else {
                        const cap = involvesCapturingGroup
                            ? " This cannot be fixed automatically because it involves a capturing group."
                            : "";
                        context.report({
                            node,
                            loc: getRegexpLocation(quantifier),
                            messageId: "replaceQuant",
                            data: {
                                quant: (0, mention_1.mention)(quantifier),
                                fix: (0, mention_1.mention)(replacement),
                                cause,
                                cap,
                            },
                            fix: involvesCapturingGroup ? undefined : fix,
                        });
                    }
                },
                onAlternativeLeave(aNode) {
                    for (let i = 0; i < aNode.elements.length - 1; i++) {
                        const left = aNode.elements[i];
                        const right = aNode.elements[i + 1];
                        if (isSimplifiedAlready(left) ||
                            isSimplifiedAlready(right)) {
                            continue;
                        }
                        const replacement = getReplacement(left, right, flags);
                        if (!replacement) {
                            continue;
                        }
                        const involvesCapturingGroup = (0, regexp_ast_1.hasCapturingGroup)(left) || (0, regexp_ast_1.hasCapturingGroup)(right);
                        if (involvesCapturingGroup &&
                            cgReporting === "ignore") {
                            continue;
                        }
                        const cap = involvesCapturingGroup
                            ? " This cannot be fixed automatically because it might change or remove a capturing group."
                            : "";
                        if (replacement.type === "Both") {
                            context.report({
                                node,
                                loc: getLoc(left, right, regexpContext),
                                messageId: replacement.messageId,
                                data: {
                                    left: (0, mention_1.mention)(left),
                                    right: (0, mention_1.mention)(right),
                                    fix: (0, mention_1.mention)(replacement.raw),
                                    cap,
                                },
                                fix: fixReplaceNode(aNode, () => {
                                    if (involvesCapturingGroup) {
                                        return null;
                                    }
                                    const before = aNode.raw.slice(0, left.start - aNode.start);
                                    const after = aNode.raw.slice(right.end - aNode.start);
                                    return before + replacement.raw + after;
                                }),
                            });
                        }
                        else {
                            context.report({
                                node,
                                loc: getRegexpLocation(replacement.nested),
                                messageId: replacement.messageId,
                                data: {
                                    nested: (0, mention_1.mention)(replacement.nested),
                                    dominate: (0, mention_1.mention)(replacement.dominate),
                                    fix: (0, mention_1.mention)(replacement.raw),
                                    cap,
                                },
                                fix: fixReplaceNode(replacement.nested, () => {
                                    if (involvesCapturingGroup) {
                                        return null;
                                    }
                                    return replacement.raw;
                                }),
                            });
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
