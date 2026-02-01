// @ts-nocheck
"use strict";

let ruleMap;

/** Get all rules */
module.exports = function getCoreRules() {
  const eslint = require("eslint");
  try {
    return ruleMap || (ruleMap = new eslint.Linter().getRules());
  } catch {
    // getRules() is no longer available in flat config.
  }

  const { builtinRules } = require("eslint/use-at-your-own-risk");
  return builtinRules;
};
