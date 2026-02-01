'use strict';

const convertConfig = require('./eslint-compat-utils.qhMYaZlL.cjs');

function getUnsupported() {
  return convertConfig.safeRequire("eslint/use-at-your-own-risk") || {};
}

exports.getUnsupported = getUnsupported;
