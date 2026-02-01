import { TypeFunction } from "./function";
import type { ITypeClass, NamedType, OtherTypeName, TypeClass, TypeInfo } from ".";
export declare class TypeSet implements ITypeClass {
    type: "Set";
    private readonly param0;
    constructor(param0: () => TypeInfo | null);
    has(type: NamedType | OtherTypeName): boolean;
    paramType(index: number): TypeInfo | null;
    propertyType(name: string): TypeInfo | null;
    iterateType(): TypeInfo | null;
    returnType(): null;
    typeNames(): string[];
    equals(o: TypeClass): boolean;
}
export declare const UNKNOWN_SET: TypeSet;
export declare function buildSetConstructor(): TypeFunction;
