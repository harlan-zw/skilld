import type { ReadonlyFlags } from "regexp-ast-analysis";
export declare const RESERVED_DOUBLE_PUNCTUATOR_CHARS: ReadonlySet<string>;
export declare const RESERVED_DOUBLE_PUNCTUATOR_CP: ReadonlySet<number>;
export declare const RESERVED_DOUBLE_PUNCTUATOR_PATTERN: RegExp;
export declare function isOctalEscape(raw: string): boolean;
export declare function isControlEscape(raw: string): boolean;
export declare function isHexadecimalEscape(raw: string): boolean;
export declare function isUnicodeEscape(raw: string): boolean;
export declare function isUnicodeCodePointEscape(raw: string): boolean;
export declare enum EscapeSequenceKind {
    octal = "octal",
    control = "control",
    hexadecimal = "hexadecimal",
    unicode = "unicode",
    unicodeCodePoint = "unicode code point"
}
export declare function getEscapeSequenceKind(raw: string): EscapeSequenceKind | null;
export declare function isEscapeSequence(raw: string): boolean;
export declare function isHexLikeEscape(raw: string): boolean;
export declare const FLAG_GLOBAL = "g";
export declare const FLAG_DOT_ALL = "s";
export declare const FLAG_HAS_INDICES = "d";
export declare const FLAG_IGNORECASE = "i";
export declare const FLAG_MULTILINE = "m";
export declare const FLAG_STICKY = "y";
export declare const FLAG_UNICODE = "u";
export declare const FLAG_UNICODE_SETS = "v";
export declare function parseFlags(flags: string): ReadonlyFlags;
