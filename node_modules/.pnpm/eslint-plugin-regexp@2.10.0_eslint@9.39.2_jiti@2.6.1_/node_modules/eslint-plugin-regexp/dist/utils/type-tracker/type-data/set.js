"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNKNOWN_SET = exports.TypeSet = void 0;
exports.buildSetConstructor = buildSetConstructor;
const util_1 = require("../../util");
const array_1 = require("./array");
const common_1 = require("./common");
const function_1 = require("./function");
const iterable_1 = require("./iterable");
const number_1 = require("./number");
const object_1 = require("./object");
const string_1 = require("./string");
const _1 = require(".");
const getPrototypes = (0, util_1.lazy)(() => {
    const RETURN_SELF = new function_1.TypeFunction(function returnSelf(selfType) {
        var _a;
        return (_a = selfType === null || selfType === void 0 ? void 0 : selfType()) !== null && _a !== void 0 ? _a : null;
    });
    const RETURN_ENTRIES = new function_1.TypeFunction(function (selfType) {
        return new iterable_1.TypeIterable(() => {
            return new array_1.TypeArray(function* () {
                const type = selfType === null || selfType === void 0 ? void 0 : selfType();
                if ((0, _1.isTypeClass)(type)) {
                    yield type.iterateType();
                    yield type.iterateType();
                }
                else {
                    yield null;
                    yield null;
                }
            }, true);
        });
    });
    const RETURN_KEYS = new function_1.TypeFunction(function (selfType) {
        return new iterable_1.TypeIterable(() => {
            const type = selfType === null || selfType === void 0 ? void 0 : selfType();
            if ((0, _1.isTypeClass)(type)) {
                return type.iterateType();
            }
            return null;
        });
    });
    const RETURN_VALUES = new function_1.TypeFunction(function (selfType) {
        return new iterable_1.TypeIterable(() => {
            const type = selfType === null || selfType === void 0 ? void 0 : selfType();
            if ((0, _1.isTypeClass)(type)) {
                return type.iterateType();
            }
            return null;
        });
    });
    return (0, common_1.createObject)({
        ...(0, object_1.getObjectPrototypes)(),
        clear: function_1.RETURN_VOID,
        delete: function_1.RETURN_BOOLEAN,
        forEach: function_1.RETURN_VOID,
        has: function_1.RETURN_BOOLEAN,
        add: RETURN_SELF,
        size: number_1.NUMBER,
        entries: RETURN_ENTRIES,
        keys: RETURN_KEYS,
        values: RETURN_VALUES,
        [Symbol.iterator]: null,
        [Symbol.toStringTag]: string_1.STRING,
    });
});
class TypeSet {
    constructor(param0) {
        this.type = "Set";
        this.param0 = param0;
    }
    has(type) {
        return type === "Set";
    }
    paramType(index) {
        if (index === 0) {
            return this.param0();
        }
        return null;
    }
    propertyType(name) {
        return getPrototypes()[name] || null;
    }
    iterateType() {
        return this.paramType(0);
    }
    returnType() {
        return null;
    }
    typeNames() {
        const param0 = (0, common_1.getTypeName)(this.iterateType());
        return [`Set${param0 != null ? `<${param0}>` : ""}`];
    }
    equals(o) {
        if (o.type !== "Set") {
            return false;
        }
        return (0, common_1.isEquals)(this.iterateType(), o.iterateType());
    }
}
exports.TypeSet = TypeSet;
exports.UNKNOWN_SET = new TypeSet(() => null);
function buildSetConstructor() {
    const SET_TYPES = (0, common_1.createObject)({
        prototype: null,
        [Symbol.species]: null,
    });
    return new function_1.TypeGlobalFunction(setConstructor, SET_TYPES);
}
function setConstructor(_thisType, argTypes, meta) {
    var _a;
    if (!(meta === null || meta === void 0 ? void 0 : meta.isConstructor)) {
        return null;
    }
    const arg = (_a = argTypes[0]) === null || _a === void 0 ? void 0 : _a.call(argTypes);
    if ((0, _1.isTypeClass)(arg)) {
        return new TypeSet(() => arg.iterateType());
    }
    return exports.UNKNOWN_SET;
}
