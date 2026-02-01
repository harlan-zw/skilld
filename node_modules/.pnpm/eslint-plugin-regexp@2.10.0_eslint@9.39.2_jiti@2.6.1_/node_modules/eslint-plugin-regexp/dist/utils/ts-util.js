"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypeScriptTools = getTypeScriptTools;
exports.getTypeScript = getTypeScript;
exports.isArrayLikeObject = isArrayLikeObject;
exports.isClassOrInterface = isClassOrInterface;
exports.isObject = isObject;
exports.isReferenceObject = isReferenceObject;
exports.isUnionOrIntersection = isUnionOrIntersection;
exports.isTypeParameter = isTypeParameter;
exports.isAny = isAny;
exports.isUnknown = isUnknown;
exports.isStringLine = isStringLine;
exports.isNumberLike = isNumberLike;
exports.isBooleanLike = isBooleanLike;
exports.isBigIntLike = isBigIntLike;
exports.isNull = isNull;
function getTypeScriptTools(context) {
    const sourceCode = context.sourceCode;
    const ts = getTypeScript();
    const tsNodeMap = sourceCode.parserServices.esTreeNodeToTSNodeMap;
    const usedTS = Boolean(ts && tsNodeMap);
    const hasFullTypeInformation = usedTS && sourceCode.parserServices.hasFullTypeInformation !== false;
    const checker = (hasFullTypeInformation &&
        sourceCode.parserServices.program &&
        sourceCode.parserServices.program.getTypeChecker()) ||
        null;
    return {
        tsNodeMap: tsNodeMap || new Map(),
        checker,
        usedTS,
        hasFullTypeInformation,
    };
}
let cacheTypeScript;
function getTypeScript() {
    try {
        return (cacheTypeScript !== null && cacheTypeScript !== void 0 ? cacheTypeScript : (cacheTypeScript = require("typescript")));
    }
    catch (e) {
        if (e.code === "MODULE_NOT_FOUND") {
            return undefined;
        }
        if (typeof require === "undefined" ||
            typeof require.define === "function") {
            return undefined;
        }
        if (typeof e.message === "string" &&
            e.message.includes("Dynamic require") &&
            e.message.includes("is not supported")) {
            return undefined;
        }
        throw e;
    }
}
function isArrayLikeObject(tsType) {
    const ts = getTypeScript();
    return (isObject(tsType) &&
        (tsType.objectFlags &
            (ts.ObjectFlags.ArrayLiteral |
                ts.ObjectFlags.EvolvingArray |
                ts.ObjectFlags.Tuple)) !==
            0);
}
function isClassOrInterface(tsType) {
    const ts = getTypeScript();
    return (isObject(tsType) &&
        (tsType.objectFlags & ts.ObjectFlags.ClassOrInterface) !== 0);
}
function isObject(tsType) {
    const ts = getTypeScript();
    return (tsType.flags & ts.TypeFlags.Object) !== 0;
}
function isReferenceObject(tsType) {
    const ts = getTypeScript();
    return (isObject(tsType) &&
        (tsType.objectFlags & ts.ObjectFlags.Reference) !== 0);
}
function isUnionOrIntersection(tsType) {
    const ts = getTypeScript();
    return (tsType.flags & ts.TypeFlags.UnionOrIntersection) !== 0;
}
function isTypeParameter(tsType) {
    const ts = getTypeScript();
    return (tsType.flags & ts.TypeFlags.TypeParameter) !== 0;
}
function isAny(tsType) {
    const ts = getTypeScript();
    return (tsType.flags & ts.TypeFlags.Any) !== 0;
}
function isUnknown(tsType) {
    const ts = getTypeScript();
    return (tsType.flags & ts.TypeFlags.Unknown) !== 0;
}
function isStringLine(tsType) {
    const ts = getTypeScript();
    return (tsType.flags & ts.TypeFlags.StringLike) !== 0;
}
function isNumberLike(tsType) {
    const ts = getTypeScript();
    return (tsType.flags & ts.TypeFlags.NumberLike) !== 0;
}
function isBooleanLike(tsType) {
    const ts = getTypeScript();
    return (tsType.flags & ts.TypeFlags.BooleanLike) !== 0;
}
function isBigIntLike(tsType) {
    const ts = getTypeScript();
    return (tsType.flags & ts.TypeFlags.BigIntLike) !== 0;
}
function isNull(tsType) {
    const ts = getTypeScript();
    return (tsType.flags & ts.TypeFlags.Null) !== 0;
}
