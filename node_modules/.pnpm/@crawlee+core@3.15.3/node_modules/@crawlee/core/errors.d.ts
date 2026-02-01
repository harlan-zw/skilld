/**
 * Errors of `NonRetryableError` type will never be retried by the crawler.
 */
export declare class NonRetryableError extends Error {
}
/**
 * Errors of `CriticalError` type will shut down the whole crawler.
 * Error handlers catching CriticalError should avoid logging it, as it will be logged by Node.js itself at the end
 */
export declare class CriticalError extends NonRetryableError {
}
/**
 * @ignore
 */
export declare class MissingRouteError extends CriticalError {
}
/**
 * Errors of `RetryRequestError` type will always be retried by the crawler.
 *
 * *This error overrides the `maxRequestRetries` option, i.e. the request can be retried indefinitely until it succeeds.*
 */
export declare class RetryRequestError extends Error {
    constructor(message?: string);
}
/**
 * Errors of `SessionError` type will trigger a session rotation.
 *
 * This error doesn't respect the `maxRequestRetries` option and has a separate limit of `maxSessionRotations`.
 */
export declare class SessionError extends RetryRequestError {
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map