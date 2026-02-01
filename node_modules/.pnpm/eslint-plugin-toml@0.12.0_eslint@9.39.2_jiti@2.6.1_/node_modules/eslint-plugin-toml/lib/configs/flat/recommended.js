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
            "toml/no-unreadable-number-separator": "error",
            "toml/precision-of-fractional-seconds": "error",
            "toml/precision-of-integer": "error",
            "toml/vue-custom-block/no-parsing-error": "error",
        },
    },
];
