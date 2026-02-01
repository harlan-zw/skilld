"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STRING_ARRAY = exports.UNKNOWN_ARRAY = exports.TypeArray = void 0;
exports.buildArrayConstructor = buildArrayConstructor;
const util_1 = require("../../util");
const common_1 = require("./common");
const function_1 = require("./function");
const iterable_1 = require("./iterable");
const number_1 = require("./number");
const object_1 = require("./object");
const string_1 = require("./string");
const union_or_intersection_1 = require("./union-or-intersection");
class TypeArray {
    constructor(generator, maybeTuple) {
        this.type = "Array";
        this.collection = new common_1.TypeCollection(generator);
        this.maybeTuple = maybeTuple !== null && maybeTuple !== void 0 ? maybeTuple : false;
    }
    has(type) {
        return type === "Array";
    }
    paramType(index) {
        if (index === 0) {
            return union_or_intersection_1.TypeUnionOrIntersection.buildType(() => this.collection.all());
        }
        return null;
    }
    at(index) {
        if (!this.maybeTuple) {
            return null;
        }
        let i = 0;
        for (const t of this.collection.tuple()) {
            if (i === index) {
                return t;
            }
            i++;
        }
        return null;
    }
    propertyType(name) {
        if (name === "0") {
            return this.paramType(0);
        }
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
        return [`Array${param0 ? `<${param0}>` : ""}`];
    }
    equals(o) {
        if (o.type !== "Array") {
            return false;
        }
        return (0, common_1.isEquals)(this.iterateType(), o.iterateType());
    }
}
exports.TypeArray = TypeArray;
exports.UNKNOWN_ARRAY = new TypeArray();
exports.STRING_ARRAY = new TypeArray(() => [string_1.STRING][Symbol.iterator]());
function buildArrayConstructor() {
    const ARRAY_TYPES = (0, common_1.createObject)({
        isArray: function_1.RETURN_BOOLEAN,
        from: function_1.RETURN_UNKNOWN_ARRAY,
        of: function_1.RETURN_UNKNOWN_ARRAY,
        prototype: null,
        [Symbol.species]: null,
    });
    return new function_1.TypeGlobalFunction(() => exports.UNKNOWN_ARRAY, ARRAY_TYPES);
}
const getPrototypes = (0, util_1.lazy)(() => {
    const RETURN_ARRAY_ELEMENT = new function_1.TypeFunction(function returnArrayElement(selfType) {
        const type = selfType === null || selfType === void 0 ? void 0 : selfType();
        if (!(0, common_1.isTypeClass)(type)) {
            return null;
        }
        return type.paramType(0);
    });
    const RETURN_SELF = new function_1.TypeFunction(function returnSelf(selfType) {
        var _a;
        return (_a = selfType === null || selfType === void 0 ? void 0 : selfType()) !== null && _a !== void 0 ? _a : null;
    });
    const RETURN_CONCAT = new function_1.TypeFunction(function returnConcat(selfType, argTypes) {
        return new TypeArray(function* () {
            for (const getType of [selfType, ...argTypes]) {
                const s = getType === null || getType === void 0 ? void 0 : getType();
                if ((0, common_1.isTypeClass)(s)) {
                    yield s.iterateType();
                }
                else {
                    yield null;
                }
            }
        });
    });
    const RETURN_ENTRIES = new function_1.TypeFunction(function (selfType) {
        return new iterable_1.TypeIterable(() => {
            return new TypeArray(function* () {
                yield number_1.NUMBER;
                const type = selfType === null || selfType === void 0 ? void 0 : selfType();
                if ((0, common_1.isTypeClass)(type)) {
                    yield type.iterateType();
                }
            });
        });
    });
    const RETURN_KEYS = new function_1.TypeFunction(function () {
        return new iterable_1.TypeIterable(() => {
            return number_1.NUMBER;
        });
    });
    const RETURN_VALUES = new function_1.TypeFunction(function (selfType) {
        return new iterable_1.TypeIterable(() => {
            const type = selfType === null || selfType === void 0 ? void 0 : selfType();
            if ((0, common_1.isTypeClass)(type)) {
                return type.iterateType();
            }
            return null;
        });
    });
    const RETURN_MAP = new function_1.TypeFunction(function (selfType, [argType]) {
        return new TypeArray(function* () {
            const type = argType === null || argType === void 0 ? void 0 : argType();
            if ((0, common_1.isTypeClass)(type)) {
                yield type.returnType(selfType, [
                    () => {
                        const s = selfType === null || selfType === void 0 ? void 0 : selfType();
                        return (0, common_1.isTypeClass)(s) ? s.iterateType() : null;
                    },
                    () => number_1.NUMBER,
                ]);
            }
        });
    });
    return (0, common_1.createObject)({
        ...(0, object_1.getObjectPrototypes)(),
        toString: function_1.RETURN_STRING,
        toLocaleString: function_1.RETURN_STRING,
        pop: RETURN_ARRAY_ELEMENT,
        push: function_1.RETURN_NUMBER,
        concat: RETURN_CONCAT,
        join: function_1.RETURN_STRING,
        reverse: RETURN_SELF,
        shift: RETURN_ARRAY_ELEMENT,
        slice: RETURN_SELF,
        sort: RETURN_SELF,
        splice: RETURN_SELF,
        unshift: function_1.RETURN_NUMBER,
        indexOf: function_1.RETURN_NUMBER,
        lastIndexOf: function_1.RETURN_NUMBER,
        every: function_1.RETURN_BOOLEAN,
        some: function_1.RETURN_BOOLEAN,
        forEach: function_1.RETURN_VOID,
        map: RETURN_MAP,
        filter: RETURN_SELF,
        reduce: null,
        reduceRight: null,
        find: RETURN_ARRAY_ELEMENT,
        findIndex: function_1.RETURN_NUMBER,
        fill: function_1.RETURN_UNKNOWN_ARRAY,
        copyWithin: RETURN_SELF,
        entries: RETURN_ENTRIES,
        keys: RETURN_KEYS,
        values: RETURN_VALUES,
        includes: function_1.RETURN_BOOLEAN,
        flatMap: function_1.RETURN_UNKNOWN_ARRAY,
        flat: function_1.RETURN_UNKNOWN_ARRAY,
        at: RETURN_ARRAY_ELEMENT,
        findLast: RETURN_ARRAY_ELEMENT,
        findLastIndex: function_1.RETURN_NUMBER,
        toReversed: RETURN_SELF,
        toSorted: RETURN_SELF,
        toSpliced: RETURN_SELF,
        with: RETURN_SELF,
        length: number_1.NUMBER,
        0: null,
        [Symbol.iterator]: null,
        [Symbol.unscopables]: null,
    });
});
