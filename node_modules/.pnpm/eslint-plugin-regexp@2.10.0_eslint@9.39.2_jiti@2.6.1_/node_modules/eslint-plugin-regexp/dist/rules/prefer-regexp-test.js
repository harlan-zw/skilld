"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const ast_utils_1 = require("../utils/ast-utils");
const type_tracker_1 = require("../utils/type-tracker");
const eslint_utils_1 = require("@eslint-community/eslint-utils");
exports.default = (0, utils_1.createRule)("prefer-regexp-test", {
    meta: {
        docs: {
            description: "enforce that `RegExp#test` is used instead of `String#match` and `RegExp#exec`",
            category: "Best Practices",
            recommended: false,
        },
        fixable: "code",
        schema: [],
        messages: {
            disallow: "Use the `RegExp#test()` method instead of `{{target}}`, if you need a boolean.",
        },
        type: "suggestion",
    },
    create(context) {
        const sourceCode = context.sourceCode;
        const typeTracer = (0, type_tracker_1.createTypeTracker)(context);
        return {
            CallExpression(node) {
                if (!(0, ast_utils_1.isKnownMethodCall)(node, { match: 1, exec: 1 })) {
                    return;
                }
                if (!isUseBoolean(node)) {
                    return;
                }
                if (node.callee.property.name === "match") {
                    if (!typeTracer.isString(node.callee.object)) {
                        return;
                    }
                    const arg = node.arguments[0];
                    const evaluated = (0, ast_utils_1.getStaticValue)(context, arg);
                    let argIsRegExp = true;
                    if (evaluated && evaluated.value instanceof RegExp) {
                        if (evaluated.value.flags.includes("g")) {
                            return;
                        }
                    }
                    else if (!typeTracer.isRegExp(arg)) {
                        argIsRegExp = false;
                    }
                    const memberExpr = node.callee;
                    context.report({
                        node,
                        messageId: "disallow",
                        data: { target: "String#match" },
                        fix(fixer) {
                            if (!argIsRegExp) {
                                return null;
                            }
                            if (node.arguments.length !== 1 ||
                                (0, eslint_utils_1.hasSideEffect)(memberExpr, sourceCode) ||
                                (0, eslint_utils_1.hasSideEffect)(node.arguments[0], sourceCode)) {
                                return null;
                            }
                            const openParen = sourceCode.getTokenAfter(node.callee, eslint_utils_1.isOpeningParenToken);
                            const closeParen = sourceCode.getLastToken(node);
                            const stringRange = memberExpr.object.range;
                            const regexpRange = [
                                openParen.range[1],
                                closeParen.range[0],
                            ];
                            const stringText = sourceCode.text.slice(...stringRange);
                            const regexpText = sourceCode.text.slice(...regexpRange);
                            const convertedComparison = node.parent.type === "BinaryExpression" &&
                                isComparisonToNull(node.parent)
                                ? convertComparison(node.parent, sourceCode)(fixer)
                                : [];
                            return [
                                fixer.replaceTextRange(stringRange, regexpText),
                                fixer.replaceText(memberExpr.property, "test"),
                                fixer.replaceTextRange(regexpRange, stringText),
                                ...convertedComparison,
                            ];
                        },
                    });
                }
                if (node.callee.property.name === "exec") {
                    if (!typeTracer.isRegExp(node.callee.object)) {
                        return;
                    }
                    const execNode = node.callee.property;
                    context.report({
                        node: execNode,
                        messageId: "disallow",
                        data: { target: "RegExp#exec" },
                        *fix(fixer) {
                            yield fixer.replaceText(execNode, "test");
                            if (node.parent.type === "BinaryExpression" &&
                                isComparisonToNull(node.parent)) {
                                yield* convertComparison(node.parent, sourceCode)(fixer);
                            }
                        },
                    });
                }
            },
        };
    },
});
function isUseBoolean(node) {
    const parent = (0, ast_utils_1.getParent)(node);
    if (!parent) {
        return false;
    }
    if (parent.type === "UnaryExpression") {
        return parent.operator === "!";
    }
    if (parent.type === "CallExpression") {
        return (parent.callee.type === "Identifier" &&
            parent.callee.name === "Boolean" &&
            parent.arguments[0] === node);
    }
    if (parent.type === "IfStatement" ||
        parent.type === "ConditionalExpression" ||
        parent.type === "WhileStatement" ||
        parent.type === "DoWhileStatement" ||
        parent.type === "ForStatement") {
        return parent.test === node;
    }
    if (parent.type === "BinaryExpression") {
        return isComparisonToNull(parent);
    }
    if (parent.type === "LogicalExpression") {
        if (parent.operator === "&&" || parent.operator === "||") {
            return isUseBoolean(parent);
        }
    }
    return false;
}
function isComparisonToNull(binary) {
    return ((binary.operator === "===" || binary.operator === "!==") &&
        binary.right.type === "Literal" &&
        binary.right.value === null);
}
function convertComparison(comparison, sourceCode) {
    return function removeComparisonFixer(fixer) {
        const operator = sourceCode.getTokenBefore(comparison.right, ({ value }) => value === comparison.operator);
        const beforeOperator = sourceCode.getTokenBefore(operator, {
            includeComments: true,
        });
        return [
            fixer.removeRange([beforeOperator.range[1], comparison.range[1]]),
            ...(comparison.operator === "==="
                ? [fixer.insertTextBefore(comparison.left, "!")]
                : []),
        ];
    };
}
