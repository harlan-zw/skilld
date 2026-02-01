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
            "toml/array-bracket-newline": "error",
            "toml/array-bracket-spacing": "error",
            "toml/array-element-newline": "error",
            "toml/comma-style": "error",
            "toml/indent": "error",
            "toml/inline-table-curly-spacing": "error",
            "toml/key-spacing": "error",
            "toml/keys-order": "error",
            "toml/no-space-dots": "error",
            "toml/no-unreadable-number-separator": "error",
            "toml/padding-line-between-pairs": "error",
            "toml/padding-line-between-tables": "error",
            "toml/precision-of-fractional-seconds": "error",
            "toml/precision-of-integer": "error",
            "toml/quoted-keys": "error",
            "toml/spaced-comment": "error",
            "toml/table-bracket-spacing": "error",
            "toml/tables-order": "error",
            "toml/vue-custom-block/no-parsing-error": "error",
        },
    },
];
