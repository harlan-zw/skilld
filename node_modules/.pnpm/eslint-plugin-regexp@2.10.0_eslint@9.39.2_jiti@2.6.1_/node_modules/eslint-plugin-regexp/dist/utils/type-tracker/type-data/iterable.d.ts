import type { ITypeClass, NamedType, OtherTypeName, TypeClass, TypeInfo } from ".";
export declare class TypeIterable implements ITypeClass {
    type: "Iterable";
    private readonly param0;
    constructor(param0: () => TypeInfo | null);
    has(_type: NamedType | OtherTypeName): boolean;
    paramType(index: number): TypeInfo | null;
    propertyType(name: string): TypeInfo | null;
    iterateType(): TypeInfo | null;
    returnType(): null;
    typeNames(): string[];
    equals(o: TypeClass): boolean;
}
export declare const UNKNOWN_ITERABLE: TypeIterable;
