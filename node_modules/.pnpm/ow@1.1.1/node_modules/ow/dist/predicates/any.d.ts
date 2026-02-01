import type { Main } from '../index.js';
import { testSymbol, type BasePredicate } from './base-predicate.js';
import type { PredicateOptions } from './predicate.js';
/**
@hidden
*/
export declare class AnyPredicate<T = unknown> implements BasePredicate<T> {
    private readonly predicates;
    private readonly options;
    constructor(predicates: BasePredicate[], options?: PredicateOptions);
    [testSymbol](value: T, main: Main, label: string | Function, idLabel: boolean): asserts value;
}
