"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNotClosingParenToken = exports.LINEBREAK_MATCHER = void 0;
exports.isCommentToken = isCommentToken;
exports.isCommaToken = isCommaToken;
exports.isEqualSign = isEqualSign;
exports.isClosingParenToken = isClosingParenToken;
exports.isClosingBracketToken = isClosingBracketToken;
exports.isClosingBraceToken = isClosingBraceToken;
exports.isTokenOnSameLine = isTokenOnSameLine;
exports.LINEBREAK_MATCHER = /\r\n|[\n\r\u2028\u2029]/u;
function isCommentToken(token) {
    return Boolean(token && token.type === "Block");
}
function isCommaToken(token) {
    return token != null && token.value === "," && token.type === "Punctuator";
}
function isEqualSign(token) {
    return token != null && token.type === "Punctuator" && token.value === "=";
}
function isClosingParenToken(token) {
    return token != null && token.value === ")" && token.type === "Punctuator";
}
exports.isNotClosingParenToken = negate(isClosingParenToken);
function isClosingBracketToken(token) {
    return token != null && token.value === "]" && token.type === "Punctuator";
}
function isClosingBraceToken(token) {
    return token != null && token.value === "}" && token.type === "Punctuator";
}
function isTokenOnSameLine(left, right) {
    return left?.loc?.end.line === right?.loc?.start.line;
}
function negate(f) {
    return ((token) => !f(token));
}
