import type { BasePredicate } from '../predicates/base-predicate.js';
/**
Test all the values in the collection against a provided predicate.

@hidden
@param source Source collection to test.
@param name The name to call the collection of values, such as `values` or `keys`.
@param predicate Predicate to test every item in the source collection against.
*/
declare const ofType: <T>(source: IterableIterator<T> | Set<T> | T[], name: string, predicate: BasePredicate<T>) => boolean | string;
export default ofType;
