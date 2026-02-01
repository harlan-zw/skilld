"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderGenerator = exports.headerGeneratorOptionsShape = void 0;
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const generative_bayesian_network_1 = require("generative-bayesian-network");
const ow_1 = tslib_1.__importDefault(require("ow"));
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const browserSpecificationShape = {
    name: ow_1.default.string,
    minVersion: ow_1.default.optional.number,
    maxVersion: ow_1.default.optional.number,
    httpVersion: ow_1.default.optional.string,
};
exports.headerGeneratorOptionsShape = {
    browsers: ow_1.default.optional.array.ofType(ow_1.default.any(ow_1.default.object.exactShape(browserSpecificationShape), ow_1.default.string.oneOf(constants_1.SUPPORTED_BROWSERS))),
    operatingSystems: ow_1.default.optional.array.ofType(ow_1.default.string.oneOf(constants_1.SUPPORTED_OPERATING_SYSTEMS)),
    devices: ow_1.default.optional.array.ofType(ow_1.default.string.oneOf(constants_1.SUPPORTED_DEVICES)),
    locales: ow_1.default.optional.array.ofType(ow_1.default.string),
    httpVersion: ow_1.default.optional.string.oneOf(constants_1.SUPPORTED_HTTP_VERSIONS),
    browserListQuery: ow_1.default.optional.string,
    strict: ow_1.default.optional.boolean,
};
/**
 * Randomly generates realistic HTTP headers based on specified options.
 */
