"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexpp_1 = require("@eslint-community/regexpp");
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
const utils_1 = require("../utils");
function isNegatableCharacterClassElement(node) {
    return (node.type === "CharacterClass" ||
        node.type === "ExpressionCharacterClass" ||
        (node.type === "CharacterSet" &&
            (node.kind !== "property" || !node.strings)));
}
function isNegate(node) {
    return isNegatableCharacterClassElement(node) && node.negate;
}
function getRawTextToNot(negateNode) {
    const raw = negateNode.raw;
    if (negateNode.type === "CharacterClass" ||
        negateNode.type === "ExpressionCharacterClass") {
        return `${raw[0]}${raw.slice(2)}`;
    }
    const escapeChar = negateNode.raw[1].toLowerCase();
    return `${raw[0]}${escapeChar}${raw.slice(2)}`;
}
function collectIntersectionOperands(expression) {
    const operands = [];
    let operand = expression;
    while (operand.type === "ClassIntersection") {
        operands.unshift(operand.right);
        operand = operand.left;
    }
    operands.unshift(operand);
    return operands;
}
function getParsedElement(pattern, flags) {
    try {
        const ast = new regexpp_1.RegExpParser().parsePattern(pattern, undefined, undefined, {
            unicode: flags.unicode,
            unicodeSets: flags.unicodeSets,
        });
        if (ast.alternatives.length === 1)
            if (ast.alternatives[0].elements.length === 1) {
                const element = ast.alternatives[0].elements[0];
                if (element.type !== "Assertion" &&
                    element.type !== "Quantifier" &&
                    element.type !== "CapturingGroup" &&
                    element.type !== "Group" &&
                    element.type !== "Backreference")
                    return element;
            }
    }
    catch (_a) {
    }
    return null;
}
exports.default = (0, utils_1.createRule)("simplify-set-operations", {
    meta: {
        docs: {
            description: "require simplify set operations",
            category: "Best Practices",
            recommended: true,
        },
        schema: [],
        messages: {
            toNegationOfDisjunction: "This {{target}} can be converted to the negation of a disjunction using De Morgan's laws.",
            toNegationOfConjunction: "This character class can be converted to the negation of a conjunction using De Morgan's laws.",
            toSubtraction: "This expression can be converted to the subtraction.",
            toIntersection: "This expression can be converted to the intersection.",
        },
        fixable: "code",
        type: "suggestion",
    },
    create(context) {
        function createVisitor(regexpContext) {
            const { node, flags, getRegexpLocation, fixReplaceNode } = regexpContext;
            if (!flags.unicodeSets) {
                return {};
            }
            return {
                onCharacterClassEnter(ccNode) {
                    toNegationOfConjunction(ccNode);
                },
                onExpressionCharacterClassEnter(eccNode) {
                    if (toNegationOfDisjunction(eccNode)) {
                        return;
                    }
                    if (toSubtraction(eccNode)) {
                        return;
                    }
                    verifyExpressions(eccNode);
                },
            };
            function reportWhenFixedIsCompatible({ reportNode, targetNode, messageId, data, fix, }) {
                const us = (0, regexp_ast_analysis_1.toUnicodeSet)(targetNode, flags);
                const fixedText = fix();
                const convertedElement = getParsedElement(fixedText, flags);
                if (!convertedElement) {
                    return false;
                }
                const convertedUs = (0, regexp_ast_analysis_1.toUnicodeSet)(convertedElement, flags);
                if (!us.equals(convertedUs)) {
                    return false;
                }
                context.report({
                    node,
                    loc: getRegexpLocation(reportNode),
                    messageId,
                    data: data || {},
                    fix: fixReplaceNode(targetNode, fixedText),
                });
                return true;
            }
            function verifyExpressions(eccNode) {
                let operand = eccNode.expression;
                let right = null;
                while (operand.type === "ClassIntersection" ||
                    operand.type === "ClassSubtraction") {
                    toIntersection(operand, right, eccNode);
                    right = operand.right;
                    operand = operand.left;
                }
            }
            function toNegationOfDisjunction(eccNode) {
                const expression = eccNode.expression;
                if (expression.type !== "ClassIntersection") {
                    return false;
                }
                const operands = collectIntersectionOperands(expression);
                const negateOperands = [];
                const others = [];
                for (const e of operands) {
                    if (isNegate(e)) {
                        negateOperands.push(e);
                    }
                    else {
                        others.push(e);
                    }
                }
                const fixedOperands = negateOperands
                    .map((negateOperand) => getRawTextToNot(negateOperand))
                    .join("");
                if (negateOperands.length === operands.length) {
                    return reportWhenFixedIsCompatible({
                        reportNode: eccNode,
                        targetNode: eccNode,
                        messageId: "toNegationOfDisjunction",
                        data: {
                            target: "character class",
                        },
                        fix: () => `[${eccNode.negate ? "" : "^"}${fixedOperands}]`,
                    });
                }
                if (negateOperands.length < 2) {
                    return null;
                }
                return reportWhenFixedIsCompatible({
                    reportNode: negateOperands[negateOperands.length - 1]
                        .parent,
                    targetNode: eccNode,
                    messageId: "toNegationOfDisjunction",
                    data: {
                        target: "expression",
                    },
                    fix: () => {
                        const operandTestList = [
                            `[^${fixedOperands}]`,
                            ...others.map((e) => e.raw),
                        ];
                        return `[${eccNode.negate ? "^" : ""}${operandTestList.join("&&")}]`;
                    },
                });
            }
            function toNegationOfConjunction(ccNode) {
                if (ccNode.elements.length <= 1) {
                    return false;
                }
                const elements = ccNode.elements;
                const negateElements = elements.filter(isNegate);
                if (negateElements.length !== elements.length) {
                    return false;
                }
                return reportWhenFixedIsCompatible({
                    reportNode: ccNode,
                    targetNode: ccNode,
                    messageId: "toNegationOfConjunction",
                    fix: () => {
                        const fixedElements = negateElements.map((negateElement) => getRawTextToNot(negateElement));
                        return `[${ccNode.negate ? "" : "^"}${fixedElements.join("&&")}]`;
                    },
                });
            }
            function toSubtraction(eccNode) {
                const expression = eccNode.expression;
                if (expression.type !== "ClassIntersection") {
                    return false;
                }
                const operands = collectIntersectionOperands(expression);
                const negateOperand = operands.find(isNegate);
                if (!negateOperand) {
                    return false;
                }
                return reportWhenFixedIsCompatible({
                    reportNode: expression,
                    targetNode: eccNode,
                    messageId: "toSubtraction",
                    fix() {
                        const others = operands.filter((e) => e !== negateOperand);
                        let fixedLeftText = others.map((e) => e.raw).join("&&");
                        if (others.length >= 2) {
                            fixedLeftText = `[${fixedLeftText}]`;
                        }
                        const fixedRightText = getRawTextToNot(negateOperand);
                        return `[${eccNode.negate ? "^" : ""}${`${fixedLeftText}--${fixedRightText}`}]`;
                    },
                });
            }
            function toIntersection(expression, expressionRight, eccNode) {
                if (expression.type !== "ClassSubtraction") {
                    return false;
                }
                const { left, right } = expression;
                if (!isNegate(right)) {
                    return false;
                }
                return reportWhenFixedIsCompatible({
                    reportNode: expression,
                    targetNode: eccNode,
                    messageId: "toIntersection",
                    fix() {
                        let fixedLeftText = left.raw;
                        if (left.type === "ClassSubtraction") {
                            fixedLeftText = `[${fixedLeftText}]`;
                        }
                        const fixedRightText = getRawTextToNot(right);
                        let fixedText = `${fixedLeftText}&&${fixedRightText}`;
                        if (expressionRight) {
                            fixedText = `[${fixedText}]`;
                        }
                        const targetRaw = eccNode.raw;
                        return `${targetRaw.slice(0, expression.start - eccNode.start)}${fixedText}${targetRaw.slice(expression.end - eccNode.start)}`;
                    },
                });
            }
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
