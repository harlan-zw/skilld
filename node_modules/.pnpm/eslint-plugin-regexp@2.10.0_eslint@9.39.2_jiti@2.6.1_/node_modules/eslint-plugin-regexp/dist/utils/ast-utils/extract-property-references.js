"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPropertyReferences = extractPropertyReferences;
exports.extractPropertyReferencesForPattern = extractPropertyReferencesForPattern;
const extract_expression_references_1 = require("./extract-expression-references");
const utils_1 = require("./utils");
function* extractPropertyReferences(node, context) {
    if (isShallowCopy(node)) {
        yield* iteratePropertyReferencesForShallowCopy(node, context);
        return;
    }
    for (const ref of (0, extract_expression_references_1.extractExpressionReferences)(node, context)) {
        if (ref.type === "member") {
            yield* iteratePropertyReferencesForMemberExpression(ref.memberExpression, context);
        }
        else if (ref.type === "destructuring") {
            yield* iteratePropertyReferencesForPattern(ref.pattern, context);
        }
        else if (ref.type === "iteration") {
            yield* iteratePropertyReferencesForForOf(ref.for, context);
        }
        else {
            if (ref.node !== node && isShallowCopy(ref.node)) {
                yield* iteratePropertyReferencesForShallowCopy(ref.node, context);
                return;
            }
            yield { type: "unknown", node: ref.node };
        }
    }
}
function* extractPropertyReferencesForPattern(node, context) {
    yield* iteratePropertyReferencesForPattern(node, context);
}
function isShallowCopy(node) {
    const parent = (0, utils_1.getParent)(node);
    if ((parent === null || parent === void 0 ? void 0 : parent.type) === "SpreadElement") {
        const spreadParent = (0, utils_1.getParent)(parent);
        if ((spreadParent === null || spreadParent === void 0 ? void 0 : spreadParent.type) === "ObjectExpression" ||
            (spreadParent === null || spreadParent === void 0 ? void 0 : spreadParent.type) === "ArrayExpression") {
            return true;
        }
    }
    return false;
}
function* iteratePropertyReferencesForMemberExpression(node, context) {
    const property = getProperty(node, context);
    if (property == null) {
        yield {
            type: "unknown",
            node,
            *extractPropertyReferences() {
                yield* extractPropertyReferences(node, context);
            },
        };
        return;
    }
    yield {
        type: "member",
        name: property,
        node,
        *extractPropertyReferences() {
            yield* extractPropertyReferences(node, context);
        },
    };
}
function* iteratePropertyReferencesForObjectPattern(node, context) {
    for (const prop of node.properties) {
        if (prop.type === "RestElement") {
            yield* iteratePropertyReferencesForPattern(prop.argument, context);
            continue;
        }
        const property = getProperty(prop, context);
        if (property == null) {
            yield {
                type: "unknown",
                node,
                *extractPropertyReferences() {
                    yield* iteratePropertyReferencesForPattern(prop.value, context);
                },
            };
            continue;
        }
        yield {
            type: "destructuring",
            name: property,
            node: prop,
            *extractPropertyReferences() {
                yield* iteratePropertyReferencesForPattern(prop.value, context);
            },
        };
    }
}
function* iteratePropertyReferencesForArrayPattern(node, context) {
    let index = 0;
    for (; index < node.elements.length; index++) {
        const element = node.elements[index];
        if (!element) {
            continue;
        }
        if (element.type === "RestElement") {
            for (const ref of iteratePropertyReferencesForPattern(element.argument, context)) {
                yield offsetRef(ref, index);
            }
            index++;
            break;
        }
        yield {
            type: "destructuring",
            name: String(index),
            node: element,
            *extractPropertyReferences() {
                yield* iteratePropertyReferencesForPattern(element, context);
            },
        };
    }
    for (; index < node.elements.length; index++) {
        const element = node.elements[index];
        if (!element) {
            continue;
        }
        yield {
            type: "unknown",
            node: element,
            *extractPropertyReferences() {
                yield* iteratePropertyReferencesForPattern(element, context);
            },
        };
    }
}
function* iteratePropertyReferencesForForOf(node, context) {
    yield {
        type: "iteration",
        node,
        *extractPropertyReferences() {
            let left = node.left;
            if (left.type === "VariableDeclaration") {
                left = left.declarations[0].id;
            }
            yield* iteratePropertyReferencesForPattern(left, context);
        },
    };
}
function* iteratePropertyReferencesForPattern(node, context) {
    let target = node;
    while (target.type === "AssignmentPattern") {
        target = target.left;
    }
    if (target.type === "Identifier") {
        for (const exprRef of (0, extract_expression_references_1.extractExpressionReferencesForVariable)(target, context)) {
            yield* extractPropertyReferences(exprRef.node, context);
        }
    }
    else if (target.type === "ObjectPattern") {
        yield* iteratePropertyReferencesForObjectPattern(target, context);
    }
    else if (target.type === "ArrayPattern") {
        yield* iteratePropertyReferencesForArrayPattern(target, context);
    }
    else {
        yield { type: "unknown", node: target };
    }
}
function* iteratePropertyReferencesForShallowCopy(node, context) {
    const spread = node.parent;
    const spreadParent = spread.parent;
    if (spreadParent.type === "ObjectExpression") {
        yield* extractPropertyReferences(spreadParent, context);
    }
    else if (spreadParent.type === "ArrayExpression") {
        const index = spreadParent.elements.indexOf(spread);
        if (index === 0) {
            yield* extractPropertyReferences(spreadParent, context);
            return;
        }
        const hasSpread = spreadParent.elements
            .slice(0, index)
            .some((e) => (e === null || e === void 0 ? void 0 : e.type) === "SpreadElement");
        if (hasSpread) {
            for (const ref of extractPropertyReferences(spreadParent, context)) {
                yield {
                    type: "unknown",
                    node: ref.node,
                    extractPropertyReferences: ref.extractPropertyReferences,
                };
            }
        }
        else {
            for (const ref of extractPropertyReferences(spreadParent, context)) {
                yield offsetRef(ref, -index);
            }
        }
    }
}
function getProperty(node, context) {
    if (node.type === "MemberExpression") {
        if (node.computed) {
            if (node.property.type === "Literal") {
                if (typeof node.property.value === "string" ||
                    typeof node.property.value === "number")
                    return String(node.property.value);
            }
            return (0, utils_1.getStringIfConstant)(context, node.property);
        }
        else if (node.property.type === "Identifier") {
            return node.property.name;
        }
    }
    if (node.type === "Property") {
        if (node.key.type === "Literal") {
            if (typeof node.key.value === "string" ||
                typeof node.key.value === "number")
                return String(node.key.value);
        }
        if (node.computed) {
            return (0, utils_1.getStringIfConstant)(context, node.key);
        }
        else if (node.key.type === "Identifier") {
            return node.key.name;
        }
    }
    return null;
}
function offsetRef(ref, offset) {
    if (ref.type === "member" || ref.type === "destructuring") {
        const num = Number(ref.name) + offset;
        if (!Number.isNaN(num)) {
            return { ...ref, name: String(num) };
        }
    }
    return ref;
}
