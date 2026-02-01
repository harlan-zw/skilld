"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promiseMap = void 0;
exports.scheduleBackgroundTask = scheduleBackgroundTask;
const node_crypto_1 = require("node:crypto");
const fs_utils_1 = require("./fs-utils");
/**
 * A map of promises that are created when a background task is scheduled.
 * This is used in MemoryStorage#teardown to wait for all tasks to finish executing before exiting the process.
 * @internal
 */
exports.promiseMap = new Map();
function scheduleBackgroundTask(message) {
    const id = (0, node_crypto_1.randomUUID)();
    let promiseResolve;
    const promise = new Promise((res) => {
        promiseResolve = res;
    });
    exports.promiseMap.set(id, {
        promise,
        resolve: promiseResolve,
    });
    void handleBackgroundMessage({
        ...message,
        messageId: id,
    });
}
async function handleBackgroundMessage(message) {
    await (0, fs_utils_1.handleMessage)(message);
    exports.promiseMap.get(message.messageId)?.resolve();
    exports.promiseMap.delete(message.messageId);
}
//# sourceMappingURL=index.js.map