"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const rules_1 = require("../utils/rules");
const path_1 = __importDefault(require("path"));
const base = require.resolve("./base");
const baseExtend = path_1.default.extname(`${base}`) === ".ts" ? "plugin:jsonc/base" : base;
const all = {};
for (const rule of rules_1.rules) {
    if (rule.meta.docs.ruleId === "jsonc/sort-array-values")
        continue;
    all[rule.meta.docs.ruleId] = "error";
}
module.exports = {
    extends: [baseExtend],
    rules: Object.assign({}, all),
};
