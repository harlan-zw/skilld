"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeUnionOrIntersection = void 0;
const common_1 = require("./common");
const _1 = require(".");
class TypeUnionOrIntersection {
    static buildType(generator) {
        const collection = new common_1.TypeCollection(generator);
        if (collection.isOneType()) {
            for (const t of collection.all()) {
                return t;
            }
            return null;
        }
        return new TypeUnionOrIntersection(() => collection.all());
    }
    constructor(generator) {
        this.type = "TypeUnionOrIntersection";
        this.collection = new common_1.TypeCollection(generator);
    }
    has(type) {
        return this.collection.has(type);
    }
    paramType() {
        return null;
    }
    propertyType(name) {
        const baseCollection = this.collection;
        return TypeUnionOrIntersection.buildType(function* () {
            for (const type of baseCollection.all()) {
                const propType = (0, _1.isTypeClass)(type)
                    ? type.propertyType(name)
                    : null;
                if (propType) {
                    yield propType;
                }
            }
        });
    }
    iterateType() {
        const baseCollection = this.collection;
        return TypeUnionOrIntersection.buildType(function* () {
            for (const type of baseCollection.all()) {
                if ((0, _1.isTypeClass)(type)) {
                    const itrType = type.iterateType();
                    if (itrType) {
                        yield itrType;
                    }
                }
            }
        });
    }
    returnType(thisType, argTypes) {
        const baseCollection = this.collection;
        return TypeUnionOrIntersection.buildType(function* () {
            for (const type of baseCollection.all()) {
                if ((0, _1.isTypeClass)(type)) {
                    const itrType = type.returnType(thisType, argTypes);
                    if (itrType) {
                        yield itrType;
                    }
                }
            }
        });
    }
    typeNames() {
        return [...this.collection.strings()].sort();
    }
    equals(o) {
        if (o.type !== "TypeUnionOrIntersection") {
            return false;
        }
        const itr1 = this.collection.all();
        const itr2 = o.collection.all();
        let e1 = itr1.next();
        let e2 = itr2.next();
        while (!e1.done && !e2.done) {
            if (!(0, common_1.isEquals)(e1.value, e2.value)) {
                return false;
            }
            e1 = itr1.next();
            e2 = itr2.next();
        }
        return e1.done === e2.done;
    }
}
exports.TypeUnionOrIntersection = TypeUnionOrIntersection;
