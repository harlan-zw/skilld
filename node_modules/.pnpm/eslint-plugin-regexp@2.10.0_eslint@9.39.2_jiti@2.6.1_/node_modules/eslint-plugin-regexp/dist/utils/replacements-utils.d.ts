type BaseReplacementElement<T> = BaseCharacterElement<T> | BaseDollarElement<T> | BaseReferenceElement<T>;
type BaseCharacterElement<T> = {
    type: "CharacterElement";
    value: string;
} & T;
type BaseDollarElement<T> = {
    type: "DollarElement";
    kind: "$" | "&" | "`" | "'";
} & T;
type BaseReferenceElement<T> = {
    type: "ReferenceElement";
    ref: number | string;
    refText: string;
} & T;
export declare function parseReplacementsForString(text: string): BaseReplacementElement<object>[];
export declare function baseParseReplacements<T, E extends {
    value: string;
}>(chars: E[], getData: (start: E, end: E) => T): BaseReplacementElement<T>[];
export {};
