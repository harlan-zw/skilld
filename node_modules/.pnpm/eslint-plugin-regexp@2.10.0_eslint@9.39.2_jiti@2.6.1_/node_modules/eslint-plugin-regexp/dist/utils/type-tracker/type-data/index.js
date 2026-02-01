"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UN_OPERATOR_TYPES = exports.BI_OPERATOR_TYPES = exports.GLOBAL_OBJECT = exports.GLOBAL_FUNCTION = exports.GLOBAL_REGEXP = exports.GLOBAL_NUMBER = exports.GLOBAL = exports.TypeFunction = exports.UNKNOWN_SET = exports.UNKNOWN_MAP = exports.TypeMap = exports.TypeSet = exports.isTypeClass = exports.TypeUnionOrIntersection = exports.BIGINT = exports.REGEXP = exports.BOOLEAN = exports.NUMBER = exports.STRING = exports.UNKNOWN_FUNCTION = exports.UNKNOWN_OBJECT = exports.UNKNOWN_ARRAY = exports.TypeObject = exports.TypeArray = exports.hasType = void 0;
const array_1 = require("./array");
Object.defineProperty(exports, "TypeArray", { enumerable: true, get: function () { return array_1.TypeArray; } });
Object.defineProperty(exports, "UNKNOWN_ARRAY", { enumerable: true, get: function () { return array_1.UNKNOWN_ARRAY; } });
const bigint_1 = require("./bigint");
Object.defineProperty(exports, "BIGINT", { enumerable: true, get: function () { return bigint_1.BIGINT; } });
const boolean_1 = require("./boolean");
Object.defineProperty(exports, "BOOLEAN", { enumerable: true, get: function () { return boolean_1.BOOLEAN; } });
const common_1 = require("./common");
Object.defineProperty(exports, "isTypeClass", { enumerable: true, get: function () { return common_1.isTypeClass; } });
Object.defineProperty(exports, "hasType", { enumerable: true, get: function () { return common_1.hasType; } });
const function_1 = require("./function");
Object.defineProperty(exports, "UNKNOWN_FUNCTION", { enumerable: true, get: function () { return function_1.UNKNOWN_FUNCTION; } });
Object.defineProperty(exports, "TypeFunction", { enumerable: true, get: function () { return function_1.TypeFunction; } });
const global_1 = require("./global");
Object.defineProperty(exports, "GLOBAL", { enumerable: true, get: function () { return global_1.GLOBAL; } });
const map_1 = require("./map");
Object.defineProperty(exports, "TypeMap", { enumerable: true, get: function () { return map_1.TypeMap; } });
Object.defineProperty(exports, "UNKNOWN_MAP", { enumerable: true, get: function () { return map_1.UNKNOWN_MAP; } });
const number_1 = require("./number");
Object.defineProperty(exports, "NUMBER", { enumerable: true, get: function () { return number_1.NUMBER; } });
const object_1 = require("./object");
Object.defineProperty(exports, "TypeObject", { enumerable: true, get: function () { return object_1.TypeObject; } });
Object.defineProperty(exports, "UNKNOWN_OBJECT", { enumerable: true, get: function () { return object_1.UNKNOWN_OBJECT; } });
const regexp_1 = require("./regexp");
Object.defineProperty(exports, "REGEXP", { enumerable: true, get: function () { return regexp_1.REGEXP; } });
const set_1 = require("./set");
Object.defineProperty(exports, "TypeSet", { enumerable: true, get: function () { return set_1.TypeSet; } });
Object.defineProperty(exports, "UNKNOWN_SET", { enumerable: true, get: function () { return set_1.UNKNOWN_SET; } });
const string_1 = require("./string");
Object.defineProperty(exports, "STRING", { enumerable: true, get: function () { return string_1.STRING; } });
const union_or_intersection_1 = require("./union-or-intersection");
Object.defineProperty(exports, "TypeUnionOrIntersection", { enumerable: true, get: function () { return union_or_intersection_1.TypeUnionOrIntersection; } });
exports.GLOBAL_NUMBER = Symbol("Number");
exports.GLOBAL_REGEXP = Symbol("RegExp");
exports.GLOBAL_FUNCTION = Symbol("Function");
exports.GLOBAL_OBJECT = Symbol("Object");
function binaryNumOp(getTypes) {
    const [t1, t2] = getTypes();
    return union_or_intersection_1.TypeUnionOrIntersection.buildType(function* () {
        let unknown = true;
        if ((0, common_1.hasType)(t1, "Number") || (0, common_1.hasType)(t2, "Number")) {
            unknown = false;
            yield number_1.NUMBER;
        }
        if ((0, common_1.hasType)(t1, "BigInt") && (0, common_1.hasType)(t2, "BigInt")) {
            unknown = false;
            yield bigint_1.BIGINT;
        }
        if (unknown) {
            yield number_1.NUMBER;
            yield bigint_1.BIGINT;
        }
    });
}
function resultBool() {
    return boolean_1.BOOLEAN;
}
function binaryBitwise() {
    return number_1.NUMBER;
}
exports.BI_OPERATOR_TYPES = (0, common_1.createObject)({
    "==": resultBool,
    "!=": resultBool,
    "===": resultBool,
    "!==": resultBool,
    "<": resultBool,
    "<=": resultBool,
    ">": resultBool,
    ">=": resultBool,
    in: resultBool,
    instanceof: resultBool,
    "-": binaryNumOp,
    "*": binaryNumOp,
    "/": binaryNumOp,
    "%": binaryNumOp,
    "^": binaryNumOp,
    "**": binaryNumOp,
    "&": binaryNumOp,
    "|": binaryNumOp,
    "<<": binaryBitwise,
    ">>": binaryBitwise,
    ">>>": binaryBitwise,
    "+": (getTypes) => {
        const [t1, t2] = getTypes();
        return union_or_intersection_1.TypeUnionOrIntersection.buildType(function* () {
            let unknown = true;
            if ((0, common_1.hasType)(t1, "String") || (0, common_1.hasType)(t2, "String")) {
                unknown = false;
                yield string_1.STRING;
            }
            if ((0, common_1.hasType)(t1, "Number") && (0, common_1.hasType)(t2, "Number")) {
                unknown = false;
                yield number_1.NUMBER;
            }
            if ((0, common_1.hasType)(t1, "BigInt") && (0, common_1.hasType)(t2, "BigInt")) {
                unknown = false;
                yield bigint_1.BIGINT;
            }
            if (unknown) {
                yield string_1.STRING;
                yield number_1.NUMBER;
                yield bigint_1.BIGINT;
            }
        });
    },
});
function unaryNumOp(getType) {
    const t = getType();
    return union_or_intersection_1.TypeUnionOrIntersection.buildType(function* () {
        let unknown = true;
        if ((0, common_1.hasType)(t, "Number")) {
            unknown = false;
            yield number_1.NUMBER;
        }
        if ((0, common_1.hasType)(t, "BigInt")) {
            unknown = false;
            yield bigint_1.BIGINT;
        }
        if (unknown) {
            yield number_1.NUMBER;
            yield bigint_1.BIGINT;
        }
    });
}
exports.UN_OPERATOR_TYPES = (0, common_1.createObject)({
    "!": resultBool,
    delete: resultBool,
    "+": unaryNumOp,
    "-": unaryNumOp,
    "~": unaryNumOp,
    void: () => "undefined",
    typeof: () => string_1.STRING,
});
