import { Predicate } from './predicate.js';
export class BigIntPredicate extends Predicate {
    /**
    @hidden
    */
    constructor(options) {
        super('bigint', options);
    }
}
