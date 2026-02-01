import type { ITypeClass, NamedType, OtherTypeName, TypeClass, TypeInfo } from ".";
type FunctionArg = (thisType: (() => TypeInfo | null) | null, argTypes: ((() => TypeInfo | null) | null)[], meta?: {
    isConstructor?: boolean;
}) => TypeInfo | null;
export declare class TypeFunction implements ITypeClass {
    type: "Function";
    private readonly fn;
    constructor(fn: FunctionArg);
    has(type: NamedType | OtherTypeName): boolean;
    returnType(thisType: (() => TypeInfo | null) | null, argTypes: ((() => TypeInfo | null) | null)[], meta?: {
        isConstructor?: boolean;
    }): TypeInfo | null;
    paramType(): null;
    propertyType(name: string): TypeInfo | null;
    iterateType(): null;
    typeNames(): string[];
    equals(_o: TypeClass): boolean;
}
export declare class TypeGlobalFunction extends TypeFunction {
    private readonly props;
    constructor(fn: FunctionArg, props: {
        [key: string]: TypeInfo | null;
    });
    propertyType(name: string): TypeInfo | null;
}
export declare const UNKNOWN_FUNCTION: TypeFunction;
export declare function buildFunctionConstructor(): TypeGlobalFunction;
export declare const RETURN_VOID: TypeFunction;
export declare const RETURN_STRING: TypeFunction;
export declare const RETURN_NUMBER: TypeFunction;
export declare const RETURN_BOOLEAN: TypeFunction;
export declare const RETURN_UNKNOWN_ARRAY: TypeFunction;
export declare const RETURN_STRING_ARRAY: TypeFunction;
export declare const RETURN_UNKNOWN_OBJECT: TypeFunction;
export declare const RETURN_REGEXP: TypeFunction;
export declare const RETURN_BIGINT: TypeFunction;
export {};
