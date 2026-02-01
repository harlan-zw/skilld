import { TypeGlobalFunction } from "./function";
import type { ITypeClass, NamedType, OtherTypeName, TypeClass, TypeInfo } from ".";
export declare class TypeBigInt implements ITypeClass {
    type: "BigInt";
    has(type: NamedType | OtherTypeName): boolean;
    paramType(): null;
    propertyType(name: string): TypeInfo | null;
    iterateType(): null;
    returnType(): null;
    typeNames(): string[];
    equals(o: TypeClass): boolean;
}
export declare const BIGINT: TypeBigInt;
export declare function buildBigIntConstructor(): TypeGlobalFunction;
