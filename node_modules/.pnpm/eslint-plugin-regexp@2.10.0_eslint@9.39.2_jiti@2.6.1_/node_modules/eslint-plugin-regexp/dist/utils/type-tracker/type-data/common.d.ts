import type { NamedType, OtherTypeName, TypeClass, TypeInfo } from ".";
export declare function isTypeClass(type: TypeInfo | null | undefined): type is TypeClass;
export declare function isEquals(t1: TypeInfo | null | undefined, t2: TypeInfo | null | undefined): boolean;
export declare function hasType(result: TypeInfo | null, type: NamedType | OtherTypeName): boolean;
export declare function createObject<T>(t: T): T;
export declare class TypeCollection {
    readonly generator: () => IterableIterator<TypeInfo>;
    private unknownIndex;
    constructor(generator?: () => IterableIterator<TypeInfo | null>);
    has(type: NamedType | OtherTypeName): boolean;
    isOneType(): boolean;
    tuple(): IterableIterator<TypeInfo>;
    all(): IterableIterator<TypeInfo>;
    strings(): IterableIterator<string>;
}
export declare function getTypeName(type: TypeInfo | null): string | null;