class HeaderGenerator {
    /**
     * @param options Default header generation options used - unless overridden.
     */
    constructor(options = {}) {
        Object.defineProperty(this, "globalOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "browserListQuery", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "inputGeneratorNetwork", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "headerGeneratorNetwork", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "uniqueBrowsers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "headersOrder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "relaxationOrder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [
                'locales',
                'devices',
                'operatingSystems',
                'browsers',
                'browserListQuery',
            ]
        });
        (0, ow_1.default)(options, 'HeaderGeneratorOptions', ow_1.default.object.partialShape(exports.headerGeneratorOptionsShape));
        // Use a default setup when the necessary values are not provided
        const { browsers = constants_1.SUPPORTED_BROWSERS, operatingSystems = constants_1.SUPPORTED_OPERATING_SYSTEMS, devices = ['desktop'], locales = ['en-US'], httpVersion = '2', browserListQuery = '', strict = false, } = options;
        this.globalOptions = {
            browsers: this._prepareBrowsersConfig(browsers, browserListQuery, httpVersion),
            operatingSystems,
            devices,
            locales,
            httpVersion,
            browserListQuery,
            strict,
        };
        this.uniqueBrowsers = [];
        this.headersOrder = JSON.parse((0, fs_1.readFileSync)(`${__dirname}/data_files/headers-order.json`).toString());
        const uniqueBrowserStrings = JSON.parse((0, fs_1.readFileSync)(`${__dirname}/data_files/browser-helper-file.json`, 'utf8').toString());
        for (const browserString of uniqueBrowserStrings) {
            // There are headers without user agents in the datasets we used to configure the generator. They should be disregarded.
            if (browserString !== constants_1.MISSING_VALUE_DATASET_TOKEN) {
                this.uniqueBrowsers.push(this.prepareHttpBrowserObject(browserString));
            }
        }
        this.inputGeneratorNetwork = new generative_bayesian_network_1.BayesianNetwork({
            path: `${__dirname}/data_files/input-network-definition.zip`,
        });
        this.headerGeneratorNetwork = new generative_bayesian_network_1.BayesianNetwork({
            path: `${__dirname}/data_files/header-network-definition.zip`,
        });
    }
    /**
     * Generates a single set of ordered headers using a combination of the default options specified in the constructor
     * and their possible overrides provided here.
     * @param options Specifies options that should be overridden for this one call.
     * @param requestDependentHeaders Specifies known values of headers dependent on the particular request.
     */
    getHeaders(options = {}, requestDependentHeaders = {}, userAgentValues) {
        (0, ow_1.default)(options, 'HeaderGeneratorOptions', ow_1.default.object.partialShape(exports.headerGeneratorOptionsShape));
        for (const [key, value] of Object.entries(options)) {
            if (!value) {
                delete options[key];
            }
        }
        const headerOptions = { ...this.globalOptions, ...options };
        const possibleAttributeValues = this._getPossibleAttributeValues(headerOptions);
        const [http1Constraints, http2Constraints] = userAgentValues
            ? [
                generative_bayesian_network_1.utils.getConstraintClosure(this.headerGeneratorNetwork, {
                    'User-Agent': userAgentValues,
                }),
                generative_bayesian_network_1.utils.getConstraintClosure(this.headerGeneratorNetwork, {
                    'user-agent': userAgentValues,
                }),
            ]
            : [null, null];
        const inputConstraints = Object.entries(possibleAttributeValues).reduce((acc, [key, value]) => {
            if (key === '*BROWSER_HTTP') {
                acc[key] = value.filter((x) => {
                    const [browserName, httpVersion] = x.split('|');
                    let httpValues = http2Constraints;
                    if (httpVersion === '1' ||
                        !http2Constraints ||
                        Object.keys(http2Constraints).length === 0) {
                        httpValues = http1Constraints;
                    }
                    return (httpValues?.['*BROWSER'].includes(browserName) ??
                        true);
                });
                return acc;
            }
            acc[key] = value.filter((x) => (http1Constraints?.[key]?.includes(x) ||
                http2Constraints?.[key]?.includes(x)) ??
                true);
            return acc;
        }, {});
        // Generate a sample of input attributes consistent with the data used to create the definition files if possible.
        const inputSample = this.inputGeneratorNetwork.generateConsistentSampleWhenPossible(inputConstraints);
        if (Object.keys(inputSample).length === 0) {
            // Try to convert HTTP/2 headers to HTTP/1 headers
            if (headerOptions.httpVersion === '1') {
                const headers2 = this.getHeaders({
                    ...options,
                    httpVersion: '2',
                }, requestDependentHeaders, userAgentValues);
                const pascalize = (name) => {
                    return name
                        .split('-')
                        .map((part) => {
                        return (part[0].toUpperCase() +
                            part.slice(1).toLowerCase());
                    })
                        .join('-');
                };
                const converted2to1 = Object.fromEntries(Object.entries(headers2).map(([name, value]) => {
                    if (name.startsWith('sec-ch-ua')) {
                        return [name, value];
                    }
                    if (['dnt', 'rtt', 'ect'].includes(name)) {
                        return [name.toUpperCase(), value];
                    }
                    return [pascalize(name), value];
                }));
                return this.orderHeaders(converted2to1);
            }
            const relaxationIndex = this.relaxationOrder.findIndex((key) => options[key] !== undefined);
            if (options.strict || relaxationIndex === -1) {
                throw new Error('No headers based on this input can be generated. Please relax or change some of the requirements you specified.');
            }
            // Relax the requirements and try again
            const relaxedOptions = { ...options };
            const relaxationKey = this.relaxationOrder[relaxationIndex];
            delete relaxedOptions[relaxationKey];
            return this.getHeaders(relaxedOptions, requestDependentHeaders, userAgentValues);
        }
        // Generate the actual headers
        const generatedSample = this.headerGeneratorNetwork.generateSample(inputSample);
        // Manually fill the accept-language header with random ordering of the locales from input
        const generatedHttpAndBrowser = this.prepareHttpBrowserObject(generatedSample[constants_1.BROWSER_HTTP_NODE_NAME]);
        let secFetchAttributeNames = constants_1.HTTP2_SEC_FETCH_ATTRIBUTES;
        let acceptLanguageFieldName = 'accept-language';
        if (generatedHttpAndBrowser.httpVersion !== '2') {
            acceptLanguageFieldName = 'Accept-Language';
            secFetchAttributeNames = constants_1.HTTP1_SEC_FETCH_ATTRIBUTES;
        }
        generatedSample[acceptLanguageFieldName] = this._getAcceptLanguageField(headerOptions.locales);
        const isChrome = generatedHttpAndBrowser.name === 'chrome';
        const isFirefox = generatedHttpAndBrowser.name === 'firefox';
        const isEdge = generatedHttpAndBrowser.name === 'edge';
        const hasSecFetch = (isChrome && generatedHttpAndBrowser.version[0] >= 76) ||
            (isFirefox && generatedHttpAndBrowser.version[0] >= 90) ||
            (isEdge && generatedHttpAndBrowser.version[0] >= 79);
        // Add fixed headers if needed
        if (hasSecFetch) {
            generatedSample[secFetchAttributeNames.site] = 'same-site';
            generatedSample[secFetchAttributeNames.mode] = 'navigate';
            generatedSample[secFetchAttributeNames.user] = '?1';
            generatedSample[secFetchAttributeNames.dest] = 'document';
        }
        for (const attribute of Object.keys(generatedSample)) {
            if (attribute.toLowerCase() === 'connection' &&
                generatedSample[attribute] === 'close')
                delete generatedSample[attribute];
            if (attribute.startsWith('*') ||
                generatedSample[attribute] === constants_1.MISSING_VALUE_DATASET_TOKEN)
                delete generatedSample[attribute];
        }
        // Order the headers in an order depending on the browser
        return this.orderHeaders({
            ...generatedSample,
            ...requestDependentHeaders,
        }, this.headersOrder[generatedHttpAndBrowser.name]);
    }
    /**
     * Returns a new object that contains ordered headers.
     * @param headers Specifies known values of headers dependent on the particular request.
     * @param order An array of ordered header names, optional (will be deducted from `user-agent`).
     */
    orderHeaders(headers, order = this.getOrderFromUserAgent(headers)) {
        const orderedSample = {};
        for (const attribute of order) {
            if (attribute in headers) {
                orderedSample[attribute] = headers[attribute];
            }
        }
        for (const attribute of Object.keys(headers)) {
            if (!order.includes(attribute)) {
                orderedSample[attribute] = headers[attribute];
            }
        }
        return orderedSample;
    }
    _prepareBrowsersConfig(browsers, browserListQuery, httpVersion) {
        let finalBrowsers = browsers;
        if (browserListQuery) {
            finalBrowsers = (0, utils_1.getBrowsersFromQuery)(browserListQuery);
        }
        return finalBrowsers.map((browser) => {
            if (typeof browser === 'string') {
                return { name: browser, httpVersion };
            }
            browser.httpVersion = httpVersion;
            return browser;
        });
    }
    _getBrowserHttpOptions(browsers) {
        const browserHttpOptions = [];
        for (const browser of browsers) {
            for (const browserOption of this.uniqueBrowsers) {
                if (browser.name === browserOption.name) {
                    const browserMajorVersion = browserOption.version[0];
                    if ((!browser.minVersion ||
                        browser.minVersion <= browserMajorVersion) &&
                        (!browser.maxVersion ||
                            browser.maxVersion >= browserMajorVersion) &&
                        browser.httpVersion === browserOption.httpVersion) {
                        browserHttpOptions.push(browserOption.completeString);
                    }
                }
            }
        }
        return browserHttpOptions;
    }
    _getPossibleAttributeValues(headerOptions) {
        const { browsers: optionsBrowser, browserListQuery, httpVersion, operatingSystems, } = headerOptions;
        const browsers = this._prepareBrowsersConfig(optionsBrowser, browserListQuery, httpVersion);
        // Find known browsers compatible with the input
        const browserHttpOptions = this._getBrowserHttpOptions(browsers);
        const possibleAttributeValues = {};
        possibleAttributeValues[constants_1.BROWSER_HTTP_NODE_NAME] = browserHttpOptions;
        possibleAttributeValues[constants_1.OPERATING_SYSTEM_NODE_NAME] = operatingSystems;
        if (headerOptions.devices) {
            possibleAttributeValues[constants_1.DEVICE_NODE_NAME] = headerOptions.devices;
        }
        return possibleAttributeValues;
    }
    _getAcceptLanguageField(localesFromOptions) {
        let locales = localesFromOptions;
        let highLevelLocales = [];
        for (const locale of locales) {
            if (!locale.includes('-')) {
                highLevelLocales.push(locale);
            }
        }
        for (const locale of locales) {
            if (!highLevelLocales.includes(locale)) {
                let highLevelEquivalentPresent = false;
                for (const highLevelLocale of highLevelLocales) {
                    if (locale.includes(highLevelLocale)) {
                        highLevelEquivalentPresent = true;
                        break;
                    }
                }
                if (!highLevelEquivalentPresent)
                    highLevelLocales.push(locale);
            }
        }
        highLevelLocales = (0, utils_1.shuffleArray)(highLevelLocales);
        locales = (0, utils_1.shuffleArray)(locales);
        const localesInAddingOrder = [];
        for (const highLevelLocale of highLevelLocales) {
            for (const locale of locales) {
                if (locale.includes(highLevelLocale) &&
                    !highLevelLocales.includes(locale)) {
                    localesInAddingOrder.push(locale);
                }
            }
            localesInAddingOrder.push(highLevelLocale);
        }
        let acceptLanguageFieldValue = localesInAddingOrder[0];
        for (let x = 1; x < localesInAddingOrder.length; x++) {
            acceptLanguageFieldValue += `,${localesInAddingOrder[x]};q=${1 - x * 0.1}`;
        }
        return acceptLanguageFieldValue;
    }
    /**
     * Extract structured information about a browser and http version in the form of an object from httpBrowserString.
     * @param httpBrowserString A string containing the browser name, version and http version, such as `chrome/88.0.4324.182|2`.
     */
    prepareHttpBrowserObject(httpBrowserString) {
        const [browserString, httpVersion] = httpBrowserString.split('|');
        let browserObject;
        if (browserString === constants_1.MISSING_VALUE_DATASET_TOKEN) {
            browserObject = { name: constants_1.MISSING_VALUE_DATASET_TOKEN };
        }
        else {
            browserObject = this.prepareBrowserObject(browserString);
        }
        return {
            ...browserObject,
            httpVersion: httpVersion,
            completeString: httpBrowserString,
        };
    }
    /**
     * Extract structured information about a browser in the form of an object from browserString.
     * @param browserString A string containing the browser name and version, e.g. `chrome/88.0.4324.182`.
     */
    prepareBrowserObject(browserString) {
        const nameVersionSplit = browserString.split('/');
        const versionSplit = nameVersionSplit[1].split('.');
        const preparedVersion = [];
        for (const versionPart of versionSplit) {
            preparedVersion.push(parseInt(versionPart, 10));
        }
        return {
            name: nameVersionSplit[0],
            version: preparedVersion,
            completeString: browserString,
        };
    }
    /**
     * Returns a new object containing header names ordered by their appearance in the given browser.
     * @param headers Non-normalized request headers
     * @returns Correct header order for the given browser.
     */
    getOrderFromUserAgent(headers) {
        const userAgent = (0, utils_1.getUserAgent)(headers);
        const browser = (0, utils_1.getBrowser)(userAgent);
        if (!browser) {
            return [];
        }
        return this.headersOrder[browser] ?? [];
    }
}
exports.HeaderGenerator = HeaderGenerator;
//# sourceMappingURL=header-generator.js.map