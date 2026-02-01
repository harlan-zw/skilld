"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertNever = assertNever;
exports.lazy = lazy;
exports.cachedFn = cachedFn;
exports.toCodePoints = toCodePoints;
exports.reversed = reversed;
function assertNever(value) {
    throw new Error(`Invalid value: ${value}`);
}
function lazy(fn) {
    let cached;
    return () => {
        if (cached === undefined) {
            cached = fn();
        }
        return cached;
    };
}
function cachedFn(fn) {
    const cache = new WeakMap();
    return (key) => {
        let cached = cache.get(key);
        if (cached === undefined) {
            cached = fn(key);
            cache.set(key, cached);
        }
        return cached;
    };
}
function toCodePoints(s) {
    return [...s].map((c) => c.codePointAt(0));
}
function reversed(iter) {
    return [...iter].reverse();
}
