// @ts-nocheck
"use strict";

const getCoreRules = require("./rules");

const allRules = {};

for (const [ruleId, rule] of getCoreRules()) {
  if (!rule.meta.deprecated) {
    allRules[ruleId] = "error";
  }
}
module.exports = { rules: allRules };
