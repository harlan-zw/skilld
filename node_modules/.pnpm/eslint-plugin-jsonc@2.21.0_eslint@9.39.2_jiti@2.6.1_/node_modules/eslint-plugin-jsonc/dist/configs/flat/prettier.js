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
            "jsonc/array-bracket-newline": "off",
            "jsonc/array-bracket-spacing": "off",
            "jsonc/array-element-newline": "off",
            "jsonc/comma-dangle": "off",
            "jsonc/comma-style": "off",
            "jsonc/indent": "off",
            "jsonc/key-spacing": "off",
            "jsonc/no-floating-decimal": "off",
            "jsonc/object-curly-newline": "off",
            "jsonc/object-curly-spacing": "off",
            "jsonc/object-property-newline": "off",
            "jsonc/quote-props": "off",
            "jsonc/quotes": "off",
            "jsonc/space-unary-ops": "off",
        },
    },
];
