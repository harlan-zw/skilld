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
        "yml/block-mapping-colon-indicator-newline": "off",
        "yml/block-mapping-question-indicator-newline": "off",
        "yml/block-sequence-hyphen-indicator-newline": "off",
        "yml/flow-mapping-curly-newline": "off",
        "yml/flow-mapping-curly-spacing": "off",
        "yml/flow-sequence-bracket-newline": "off",
        "yml/flow-sequence-bracket-spacing": "off",
        "yml/indent": "off",
        "yml/key-spacing": "off",
        "yml/no-multiple-empty-lines": "off",
        "yml/no-trailing-zeros": "off",
        "yml/quotes": "off",
    },
};
