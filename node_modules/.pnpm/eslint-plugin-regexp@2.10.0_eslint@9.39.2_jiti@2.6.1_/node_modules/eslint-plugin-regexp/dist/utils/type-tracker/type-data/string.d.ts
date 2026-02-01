import { TypeGlobalFunction } from "./function";
import type { ITypeClass, NamedType, OtherTypeName, TypeClass, TypeInfo } from ".";
export declare class TypeString implements ITypeClass {
    type: "String";
    has(type: NamedType | OtherTypeName): boolean;
    paramType(): null;
    propertyType(name: string): TypeInfo | null;
    iterateType(): TypeInfo;
    returnType(): null;
    typeNames(): string[];
    equals(o: TypeClass): boolean;
}
export declare const STRING: TypeString;
export declare function buildStringConstructor(): TypeGlobalFunction;
