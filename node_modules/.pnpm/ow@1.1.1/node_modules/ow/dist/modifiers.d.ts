import { type Predicates } from './predicates.js';
import type { BasePredicate } from './index.js';
type Optionalify<P> = P extends BasePredicate<infer X> ? P & BasePredicate<X | undefined> : P;
export type Modifiers = {
    /**
    Make the following predicate optional so it doesn't fail when the value is `undefined`.
    */
    readonly optional: {
        [K in keyof Predicates]: Optionalify<Predicates[K]>;
    };
};
declare const modifiers: <T>(object: T) => T & Modifiers;
export default modifiers;
