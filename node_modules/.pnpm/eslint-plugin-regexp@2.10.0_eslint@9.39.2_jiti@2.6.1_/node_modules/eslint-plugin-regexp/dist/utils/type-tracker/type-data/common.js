"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeCollection = void 0;
exports.isTypeClass = isTypeClass;
exports.isEquals = isEquals;
exports.hasType = hasType;
exports.createObject = createObject;
exports.getTypeName = getTypeName;
function isTypeClass(type) {
    if (!type) {
        return false;
    }
    const t = typeof type;
    if (t === "string") {
        return false;
    }
    return true;
}
function isEquals(t1, t2) {
    if (t1 === t2) {
        return true;
    }
    if (isTypeClass(t1) && isTypeClass(t2)) {
        return t1.equals(t2);
    }
    return false;
}
function hasType(result, type) {
    if (result == null) {
        return false;
    }
    if (typeof result === "string") {
        return result === type;
    }
    return result.has(type);
}
function createObject(t) {
    return Object.assign(Object.create(null), t);
}
class TypeCollection {
    constructor(generator) {
        this.unknownIndex = null;
        const that = this;
        this.generator = generator
            ? function* () {
                var _a;
                let index = 0;
                for (const t of generator()) {
                    if (t != null) {
                        yield t;
                    }
                    else {
                        (_a = that.unknownIndex) !== null && _a !== void 0 ? _a : (that.unknownIndex = index);
                    }
                    index++;
                }
            }
            : () => [][Symbol.iterator]();
    }
    has(type) {
        for (const t of this.generator()) {
            if (typeof t === "string") {
                if (t === type)
                    return true;
            }
            else {
                if (t.has(type))
                    return true;
            }
        }
        return false;
    }
    isOneType() {
        let first = null;
        for (const t of this.all()) {
            if (first == null) {
                first = t;
            }
            else {
                if (!isEquals(first, t)) {
                    return false;
                }
            }
        }
        return true;
    }
    *tuple() {
        let index = 0;
        for (const t of this.generator()) {
            if (this.unknownIndex != null && index < this.unknownIndex) {
                return;
            }
            yield t;
            index++;
        }
    }
    *all() {
        const set = new Set();
        for (const t of this.generator()) {
            if (!set.has(t)) {
                set.add(t);
                yield t;
            }
        }
    }
    *strings() {
        const set = new Set();
        for (const t of this.all()) {
            if (typeof t === "string") {
                const str = t;
                if (!set.has(str)) {
                    set.add(t);
                    yield str;
                }
            }
            else {
                for (const str of t.typeNames()) {
                    if (!set.has(str)) {
                        set.add(t);
                        yield str;
                    }
                }
            }
        }
    }
}
exports.TypeCollection = TypeCollection;
function getTypeName(type) {
    if (type == null) {
        return null;
    }
    if (typeof type === "string") {
        return type;
    }
    return type.typeNames().join("|");
}
