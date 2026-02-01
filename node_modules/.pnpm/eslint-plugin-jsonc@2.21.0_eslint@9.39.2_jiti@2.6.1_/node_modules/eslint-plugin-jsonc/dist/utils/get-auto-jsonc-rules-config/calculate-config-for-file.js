"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateConfigForFile = calculateConfigForFile;
const synckit_1 = require("synckit");
const getSync = (0, synckit_1.createSyncFn)(require.resolve("./worker"));
function calculateConfigForFile(cwd, fileName) {
    return getSync(cwd, fileName);
}
