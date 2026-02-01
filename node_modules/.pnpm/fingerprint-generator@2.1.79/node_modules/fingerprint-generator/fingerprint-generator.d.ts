import { HeaderGenerator, HeaderGeneratorOptions, Headers } from 'header-generator';
export type ScreenFingerprint = {
    availHeight: number;
    availWidth: number;
    availTop: number;
    availLeft: number;
    colorDepth: number;
    height: number;
    pixelDepth: number;
    width: number;
    devicePixelRatio: number;
    pageXOffset: number;
    pageYOffset: number;
    innerHeight: number;
    outerHeight: number;
    outerWidth: number;
    innerWidth: number;
    screenX: number;
    clientWidth: number;
    clientHeight: number;
    hasHDR: boolean;
};
export type Brand = {
    brand: string;
    version: string;
};
export type UserAgentData = {
    brands: Brand[];
    mobile: boolean;
    platform: string;
    architecture: string;
    bitness: string;
    fullVersionList: Brand[];
    model: string;
    platformVersion: string;
    uaFullVersion: string;
};
export type ExtraProperties = {
    vendorFlavors: string[];
    isBluetoothSupported: boolean;
    globalPrivacyControl: null;
    pdfViewerEnabled: boolean;
    installedApps: any[];
};
export type NavigatorFingerprint = {
    userAgent: string;
    userAgentData: UserAgentData;
    doNotTrack: string;
    appCodeName: string;
    appName: string;
    appVersion: string;
    oscpu: string;
    webdriver: string;
    language: string;
    languages: string[];
    platform: string;
    deviceMemory?: number;
    hardwareConcurrency: number;
    product: string;
    productSub: string;
    vendor: string;
    vendorSub: string;
    maxTouchPoints?: number;
    extraProperties: ExtraProperties;
};
export type VideoCard = {
    renderer: string;
    vendor: string;
};
export type Fingerprint = {
    screen: ScreenFingerprint;
    navigator: NavigatorFingerprint;
    videoCodecs: Record<string, string>;
    audioCodecs: Record<string, string>;
    pluginsData: Record<string, string>;
    battery?: Record<string, string>;
    videoCard: VideoCard;
    multimediaDevices: string[];
    fonts: string[];
    mockWebRTC: boolean;
    slim?: boolean;
};
export type BrowserFingerprintWithHeaders = {
    headers: Headers;
    fingerprint: Fingerprint;
};
export interface FingerprintGeneratorOptions extends HeaderGeneratorOptions {
    /**
     * Defines the screen dimensions of the generated fingerprint.
     *
     * **Note:** Using this option can lead to a substantial performance drop (~0.0007s/fingerprint -> ~0.03s/fingerprint)
     */
    screen: {
        minWidth?: number;
        maxWidth?: number;
        minHeight?: number;
        maxHeight?: number;
    };
    mockWebRTC?: boolean;
    /**
     * Enables the slim mode for the fingerprint injection.
     * This disables some performance-heavy evasions, but might decrease benchmark scores.
     *
     * Try enabling this if you are experiencing performance issues with the fingerprint injection.
     */
    slim?: boolean;
}
/**
 * Fingerprint generator - Class for realistic browser fingerprint generation.
 */
export declare class FingerprintGenerator extends HeaderGenerator {
    fingerprintGeneratorNetwork: any;
    fingerprintGlobalOptions: Partial<Omit<FingerprintGeneratorOptions, keyof HeaderGeneratorOptions>>;
    /**
     * @param options Default header generation options used - unless overridden.
     */
    constructor(options?: Partial<FingerprintGeneratorOptions>);
    /**
     * Generates a fingerprint and a matching set of ordered headers using a combination of the default options specified in the constructor
     * and their possible overrides provided here.
     * @param options Overrides default `FingerprintGenerator` options.
     * @param requestDependentHeaders Specifies known values of headers dependent on the particular request.
     */
    getFingerprint(options?: Partial<FingerprintGeneratorOptions>, requestDependentHeaders?: Headers): BrowserFingerprintWithHeaders;
    /**
     * Transforms fingerprint to the final scheme, more suitable for fingerprint manipulation and injection.
     * This schema is used in the `fingerprint-injector`.
     * @param fingerprint Fingerprint to be transformed.
     * @returns Transformed fingerprint.
     */
    private transformFingerprint;
}
//# sourceMappingURL=fingerprint-generator.d.ts.map