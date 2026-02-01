import type { Predicate } from '../predicates/predicate.js';
/**
Test all the values in the object against a provided predicate.

@hidden

@param predicate - Predicate to test every value in the given object against.
*/
declare const ofTypeDeepSafe: (object: unknown, predicate: Predicate) => boolean | string;
export default ofTypeDeepSafe;
