"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestQueueFileSystemEntry = void 0;
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const async_queue_1 = require("@sapphire/async-queue");
const fs_extra_1 = require("fs-extra");
const fs_utils_1 = require("../../background-handler/fs-utils");
class RequestQueueFileSystemEntry {
    constructor(options) {
        Object.defineProperty(this, "filePath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fsQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new async_queue_1.AsyncQueue()
        });
        Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "directoryExists", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        /**
         * A "sweep" timeout that is created/refreshed whenever this entry is accessed/updated.
         * It exists to ensure that the entry is not kept in memory indefinitely, by sweeping it after 60 seconds of inactivity (in order to keep memory usage low)
         */
        Object.defineProperty(this, "sweepTimeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "orderNo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.filePath = (0, node_path_1.resolve)(options.storeDirectory, `${options.requestId}.json`);
    }
    async get(force = false) {
        await this.fsQueue.wait();
        this.setOrRefreshSweepTimeout();
        if (this.data && !force) {
            this.fsQueue.shift();
            return this.data;
        }
        try {
            return await (0, fs_utils_1.lockAndCallback)(this.filePath, async () => {
                const req = JSON.parse(await (0, promises_1.readFile)(this.filePath, 'utf-8'));
                this.data = req;
                this.orderNo = req.orderNo;
                return req;
            });
        }
        finally {
            this.fsQueue.shift();
        }
    }
    async update(data) {
        await this.fsQueue.wait();
        this.data = data;
        try {
            if (!this.directoryExists) {
                await (0, fs_extra_1.ensureDir)((0, node_path_1.dirname)(this.filePath));
                this.directoryExists = true;
            }
            await (0, fs_utils_1.lockAndWrite)(this.filePath, data);
            this.orderNo = data.orderNo;
        }
        finally {
            this.setOrRefreshSweepTimeout();
            this.fsQueue.shift();
        }
    }
    async delete() {
        await this.fsQueue.wait();
        await (0, promises_1.rm)(this.filePath, { force: true });
        this.fsQueue.shift();
    }
    setOrRefreshSweepTimeout() {
        if (this.sweepTimeout) {
            this.sweepTimeout.refresh();
        }
        else {
            this.sweepTimeout = setTimeout(() => {
                this.sweepTimeout = undefined;
                this.data = undefined;
            }, 60000).unref();
        }
    }
}
exports.RequestQueueFileSystemEntry = RequestQueueFileSystemEntry;
//# sourceMappingURL=fs.js.map