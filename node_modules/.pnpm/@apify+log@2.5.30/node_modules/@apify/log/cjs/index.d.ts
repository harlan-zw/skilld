import { EventEmitter } from 'node:events';

declare enum LogLevel {
    OFF = 0,
    ERROR = 1,
    SOFT_FAIL = 2,
    WARNING = 3,
    INFO = 4,
    DEBUG = 5,
    PERF = 6
}
declare const LEVELS: typeof LogLevel;
declare const LEVEL_TO_STRING: string[];
declare enum LogFormat {
    JSON = "JSON",
    TEXT = "TEXT"
}
/**
 * A symbol used to mark a limited depth object as having come from an error
 * @internal
 */
declare const IS_APIFY_LOGGER_EXCEPTION: unique symbol;
declare const PREFIX_DELIMITER = ":";
declare const TRUNCATION_FLAG_KEY = "[TRUNCATED]";
declare const TRUNCATION_SUFFIX = "...[truncated]";
/** ID fields used in Apify system */
declare const PREFERRED_ID_FIELDS: readonly ["_id", "id", "userId", "impersonatedUserId", "impersonatingUserId", "adminUserId", "actorId", "actorTaskId", "taskId", "buildId", "buildNumber", "runId"];
/** Standard JS Error fields */
declare const PREFERRED_ERROR_FIELDS: readonly ["name", "message", "stack", "cause"];
/** Standard HTTP / network-related fields */
declare const PREFERRED_HTTP_FIELDS: readonly ["url", "method", "code", "status", "statusCode", "statusText"];
/** API error fields used in Apify system */
declare const PREFERRED_API_ERROR_FIELDS: readonly ["errorCode", "errorMessage", "errorResponse"];
/** Potentially large or nested data fields */
declare const PREFERRED_DATA_FIELDS: readonly ["response", "request", "data", "payload", "details", "exception", "config", "headers"];
declare const PREFERRED_FIELDS: readonly ["_id", "id", "userId", "impersonatedUserId", "impersonatingUserId", "adminUserId", "actorId", "actorTaskId", "taskId", "buildId", "buildNumber", "runId", "name", "message", "stack", "cause", "url", "method", "code", "status", "statusCode", "statusText", "errorCode", "errorMessage", "errorResponse", "response", "request", "data", "payload", "details", "exception", "config", "headers"];

/**
 * This is an abstract class that should
 * be extended by custom logger classes.
 *
 * this._log() method must be implemented by them.
 */
declare class Logger extends EventEmitter {
    protected options: Record<string, any>;
    constructor(options: Record<string, any>);
    setOptions(options: Record<string, any>): void;
    getOptions(): Record<string, any>;
    _outputWithConsole(level: LogLevel, line: string): void;
    _log(level: LogLevel, message: string, data?: any, exception?: unknown, opts?: Record<string, any>): void;
    log(level: LogLevel, message: string, ...args: any[]): void;
}

