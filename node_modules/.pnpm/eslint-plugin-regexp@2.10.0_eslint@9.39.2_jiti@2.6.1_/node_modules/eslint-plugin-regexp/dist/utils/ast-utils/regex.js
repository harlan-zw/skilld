"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFlagsRange = getFlagsRange;
exports.getFlagsLocation = getFlagsLocation;
exports.getFlagRange = getFlagRange;
exports.getFlagLocation = getFlagLocation;
const utils_1 = require("./utils");
function getFlagsRange(flagsNode) {
    if (!flagsNode) {
        return null;
    }
    if ((0, utils_1.isRegexpLiteral)(flagsNode)) {
        return [
            flagsNode.range[1] - flagsNode.regex.flags.length,
            flagsNode.range[1],
        ];
    }
    if ((0, utils_1.isStringLiteral)(flagsNode)) {
        return [flagsNode.range[0] + 1, flagsNode.range[1] - 1];
    }
    return null;
}
function getFlagsLocation(sourceCode, regexpNode, flagsNode) {
    var _a;
    const range = getFlagsRange(flagsNode);
    if (range == null) {
        return (_a = flagsNode === null || flagsNode === void 0 ? void 0 : flagsNode.loc) !== null && _a !== void 0 ? _a : regexpNode.loc;
    }
    if (range[0] === range[1]) {
        range[0]--;
    }
    return {
        start: sourceCode.getLocFromIndex(range[0]),
        end: sourceCode.getLocFromIndex(range[1]),
    };
}
function getFlagRange(sourceCode, flagsNode, flag) {
    if (!flagsNode || !flag) {
        return null;
    }
    if ((0, utils_1.isRegexpLiteral)(flagsNode)) {
        const index = flagsNode.regex.flags.indexOf(flag);
        if (index === -1) {
            return null;
        }
        const start = flagsNode.range[1] - flagsNode.regex.flags.length + index;
        return [start, start + 1];
    }
    if ((0, utils_1.isStringLiteral)(flagsNode)) {
        const index = flagsNode.value.indexOf(flag);
        if (index === -1) {
            return null;
        }
        return (0, utils_1.getStringValueRange)(sourceCode, flagsNode, index, index + 1);
    }
    return null;
}
function getFlagLocation(sourceCode, regexpNode, flagsNode, flag) {
    var _a;
    const range = getFlagRange(sourceCode, flagsNode, flag);
    if (range == null) {
        return (_a = flagsNode === null || flagsNode === void 0 ? void 0 : flagsNode.loc) !== null && _a !== void 0 ? _a : regexpNode.loc;
    }
    return {
        start: sourceCode.getLocFromIndex(range[0]),
        end: sourceCode.getLocFromIndex(range[1]),
    };
}
