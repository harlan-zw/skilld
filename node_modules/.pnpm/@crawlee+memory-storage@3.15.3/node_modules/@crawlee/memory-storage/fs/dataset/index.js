"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDatasetStorageImplementation = createDatasetStorageImplementation;
const fs_1 = require("./fs");
const memory_1 = require("./memory");
function createDatasetStorageImplementation(options) {
    if (options.persistStorage) {
        return new fs_1.DatasetFileSystemEntry(options);
    }
    return new memory_1.DatasetMemoryEntry();
}
//# sourceMappingURL=index.js.map