"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NUMBER = exports.TypeNumber = void 0;
exports.buildNumberConstructor = buildNumberConstructor;
const util_1 = require("../../util");
const common_1 = require("./common");
const function_1 = require("./function");
const object_1 = require("./object");
class TypeNumber {
    constructor() {
        this.type = "Number";
    }
    has(type) {
        return type === "Number";
    }
    paramType() {
        return null;
    }
    propertyType(name) {
        return getPrototypes()[name] || null;
    }
    iterateType() {
        return null;
    }
    returnType() {
        return null;
    }
    typeNames() {
        return ["Number"];
    }
    equals(o) {
        return o.type === "Number";
    }
}
exports.TypeNumber = TypeNumber;
exports.NUMBER = new TypeNumber();
function buildNumberConstructor() {
    const NUMBER_TYPES = (0, common_1.createObject)({
        MAX_VALUE: exports.NUMBER,
        MIN_VALUE: exports.NUMBER,
        NaN: exports.NUMBER,
        NEGATIVE_INFINITY: exports.NUMBER,
        POSITIVE_INFINITY: exports.NUMBER,
        EPSILON: exports.NUMBER,
        isFinite: function_1.RETURN_BOOLEAN,
        isInteger: function_1.RETURN_BOOLEAN,
        isNaN: function_1.RETURN_BOOLEAN,
        isSafeInteger: function_1.RETURN_BOOLEAN,
        MAX_SAFE_INTEGER: exports.NUMBER,
        MIN_SAFE_INTEGER: exports.NUMBER,
        parseFloat: function_1.RETURN_NUMBER,
        parseInt: function_1.RETURN_NUMBER,
        prototype: null,
    });
    return new function_1.TypeGlobalFunction(() => exports.NUMBER, NUMBER_TYPES);
}
const getPrototypes = (0, util_1.lazy)(() => (0, common_1.createObject)({
    ...(0, object_1.getObjectPrototypes)(),
    toString: function_1.RETURN_STRING,
    toFixed: function_1.RETURN_STRING,
    toExponential: function_1.RETURN_STRING,
    toPrecision: function_1.RETURN_STRING,
    valueOf: function_1.RETURN_NUMBER,
    toLocaleString: function_1.RETURN_STRING,
}));
