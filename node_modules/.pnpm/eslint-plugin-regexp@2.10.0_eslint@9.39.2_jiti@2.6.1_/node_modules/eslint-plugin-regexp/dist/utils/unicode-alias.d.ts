export declare class AliasMap {
    private readonly toShortMap;
    private readonly toLongMap;
    constructor({ shortToLong, otherToLong, }: {
        shortToLong: Record<string, string>;
        otherToLong: Record<string, string>;
    });
    toShort(key: string): string;
    toLong(key: string): string;
}
export declare const UNICODE_CATEGORY_ALIAS: AliasMap;
export declare const UNICODE_BINARY_PROPERTY_ALIAS: AliasMap;
export declare const UNICODE_GENERAL_CATEGORY_ALIAS: AliasMap;
export declare const UNICODE_SCRIPT_ALIAS: AliasMap;
