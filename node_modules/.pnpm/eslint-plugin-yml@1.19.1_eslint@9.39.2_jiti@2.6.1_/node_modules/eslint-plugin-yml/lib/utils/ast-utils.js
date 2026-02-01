"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCommentToken = isCommentToken;
exports.isTokenOnSameLine = isTokenOnSameLine;
exports.isQuestion = isQuestion;
exports.isHyphen = isHyphen;
exports.isColon = isColon;
exports.isComma = isComma;
exports.isOpeningBracketToken = isOpeningBracketToken;
exports.isClosingBracketToken = isClosingBracketToken;
exports.isOpeningBraceToken = isOpeningBraceToken;
exports.isClosingBraceToken = isClosingBraceToken;
function isCommentToken(token) {
    return Boolean(token && (token.type === "Block" || token.type === "Line"));
}
function isTokenOnSameLine(left, right) {
    return left.loc.end.line === right.loc.start.line;
}
function isQuestion(token) {
    return token != null && token.type === "Punctuator" && token.value === "?";
}
function isHyphen(token) {
    return token != null && token.type === "Punctuator" && token.value === "-";
}
function isColon(token) {
    return token != null && token.type === "Punctuator" && token.value === ":";
}
function isComma(token) {
    return token != null && token.type === "Punctuator" && token.value === ",";
}
function isOpeningBracketToken(token) {
    return token != null && token.value === "[" && token.type === "Punctuator";
}
function isClosingBracketToken(token) {
    return token != null && token.value === "]" && token.type === "Punctuator";
}
function isOpeningBraceToken(token) {
    return token != null && token.value === "{" && token.type === "Punctuator";
}
function isClosingBraceToken(token) {
    return token != null && token.value === "}" && token.type === "Punctuator";
}
