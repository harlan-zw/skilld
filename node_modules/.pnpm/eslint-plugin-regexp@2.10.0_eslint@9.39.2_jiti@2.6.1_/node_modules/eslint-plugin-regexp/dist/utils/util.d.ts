export declare function assertNever(value: never): never;
export declare function lazy<R extends NonNullable<unknown> | null>(fn: () => R): () => R;
export declare function cachedFn<K extends object, R>(fn: (key: K) => R): (key: K) => R;
export declare function toCodePoints(s: string): number[];
export declare function reversed<T>(iter: Iterable<T>): T[];
