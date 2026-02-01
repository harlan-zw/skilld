"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FingerprintGenerator = void 0;
const generative_bayesian_network_1 = require("generative-bayesian-network");
const header_generator_1 = require("header-generator");
const constants_1 = require("./constants");
/**
 * Fingerprint generator - Class for realistic browser fingerprint generation.
 */
class FingerprintGenerator extends header_generator_1.HeaderGenerator {
    /**
     * @param options Default header generation options used - unless overridden.
     */
    constructor(options = {}) {
        super(options);
        Object.defineProperty(this, "fingerprintGeneratorNetwork", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fingerprintGlobalOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.fingerprintGlobalOptions = {
            screen: options.screen,
            mockWebRTC: options.mockWebRTC,
            slim: options.slim,
        };
        this.fingerprintGeneratorNetwork = new generative_bayesian_network_1.BayesianNetwork({
            path: `${__dirname}/data_files/fingerprint-network-definition.zip`,
        });
    }
    /**
     * Generates a fingerprint and a matching set of ordered headers using a combination of the default options specified in the constructor
     * and their possible overrides provided here.
     * @param options Overrides default `FingerprintGenerator` options.
     * @param requestDependentHeaders Specifies known values of headers dependent on the particular request.
     */
    getFingerprint(options = {}, requestDependentHeaders = {}) {
        const filteredValues = {};
        for (const [key, value] of Object.entries(options)) {
            if (!value) {
                delete options[key];
            }
        }
        options = {
            ...this.fingerprintGlobalOptions,
            ...options,
        };
        const partialCSP = (() => {
            const extensiveScreen = options.screen && Object.keys(options.screen).length !== 0;
            const shouldUseExtensiveConstraints = extensiveScreen;
            if (!shouldUseExtensiveConstraints)
                return undefined;
            filteredValues.screen = extensiveScreen
                ? this.fingerprintGeneratorNetwork.nodesByName.screen.possibleValues.filter((screenString) => {
                    const screen = JSON.parse(screenString.split(constants_1.STRINGIFIED_PREFIX)[1]);
                    return (screen.width >= (options.screen?.minWidth ?? 0) &&
                        screen.width <=
                            (options.screen?.maxWidth ?? 1e5) &&
                        screen.height >=
                            (options.screen?.minHeight ?? 0) &&
                        screen.height <=
                            (options.screen?.maxHeight ?? 1e5));
                })
                : undefined;
            try {
                return generative_bayesian_network_1.utils.getConstraintClosure(this.fingerprintGeneratorNetwork, filteredValues);
            }
            catch (e) {
                if (options?.strict)
                    throw e;
                delete filteredValues.screen;
                return undefined;
            }
        })();
        for (let generateRetries = 0; generateRetries < 10; generateRetries++) {
            // Generate headers consistent with the inputs to get input-compatible user-agent and accept-language headers needed later
            const headers = super.getHeaders(options, requestDependentHeaders, partialCSP?.userAgent);
            const userAgent = 'User-Agent' in headers
                ? headers['User-Agent']
                : headers['user-agent'];
            // Generate fingerprint consistent with the generated user agent
            const fingerprint = this.fingerprintGeneratorNetwork.generateConsistentSampleWhenPossible({
                ...filteredValues,
                userAgent: [userAgent],
            });
            /* Delete any missing attributes and unpack any object/array-like attributes
             * that have been packed together to make the underlying network simpler
             */
            for (const attribute of Object.keys(fingerprint)) {
                if (fingerprint[attribute] === constants_1.MISSING_VALUE_DATASET_TOKEN) {
                    fingerprint[attribute] = null;
                }
                else if (fingerprint[attribute].startsWith(constants_1.STRINGIFIED_PREFIX)) {
                    fingerprint[attribute] = JSON.parse(fingerprint[attribute].slice(constants_1.STRINGIFIED_PREFIX.length));
                }
            }
            if (!fingerprint.screen)
                continue; // fix? sometimes, fingerprints are generated 90% empty/null. This is just a workaround.
            // Manually add the set of accepted languages required by the input
            const acceptLanguageHeaderValue = 'Accept-Language' in headers
                ? headers['Accept-Language']
                : headers['accept-language'];
            const acceptedLanguages = [];
            for (const locale of acceptLanguageHeaderValue.split(',')) {
                acceptedLanguages.push(locale.split(';')[0]);
            }
            fingerprint.languages = acceptedLanguages;
            return {
                fingerprint: {
                    ...this.transformFingerprint(fingerprint),
                    mockWebRTC: options.mockWebRTC ??
                        this.fingerprintGlobalOptions.mockWebRTC ??
                        false,
                    slim: options.slim ??
                        this.fingerprintGlobalOptions.slim ??
                        false,
                },
                headers,
            };
        }
        throw new Error('Failed to generate a consistent fingerprint after 10 attempts');
    }
    /**
     * Transforms fingerprint to the final scheme, more suitable for fingerprint manipulation and injection.
     * This schema is used in the `fingerprint-injector`.
     * @param fingerprint Fingerprint to be transformed.
     * @returns Transformed fingerprint.
     */
    transformFingerprint(fingerprint) {
        const { userAgent, userAgentData, doNotTrack, appCodeName, appName, appVersion, oscpu, webdriver, languages, platform, deviceMemory, hardwareConcurrency, product, productSub, vendor, vendorSub, maxTouchPoints, extraProperties, screen, pluginsData, audioCodecs, videoCodecs, battery, videoCard, multimediaDevices, fonts, } = fingerprint;
        const parsedMemory = parseInt(deviceMemory, 10);
        const parsedTouchPoints = parseInt(maxTouchPoints, 10);
        const navigator = {
            userAgent,
            userAgentData,
            language: languages[0],
            languages,
            platform,
            deviceMemory: Number.isNaN(parsedMemory) ? null : parsedMemory, // Firefox does not have deviceMemory available
            hardwareConcurrency: parseInt(hardwareConcurrency, 10),
            maxTouchPoints: Number.isNaN(parsedTouchPoints)
                ? 0
                : parsedTouchPoints,
            product,
            productSub,
            vendor,
            vendorSub,
            doNotTrack,
            appCodeName,
            appName,
            appVersion,
            oscpu,
            extraProperties,
            webdriver,
        };
        return {
            screen,
            navigator,
            audioCodecs,
            videoCodecs,
            pluginsData,
            battery,
            videoCard,
            multimediaDevices,
            fonts,
        };
    }
}
exports.FingerprintGenerator = FingerprintGenerator;
//# sourceMappingURL=fingerprint-generator.js.map