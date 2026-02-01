"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
exports.default = [
    ...base_1.default,
    {
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
    },
];
