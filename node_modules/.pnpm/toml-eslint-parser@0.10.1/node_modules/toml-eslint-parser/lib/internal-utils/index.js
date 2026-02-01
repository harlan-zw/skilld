"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.last = last;
exports.toKeyName = toKeyName;
/**
 * Get the last element from given array
 */
function last(arr) {
    var _a;
    return (_a = arr[arr.length - 1]) !== null && _a !== void 0 ? _a : null;
}
/**
 * Node to key name
 */
function toKeyName(node) {
    return node.type === "TOMLBare" ? node.name : node.value;
}
