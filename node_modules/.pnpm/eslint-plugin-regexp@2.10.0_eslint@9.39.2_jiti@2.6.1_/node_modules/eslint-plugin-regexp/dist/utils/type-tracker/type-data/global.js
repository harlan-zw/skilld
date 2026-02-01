"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GLOBAL = exports.TypeGlobal = void 0;
const util_1 = require("../../util");
const array_1 = require("./array");
const bigint_1 = require("./bigint");
const boolean_1 = require("./boolean");
const common_1 = require("./common");
const function_1 = require("./function");
const map_1 = require("./map");
const number_1 = require("./number");
const object_1 = require("./object");
const regexp_1 = require("./regexp");
const set_1 = require("./set");
const string_1 = require("./string");
class TypeGlobal {
    constructor() {
        this.type = "Global";
    }
    has(_type) {
        return false;
    }
    paramType() {
        return null;
    }
    propertyType(name) {
        return getProperties()[name] || null;
    }
    iterateType() {
        return null;
    }
    returnType() {
        return null;
    }
    typeNames() {
        return ["Global"];
    }
    equals(o) {
        return o.type === "Global";
    }
}
exports.TypeGlobal = TypeGlobal;
exports.GLOBAL = new TypeGlobal();
const getProperties = (0, util_1.lazy)(() => (0, common_1.createObject)({
    String: (0, string_1.buildStringConstructor)(),
    Number: (0, number_1.buildNumberConstructor)(),
    Boolean: (0, boolean_1.buildBooleanConstructor)(),
    RegExp: (0, regexp_1.buildRegExpConstructor)(),
    BigInt: (0, bigint_1.buildBigIntConstructor)(),
    Array: (0, array_1.buildArrayConstructor)(),
    Object: (0, object_1.buildObjectConstructor)(),
    Function: (0, function_1.buildFunctionConstructor)(),
    Map: (0, map_1.buildMapConstructor)(),
    Set: (0, set_1.buildSetConstructor)(),
    isFinite: function_1.RETURN_BOOLEAN,
    isNaN: function_1.RETURN_BOOLEAN,
    parseFloat: function_1.RETURN_NUMBER,
    parseInt: function_1.RETURN_NUMBER,
    decodeURI: function_1.RETURN_STRING,
    decodeURIComponent: function_1.RETURN_STRING,
    encodeURI: function_1.RETURN_STRING,
    encodeURIComponent: function_1.RETURN_STRING,
    escape: function_1.RETURN_STRING,
    unescape: function_1.RETURN_STRING,
    globalThis: exports.GLOBAL,
    window: exports.GLOBAL,
    self: exports.GLOBAL,
    global: exports.GLOBAL,
    undefined: "undefined",
    Infinity: number_1.NUMBER,
    NaN: number_1.NUMBER,
}));
