"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LINEBREAK_MATCHER = exports.LINEBREAKS = void 0;
exports.createGlobalLinebreakMatcher = createGlobalLinebreakMatcher;
exports.canTokensBeAdjacent = canTokensBeAdjacent;
exports.isSurroundedBy = isSurroundedBy;
exports.isNumericLiteral = isNumericLiteral;
exports.isTokenOnSameLine = isTokenOnSameLine;
exports.getStaticPropertyName = getStaticPropertyName;
exports.getNextLocation = getNextLocation;
const jsonc_eslint_parser_1 = require("jsonc-eslint-parser");
const espree_1 = require("espree");
exports.LINEBREAKS = new Set(["\r\n", "\r", "\n", "\u2028", "\u2029"]);
exports.LINEBREAK_MATCHER = /\r\n|[\n\r\u2028\u2029]/u;
function createGlobalLinebreakMatcher() {
    return new RegExp(exports.LINEBREAK_MATCHER.source, "gu");
}
function canTokensBeAdjacent(leftValue, rightValue) {
    const espreeOptions = {
        comment: true,
        ecmaVersion: espree_1.latestEcmaVersion,
        range: true,
    };
    let leftToken;
    if (typeof leftValue === "string") {
        let tokens;
        try {
            tokens = (0, espree_1.tokenize)(leftValue, espreeOptions);
        }
        catch (_a) {
            return false;
        }
        const comments = tokens.comments;
        leftToken = tokens[tokens.length - 1];
        if (comments.length) {
            const lastComment = comments[comments.length - 1];
            if (!leftToken || lastComment.range[0] > leftToken.range[0])
                leftToken = lastComment;
        }
    }
    else {
        leftToken = leftValue;
    }
    if (leftToken.type === "Shebang" || leftToken.type === "Hashbang")
        return false;
    let rightToken;
    if (typeof rightValue === "string") {
        let tokens;
        try {
            tokens = (0, espree_1.tokenize)(rightValue, espreeOptions);
        }
        catch (_b) {
            return false;
        }
        const comments = tokens.comments;
        rightToken = tokens[0];
        if (comments.length) {
            const firstComment = comments[0];
            if (!rightToken || firstComment.range[0] < rightToken.range[0])
                rightToken = firstComment;
        }
    }
    else {
        rightToken = rightValue;
    }
    if (leftToken.type === "Punctuator" || rightToken.type === "Punctuator") {
        if (leftToken.type === "Punctuator" && rightToken.type === "Punctuator") {
            const PLUS_TOKENS = new Set(["+", "++"]);
            const MINUS_TOKENS = new Set(["-", "--"]);
            return !((PLUS_TOKENS.has(leftToken.value) &&
                PLUS_TOKENS.has(rightToken.value)) ||
                (MINUS_TOKENS.has(leftToken.value) &&
                    MINUS_TOKENS.has(rightToken.value)));
        }
        if (leftToken.type === "Punctuator" && leftToken.value === "/")
            return !["Block", "Line", "RegularExpression"].includes(rightToken.type);
        return true;
    }
    if (leftToken.type === "String" ||
        rightToken.type === "String" ||
        leftToken.type === "Template" ||
        rightToken.type === "Template")
        return true;
    if (leftToken.type !== "Numeric" &&
        rightToken.type === "Numeric" &&
        rightToken.value.startsWith("."))
        return true;
    if (leftToken.type === "Block" ||
        rightToken.type === "Block" ||
        rightToken.type === "Line")
        return true;
    if (rightToken.type === "PrivateIdentifier")
        return true;
    return false;
}
function isSurroundedBy(val, character) {
    return val.startsWith(character) && val.endsWith(character);
}
function isNumericLiteral(node) {
    return (node.type === "JSONLiteral" &&
        (typeof node.value === "number" || Boolean("bigint" in node && node.bigint)));
}
function isTokenOnSameLine(left, right) {
    var _a, _b;
    return ((_a = left === null || left === void 0 ? void 0 : left.loc) === null || _a === void 0 ? void 0 : _a.end.line) === ((_b = right === null || right === void 0 ? void 0 : right.loc) === null || _b === void 0 ? void 0 : _b.start.line);
}
function getStaticPropertyName(node) {
    let prop;
    if (node) {
        switch (node.type) {
            case "JSONProperty":
                prop = node.key;
                break;
            default:
                return null;
        }
    }
    if (prop) {
        if (prop.type === "JSONIdentifier")
            return prop.name;
        return String((0, jsonc_eslint_parser_1.getStaticJSONValue)(prop));
    }
    return null;
}
function getNextLocation(sourceCode, { column, line }) {
    if (column < sourceCode.lines[line - 1].length) {
        return {
            column: column + 1,
            line,
        };
    }
    if (line < sourceCode.lines.length) {
        return {
            column: 0,
            line: line + 1,
        };
    }
    return null;
}
