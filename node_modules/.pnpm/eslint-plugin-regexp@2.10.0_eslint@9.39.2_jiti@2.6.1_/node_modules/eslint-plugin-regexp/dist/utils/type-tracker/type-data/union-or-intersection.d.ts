import type { ITypeClass, NamedType, OtherTypeName, TypeClass, TypeInfo } from ".";
export declare class TypeUnionOrIntersection implements ITypeClass {
    type: "TypeUnionOrIntersection";
    private readonly collection;
    static buildType(generator?: () => IterableIterator<TypeInfo | null>): TypeInfo | null;
    private constructor();
    has(type: NamedType | OtherTypeName): boolean;
    paramType(): null;
    propertyType(name: string): TypeInfo | null;
    iterateType(): TypeInfo | null;
    returnType(thisType: (() => TypeInfo | null) | null, argTypes: ((() => TypeInfo | null) | null)[]): TypeInfo | null;
    typeNames(): string[];
    equals(o: TypeClass): boolean;
}
