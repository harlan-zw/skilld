"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path_1 = __importDefault(require("path"));
const base = require.resolve("./base");
const baseExtend = path_1.default.extname(`${base}`) === ".ts" ? "plugin:yml/base" : base;
module.exports = {
    extends: [baseExtend],
    rules: {
        "yml/no-empty-document": "error",
        "yml/no-empty-key": "error",
        "yml/no-empty-mapping-value": "error",
        "yml/no-empty-sequence-entry": "error",
        "yml/no-irregular-whitespace": "error",
        "yml/no-tab-indent": "error",
        "yml/vue-custom-block/no-parsing-error": "error",
    },
};
