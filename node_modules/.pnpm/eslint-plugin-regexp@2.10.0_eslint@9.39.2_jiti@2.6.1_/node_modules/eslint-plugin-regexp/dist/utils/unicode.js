"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CP_PARAGRAPH_SEPARATOR = exports.CP_LINE_SEPARATOR = exports.CP_RLM = exports.CP_LRM = exports.CP_ZWJ = exports.CP_ZWNJ = exports.CP_ZWSP = exports.CP_HAIR_SPACE = exports.CP_EN_QUAD = exports.CP_MONGOLIAN_VOWEL_SEPARATOR = exports.CP_OGHAM_SPACE_MARK = exports.CP_NBSP = exports.CP_NEL = exports.CP_TILDE = exports.CP_CLOSING_BRACE = exports.CP_PIPE = exports.CP_OPENING_BRACE = exports.CP_APOSTROPHE = exports.CP_BACKTICK = exports.CP_CARET = exports.CP_CLOSING_BRACKET = exports.CP_BACK_SLASH = exports.CP_OPENING_BRACKET = exports.CP_AT = exports.CP_QUESTION = exports.CP_GT = exports.CP_EQ = exports.CP_LT = exports.CP_SEMI = exports.CP_COLON = exports.CP_SLASH = exports.CP_DOT = exports.CP_MINUS = exports.CP_COMMA = exports.CP_PLUS = exports.CP_STAR = exports.CP_CLOSING_PAREN = exports.CP_OPENING_PAREN = exports.CP_AMP = exports.CP_PERCENT = exports.CP_DOLLAR = exports.CP_HASH = exports.CP_BAN = exports.CP_SPACE = exports.CP_CR = exports.CP_FF = exports.CP_VT = exports.CP_LF = exports.CP_TAB = exports.CP_BACKSPACE = void 0;
exports.CP_RANGE_CAPITAL_LETTER = exports.CP_RANGE_SMALL_LETTER = exports.CP_LOW_LINE = exports.CP_CAPITAL_Z = exports.CP_CAPITAL_A = exports.CP_SMALL_Z = exports.CP_SMALL_A = exports.CP_DIGIT_NINE = exports.CP_DIGIT_ZERO = exports.CP_BOM = exports.CP_IDEOGRAPHIC_SPACE = exports.CP_BRAILLE_PATTERN_BLANK = exports.CP_MMSP = exports.CP_NNBSP = void 0;
exports.isDigit = isDigit;
exports.isLowercaseLetter = isLowercaseLetter;
exports.isUppercaseLetter = isUppercaseLetter;
exports.isLetter = isLetter;
exports.toLowerCodePoint = toLowerCodePoint;
exports.toUpperCodePoint = toUpperCodePoint;
exports.isSymbol = isSymbol;
exports.isSpace = isSpace;
exports.isWord = isWord;
exports.isInvisible = isInvisible;
const regexp_ast_analysis_1 = require("regexp-ast-analysis");
exports.CP_BACKSPACE = 8;
exports.CP_TAB = 9;
exports.CP_LF = 10;
exports.CP_VT = 11;
exports.CP_FF = 12;
exports.CP_CR = 13;
exports.CP_SPACE = " ".codePointAt(0);
exports.CP_BAN = "!".codePointAt(0);
exports.CP_HASH = "#".codePointAt(0);
exports.CP_DOLLAR = "$".codePointAt(0);
exports.CP_PERCENT = "%".codePointAt(0);
exports.CP_AMP = "&".codePointAt(0);
exports.CP_OPENING_PAREN = "(".codePointAt(0);
exports.CP_CLOSING_PAREN = ")".codePointAt(0);
exports.CP_STAR = "*".codePointAt(0);
exports.CP_PLUS = "+".codePointAt(0);
exports.CP_COMMA = ",".codePointAt(0);
exports.CP_MINUS = "-".codePointAt(0);
exports.CP_DOT = ".".codePointAt(0);
exports.CP_SLASH = "/".codePointAt(0);
exports.CP_COLON = ":".codePointAt(0);
exports.CP_SEMI = ";".codePointAt(0);
exports.CP_LT = "<".codePointAt(0);
exports.CP_EQ = "=".codePointAt(0);
exports.CP_GT = ">".codePointAt(0);
exports.CP_QUESTION = "?".codePointAt(0);
exports.CP_AT = "@".codePointAt(0);
exports.CP_OPENING_BRACKET = "[".codePointAt(0);
exports.CP_BACK_SLASH = "\\".codePointAt(0);
exports.CP_CLOSING_BRACKET = "]".codePointAt(0);
exports.CP_CARET = "^".codePointAt(0);
exports.CP_BACKTICK = "`".codePointAt(0);
exports.CP_APOSTROPHE = "'".codePointAt(0);
exports.CP_OPENING_BRACE = "{".codePointAt(0);
exports.CP_PIPE = "|".codePointAt(0);
exports.CP_CLOSING_BRACE = "}".codePointAt(0);
exports.CP_TILDE = "~".codePointAt(0);
exports.CP_NEL = "\u0085".codePointAt(0);
exports.CP_NBSP = "\u00a0".codePointAt(0);
exports.CP_OGHAM_SPACE_MARK = "\u1680".codePointAt(0);
exports.CP_MONGOLIAN_VOWEL_SEPARATOR = "\u180e".codePointAt(0);
exports.CP_EN_QUAD = "\u2000".codePointAt(0);
exports.CP_HAIR_SPACE = "\u200a".codePointAt(0);
exports.CP_ZWSP = "\u200b".codePointAt(0);
exports.CP_ZWNJ = "\u200c".codePointAt(0);
exports.CP_ZWJ = "\u200d".codePointAt(0);
exports.CP_LRM = "\u200e".codePointAt(0);
exports.CP_RLM = "\u200f".codePointAt(0);
exports.CP_LINE_SEPARATOR = "\u2028".codePointAt(0);
exports.CP_PARAGRAPH_SEPARATOR = "\u2029".codePointAt(0);
exports.CP_NNBSP = "\u202f".codePointAt(0);
exports.CP_MMSP = "\u205f".codePointAt(0);
exports.CP_BRAILLE_PATTERN_BLANK = "\u2800".codePointAt(0);
exports.CP_IDEOGRAPHIC_SPACE = "\u3000".codePointAt(0);
exports.CP_BOM = "\ufeff".codePointAt(0);
exports.CP_DIGIT_ZERO = "0".codePointAt(0);
exports.CP_DIGIT_NINE = "9".codePointAt(0);
exports.CP_SMALL_A = "a".codePointAt(0);
exports.CP_SMALL_Z = "z".codePointAt(0);
exports.CP_CAPITAL_A = "A".codePointAt(0);
exports.CP_CAPITAL_Z = "Z".codePointAt(0);
exports.CP_LOW_LINE = "_".codePointAt(0);
exports.CP_RANGE_SMALL_LETTER = [exports.CP_SMALL_A, exports.CP_SMALL_Z];
exports.CP_RANGE_CAPITAL_LETTER = [exports.CP_CAPITAL_A, exports.CP_CAPITAL_Z];
function isCodePointInRange(codePoint, [start, end]) {
    return start <= codePoint && codePoint <= end;
}
function isDigit(codePoint) {
    return regexp_ast_analysis_1.Chars.digit({}).has(codePoint);
}
function isLowercaseLetter(codePoint) {
    return isCodePointInRange(codePoint, exports.CP_RANGE_SMALL_LETTER);
}
function isUppercaseLetter(codePoint) {
    return isCodePointInRange(codePoint, exports.CP_RANGE_CAPITAL_LETTER);
}
function isLetter(codePoint) {
    return isLowercaseLetter(codePoint) || isUppercaseLetter(codePoint);
}
function toLowerCodePoint(codePoint) {
    if (isUppercaseLetter(codePoint)) {
        return codePoint + 0x0020;
    }
    return codePoint;
}
function toUpperCodePoint(codePoint) {
    if (isLowercaseLetter(codePoint)) {
        return codePoint - 0x0020;
    }
    return codePoint;
}
function isSymbol(codePoint) {
    return (isCodePointInRange(codePoint, [exports.CP_BAN, exports.CP_SLASH]) ||
        isCodePointInRange(codePoint, [exports.CP_COLON, exports.CP_AT]) ||
        isCodePointInRange(codePoint, [exports.CP_OPENING_BRACKET, exports.CP_BACKTICK]) ||
        isCodePointInRange(codePoint, [exports.CP_OPENING_BRACE, exports.CP_TILDE]));
}
function isSpace(codePoint) {
    return regexp_ast_analysis_1.Chars.space({}).has(codePoint);
}
function isWord(codePoint) {
    return regexp_ast_analysis_1.Chars.word({}).has(codePoint);
}
function isInvisible(codePoint) {
    if (isSpace(codePoint)) {
        return true;
    }
    return (codePoint === exports.CP_MONGOLIAN_VOWEL_SEPARATOR ||
        codePoint === exports.CP_NEL ||
        codePoint === exports.CP_ZWSP ||
        codePoint === exports.CP_ZWNJ ||
        codePoint === exports.CP_ZWJ ||
        codePoint === exports.CP_LRM ||
        codePoint === exports.CP_RLM ||
        codePoint === exports.CP_BRAILLE_PATTERN_BLANK);
}
