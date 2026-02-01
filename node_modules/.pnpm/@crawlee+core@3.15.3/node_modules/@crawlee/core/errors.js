"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionError = exports.RetryRequestError = exports.MissingRouteError = exports.CriticalError = exports.NonRetryableError = void 0;
/**
 * Errors of `NonRetryableError` type will never be retried by the crawler.
 */
class NonRetryableError extends Error {
}
exports.NonRetryableError = NonRetryableError;
/**
 * Errors of `CriticalError` type will shut down the whole crawler.
 * Error handlers catching CriticalError should avoid logging it, as it will be logged by Node.js itself at the end
 */
class CriticalError extends NonRetryableError {
}
exports.CriticalError = CriticalError;
/**
 * @ignore
 */
class MissingRouteError extends CriticalError {
}
exports.MissingRouteError = MissingRouteError;
/**
 * Errors of `RetryRequestError` type will always be retried by the crawler.
 *
 * *This error overrides the `maxRequestRetries` option, i.e. the request can be retried indefinitely until it succeeds.*
 */
class RetryRequestError extends Error {
    constructor(message) {
        super(message ?? "Request is being retried at the user's request");
    }
}
exports.RetryRequestError = RetryRequestError;
/**
 * Errors of `SessionError` type will trigger a session rotation.
 *
 * This error doesn't respect the `maxRequestRetries` option and has a separate limit of `maxSessionRotations`.
 */
class SessionError extends RetryRequestError {
    constructor(message) {
        super(`Detected a session error, rotating session... ${message ? `\n${message}` : ''}`);
    }
}
exports.SessionError = SessionError;
//# sourceMappingURL=errors.js.map