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
            "jsonc/no-bigint-literals": "error",
            "jsonc/no-binary-expression": "error",
            "jsonc/no-binary-numeric-literals": "error",
            "jsonc/no-dupe-keys": "error",
            "jsonc/no-escape-sequence-in-identifier": "error",
            "jsonc/no-floating-decimal": "error",
            "jsonc/no-hexadecimal-numeric-literals": "error",
            "jsonc/no-infinity": "error",
            "jsonc/no-multi-str": "error",
            "jsonc/no-nan": "error",
            "jsonc/no-number-props": "error",
            "jsonc/no-numeric-separators": "error",
            "jsonc/no-octal-numeric-literals": "error",
            "jsonc/no-octal": "error",
            "jsonc/no-parenthesized": "error",
            "jsonc/no-plus-sign": "error",
            "jsonc/no-regexp-literals": "error",
            "jsonc/no-sparse-arrays": "error",
            "jsonc/no-template-literals": "error",
            "jsonc/no-undefined-value": "error",
            "jsonc/no-unicode-codepoint-escapes": "error",
            "jsonc/no-useless-escape": "error",
            "jsonc/quote-props": "error",
            "jsonc/quotes": "error",
            "jsonc/space-unary-ops": "error",
            "jsonc/valid-json-number": "error",
            "jsonc/vue-custom-block/no-parsing-error": "error",
        },
    },
];
