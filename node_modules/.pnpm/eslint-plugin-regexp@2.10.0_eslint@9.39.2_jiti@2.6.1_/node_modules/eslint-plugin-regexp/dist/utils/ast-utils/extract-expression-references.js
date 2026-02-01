"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractExpressionReferences = extractExpressionReferences;
exports.extractExpressionReferencesForVariable = extractExpressionReferencesForVariable;
const utils_1 = require("./utils");
function* extractExpressionReferences(node, context) {
    yield* iterateReferencesForExpression(node, context, {
        variables: new Set(),
        functions: new Map(),
    });
}
function* extractExpressionReferencesForVariable(node, context) {
    yield* iterateReferencesForVariable(node, context, {
        variables: new Set(),
        functions: new Map(),
    });
}
function* iterateReferencesForExpression(expression, context, alreadyChecked) {
    let node = expression;
    let parent = (0, utils_1.getParent)(node);
    while ((parent === null || parent === void 0 ? void 0 : parent.type) === "ChainExpression" ||
        (parent === null || parent === void 0 ? void 0 : parent.type) === "TSNonNullExpression" ||
        (parent === null || parent === void 0 ? void 0 : parent.type) === "TSAsExpression") {
        node = parent;
        parent = (0, utils_1.getParent)(node);
    }
    if (!parent || parent.type === "ExpressionStatement") {
        yield { node, type: "unused" };
        return;
    }
    if (parent.type === "MemberExpression") {
        if (parent.object === node) {
            yield { node, type: "member", memberExpression: parent };
        }
        else {
            yield { node, type: "unknown" };
        }
    }
    else if (parent.type === "AssignmentExpression") {
        if (parent.right === node && parent.operator === "=") {
            yield* iterateReferencesForESPattern(node, parent.left, context, alreadyChecked);
        }
        else {
            yield { node, type: "unknown" };
        }
    }
    else if (parent.type === "VariableDeclarator") {
        if (parent.init === node) {
            const pp = (0, utils_1.getParent)((0, utils_1.getParent)(parent));
            if ((pp === null || pp === void 0 ? void 0 : pp.type) === "ExportNamedDeclaration") {
                yield { node, type: "exported" };
            }
            yield* iterateReferencesForESPattern(node, parent.id, context, alreadyChecked);
        }
        else {
            yield { node, type: "unknown" };
        }
    }
    else if (parent.type === "CallExpression") {
        const argIndex = parent.arguments.indexOf(node);
        if (argIndex > -1) {
            if (parent.callee.type === "Identifier") {
                const fn = (0, utils_1.findFunction)(context, parent.callee);
                if (fn) {
                    yield* iterateReferencesForFunctionArgument(node, fn, argIndex, context, alreadyChecked);
                    return;
                }
            }
            yield { node, type: "argument", callExpression: parent };
        }
        else {
            yield { node, type: "call" };
        }
    }
    else if (parent.type === "ExportSpecifier" ||
        parent.type === "ExportDefaultDeclaration") {
        yield { node, type: "exported" };
    }
    else if (parent.type === "ForOfStatement") {
        if (parent.right === node) {
            yield { node, type: "iteration", for: parent };
        }
        else {
            yield { node, type: "unknown" };
        }
    }
    else if (parent.type === "IfStatement" ||
        parent.type === "ConditionalExpression" ||
        parent.type === "LogicalExpression" ||
        parent.type === "UnaryExpression") {
        if (isUsedInTest(parent, node)) {
        }
        else {
            yield { node, type: "unknown" };
        }
    }
    else {
        yield { node, type: "unknown" };
    }
}
function isUsedInTest(parent, node) {
    if (parent.type === "IfStatement") {
        return parent.test === node;
    }
    if (parent.type === "ConditionalExpression") {
        return parent.test === node;
    }
    if (parent.type === "LogicalExpression") {
        return parent.operator === "&&" && parent.left === node;
    }
    if (parent.type === "UnaryExpression") {
        return parent.operator === "!" && parent.argument === node;
    }
    return false;
}
function* iterateReferencesForESPattern(expression, pattern, context, alreadyChecked) {
    let target = pattern;
    while (target.type === "AssignmentPattern") {
        target = target.left;
    }
    if (target.type === "Identifier") {
        yield* iterateReferencesForVariable(target, context, alreadyChecked);
    }
    else if (target.type === "ObjectPattern" ||
        target.type === "ArrayPattern") {
        yield { node: expression, type: "destructuring", pattern: target };
    }
    else {
        yield { node: expression, type: "unknown" };
    }
}
function* iterateReferencesForVariable(identifier, context, alreadyChecked) {
    const variable = (0, utils_1.findVariable)(context, identifier);
    if (!variable) {
        yield { node: identifier, type: "unknown" };
        return;
    }
    if (alreadyChecked.variables.has(variable)) {
        return;
    }
    alreadyChecked.variables.add(variable);
    if (variable.eslintUsed) {
        yield { node: identifier, type: "exported" };
    }
    const readReferences = variable.references.filter((ref) => ref.isRead());
    if (!readReferences.length) {
        yield { node: identifier, type: "unused" };
        return;
    }
    for (const reference of readReferences) {
        yield* iterateReferencesForExpression(reference.identifier, context, alreadyChecked);
    }
}
function* iterateReferencesForFunctionArgument(expression, fn, argIndex, context, alreadyChecked) {
    let alreadyIndexes = alreadyChecked.functions.get(fn);
    if (!alreadyIndexes) {
        alreadyIndexes = new Set();
        alreadyChecked.functions.set(fn, alreadyIndexes);
    }
    if (alreadyIndexes.has(argIndex)) {
        return;
    }
    alreadyIndexes.add(argIndex);
    const params = fn.params.slice(0, argIndex + 1);
    const argNode = params[argIndex];
    if (!argNode || params.some((param) => (param === null || param === void 0 ? void 0 : param.type) === "RestElement")) {
        yield { node: expression, type: "unknown" };
        return;
    }
    yield* iterateReferencesForESPattern(expression, argNode, context, alreadyChecked);
}
