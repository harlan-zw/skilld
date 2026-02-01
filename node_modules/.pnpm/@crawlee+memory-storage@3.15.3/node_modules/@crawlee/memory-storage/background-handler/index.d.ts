import type { BackgroundHandlerReceivedMessage } from '../utils';
/**
 * A map of promises that are created when a background task is scheduled.
 * This is used in MemoryStorage#teardown to wait for all tasks to finish executing before exiting the process.
 * @internal
 */
export declare const promiseMap: Map<string, {
    promise: Promise<void>;
    resolve: () => void;
}>;
export declare function scheduleBackgroundTask(message: BackgroundHandlerReceivedMessage): void;
//# sourceMappingURL=index.d.ts.map