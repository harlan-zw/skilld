import type { Cookie as CookieObject } from '@crawlee/types';
import { Cookie } from 'tough-cookie';
export interface ResponseLike {
    url?: string | (() => string);
    headers?: Record<string, string | string[] | undefined> | (() => Record<string, string | string[] | undefined>);
}
/**
 * @internal
 */
export declare function getCookiesFromResponse(response: ResponseLike): Cookie[];
/**
 * Calculate cookie expiration date
 * @param maxAgeSecs
 * @returns Calculated date by session max age seconds.
 * @internal
 */
export declare function getDefaultCookieExpirationDate(maxAgeSecs: number): Date;
/**
 * Transforms tough-cookie to puppeteer cookie.
 * @param toughCookie Cookie from CookieJar
 * @return Cookie compatible with browser pool
 * @internal
 */
export declare function toughCookieToBrowserPoolCookie(toughCookie: Cookie): CookieObject;
/**
 * Transforms browser-pool cookie to tough-cookie.
 * @param cookieObject Cookie object (for instance from the `page.cookies` method).
 * @internal
 */
export declare function browserPoolCookieToToughCookie(cookieObject: CookieObject, maxAgeSecs: number): Cookie;
/**
 * @internal
 * @param cookieString The cookie string to attempt parsing
 * @returns Browser pool compatible cookie, or null if cookie cannot be parsed
 */
export declare function cookieStringToToughCookie(cookieString: string): CookieObject | null;
/**
 * Merges multiple cookie strings. Keys are compared case-sensitively, warning will be logged
 * if we see two cookies with same keys but different casing.
 * @internal
 */
export declare function mergeCookies(url: string, sourceCookies: string[]): string;
//# sourceMappingURL=cookie_utils.d.ts.map