"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixSimplifyQuantifier = fixSimplifyQuantifier;
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const regexp_ast_1 = require("./regexp-ast");
function fixSimplifyQuantifier(quantifier, result, { fixReplaceNode }) {
    const ancestor = (0, regexp_ast_analysis_1.getClosestAncestor)(quantifier, ...result.dependencies);
    let replacement;
    if (quantifier.min === 0) {
        replacement = "";
    }
    else if (quantifier.min === 1) {
        replacement = quantifier.element.raw;
    }
    else {
        replacement =
            quantifier.element.raw +
                (0, regexp_ast_1.quantToString)({
                    min: quantifier.min,
                    max: quantifier.min,
                    greedy: true,
                });
    }
    return [
        replacement,
        fixReplaceNode(ancestor, () => {
            return (ancestor.raw.slice(0, quantifier.start - ancestor.start) +
                replacement +
                ancestor.raw.slice(quantifier.end - ancestor.start));
        }),
    ];
}
