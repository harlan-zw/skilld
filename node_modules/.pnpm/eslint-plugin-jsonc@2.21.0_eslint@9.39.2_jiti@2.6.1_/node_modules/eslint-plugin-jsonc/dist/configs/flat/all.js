"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rules_1 = require("../../utils/rules");
const base_1 = __importDefault(require("./base"));
const all = {};
for (const rule of rules_1.rules) {
    if (rule.meta.docs.ruleId === "jsonc/sort-array-values")
        continue;
    all[rule.meta.docs.ruleId] = "error";
}
exports.default = [
    ...base_1.default,
    {
        rules: Object.assign({}, all),
    },
];
