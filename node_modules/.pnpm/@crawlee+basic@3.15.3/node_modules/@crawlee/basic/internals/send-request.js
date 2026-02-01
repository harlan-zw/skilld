"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSendRequest = createSendRequest;
const core_1 = require("@crawlee/core");
/**
 * Prepares a function to be used as the `sendRequest` context helper.
 *
 * @internal
 * @param httpClient The HTTP client that will perform the requests.
 * @param originRequest The crawling request being processed.
 * @param session The user session associated with the current request.
 * @param getProxyUrl A function that will return the proxy URL that should be used for handling the request.
 */
function createSendRequest(httpClient, originRequest, session, getProxyUrl) {
    return async (
    // TODO the type information here (and in crawler_commons) is outright wrong... for BC - replace this with generic HttpResponse in v4
    overrideOptions = {}) => {
        const cookieJar = session
            ? {
                getCookieString: async (url) => session.getCookieString(url),
                setCookie: async (rawCookie, url) => session.setCookie(rawCookie, url),
                ...overrideOptions?.cookieJar,
            }
            : overrideOptions?.cookieJar;
        const requestOptions = (0, core_1.processHttpRequestOptions)({
            url: originRequest.url,
            method: originRequest.method, // Narrow type to omit CONNECT
            headers: originRequest.headers,
            proxyUrl: getProxyUrl(),
            sessionToken: session,
            responseType: 'text',
            ...overrideOptions,
            cookieJar,
        });
        // Fill in body as the last step - `processHttpRequestOptions` may use either `body`, `json` or `form` so we cannot override it beforehand
        requestOptions.body ?? (requestOptions.body = originRequest.payload);
        return httpClient.sendRequest(requestOptions);
    };
}
//# sourceMappingURL=send-request.js.map