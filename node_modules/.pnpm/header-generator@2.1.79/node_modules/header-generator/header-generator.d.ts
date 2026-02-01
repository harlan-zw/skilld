import { SUPPORTED_BROWSERS, MISSING_VALUE_DATASET_TOKEN, SUPPORTED_OPERATING_SYSTEMS, SUPPORTED_DEVICES, SUPPORTED_HTTP_VERSIONS } from './constants';
export declare const headerGeneratorOptionsShape: {
    browsers: import("ow").ArrayPredicate<string | {
        name: string;
        minVersion: number | undefined;
        maxVersion: number | undefined;
        httpVersion: string | undefined;
    }>;
    operatingSystems: import("ow").ArrayPredicate<string>;
    devices: import("ow").ArrayPredicate<string>;
    locales: import("ow").ArrayPredicate<string>;
    httpVersion: import("ow").StringPredicate & import("ow").BasePredicate<string | undefined>;
    browserListQuery: import("ow").StringPredicate & import("ow").BasePredicate<string | undefined>;
    strict: import("ow").BooleanPredicate & import("ow").BasePredicate<boolean | undefined>;
};
/**
 * String specifying the HTTP version to use.
 */
export type HttpVersion = (typeof SUPPORTED_HTTP_VERSIONS)[number];
/**
 * String specifying the device type to use.
 */
export type Device = (typeof SUPPORTED_DEVICES)[number];
/**
 * String specifying the operating system to use.
 */
export type OperatingSystem = (typeof SUPPORTED_OPERATING_SYSTEMS)[number];
/**
 * String specifying the browser to use.
 */
export type BrowserName = (typeof SUPPORTED_BROWSERS)[number];
export interface BrowserSpecification {
    /**
     * String representing the browser name.
     */
    name: BrowserName;
    /**
     * Minimum version of browser used.
     */
    minVersion?: number;
    /**
     * Maximum version of browser used.
     */
    maxVersion?: number;
    /**
     * HTTP version to be used for header generation (the headers differ depending on the version).
     * If not specified, the `httpVersion` specified in `HeaderGeneratorOptions` is used.
     */
    httpVersion?: HttpVersion;
}
export type BrowsersType = (BrowserSpecification | BrowserName)[];
/**
 * Options for the `HeaderGenerator` class constructor.
 */
export interface HeaderGeneratorOptions {
    /**
     * List of BrowserSpecifications to generate the headers for,
     * or one of `chrome`, `edge`, `firefox` and `safari`.
     */
    browsers: BrowsersType;
    /**
     * Browser generation query based on the real world data.
     *  For more info see the [query docs](https://github.com/browserslist/browserslist#full-list).
     *  If `browserListQuery` is passed the `browsers` array is ignored.
     */
    browserListQuery: string;
    /**
     * List of operating systems to generate the headers for.
     */
    operatingSystems: OperatingSystem[];
    /**
     * List of devices to generate the headers for.
     */
    devices: Device[];
    /**
     * List of at most 10 languages to include in the
     *  [Accept-Language](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language) request header
     *  in the language format accepted by that header, for example `en`, `en-US` or `de`.
     */
    locales: string[];
    /**
     * Http version to be used to generate headers (the headers differ depending on the version).
     *  Can be either 1 or 2. Default value is 2.
     */
    httpVersion: HttpVersion;
    /**
     * If true, the generator will throw an error if it cannot generate headers based on the input.
     *
     * By default (strict: false), the generator will try to relax some requirements and generate headers based on the relaxed input.
     */
    strict: boolean;
}
/**
 * Structured information about a browser and HTTP version used.
 */
export interface HttpBrowserObject {
    /**
     * Name of the browser used.
     */
    name: BrowserName | typeof MISSING_VALUE_DATASET_TOKEN;
    /**
     * Browser version split into parts of the semantic version number.
     */
    version: number[];
    /**
     * String containing the browser name, browser version and HTTP version (e.g. `chrome/88.0.4324.182|2`).
     */
    completeString: string;
    /**
     * HTTP version as a string ("1" or "2").
     */
    httpVersion: HttpVersion;
}
export type Headers = Record<string, string>;
/**
 * Randomly generates realistic HTTP headers based on specified options.
 */
export declare class HeaderGenerator {
    globalOptions: HeaderGeneratorOptions;
    browserListQuery: string | undefined;
    private inputGeneratorNetwork;
    private headerGeneratorNetwork;
    private uniqueBrowsers;
    private headersOrder;
    private relaxationOrder;
    /**
     * @param options Default header generation options used - unless overridden.
     */
    constructor(options?: Partial<HeaderGeneratorOptions>);
    /**
     * Generates a single set of ordered headers using a combination of the default options specified in the constructor
     * and their possible overrides provided here.
     * @param options Specifies options that should be overridden for this one call.
     * @param requestDependentHeaders Specifies known values of headers dependent on the particular request.
     */
    getHeaders(options?: Partial<HeaderGeneratorOptions>, requestDependentHeaders?: Headers, userAgentValues?: string[]): Headers;
    /**
     * Returns a new object that contains ordered headers.
     * @param headers Specifies known values of headers dependent on the particular request.
     * @param order An array of ordered header names, optional (will be deducted from `user-agent`).
     */
    orderHeaders(headers: Headers, order?: string[]): Headers;
    private _prepareBrowsersConfig;
    private _getBrowserHttpOptions;
    private _getPossibleAttributeValues;
    private _getAcceptLanguageField;
    /**
     * Extract structured information about a browser and http version in the form of an object from httpBrowserString.
     * @param httpBrowserString A string containing the browser name, version and http version, such as `chrome/88.0.4324.182|2`.
     */
    private prepareHttpBrowserObject;
    /**
     * Extract structured information about a browser in the form of an object from browserString.
     * @param browserString A string containing the browser name and version, e.g. `chrome/88.0.4324.182`.
     */
    private prepareBrowserObject;
    /**
     * Returns a new object containing header names ordered by their appearance in the given browser.
     * @param headers Non-normalized request headers
     * @returns Correct header order for the given browser.
     */
    private getOrderFromUserAgent;
}
//# sourceMappingURL=header-generator.d.ts.map