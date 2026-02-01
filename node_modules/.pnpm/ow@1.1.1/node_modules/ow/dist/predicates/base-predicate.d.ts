import type { Main } from '../index.js';
/**
@hidden
*/
export declare const testSymbol: unique symbol;
/**
@hidden
*/
export declare const isPredicate: (value: unknown) => value is BasePredicate<unknown>;
/**
@hidden
*/
export type BasePredicate<T = unknown> = {
    [testSymbol](value: T, main: Main, label: string | Function, idLabel?: boolean): void;
};
