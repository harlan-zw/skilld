"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEqualNodes = isEqualNodes;
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
function isEqualChar(a, b, flags) {
    if (a.type === "Character") {
        if (b.type === "Character") {
            if (a.value === b.value) {
                return true;
            }
        }
        else if (b.type === "CharacterSet") {
            return false;
        }
    }
    else if (a.type === "CharacterSet") {
        if (b.type === "Character") {
            return false;
        }
        else if (b.type === "CharacterSet") {
            return a.raw === b.raw;
        }
    }
    else if (a.type === "CharacterClassRange") {
        if (b.type === "CharacterClassRange") {
            return a.min.value === b.min.value && a.max.value === b.max.value;
        }
    }
    if (a.raw === b.raw) {
        return true;
    }
    return (0, regexp_ast_analysis_1.toUnicodeSet)(a, flags).equals((0, regexp_ast_analysis_1.toUnicodeSet)(b, flags));
}
const EQUALS_CHECKER = {
    Alternative(a, b, flags, shortCircuit) {
        return isEqualConcatenation(a.elements, b.elements, flags, shortCircuit);
    },
    Assertion(a, b, flags, shortCircuit) {
        if (a.kind === "start" || a.kind === "end") {
            return a.kind === b.kind;
        }
        if (a.kind === "word") {
            return b.kind === "word" && a.negate === b.negate;
        }
        if (a.kind === "lookahead" || a.kind === "lookbehind") {
            if (b.kind === a.kind && a.negate === b.negate) {
                return isEqualSet(a.alternatives, b.alternatives, flags, shortCircuit);
            }
            return false;
        }
        return false;
    },
    Backreference(a, b) {
        return a.ref === b.ref;
    },
    CapturingGroup(a, b, flags, shortCircuit) {
        return (a.name === b.name &&
            isEqualSet(a.alternatives, b.alternatives, flags, shortCircuit));
    },
    Character(a, b, flags) {
        return isEqualChar(a, b, flags);
    },
    CharacterClass(a, b, flags) {
        return isEqualChar(a, b, flags);
    },
    CharacterClassRange(a, b, flags) {
        return isEqualChar(a, b, flags);
    },
    CharacterSet(a, b, flags) {
        return isEqualChar(a, b, flags);
    },
    ClassIntersection(a, b, flags, shortCircuit) {
        return isEqualSet([a.left, a.right], [b.left, b.right], flags, shortCircuit);
    },
    ClassStringDisjunction(a, b, flags, shortCircuit) {
        return isEqualSet(a.alternatives, b.alternatives, flags, shortCircuit);
    },
    ClassSubtraction(a, b, flags, shortCircuit) {
        return (isEqualNodes(a.left, b.left, flags, shortCircuit) &&
            isEqualNodes(a.right, b.right, flags, shortCircuit));
    },
    ExpressionCharacterClass(a, b, flags) {
        return (a.negate === b.negate &&
            isEqualNodes(a.expression, b.expression, flags));
    },
    Flags(a, b) {
        return (a.dotAll === b.dotAll &&
            a.global === b.global &&
            a.ignoreCase === b.ignoreCase &&
            a.multiline === b.multiline &&
            a.hasIndices === b.hasIndices &&
            a.sticky === b.sticky &&
            a.unicode === b.unicode &&
            a.unicodeSets === b.unicodeSets);
    },
    Group(a, b, flags, shortCircuit) {
        return isEqualSet(a.alternatives, b.alternatives, flags, shortCircuit);
    },
    ModifierFlags(a, b) {
        return (a.dotAll === b.dotAll &&
            a.ignoreCase === b.ignoreCase &&
            a.multiline === b.multiline);
    },
    Modifiers(a, b, flags, shortCircuit) {
        return (isEqualNodes(a.add, b.add, flags, shortCircuit) &&
            ((a.remove == null && b.remove == null) ||
                (a.remove != null &&
                    b.remove != null &&
                    isEqualNodes(a.remove, b.remove, flags, shortCircuit))));
    },
    Pattern(a, b, flags, shortCircuit) {
        return isEqualSet(a.alternatives, b.alternatives, flags, shortCircuit);
    },
    Quantifier(a, b, flags, shortCircuit) {
        return (a.min === b.min &&
            a.max === b.max &&
            a.greedy === b.greedy &&
            isEqualNodes(a.element, b.element, flags, shortCircuit));
    },
    RegExpLiteral(a, b, flags, shortCircuit) {
        return (isEqualNodes(a.pattern, b.pattern, flags, shortCircuit) &&
            isEqualNodes(a.flags, b.flags, flags, shortCircuit));
    },
    StringAlternative(a, b, flags, shortCircuit) {
        return isEqualConcatenation(a.elements, b.elements, flags, shortCircuit);
    },
};
function isToCharSetElement(node) {
    return (node.type === "Character" ||
        node.type === "CharacterClass" ||
        node.type === "CharacterClassRange" ||
        node.type === "CharacterSet");
}
function isEqualNodes(a, b, flags, shortCircuit) {
    if (isToCharSetElement(a) && isToCharSetElement(b)) {
        return isEqualChar(a, b, flags);
    }
    if (a.type !== b.type) {
        return false;
    }
    if (shortCircuit) {
        const kind = shortCircuit(a, b);
        if (kind != null) {
            return kind;
        }
    }
    if (/[(*+?[\\{|]/u.test(a.raw) || /[(*+?[\\{|]/u.test(b.raw)) {
        return EQUALS_CHECKER[a.type](a, b, flags, shortCircuit);
    }
    return a.raw === b.raw;
}
function isEqualConcatenation(a, b, flags, shortCircuit) {
    if (a.length !== b.length) {
        return false;
    }
    for (let index = 0; index < a.length; index++) {
        const ae = a[index];
        const be = b[index];
        if (!isEqualNodes(ae, be, flags, shortCircuit)) {
            return false;
        }
    }
    return true;
}
function isEqualSet(a, b, flags, shortCircuit) {
    if (a.length !== b.length) {
        return false;
    }
    const beList = [...b];
    for (const ae of a) {
        const bIndex = beList.findIndex((be) => isEqualNodes(ae, be, flags, shortCircuit));
        if (bIndex >= 0) {
            beList.splice(bIndex, 1);
        }
        else {
            return false;
        }
    }
    return true;
}
