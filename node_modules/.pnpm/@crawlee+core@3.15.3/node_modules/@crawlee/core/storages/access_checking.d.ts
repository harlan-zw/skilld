import type { Awaitable } from '../typedefs';
/**
 * Invoke a storage access checker function defined using {@link withCheckedStorageAccess} higher up in the call stack.
 */
export declare const checkStorageAccess: () => void | undefined;
/**
 * Define a storage access checker function that should be used by calls to {@link checkStorageAccess} in the callbacks.
 *
 * @param checkFunction The check function that should be invoked by {@link checkStorageAccess} calls
 * @param callback The code that should be invoked with the `checkFunction` setting
 */
export declare const withCheckedStorageAccess: <T>(checkFunction: () => void, callback: () => Awaitable<T>) => Promise<T>;
//# sourceMappingURL=access_checking.d.ts.map