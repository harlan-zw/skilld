import { TypeGlobalFunction } from "./function";
import type { ITypeClass, NamedType, OtherTypeName, TypeClass, TypeInfo } from ".";
export declare class TypeBoolean implements ITypeClass {
    type: "Boolean";
    has(type: NamedType | OtherTypeName): boolean;
    paramType(): null;
    propertyType(name: string): TypeInfo | null;
    iterateType(): null;
    returnType(): null;
    typeNames(): string[];
    equals(o: TypeClass): boolean;
}
export declare const BOOLEAN: TypeBoolean;
export declare function buildBooleanConstructor(): TypeGlobalFunction;
