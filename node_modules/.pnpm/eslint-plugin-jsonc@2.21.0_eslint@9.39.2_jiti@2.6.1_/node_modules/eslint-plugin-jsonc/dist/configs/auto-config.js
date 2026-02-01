"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path_1 = __importDefault(require("path"));
const base = require.resolve("./base");
const baseExtend = path_1.default.extname(`${base}`) === ".ts" ? "plugin:jsonc/base" : base;
module.exports = {
    extends: [baseExtend],
    rules: {
        "jsonc/auto": "error",
    },
};
