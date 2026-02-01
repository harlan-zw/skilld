"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNKNOWN_ITERABLE = exports.TypeIterable = void 0;
const util_1 = require("../../util");
const common_1 = require("./common");
const object_1 = require("./object");
const getPrototypes = (0, util_1.lazy)(() => {
    return (0, common_1.createObject)({
        ...(0, object_1.getObjectPrototypes)(),
        [Symbol.iterator]: null,
    });
});
class TypeIterable {
    constructor(param0) {
        this.type = "Iterable";
        this.param0 = param0;
    }
    has(_type) {
        return false;
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
        return [`Iterable${param0 != null ? `<${param0}>` : ""}`];
    }
    equals(o) {
        if (o.type !== "Iterable") {
            return false;
        }
        return (0, common_1.isEquals)(this.iterateType(), o.iterateType());
    }
}
exports.TypeIterable = TypeIterable;
exports.UNKNOWN_ITERABLE = new TypeIterable(() => null);
