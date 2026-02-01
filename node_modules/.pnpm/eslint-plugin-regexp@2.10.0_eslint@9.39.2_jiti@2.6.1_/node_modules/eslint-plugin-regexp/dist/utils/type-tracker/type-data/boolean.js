"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOOLEAN = exports.TypeBoolean = void 0;
exports.buildBooleanConstructor = buildBooleanConstructor;
const util_1 = require("../../util");
const common_1 = require("./common");
const function_1 = require("./function");
const object_1 = require("./object");
class TypeBoolean {
    constructor() {
        this.type = "Boolean";
    }
    has(type) {
        return type === "Boolean";
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
        return ["Boolean"];
    }
    equals(o) {
        return o.type === "Boolean";
    }
}
exports.TypeBoolean = TypeBoolean;
exports.BOOLEAN = new TypeBoolean();
function buildBooleanConstructor() {
    const BOOLEAN_TYPES = (0, common_1.createObject)({
        prototype: null,
    });
    return new function_1.TypeGlobalFunction(() => exports.BOOLEAN, BOOLEAN_TYPES);
}
const getPrototypes = (0, util_1.lazy)(() => (0, common_1.createObject)({
    ...(0, object_1.getObjectPrototypes)(),
    valueOf: function_1.RETURN_BOOLEAN,
}));
