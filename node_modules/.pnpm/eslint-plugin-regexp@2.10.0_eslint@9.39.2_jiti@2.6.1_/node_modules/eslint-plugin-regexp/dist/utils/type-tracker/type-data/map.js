"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNKNOWN_MAP = exports.TypeMap = void 0;
exports.buildMapConstructor = buildMapConstructor;
const util_1 = require("../../util");
const array_1 = require("./array");
const common_1 = require("./common");
const function_1 = require("./function");
const iterable_1 = require("./iterable");
const number_1 = require("./number");
const object_1 = require("./object");
const string_1 = require("./string");
const getPrototypes = (0, util_1.lazy)(() => {
    const RETURN_MAP_VALUE = new function_1.TypeFunction(function returnMapValue(selfType) {
        const type = selfType === null || selfType === void 0 ? void 0 : selfType();
        if (!(0, common_1.isTypeClass)(type)) {
            return null;
        }
        return type.paramType(1);
    });
    const RETURN_SELF = new function_1.TypeFunction(function returnSelf(selfType) {
        var _a;
        return (_a = selfType === null || selfType === void 0 ? void 0 : selfType()) !== null && _a !== void 0 ? _a : null;
    });
    const RETURN_ENTRIES = new function_1.TypeFunction(function (selfType) {
        return new iterable_1.TypeIterable(() => {
            return new array_1.TypeArray(function* () {
                const type = selfType === null || selfType === void 0 ? void 0 : selfType();
                if ((0, common_1.isTypeClass)(type)) {
                    yield type.paramType(0);
                    yield type.paramType(1);
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
            if ((0, common_1.isTypeClass)(type)) {
                return type.paramType(0);
            }
            return null;
        });
    });
    const RETURN_VALUES = new function_1.TypeFunction(function (selfType) {
        return new iterable_1.TypeIterable(() => {
            const type = selfType === null || selfType === void 0 ? void 0 : selfType();
            if ((0, common_1.isTypeClass)(type)) {
                return type.paramType(1);
            }
            return null;
        });
    });
    return (0, common_1.createObject)({
        ...(0, object_1.getObjectPrototypes)(),
        clear: function_1.RETURN_VOID,
        delete: function_1.RETURN_BOOLEAN,
        forEach: function_1.RETURN_VOID,
        get: RETURN_MAP_VALUE,
        has: function_1.RETURN_BOOLEAN,
        set: RETURN_SELF,
        size: number_1.NUMBER,
        entries: RETURN_ENTRIES,
        keys: RETURN_KEYS,
        values: RETURN_VALUES,
        [Symbol.iterator]: null,
        [Symbol.toStringTag]: string_1.STRING,
    });
});
class TypeMap {
    constructor(param0, param1) {
        this.type = "Map";
        this.param0 = param0;
        this.param1 = param1;
    }
    has(type) {
        return type === "Map";
    }
    paramType(index) {
        if (index === 0) {
            return this.param0();
        }
        if (index === 1) {
            return this.param1();
        }
        return null;
    }
    propertyType(name) {
        return getPrototypes()[name] || null;
    }
    iterateType() {
        const map = this;
        return new array_1.TypeArray(function* () {
            yield map.paramType(0);
            yield map.paramType(1);
        }, true);
    }
    returnType() {
        return null;
    }
    typeNames() {
        const param0 = (0, common_1.getTypeName)(this.paramType(0));
        const param1 = (0, common_1.getTypeName)(this.paramType(1));
        return [
            `Map${param0 != null && param1 != null ? `<${param0},${param1}>` : ""}`,
        ];
    }
    equals(o) {
        if (o.type !== "Map") {
            return false;
        }
        return ((0, common_1.isEquals)(this.paramType(0), o.paramType(0)) &&
            (0, common_1.isEquals)(this.paramType(1), o.paramType(1)));
    }
}
exports.TypeMap = TypeMap;
exports.UNKNOWN_MAP = new TypeMap(() => null, () => null);
function buildMapConstructor() {
    const MAP_TYPES = (0, common_1.createObject)({
        prototype: null,
        [Symbol.species]: null,
    });
    return new function_1.TypeGlobalFunction(mapConstructor, MAP_TYPES);
}
function mapConstructor(_thisType, argTypes, meta) {
    var _a;
    if (!(meta === null || meta === void 0 ? void 0 : meta.isConstructor)) {
        return null;
    }
    const arg = (_a = argTypes[0]) === null || _a === void 0 ? void 0 : _a.call(argTypes);
    if ((0, common_1.isTypeClass)(arg) && arg.type === "Array") {
        const iterateType = arg.iterateType();
        if ((0, common_1.isTypeClass)(iterateType) && iterateType.type === "Array") {
            return new TypeMap(() => iterateType.at(0), () => iterateType.at(1));
        }
    }
    return exports.UNKNOWN_MAP;
}
