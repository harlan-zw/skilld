"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSourceCode = getSourceCode;
exports.getFilename = getFilename;
const eslint_compat_utils_1 = require("eslint-compat-utils");
function getSourceCode(context) {
    return (0, eslint_compat_utils_1.getSourceCode)(context);
}
function getFilename(context) {
    return (0, eslint_compat_utils_1.getFilename)(context);
}
