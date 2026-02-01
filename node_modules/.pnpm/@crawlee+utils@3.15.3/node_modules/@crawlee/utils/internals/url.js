"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applySearchParams = applySearchParams;
/**
 * Appends search (query string) parameters to a URL, replacing the original value (if any).
 *
 * @param url The URL to append to.
 * @param searchParams The search parameters to be appended.
 * @internal
 */
function applySearchParams(url, searchParams) {
    if (searchParams === undefined) {
        return;
    }
    if (typeof searchParams === 'string') {
        url.search = searchParams;
        return;
    }
    let newSearchParams;
    if (searchParams instanceof URLSearchParams) {
        newSearchParams = searchParams;
    }
    else {
        newSearchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(newSearchParams)) {
            if (value === undefined) {
                newSearchParams.delete(key);
            }
            else if (value === null) {
                newSearchParams.append(key, '');
            }
            else {
                newSearchParams.append(key, value);
            }
        }
    }
    url.search = newSearchParams.toString();
}
//# sourceMappingURL=url.js.map