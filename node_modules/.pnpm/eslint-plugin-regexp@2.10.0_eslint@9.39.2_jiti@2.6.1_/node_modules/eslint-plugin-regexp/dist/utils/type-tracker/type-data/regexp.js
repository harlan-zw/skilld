"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REGEXP = exports.TypeRegExp = void 0;
exports.buildRegExpConstructor = buildRegExpConstructor;
const util_1 = require("../../util");
const boolean_1 = require("./boolean");
const common_1 = require("./common");
const function_1 = require("./function");
const number_1 = require("./number");
const object_1 = require("./object");
const string_1 = require("./string");
class TypeRegExp {
    constructor() {
        this.type = "RegExp";
    }
    has(type) {
        return type === "RegExp";
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
        return ["RegExp"];
    }
    equals(o) {
        return o.type === "RegExp";
    }
}
exports.TypeRegExp = TypeRegExp;
exports.REGEXP = new TypeRegExp();
function buildRegExpConstructor() {
    const REGEXP_TYPES = (0, common_1.createObject)({
        $1: string_1.STRING,
        $2: string_1.STRING,
        $3: string_1.STRING,
        $4: string_1.STRING,
        $5: string_1.STRING,
        $6: string_1.STRING,
        $7: string_1.STRING,
        $8: string_1.STRING,
        $9: string_1.STRING,
        $_: string_1.STRING,
        "$&": string_1.STRING,
        "$+": string_1.STRING,
        "$`": string_1.STRING,
        "$'": string_1.STRING,
        input: string_1.STRING,
        lastParen: string_1.STRING,
        leftContext: string_1.STRING,
        rightContext: string_1.STRING,
        lastMatch: number_1.NUMBER,
        prototype: null,
        [Symbol.species]: null,
    });
    return new function_1.TypeGlobalFunction(() => exports.REGEXP, REGEXP_TYPES);
}
const getPrototypes = (0, util_1.lazy)(() => (0, common_1.createObject)({
    ...(0, object_1.getObjectPrototypes)(),
    exec: function_1.RETURN_STRING_ARRAY,
    test: function_1.RETURN_BOOLEAN,
    source: string_1.STRING,
    global: boolean_1.BOOLEAN,
    ignoreCase: boolean_1.BOOLEAN,
    multiline: boolean_1.BOOLEAN,
    lastIndex: number_1.NUMBER,
    compile: function_1.RETURN_REGEXP,
    flags: string_1.STRING,
    sticky: boolean_1.BOOLEAN,
    unicode: boolean_1.BOOLEAN,
    dotAll: boolean_1.BOOLEAN,
    hasIndices: boolean_1.BOOLEAN,
    [Symbol.match]: null,
    [Symbol.replace]: null,
    [Symbol.search]: null,
    [Symbol.split]: null,
    [Symbol.matchAll]: null,
}));
