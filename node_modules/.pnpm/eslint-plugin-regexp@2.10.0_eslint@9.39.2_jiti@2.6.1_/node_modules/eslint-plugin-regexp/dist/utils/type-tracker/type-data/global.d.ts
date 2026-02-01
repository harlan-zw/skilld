import type { ITypeClass, NamedType, OtherTypeName, TypeClass, TypeInfo } from ".";
export declare class TypeGlobal implements ITypeClass {
    type: "Global";
    has(_type: NamedType | OtherTypeName): boolean;
    paramType(): null;
    propertyType(name: string): TypeInfo | null;
    iterateType(): null;
    returnType(): null;
    typeNames(): string[];
    equals(o: TypeClass): boolean;
}
export declare const GLOBAL: TypeGlobal;