interface LoggerOptions {
    /**
     * Sets the log level to the given value, preventing messages from less important log levels
     * from being printed to the console. Use in conjunction with the `log.LEVELS` constants.
     */
    level?: number;
    /** Max depth of data object that will be logged. Anything deeper than the limit will be stripped off. */
    maxDepth?: number;
    /**
     * Factor by which the limits (`maxStringLength`, `maxArrayLength`, `maxFields`) will be adjusted at each depth level.
     *
     * Examples
     * - If the factor is 0.5, the limits will be halved at each depth level.
     * - If the factor is 1, the limits will be kept the same at each depth level.
     * - If the factor is 2, the limits will be doubled at each depth level.
     */
    gradualLimitFactor?: number;
    /** Max length of the string to be logged. Longer strings will be truncated. */
    maxStringLength?: number;
    /** Max number of array items to be logged. More items will be omitted. */
    maxArrayLength?: number;
    /** Max number of fields to be logged. More fields will be omitted. */
    maxFields?: number;
    /** Ordered list of fields that should be prioritized when logging objects. */
    preferredFields?: PropertyKey[];
    /** Prefix to be prepended the each logged line. */
    prefix?: string | null;
    /** Suffix that will be appended the each logged line. */
    suffix?: string | null;
    /** Suffix that will be appended to truncated strings, objects and arrays. */
    truncationSuffix?: string;
    /** Key of the flag property that will be added to the object if it is truncated. */
    truncationFlagKey?: string;
    /**
     * Logger implementation to be used. Default one is log.LoggerText to log messages as easily readable
     * strings. Optionally you can use `log.LoggerJson` that formats each log line as a JSON.
     */
    logger?: Logger;
    /** Additional data to be added to each log line. */
    data?: Record<string, unknown>;
}
type AdditionalData = Record<string, any> | null;
/**
 * The log instance enables level aware logging of messages and we advise
 * to use it instead of `console.log()` and its aliases in most development
 * scenarios.
 *
 * A very useful use case for `log` is using `log.debug` liberally throughout
 * the codebase to get useful logging messages only when appropriate log level is set
 * and keeping the console tidy in production environments.
 *
 * The available logging levels are, in this order: `DEBUG`, `INFO`, `WARNING`, `ERROR`, `OFF`
 * and can be referenced from the `log.LEVELS` constant, such as `log.LEVELS.ERROR`.
 *
 * To log messages to the system console, use the `log.level(message)` invocation,
 * such as `log.debug('this is a debug message')`.
 *
 * To prevent writing of messages above a certain log level to the console, simply
 * set the appropriate level. The default log level is `INFO`, which means that
 * `DEBUG` messages will not be printed, unless enabled.
 *
 * **Example:**
 * ```js
 * import log from '@apify/log';
 *
 * // importing from the Apify SDK or Crawlee is also supported:
 * // import { log } from 'apify';
 * // import { log } from 'crawlee';
 *
 * log.info('Information message', { someData: 123 }); // prints message
 * log.debug('Debug message', { debugData: 'hello' }); // doesn't print anything
 *
 * log.setLevel(log.LEVELS.DEBUG);
 * log.debug('Debug message'); // prints message
 *
 * log.setLevel(log.LEVELS.ERROR);
 * log.debug('Debug message'); // doesn't print anything
 * log.info('Info message'); // doesn't print anything
 * log.error('Error message', { errorDetails: 'This is bad!' }); // prints message
 *
 * try {
 *   throw new Error('Not good!');
 * } catch (e) {
 *   log.exception(e, 'Exception occurred', { errorDetails: 'This is really bad!' }); // prints message
 * }
 *
 * log.setOptions({ prefix: 'My actor' });
 * log.info('I am running!'); // prints "My actor: I am running"
 *
 * const childLog = log.child({ prefix: 'Crawler' });
 * log.info('I am crawling!'); // prints "My actor:Crawler: I am crawling"
 * ```
 *
 * Another very useful way of setting the log level is by setting the `APIFY_LOG_LEVEL`
 * environment variable, such as `APIFY_LOG_LEVEL=DEBUG`. This way, no code changes
 * are necessary to turn on your debug messages and start debugging right away.
 *
 * To add timestamps to your logs, you can override the default logger settings:
 * ```js
 * log.setOptions({
 *     logger: new log.LoggerText({ skipTime: false }),
 * });
 * ```
 * You can customize your logging further by extending or replacing the default
 * logger instances with your own implementations.
 */
