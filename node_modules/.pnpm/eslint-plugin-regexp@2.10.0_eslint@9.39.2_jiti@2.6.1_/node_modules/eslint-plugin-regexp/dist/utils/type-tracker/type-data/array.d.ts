import { TypeGlobalFunction } from "./function";
import type { ITypeClass, NamedType, OtherTypeName, TypeClass, TypeInfo } from ".";
export declare class TypeArray implements ITypeClass {
    type: "Array";
    private readonly collection;
    private readonly maybeTuple;
    constructor(generator?: () => IterableIterator<TypeInfo | null>, maybeTuple?: boolean);
    has(type: NamedType | OtherTypeName): boolean;
    paramType(index: number): TypeInfo | null;
    at(index: number): TypeInfo | null;
    propertyType(name: string): TypeInfo | null;
    iterateType(): TypeInfo | null;
    returnType(): null;
    typeNames(): string[];
    equals(o: TypeClass): boolean;
}
export declare const UNKNOWN_ARRAY: TypeArray;
export declare const STRING_ARRAY: TypeArray;
export declare function buildArrayConstructor(): TypeGlobalFunction;
