"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FLAG_UNICODE_SETS = exports.FLAG_UNICODE = exports.FLAG_STICKY = exports.FLAG_MULTILINE = exports.FLAG_IGNORECASE = exports.FLAG_HAS_INDICES = exports.FLAG_DOT_ALL = exports.FLAG_GLOBAL = exports.EscapeSequenceKind = exports.RESERVED_DOUBLE_PUNCTUATOR_PATTERN = exports.RESERVED_DOUBLE_PUNCTUATOR_CP = exports.RESERVED_DOUBLE_PUNCTUATOR_CHARS = void 0;
exports.isOctalEscape = isOctalEscape;
exports.isControlEscape = isControlEscape;
exports.isHexadecimalEscape = isHexadecimalEscape;
exports.isUnicodeEscape = isUnicodeEscape;
exports.isUnicodeCodePointEscape = isUnicodeCodePointEscape;
exports.getEscapeSequenceKind = getEscapeSequenceKind;
exports.isEscapeSequence = isEscapeSequence;
exports.isHexLikeEscape = isHexLikeEscape;
exports.parseFlags = parseFlags;
const util_1 = require("./util");
const RESERVED_DOUBLE_PUNCTUATORS = "&!#$%*+,.:;<=>?@^`~-";
exports.RESERVED_DOUBLE_PUNCTUATOR_CHARS = new Set(RESERVED_DOUBLE_PUNCTUATORS);
exports.RESERVED_DOUBLE_PUNCTUATOR_CP = new Set((0, util_1.toCodePoints)(RESERVED_DOUBLE_PUNCTUATORS));
exports.RESERVED_DOUBLE_PUNCTUATOR_PATTERN = /&&|!!|##|\$\$|%%|\*\*|\+\+|,,|\.\.|::|;;|<<|==|>>|\?\?|@@|\^\^|``|~~|--/u;
function isOctalEscape(raw) {
    return /^\\[0-7]{1,3}$/u.test(raw);
}
function isControlEscape(raw) {
    return /^\\c[A-Za-z]$/u.test(raw);
}
function isHexadecimalEscape(raw) {
    return /^\\x[\dA-Fa-f]{2}$/u.test(raw);
}
function isUnicodeEscape(raw) {
    return /^\\u[\dA-Fa-f]{4}$/u.test(raw);
}
function isUnicodeCodePointEscape(raw) {
    return /^\\u\{[\dA-Fa-f]{1,8}\}$/u.test(raw);
}
var EscapeSequenceKind;
(function (EscapeSequenceKind) {
    EscapeSequenceKind["octal"] = "octal";
    EscapeSequenceKind["control"] = "control";
    EscapeSequenceKind["hexadecimal"] = "hexadecimal";
    EscapeSequenceKind["unicode"] = "unicode";
    EscapeSequenceKind["unicodeCodePoint"] = "unicode code point";
})(EscapeSequenceKind || (exports.EscapeSequenceKind = EscapeSequenceKind = {}));
function getEscapeSequenceKind(raw) {
    if (!raw.startsWith("\\")) {
        return null;
    }
    if (isOctalEscape(raw)) {
        return EscapeSequenceKind.octal;
    }
    if (isControlEscape(raw)) {
        return EscapeSequenceKind.control;
    }
    if (isHexadecimalEscape(raw)) {
        return EscapeSequenceKind.hexadecimal;
    }
    if (isUnicodeEscape(raw)) {
        return EscapeSequenceKind.unicode;
    }
    if (isUnicodeCodePointEscape(raw)) {
        return EscapeSequenceKind.unicodeCodePoint;
    }
    return null;
}
function isEscapeSequence(raw) {
    return getEscapeSequenceKind(raw) !== null;
}
function isHexLikeEscape(raw) {
    const kind = getEscapeSequenceKind(raw);
    return (kind === EscapeSequenceKind.hexadecimal ||
        kind === EscapeSequenceKind.unicode ||
        kind === EscapeSequenceKind.unicodeCodePoint);
}
exports.FLAG_GLOBAL = "g";
exports.FLAG_DOT_ALL = "s";
exports.FLAG_HAS_INDICES = "d";
exports.FLAG_IGNORECASE = "i";
exports.FLAG_MULTILINE = "m";
exports.FLAG_STICKY = "y";
exports.FLAG_UNICODE = "u";
exports.FLAG_UNICODE_SETS = "v";
const flagsCache = new Map();
function parseFlags(flags) {
    let cached = flagsCache.get(flags);
    if (cached === undefined) {
        cached = {
            dotAll: flags.includes(exports.FLAG_DOT_ALL),
            global: flags.includes(exports.FLAG_GLOBAL),
            hasIndices: flags.includes(exports.FLAG_HAS_INDICES),
            ignoreCase: flags.includes(exports.FLAG_IGNORECASE),
            multiline: flags.includes(exports.FLAG_MULTILINE),
            sticky: flags.includes(exports.FLAG_STICKY),
            unicode: flags.includes(exports.FLAG_UNICODE),
            unicodeSets: flags.includes(exports.FLAG_UNICODE_SETS),
        };
        flagsCache.set(flags, cached);
    }
    return cached;
}
