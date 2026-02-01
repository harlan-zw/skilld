"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canSimplifyQuantifier = canSimplifyQuantifier;
const refa_1 = require("refa");
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const util_1 = require("../util");
const containsAssertions = (0, util_1.cachedFn)((node) => {
    return (0, regexp_ast_analysis_1.hasSomeDescendant)(node, (n) => n.type === "Assertion");
});
const cachedGetPossiblyConsumedChar = (0, util_1.cachedFn)((flags) => {
    return (0, util_1.cachedFn)((element) => (0, regexp_ast_analysis_1.getConsumedChars)(element, flags));
});
const CANNOT_SIMPLIFY = { canSimplify: false };
function canSimplifyQuantifier(quantifier, flags, parser) {
    if (quantifier.min === quantifier.max) {
        return CANNOT_SIMPLIFY;
    }
    if ((0, regexp_ast_analysis_1.isZeroLength)(quantifier, flags)) {
        return CANNOT_SIMPLIFY;
    }
    if (containsAssertions(quantifier)) {
        return CANNOT_SIMPLIFY;
    }
    const direction = (0, regexp_ast_analysis_1.getMatchingDirection)(quantifier);
    const preceding = getPrecedingQuantifiers(quantifier, direction, flags);
    if (!preceding) {
        return CANNOT_SIMPLIFY;
    }
    return canAbsorb(preceding, { direction, flags, parser, quantifier });
}
function canAbsorb(initialPreceding, options) {
    const { direction, flags, parser, quantifier } = options;
    const preceding = removeTargetQuantifier(initialPreceding, quantifier, direction, flags);
    if (!preceding) {
        return CANNOT_SIMPLIFY;
    }
    const dependencies = [...preceding];
    const CAN_SIMPLIFY = {
        canSimplify: true,
        dependencies,
    };
    const fast = everyMaybe(preceding, (q) => canAbsorbElementFast(q, quantifier.element, flags));
    if (typeof fast === "boolean") {
        return fast ? CAN_SIMPLIFY : CANNOT_SIMPLIFY;
    }
    const formal = everyMaybe(fast, (q) => canAbsorbElementFormal(q, quantifier.element, parser));
    if (typeof formal === "boolean") {
        return formal ? CAN_SIMPLIFY : CANNOT_SIMPLIFY;
    }
    return formal.every((q) => {
        const parts = splitQuantifierIntoTails(q, direction, flags);
        if (!parts)
            return false;
        const result = canAbsorb(parts, options);
        if (result.canSimplify)
            dependencies.push(...result.dependencies);
        return result.canSimplify;
    })
        ? CAN_SIMPLIFY
        : CANNOT_SIMPLIFY;
}
function everyMaybe(array, fn) {
    const maybe = [];
    for (const item of array) {
        const result = fn(item);
        if (result === false)
            return false;
        if (result === undefined)
            maybe.push(item);
    }
    if (maybe.length === 0)
        return true;
    return maybe;
}
function canAbsorbElementFast(quantifier, element, flags) {
    if (!quantifier.greedy) {
        return false;
    }
    if (!isNonFinite(quantifier, flags)) {
        return false;
    }
    const qChar = cachedGetPossiblyConsumedChar(flags)(quantifier.element);
    const eChar = cachedGetPossiblyConsumedChar(flags)(element);
    if (qChar.chars.isDisjointWith(eChar.chars)) {
        return false;
    }
    if (eChar.exact && !eChar.chars.without(qChar.chars).isEmpty) {
        return false;
    }
    if (containsAssertions(quantifier) || containsAssertions(element)) {
        return undefined;
    }
    if (quantifier.element.type === "Character" ||
        quantifier.element.type === "CharacterClass" ||
        quantifier.element.type === "CharacterSet") {
        if (quantifier.max !== Infinity) {
            return false;
        }
        if (qChar.exact && qChar.chars.isSupersetOf(eChar.chars)) {
            return true;
        }
    }
    return undefined;
}
function isNonFinite(node, flags) {
    return (0, regexp_ast_analysis_1.hasSomeDescendant)(node, (n) => n.type === "Quantifier" &&
        n.max === Infinity &&
        !(0, regexp_ast_analysis_1.isZeroLength)(n.element, flags), (n) => n.type !== "Assertion");
}
function toNfa(element, parser) {
    const { expression, maxCharacter } = parser.parseElement(element, {
        maxNodes: 1000,
        assertions: "throw",
        backreferences: "throw",
    });
    return refa_1.NFA.fromRegex(expression, { maxCharacter }, {}, new refa_1.NFA.LimitedNodeFactory(1000));
}
function canAbsorbElementFormal(quantifier, element, parser) {
    if (containsAssertions(quantifier) || containsAssertions(element)) {
        return undefined;
    }
    try {
        const qNfa = toNfa(quantifier, parser);
        const qDfa = refa_1.DFA.fromFA(qNfa, new refa_1.DFA.LimitedNodeFactory(1000));
        const eNfa = toNfa(element, parser);
        eNfa.quantify(0, 1);
        qNfa.append(eNfa);
        const qeDfa = refa_1.DFA.fromFA(qNfa, new refa_1.DFA.LimitedNodeFactory(1000));
        qDfa.minimize();
        qeDfa.minimize();
        const equal = qDfa.structurallyEqual(qeDfa);
        return equal;
    }
    catch (_a) {
    }
    return undefined;
}
function splitQuantifierIntoTails(quantifier, direction, flags) {
    if ((0, regexp_ast_analysis_1.isPotentiallyZeroLength)(quantifier, flags)) {
        return undefined;
    }
    return getTailQuantifiers(quantifier.element, direction, flags);
}
function removeTargetQuantifier(quantifiers, target, direction, flags) {
    const result = [];
    for (const q of quantifiers) {
        if ((0, regexp_ast_analysis_1.hasSomeDescendant)(q, target)) {
            const inner = splitQuantifierIntoTails(q, direction, flags);
            if (inner === undefined) {
                return undefined;
            }
            const mapped = removeTargetQuantifier(inner, target, direction, flags);
            if (mapped === undefined) {
                return undefined;
            }
            result.push(...mapped);
        }
        else {
            result.push(q);
        }
    }
    return result;
}
function unionQuantifiers(sets) {
    const result = [];
    for (const set of sets) {
        if (set === undefined) {
            return undefined;
        }
        result.push(...set);
    }
    if (result.length === 0)
        return undefined;
    return [...new Set(result)];
}
function getTailQuantifiers(element, direction, flags) {
    switch (element.type) {
        case "Assertion":
        case "Backreference":
        case "Character":
        case "CharacterClass":
        case "CharacterSet":
        case "ExpressionCharacterClass":
            return undefined;
        case "Quantifier":
            return [element];
        case "Group":
        case "CapturingGroup":
            return unionQuantifiers(element.alternatives.map((a) => getTailQuantifiers(a, direction, flags)));
        case "Alternative": {
            const elements = direction === "ltr"
                ? (0, util_1.reversed)(element.elements)
                : element.elements;
            for (const e of elements) {
                if ((0, regexp_ast_analysis_1.isEmpty)(e, flags))
                    continue;
                if (e.type === "Quantifier") {
                    return [e];
                }
                return undefined;
            }
            const { parent } = element;
            if (parent.type === "Pattern") {
                return undefined;
            }
            if (parent.type === "Assertion") {
                return undefined;
            }
            return getPrecedingQuantifiers(parent, direction, flags);
        }
        default:
            return (0, util_1.assertNever)(element);
    }
}
function getPrecedingQuantifiers(element, direction, flags) {
    const parent = element.parent;
    if (parent.type === "Quantifier") {
        if (parent.max === 0) {
            return undefined;
        }
        if (parent.max === 1) {
            return getPrecedingQuantifiers(parent, direction, flags);
        }
        return unionQuantifiers([
            getPrecedingQuantifiers(parent, direction, flags),
            getTailQuantifiers(parent.element, direction, flags),
        ]);
    }
    if (parent.type !== "Alternative") {
        return undefined;
    }
    const inc = direction === "ltr" ? -1 : +1;
    const { elements } = parent;
    const elementIndex = elements.indexOf(element);
    for (let precedingIndex = elementIndex + inc; precedingIndex >= 0 && precedingIndex < elements.length; precedingIndex += inc) {
        const preceding = parent.elements[precedingIndex];
        if ((0, regexp_ast_analysis_1.isEmpty)(preceding, flags))
            continue;
        return getTailQuantifiers(preceding, direction, flags);
    }
    if (parent.parent.type === "Pattern") {
        return undefined;
    }
    return getPrecedingQuantifiers(parent.parent, direction, flags);
}
