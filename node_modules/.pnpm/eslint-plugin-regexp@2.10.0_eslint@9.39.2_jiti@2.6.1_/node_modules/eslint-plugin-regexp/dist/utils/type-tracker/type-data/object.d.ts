import { TypeGlobalFunction } from "./function";
import type { ITypeClass, NamedType, OtherTypeName, TypeClass, TypeInfo } from ".";
type ObjectKeys = "constructor" | "toString" | "toLocaleString" | "valueOf" | "hasOwnProperty" | "isPrototypeOf" | "propertyIsEnumerable";
export declare const getObjectPrototypes: () => {
    [key in ObjectKeys]: TypeInfo | null;
};
export declare class TypeObject implements ITypeClass {
    type: "Object";
    private readonly propertiesGenerator;
    constructor(propertiesGenerator?: () => IterableIterator<[
        string,
        () => TypeInfo | null
    ]>);
    allProperties(): IterableIterator<[string, () => TypeInfo | null]>;
    has(type: NamedType | OtherTypeName): boolean;
    paramType(): null;
    propertyType(name: string): TypeInfo | null;
    iterateType(): null;
    returnType(): null;
    typeNames(): string[];
    equals(o: TypeClass): boolean;
}
export declare const UNKNOWN_OBJECT: TypeObject;
export declare function buildObjectConstructor(): TypeGlobalFunction;
export {};
