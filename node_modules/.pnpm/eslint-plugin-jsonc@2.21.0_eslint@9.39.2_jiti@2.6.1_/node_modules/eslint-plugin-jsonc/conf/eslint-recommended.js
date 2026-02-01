// @ts-nocheck
"use strict";

const getCoreRules = require("./rules");

const rules = {};

for (const [ruleId, rule] of getCoreRules()) {
  if (rule.meta.docs.recommended && !rule.meta.deprecated) {
    rules[ruleId] = "error";
  }
}
module.exports = {
  rules,
};
