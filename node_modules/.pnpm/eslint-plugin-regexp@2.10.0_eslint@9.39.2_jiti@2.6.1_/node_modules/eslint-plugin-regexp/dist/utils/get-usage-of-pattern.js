"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageOfPattern = void 0;
exports.getUsageOfPattern = getUsageOfPattern;
const ast_utils_1 = require("./ast-utils");
var UsageOfPattern;
(function (UsageOfPattern) {
    UsageOfPattern[UsageOfPattern["partial"] = 0] = "partial";
    UsageOfPattern[UsageOfPattern["whole"] = 1] = "whole";
    UsageOfPattern[UsageOfPattern["mixed"] = 2] = "mixed";
    UsageOfPattern[UsageOfPattern["unknown"] = 3] = "unknown";
})(UsageOfPattern || (exports.UsageOfPattern = UsageOfPattern = {}));
function getUsageOfPattern(node, context) {
    const usageSet = new Set();
    for (const usage of iterateUsageOfPattern(node, context)) {
        if (usage === UsageOfPattern.unknown) {
            return UsageOfPattern.unknown;
        }
        usageSet.add(usage);
    }
    if (usageSet.has(UsageOfPattern.partial)) {
        return usageSet.has(UsageOfPattern.whole)
            ? UsageOfPattern.mixed
            : UsageOfPattern.partial;
    }
    return usageSet.has(UsageOfPattern.whole)
        ? UsageOfPattern.whole
        : UsageOfPattern.unknown;
}
function* iterateUsageOfPattern(node, context) {
    for (const ref of (0, ast_utils_1.extractExpressionReferences)(node, context)) {
        if (ref.type === "member") {
            yield* iterateUsageOfPatternForMemberExpression(ref.memberExpression, context);
        }
        else if (ref.type === "destructuring") {
            if (ref.pattern.type === "ObjectPattern")
                yield* iterateUsageOfPatternForObjectPattern(ref.pattern, context);
        }
        else if (ref.type === "unused") {
        }
        else if (ref.type === "argument") {
            if (ref.callExpression.arguments[0] === ref.node &&
                ref.callExpression.callee.type === "MemberExpression") {
                const member = ref.callExpression.callee;
                const propName = !member.computed
                    ? member.property.name
                    : (0, ast_utils_1.getStringIfConstant)(context, member.property);
                if (propName === "match" ||
                    propName === "matchAll" ||
                    propName === "split" ||
                    propName === "replace" ||
                    propName === "replaceAll" ||
                    propName === "search") {
                    yield UsageOfPattern.whole;
                }
                else {
                    yield UsageOfPattern.unknown;
                }
            }
            else {
                yield UsageOfPattern.unknown;
            }
        }
        else {
            yield UsageOfPattern.unknown;
        }
    }
}
function* iterateUsageOfPatternForMemberExpression(node, context) {
    const propName = !node.computed
        ? node.property.name
        : (0, ast_utils_1.getStringIfConstant)(context, node.property);
    yield* iterateUsageOfPatternForPropName(propName);
}
function* iterateUsageOfPatternForPropName(propName) {
    const regexpPropName = propName;
    if (regexpPropName === "source") {
        yield UsageOfPattern.partial;
        return;
    }
    if (regexpPropName === "compile" ||
        regexpPropName === "dotAll" ||
        regexpPropName === "flags" ||
        regexpPropName === "global" ||
        regexpPropName === "ignoreCase" ||
        regexpPropName === "multiline" ||
        regexpPropName === "sticky" ||
        regexpPropName === "unicode") {
        return;
    }
    yield UsageOfPattern.whole;
}
function* iterateUsageOfPatternForObjectPattern(node, context) {
    for (const prop of node.properties) {
        if (prop.type === "RestElement") {
            continue;
        }
        let propName;
        if (!prop.computed) {
            propName =
                prop.key.type === "Identifier"
                    ? prop.key.name
                    : String(prop.key.value);
        }
        else {
            propName = (0, ast_utils_1.getStringIfConstant)(context, prop.key);
        }
        yield* iterateUsageOfPatternForPropName(propName);
    }
}
