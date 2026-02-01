import { Predicate, type PredicateOptions } from './predicate.js';
export declare class BooleanPredicate extends Predicate<boolean> {
    /**
    @hidden
    */
    constructor(options?: PredicateOptions);
    /**
    Test a boolean to be true.
    */
    get true(): this;
    /**
    Test a boolean to be false.
    */
    get false(): this;
}
