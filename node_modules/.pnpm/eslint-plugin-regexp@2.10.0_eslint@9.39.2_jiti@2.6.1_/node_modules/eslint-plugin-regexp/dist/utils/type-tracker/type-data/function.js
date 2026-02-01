"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RETURN_BIGINT = exports.RETURN_REGEXP = exports.RETURN_UNKNOWN_OBJECT = exports.RETURN_STRING_ARRAY = exports.RETURN_UNKNOWN_ARRAY = exports.RETURN_BOOLEAN = exports.RETURN_NUMBER = exports.RETURN_STRING = exports.RETURN_VOID = exports.UNKNOWN_FUNCTION = exports.TypeGlobalFunction = exports.TypeFunction = void 0;
exports.buildFunctionConstructor = buildFunctionConstructor;
const util_1 = require("../../util");
const array_1 = require("./array");
const bigint_1 = require("./bigint");
const boolean_1 = require("./boolean");
const common_1 = require("./common");
const number_1 = require("./number");
const object_1 = require("./object");
const regexp_1 = require("./regexp");
const string_1 = require("./string");
class TypeFunction {
    constructor(fn) {
        this.type = "Function";
        this.fn = fn;
    }
    has(type) {
        return type === "Function";
    }
    returnType(thisType, argTypes, meta) {
        return this.fn(thisType, argTypes, meta);
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
    typeNames() {
        return ["Function"];
    }
    equals(_o) {
        return false;
    }
}
exports.TypeFunction = TypeFunction;
class TypeGlobalFunction extends TypeFunction {
    constructor(fn, props) {
        super(fn);
        this.props = props;
    }
    propertyType(name) {
        return this.props[name] || super.propertyType(name);
    }
}
exports.TypeGlobalFunction = TypeGlobalFunction;
exports.UNKNOWN_FUNCTION = new TypeFunction(function returnUnknown() {
    return null;
});
function buildFunctionConstructor() {
    const FUNCTION_TYPES = (0, common_1.createObject)({
        prototype: null,
    });
    return new TypeGlobalFunction(function returnFunction() {
        return exports.UNKNOWN_FUNCTION;
    }, FUNCTION_TYPES);
}
exports.RETURN_VOID = new TypeFunction(function retVoid() {
    return "undefined";
});
exports.RETURN_STRING = new TypeFunction(function returnString() {
    return string_1.STRING;
});
exports.RETURN_NUMBER = new TypeFunction(function returnNumber() {
    return number_1.NUMBER;
});
exports.RETURN_BOOLEAN = new TypeFunction(function returnBoolean() {
    return boolean_1.BOOLEAN;
});
exports.RETURN_UNKNOWN_ARRAY = new TypeFunction(function returnUnknownArray() {
    return array_1.UNKNOWN_ARRAY;
});
exports.RETURN_STRING_ARRAY = new TypeFunction(function returnStringArray() {
    return array_1.STRING_ARRAY;
});
exports.RETURN_UNKNOWN_OBJECT = new TypeFunction(function returnObject() {
    return object_1.UNKNOWN_OBJECT;
});
exports.RETURN_REGEXP = new TypeFunction(function returnRegExp() {
    return regexp_1.REGEXP;
});
exports.RETURN_BIGINT = new TypeFunction(function returnBigInt() {
    return bigint_1.BIGINT;
});
const RETURN_SELF = new TypeFunction(function returnSelf(selfType) {
    var _a;
    return (_a = selfType === null || selfType === void 0 ? void 0 : selfType()) !== null && _a !== void 0 ? _a : null;
});
const getPrototypes = (0, util_1.lazy)(() => (0, common_1.createObject)({
    ...(0, object_1.getObjectPrototypes)(),
    toString: exports.RETURN_STRING,
    bind: RETURN_SELF,
    length: number_1.NUMBER,
    name: string_1.STRING,
    apply: exports.UNKNOWN_FUNCTION,
    call: exports.UNKNOWN_FUNCTION,
    arguments: null,
    caller: exports.UNKNOWN_FUNCTION,
    prototype: null,
    [Symbol.hasInstance]: null,
}));
