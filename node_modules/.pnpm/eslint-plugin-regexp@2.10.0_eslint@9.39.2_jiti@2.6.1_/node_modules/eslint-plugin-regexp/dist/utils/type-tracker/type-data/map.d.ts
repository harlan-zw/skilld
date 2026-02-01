import { TypeFunction } from "./function";
import type { ITypeClass, NamedType, OtherTypeName, TypeClass, TypeInfo } from ".";
export declare class TypeMap implements ITypeClass {
    type: "Map";
    private readonly param0;
    private readonly param1;
    constructor(param0: () => TypeInfo | null, param1: () => TypeInfo | null);
    has(type: NamedType | OtherTypeName): boolean;
    paramType(index: number): TypeInfo | null;
    propertyType(name: string): TypeInfo | null;
    iterateType(): TypeInfo | null;
    returnType(): null;
    typeNames(): string[];
    equals(o: TypeClass): boolean;
}
export declare const UNKNOWN_MAP: TypeMap;
export declare function buildMapConstructor(): TypeFunction;
