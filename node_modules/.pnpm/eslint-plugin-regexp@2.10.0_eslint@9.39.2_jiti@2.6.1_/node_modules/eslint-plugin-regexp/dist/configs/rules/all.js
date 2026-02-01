"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rules = void 0;
const all_rules_1 = require("../../all-rules");
const recommended_1 = require("./recommended");
const all = {};
for (const rule of all_rules_1.rules) {
    all[rule.meta.docs.ruleId] = "error";
}
exports.rules = {
    ...all,
    ...recommended_1.rules,
};
