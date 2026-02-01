import type * as ES from "estree";
import { TypeArray, UNKNOWN_ARRAY } from "./array";
import type { TypeBigInt } from "./bigint";
import { BIGINT } from "./bigint";
import type { TypeBoolean } from "./boolean";
import { BOOLEAN } from "./boolean";
import { isTypeClass, hasType } from "./common";
import { UNKNOWN_FUNCTION, TypeFunction } from "./function";
import type { TypeGlobal } from "./global";
import { GLOBAL } from "./global";
import type { TypeIterable } from "./iterable";
import { TypeMap, UNKNOWN_MAP } from "./map";
import type { TypeNumber } from "./number";
import { NUMBER } from "./number";
import { TypeObject, UNKNOWN_OBJECT } from "./object";
import type { TypeRegExp } from "./regexp";
import { REGEXP } from "./regexp";
import { TypeSet, UNKNOWN_SET } from "./set";
import type { TypeString } from "./string";
import { STRING } from "./string";
import { TypeUnionOrIntersection } from "./union-or-intersection";
export { hasType, TypeArray, TypeObject, UNKNOWN_ARRAY, UNKNOWN_OBJECT, UNKNOWN_FUNCTION, STRING, NUMBER, BOOLEAN, REGEXP, BIGINT, TypeUnionOrIntersection, isTypeClass, TypeSet, TypeMap, UNKNOWN_MAP, UNKNOWN_SET, TypeFunction, GLOBAL, };
export declare const GLOBAL_NUMBER: unique symbol;
export declare const GLOBAL_REGEXP: unique symbol;
export declare const GLOBAL_FUNCTION: unique symbol;
export declare const GLOBAL_OBJECT: unique symbol;
export type NamedType = "null" | "undefined";
export type OtherTypeName = "Function" | "Array" | "Object" | "String" | "Number" | "Boolean" | "RegExp" | "BigInt" | "Map" | "Set";
export type TypeInfo = NamedType | TypeClass;
export type TypeClass = TypeUnionOrIntersection | TypeArray | TypeObject | TypeString | TypeNumber | TypeBoolean | TypeRegExp | TypeBigInt | TypeMap | TypeSet | TypeFunction | TypeIterable | TypeGlobal;
export interface ITypeClass {
    type: "TypeUnionOrIntersection" | "Array" | "Object" | "String" | "Number" | "Boolean" | "RegExp" | "BigInt" | "Map" | "Set" | "Function" | "Iterable" | "Global";
    has(type: NamedType | OtherTypeName): boolean;
    paramType(index: number): TypeInfo | null;
    iterateType(): TypeInfo | null;
    propertyType(name: string): TypeInfo | null;
    returnType(thisType: (() => TypeInfo | null) | null, argTypes: ((() => TypeInfo | null) | null)[], meta?: {
        isConstructor?: boolean;
    }): TypeInfo | null;
    typeNames(): string[];
    equals(o: TypeClass): boolean;
}
export declare const BI_OPERATOR_TYPES: {
    [key in ES.BinaryExpression["operator"]]: (getTypes: () => [TypeInfo | null, TypeInfo | null]) => TypeInfo | null;
};
export declare const UN_OPERATOR_TYPES: {
    [key in ES.UnaryExpression["operator"]]: (getType: () => TypeInfo | null) => TypeInfo | null;
};
