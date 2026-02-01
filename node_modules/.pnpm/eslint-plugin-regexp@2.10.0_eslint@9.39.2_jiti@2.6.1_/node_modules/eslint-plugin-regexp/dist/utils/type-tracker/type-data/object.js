"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNKNOWN_OBJECT = exports.TypeObject = exports.getObjectPrototypes = void 0;
exports.buildObjectConstructor = buildObjectConstructor;
const util_1 = require("../../util");
const common_1 = require("./common");
const function_1 = require("./function");
exports.getObjectPrototypes = (0, util_1.lazy)(() => (0, common_1.createObject)({
    constructor: function_1.UNKNOWN_FUNCTION,
    toString: function_1.RETURN_STRING,
    toLocaleString: function_1.RETURN_STRING,
    valueOf: function_1.RETURN_UNKNOWN_OBJECT,
    hasOwnProperty: function_1.RETURN_BOOLEAN,
    isPrototypeOf: function_1.RETURN_BOOLEAN,
    propertyIsEnumerable: function_1.RETURN_BOOLEAN,
}));
class TypeObject {
    constructor(propertiesGenerator) {
        this.type = "Object";
        this.propertiesGenerator =
            propertiesGenerator !== null && propertiesGenerator !== void 0 ? propertiesGenerator : (() => {
                return [][Symbol.iterator]();
            });
    }
    *allProperties() {
        const set = new Set();
        for (const t of this.propertiesGenerator()) {
            if (set.has(t[0])) {
                continue;
            }
            set.add(t[0]);
            yield t;
        }
    }
    has(type) {
        return type === "Object";
    }
    paramType() {
        return null;
    }
    propertyType(name) {
        for (const [key, getValue] of this.allProperties()) {
            if (key === name) {
                return getValue();
            }
        }
        return (0, exports.getObjectPrototypes)()[name] || null;
    }
    iterateType() {
        return null;
    }
    returnType() {
        return null;
    }
    typeNames() {
        return ["Object"];
    }
    equals(o) {
        if (o.type !== "Object") {
            return false;
        }
        const itr2 = o.allProperties();
        const props2 = new Map();
        for (const [key1, get1] of this.allProperties()) {
            const get2 = props2.get(key1);
            if (get2) {
                if (!(0, common_1.isEquals)(get1(), get2())) {
                    return false;
                }
            }
            else {
                let e2 = itr2.next();
                while (!e2.done) {
                    const [key2, get] = e2.value;
                    props2.set(key2, get);
                    if (key1 === key2) {
                        if (!(0, common_1.isEquals)(get1(), get())) {
                            return false;
                        }
                        break;
                    }
                    e2 = itr2.next();
                }
                if (e2.done) {
                    return false;
                }
            }
        }
        const e2 = itr2.next();
        if (!e2.done) {
            return false;
        }
        return true;
    }
}
exports.TypeObject = TypeObject;
exports.UNKNOWN_OBJECT = new TypeObject();
function buildObjectConstructor() {
    const RETURN_ARG = new function_1.TypeFunction(function returnArg(_selfType, argTypes) {
        var _a, _b;
        return (_b = (_a = argTypes[0]) === null || _a === void 0 ? void 0 : _a.call(argTypes)) !== null && _b !== void 0 ? _b : null;
    });
    const RETURN_ASSIGN = new function_1.TypeFunction(function returnAssign(selfType, argTypes) {
        return new TypeObject(function* () {
            for (const getType of [selfType, ...argTypes].reverse()) {
                const s = getType === null || getType === void 0 ? void 0 : getType();
                if ((0, common_1.isTypeClass)(s) && s.type === "Object") {
                    yield* s.allProperties();
                }
            }
        });
    });
    const OBJECT_TYPES = (0, common_1.createObject)({
        getPrototypeOf: null,
        getOwnPropertyDescriptor: null,
        getOwnPropertyNames: function_1.RETURN_STRING_ARRAY,
        create: null,
        defineProperty: null,
        defineProperties: null,
        seal: RETURN_ARG,
        freeze: RETURN_ARG,
        preventExtensions: null,
        isSealed: function_1.RETURN_BOOLEAN,
        isFrozen: function_1.RETURN_BOOLEAN,
        isExtensible: function_1.RETURN_BOOLEAN,
        keys: function_1.RETURN_STRING_ARRAY,
        assign: RETURN_ASSIGN,
        getOwnPropertySymbols: function_1.RETURN_UNKNOWN_ARRAY,
        is: function_1.RETURN_BOOLEAN,
        setPrototypeOf: null,
        values: function_1.RETURN_UNKNOWN_ARRAY,
        entries: function_1.RETURN_UNKNOWN_ARRAY,
        getOwnPropertyDescriptors: null,
        fromEntries: null,
        hasOwn: function_1.RETURN_BOOLEAN,
        prototype: null,
    });
    return new function_1.TypeGlobalFunction((_thisType, [argType]) => { var _a; return (_a = argType === null || argType === void 0 ? void 0 : argType()) !== null && _a !== void 0 ? _a : exports.UNKNOWN_OBJECT; }, OBJECT_TYPES);
}
