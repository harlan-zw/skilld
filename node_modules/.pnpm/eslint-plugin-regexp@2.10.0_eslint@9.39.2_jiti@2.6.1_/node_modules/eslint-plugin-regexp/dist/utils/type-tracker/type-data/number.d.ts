import { TypeGlobalFunction } from "./function";
import type { ITypeClass, NamedType, OtherTypeName, TypeClass, TypeInfo } from ".";
export declare class TypeNumber implements ITypeClass {
    type: "Number";
    has(type: NamedType | OtherTypeName): boolean;
    paramType(): null;
    propertyType(name: string): TypeInfo | null;
    iterateType(): null;
    returnType(): null;
    typeNames(): string[];
    equals(o: TypeClass): boolean;
}
export declare const NUMBER: TypeNumber;
export declare function buildNumberConstructor(): TypeGlobalFunction;
