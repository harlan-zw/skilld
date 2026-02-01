"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRequestTimeout = handleRequestTimeout;
const timeout_1 = require("@apify/timeout");
/**
 * Handles timeout request
 * @internal
 */
function handleRequestTimeout({ session, errorMessage }) {
    session?.markBad();
    const timeoutMillis = errorMessage.match(/(\d+)\s?ms/)?.[1]; // first capturing group
    const timeoutSecs = Number(timeoutMillis) / 1000;
    throw new timeout_1.TimeoutError(`Navigation timed out after ${timeoutSecs} seconds.`);
}
//# sourceMappingURL=crawler_utils.js.map