declare class Log {
    /**
     * Map of available log levels that's useful for easy setting of appropriate log levels.
     * Each log level is represented internally by a number. Eg. `log.LEVELS.DEBUG === 5`.
     */
    readonly LEVELS: typeof LogLevel;
    private options;
    /** Maps preferred fields to their index for faster lookup */
    private readonly preferredFieldsMap;
    private readonly warningsOnceLogged;
    constructor(options?: Partial<LoggerOptions>);
    private _sanitizeData;
    /**
     * Returns the currently selected logging level. This is useful for checking whether a message
     * will actually be printed to the console before one actually performs a resource intensive operation
     * to construct the message, such as querying a DB for some metadata that need to be added. If the log
     * level is not high enough at the moment, it doesn't make sense to execute the query.
     */
    getLevel(): number;
    /**
     * Sets the log level to the given value, preventing messages from less important log levels
     * from being printed to the console. Use in conjunction with the `log.LEVELS` constants such as
     *
     * ```
     * log.setLevel(log.LEVELS.DEBUG);
     * ```
     *
     * Default log level is INFO.
     */
    setLevel(level: LogLevel): void;
    internal(level: LogLevel, message: string, data?: any, exception?: any): void;
    /**
     * Configures logger.
     */
    setOptions(options: Partial<LoggerOptions>): void;
    /**
     * Returns the logger configuration.
     */
    getOptions(): Required<LoggerOptions>;
    /**
     * Creates a new instance of logger that inherits settings from a parent logger.
     */
    child(options: Partial<LoggerOptions>): Log;
    /**
     * Logs an `ERROR` message. Use this method to log error messages that are not directly connected
     * to an exception. For logging exceptions, use the `log.exception` method.
     */
    error(message: string, data?: AdditionalData): void;
    /**
     * Logs an `ERROR` level message with a nicely formatted exception. Note that the exception is the first parameter
     * here and an additional message is only optional.
     */
    exception(exception: Error, message: string, data?: AdditionalData): void;
    softFail(message: string, data?: AdditionalData): void;
    /**
     * Logs a `WARNING` level message. Data are stringified and appended to the message.
     */
    warning(message: string, data?: AdditionalData): void;
    /**
     * Logs an `INFO` message. `INFO` is the default log level so info messages will be always logged,
     * unless the log level is changed. Data are stringified and appended to the message.
     */
    info(message: string, data?: AdditionalData): void;
    /**
     * Logs a `DEBUG` message. By default, it will not be written to the console. To see `DEBUG`
     * messages in the console, set the log level to `DEBUG` either using the `log.setLevel(log.LEVELS.DEBUG)`
     * method or using the environment variable `APIFY_LOG_LEVEL=DEBUG`. Data are stringified and appended
     * to the message.
     */
    debug(message: string, data?: AdditionalData): void;
    perf(message: string, data?: AdditionalData): void;
    /**
     * Logs a `WARNING` level message only once.
     */
    warningOnce(message: string): void;
    /**
     * Logs given message only once as WARNING. It's used to warn user that some feature he is using has been deprecated.
     */
    deprecated(message: string): void;
}

/**
 * Ensures a string is shorter than a specified number of character, and truncates it if not, appending a specific suffix to it.
 * (copied from utilities package so logger do not have to depend on all of its dependencies)
 */
declare function truncate(str: string, maxLength: number, suffix?: string): string;
/**
 * Gets log level from env variable. Both integers and strings (WARNING) are supported.
 */
declare function getLevelFromEnv(): number;
/**
 * Gets log format from env variable. Currently, values 'JSON' and 'TEXT' are supported.
 * Defaults to 'TEXT' if no value is specified.
 */
declare function getFormatFromEnv(): LogFormat;
type SanitizeDataOptions = {
    maxDepth?: number;
    gradualLimitFactor?: number;
    maxStringLength?: number;
    maxArrayLength?: number;
    maxFields?: number;
    preferredFieldsMap?: Record<PropertyKey, number>;
    truncationSuffix?: string;
    truncationFlagKey?: string;
};
/**
 * Sanitizes given object based on the given options.
 *
 * ie. Replaces object's content by '[object]' and array's content
 * by '[array]' when the value is nested more than given depth limit.
 */
declare function sanitizeData(data: unknown, options: SanitizeDataOptions): unknown;
interface LimitedError {
    [IS_APIFY_LOGGER_EXCEPTION]: true;
    name: string;
    message: string;
    stack?: string;
    cause?: unknown;
    type?: string;
    details?: Record<string, unknown>;
    reason?: string;
    [key: string]: unknown;
}

declare class LoggerJson extends Logger {
    constructor(options?: {});
    _log(level: LogLevel, message: string, data?: any, exception?: unknown, opts?: Record<string, any>): string;
}

declare class LoggerText extends Logger {
    constructor(options?: {});
    _log(level: LogLevel, message: string, data?: any, exception?: unknown, opts?: Record<string, any>): string;
    protected _parseException(exception: unknown, indentLevel?: number): string;
    private _parseLoggerException;
}

declare const log: Log;

export { IS_APIFY_LOGGER_EXCEPTION, LEVELS, LEVEL_TO_STRING, type LimitedError, Log, LogFormat, LogLevel, Logger, LoggerJson, type LoggerOptions, LoggerText, PREFERRED_API_ERROR_FIELDS, PREFERRED_DATA_FIELDS, PREFERRED_ERROR_FIELDS, PREFERRED_FIELDS, PREFERRED_HTTP_FIELDS, PREFERRED_ID_FIELDS, PREFIX_DELIMITER, TRUNCATION_FLAG_KEY, TRUNCATION_SUFFIX, log as default, getFormatFromEnv, getLevelFromEnv, sanitizeData, truncate };
