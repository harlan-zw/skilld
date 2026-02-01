"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKeyValueStorageImplementation = createKeyValueStorageImplementation;
const fs_1 = require("./fs");
const memory_1 = require("./memory");
function createKeyValueStorageImplementation(options) {
    if (options.persistStorage) {
        return new fs_1.KeyValueFileSystemEntry(options);
    }
    return new memory_1.KeyValueMemoryEntry();
}
//# sourceMappingURL=index.js.map