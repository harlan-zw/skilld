"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mentionChar = mentionChar;
exports.mention = mention;
exports.joinEnglishList = joinEnglishList;
function formatCodePoint(value) {
    return `U+${value.toString(16).padStart(4, "0")}`;
}
function mentionChar(element) {
    if (element.type === "Character") {
        const value = formatCodePoint(element.value);
        return `'${escape(element.raw)}' (${value})`;
    }
    if (element.type === "CharacterClassRange") {
        const min = formatCodePoint(element.min.value);
        const max = formatCodePoint(element.max.value);
        return `'${escape(element.raw)}' (${min} - ${max})`;
    }
    return mention(element);
}
function mention(element) {
    return `'${escape(typeof element === "string" ? element : element.raw)}'`;
}
function escape(value) {
    return (value
        .replace(/\\(?<char>[\s\S])/gu, (m, char) => {
        if (char.charCodeAt(0) < 0x20) {
            return escapeControl(char);
        }
        return m;
    })
        .replace(/[\0-\x1f]/gu, escapeControl));
}
function escapeControl(control) {
    if (control === "\t")
        return control;
    if (control === "\n")
        return "\\n";
    if (control === "\r")
        return "\\r";
    return `\\x${control.charCodeAt(0).toString(16).padStart(2, "0")}`;
}
function joinEnglishList(list) {
    if (list.length === 0)
        return "none";
    if (list.length === 1)
        return list[0];
    if (list.length === 2)
        return `${list[0]} and ${list[1]}`;
    let result = list[0];
    for (let i = 1; i < list.length - 1; i++) {
        result += `, ${list[i]}`;
    }
    result += `, and ${list[list.length - 1]}`;
    return result;
}
