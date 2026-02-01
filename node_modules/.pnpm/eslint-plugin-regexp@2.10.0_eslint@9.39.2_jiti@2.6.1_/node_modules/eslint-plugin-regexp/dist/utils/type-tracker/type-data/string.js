"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STRING = exports.TypeString = void 0;
exports.buildStringConstructor = buildStringConstructor;
const util_1 = require("../../util");
const common_1 = require("./common");
const function_1 = require("./function");
const number_1 = require("./number");
const object_1 = require("./object");
class TypeString {
    constructor() {
        this.type = "String";
    }
    has(type) {
        return type === "String";
    }
    paramType() {
        return null;
    }
    propertyType(name) {
        if (name === "0") {
            return this;
        }
        return getPrototypes()[name] || null;
    }
    iterateType() {
        return this;
    }
    returnType() {
        return null;
    }
    typeNames() {
        return ["String"];
    }
    equals(o) {
        return o.type === "String";
    }
}
exports.TypeString = TypeString;
exports.STRING = new TypeString();
function buildStringConstructor() {
    const STRING_TYPES = (0, common_1.createObject)({
        fromCharCode: function_1.RETURN_STRING,
        fromCodePoint: function_1.RETURN_STRING,
        raw: function_1.RETURN_STRING,
        prototype: null,
    });
    return new function_1.TypeGlobalFunction(() => exports.STRING, STRING_TYPES);
}
const getPrototypes = (0, util_1.lazy)(() => (0, common_1.createObject)({
    ...(0, object_1.getObjectPrototypes)(),
    toString: function_1.RETURN_STRING,
    charAt: function_1.RETURN_STRING,
    charCodeAt: function_1.RETURN_NUMBER,
    concat: function_1.RETURN_STRING,
    indexOf: function_1.RETURN_NUMBER,
    lastIndexOf: function_1.RETURN_NUMBER,
    localeCompare: function_1.RETURN_NUMBER,
    match: function_1.RETURN_STRING_ARRAY,
    replace: function_1.RETURN_STRING,
    search: function_1.RETURN_NUMBER,
    slice: function_1.RETURN_STRING,
    split: function_1.RETURN_STRING_ARRAY,
    substring: function_1.RETURN_STRING,
    toLowerCase: function_1.RETURN_STRING,
    toLocaleLowerCase: function_1.RETURN_STRING,
    toUpperCase: function_1.RETURN_STRING,
    toLocaleUpperCase: function_1.RETURN_STRING,
    trim: function_1.RETURN_STRING,
    substr: function_1.RETURN_STRING,
    valueOf: function_1.RETURN_STRING,
    codePointAt: function_1.RETURN_NUMBER,
    includes: function_1.RETURN_BOOLEAN,
    endsWith: function_1.RETURN_BOOLEAN,
    normalize: function_1.RETURN_STRING,
    repeat: function_1.RETURN_STRING,
    startsWith: function_1.RETURN_BOOLEAN,
    anchor: function_1.RETURN_STRING,
    big: function_1.RETURN_STRING,
    blink: function_1.RETURN_STRING,
    bold: function_1.RETURN_STRING,
    fixed: function_1.RETURN_STRING,
    fontcolor: function_1.RETURN_STRING,
    fontsize: function_1.RETURN_STRING,
    italics: function_1.RETURN_STRING,
    link: function_1.RETURN_STRING,
    small: function_1.RETURN_STRING,
    strike: function_1.RETURN_STRING,
    sub: function_1.RETURN_STRING,
    sup: function_1.RETURN_STRING,
    padStart: function_1.RETURN_STRING,
    padEnd: function_1.RETURN_STRING,
    trimLeft: function_1.RETURN_STRING,
    trimRight: function_1.RETURN_STRING,
    trimStart: function_1.RETURN_STRING,
    trimEnd: function_1.RETURN_STRING,
    matchAll: null,
    replaceAll: function_1.RETURN_STRING,
    at: function_1.RETURN_STRING,
    length: number_1.NUMBER,
    0: exports.STRING,
    [Symbol.iterator]: null,
}));
