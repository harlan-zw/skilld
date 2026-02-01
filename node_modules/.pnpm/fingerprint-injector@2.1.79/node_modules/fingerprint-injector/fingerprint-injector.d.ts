import { BrowserFingerprintWithHeaders, FingerprintGeneratorOptions } from 'fingerprint-generator';
// @ts-ignore optional peer dependency
import { BrowserContext, Browser as PWBrowser, BrowserContextOptions } from 'playwright';
// @ts-ignore optional peer dependency
import { Page, Browser as PPBrowser } from 'puppeteer';
/**
 * Fingerprint injector class.
 * @class
 */
export declare class FingerprintInjector {
    private utilsJs;
    /**
     * Some HTTP headers depend on the request (for example Accept (with values application/json, image/png) etc.).
     *  This function filters out those headers and leaves only the browser-wide ones.
     * @param headers Headers to be filtered.
     * @returns Filtered headers.
     */
    private onlyInjectableHeaders;
    /**
     * Adds init script to the browser context, so the fingerprint is changed before every document creation.
     * DISCLAIMER: Since Playwright does not support changing viewport and `user-agent` after the context is created,
     * you have to set it manually when the context is created. Check the Playwright usage example for more details.
     * @param browserContext Playwright browser context to be injected with the fingerprint.
     * @param fingerprint Browser fingerprint from [`fingerprint-generator`](https://github.com/apify/fingerprint-generator).
     */
    attachFingerprintToPlaywright(browserContext: BrowserContext, browserFingerprintWithHeaders: BrowserFingerprintWithHeaders): Promise<void>;
    /**
     * Adds script that is evaluated before every document creation.
     * Sets User-Agent and viewport using native puppeteer interface
     * @param page Puppeteer `Page` object to be injected with the fingerprint.
     * @param fingerprint Fingerprint from [`fingerprint-generator`](https://github.com/apify/fingerprint-generator).
     */
    attachFingerprintToPuppeteer(page: Page, browserFingerprintWithHeaders: BrowserFingerprintWithHeaders): Promise<void>;
    /**
     * Gets the override script that should be evaluated in the browser.
     */
    getInjectableScript(browserFingerprintWithHeaders: BrowserFingerprintWithHeaders): string;
    /**
     * Create injection function string.
     * @param fingerprint Enhanced fingerprint.
     * @returns Script overriding browser fingerprint.
     */
    private getInjectableFingerprintFunction;
    private _enhanceFingerprint;
    /**
     * Loads the contents of the `utils.js` file, which contains the helper functions for the fingerprinting script.
     *
     * Loading this file dynamically bypasses the TypeScript compiler, which would otherwise mangle the code,
     * causing errors when executing it in the browser.
     */
    private _loadUtils;
    private _randomInRange;
}
/**
 * Creates a new Playwright BrowserContext preinjected with a generated fingerprint.
 * @param browser Playwright Browser instance.
 * @param options.fingerprintOptions Options for the underlying FingerprintGenerator instance.
 * @param options.newContextOptions Options for the new context creation.
 *  > Note: Setting `userAgent` or `viewport` in `newContextOptions` will override the values from the generated fingerprint.
 * @returns BrowserContext with injected fingerprint.
 */
export declare function newInjectedContext(browser: PWBrowser, options?: {
    fingerprint?: BrowserFingerprintWithHeaders;
    fingerprintOptions?: Partial<FingerprintGeneratorOptions>;
    newContextOptions?: BrowserContextOptions;
}): Promise<BrowserContext>;
export declare function newInjectedPage(browser: PPBrowser, options?: {
    fingerprint?: BrowserFingerprintWithHeaders;
    fingerprintOptions?: Partial<FingerprintGeneratorOptions>;
}): Promise<Page>;
//# sourceMappingURL=fingerprint-injector.d.ts.map