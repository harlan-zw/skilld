import { type BasePredicate } from './predicates/base-predicate.js';
import { type Modifiers } from './modifiers.js';
import { type Predicates } from './predicates.js';
/**
@hidden
*/
export type Main = <T>(value: T, label: string | Function, predicate: BasePredicate<T>, idLabel?: boolean) => void;
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
export type Infer<P> = P extends BasePredicate<infer T> ? T : never;
export type Ow = {
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
} & Modifiers & Predicates;
/**
A reusable validator.
*/
export type ReusableValidator<T> = {
    /**
    Test if the value matches the predicate. Throws an `ArgumentError` if the test fails.

    @param value - Value to test.
    @param label - Override the label which should be used in error messages.
    */
    (value: unknown | T, label?: string): void;
};
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
export type AssertingValidator<T> = T extends ReusableValidator<infer R> ? (value: unknown, label?: string) => asserts value is R : T extends BasePredicate<infer R> ? (value: unknown, label?: string) => asserts value is R : never;
declare const _ow: Ow;
export default _ow;
export * from './predicates.js';
export { ArgumentError } from './argument-error.js';
export { Predicate } from './predicates/predicate.js';
export type { BasePredicate } from './predicates/base-predicate.js';
