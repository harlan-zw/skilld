import { Predicate } from './predicates/predicate';
import { BasePredicate } from './predicates/base-predicate';
import { Modifiers } from './modifiers';
import { Predicates } from './predicates';
/**
@hidden
*/
export declare type Main = <T>(value: T, label: string | Function, predicate: BasePredicate<T>, idLabel?: boolean) => void;
/**
Retrieve the type from the given predicate.

@example
```
import ow, {Infer} from 'ow';

const userPredicate = ow.object.exactShape({
    name: ow.string
});

type User = Infer<typeof userPredicate>;
```
*/
export declare type Infer<P> = P extends BasePredicate<infer T> ? T : never;
export interface Ow extends Modifiers, Predicates {
    /**
    Test if the value matches the predicate. Throws an `ArgumentError` if the test fails.

    @param value - Value to test.
    @param predicate - Predicate to test against.
    */
    <T>(value: unknown, predicate: BasePredicate<T>): asserts value is T;
    /**
    Test if `value` matches the provided `predicate`. Throws an `ArgumentError` with the specified `label` if the test fails.

    @param value - Value to test.
    @param label - Label which should be used in error messages.
    @param predicate - Predicate to test against.
    */
    <T>(value: unknown, label: string, predicate: BasePredicate<T>): asserts value is T;
    /**
    Returns `true` if the value matches the predicate, otherwise returns `false`.

    @param value - Value to test.
    @param predicate - Predicate to test against.
    */
    isValid: <T>(value: unknown, predicate: BasePredicate<T>) => value is T;
    /**
    Create a reusable validator.

    @param predicate - Predicate used in the validator function.
    */
    create: (<T>(predicate: BasePredicate<T>) => ReusableValidator<T>) & (<T>(label: string, predicate: BasePredicate<T>) => ReusableValidator<T>);
}
/**
A reusable validator.
*/
export interface ReusableValidator<T> {
    /**
    Test if the value matches the predicate. Throws an `ArgumentError` if the test fails.

    @param value - Value to test.
    @param label - Override the label which should be used in error messages.
    */
    (value: unknown | T, label?: string): void;
}
/**
Turn a `ReusableValidator` into one with a type assertion.

@example
```
const checkUsername = ow.create(ow.string.minLength(3));
const checkUsername_: AssertingValidator<typeof checkUsername> = checkUsername;
```

@example
```
const predicate = ow.string.minLength(3);
const checkUsername: AssertingValidator<typeof predicate> = ow.create(predicate);
```
*/
export declare type AssertingValidator<T> = T extends ReusableValidator<infer R> ? (value: unknown, label?: string) => asserts value is R : T extends BasePredicate<infer R> ? (value: unknown, label?: string) => asserts value is R : never;
declare const _ow: Ow;
export default _ow;
export { BasePredicate, Predicate };
export * from './predicates';
export { ArgumentError } from './argument-error';
