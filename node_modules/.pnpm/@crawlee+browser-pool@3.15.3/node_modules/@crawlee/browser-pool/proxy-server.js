"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalProxyAddress = getLocalProxyAddress;
const proxy_chain_1 = require("proxy-chain");
const server = new proxy_chain_1.Server({
    port: 0,
});
server.server.unref();
const listenPromise = server.listen();
listenPromise.catch(() => { });
// https://github.com/microsoft/playwright/blob/2e4722d460b5142267e0e506ca7ea9a259556b5f/packages/playwright-core/src/server/browserContext.ts#L423-L427
async function getLocalProxyAddress() {
    await listenPromise;
    return `http://127.0.0.1:${server.port}`;
}
//# sourceMappingURL=proxy-server.js.map