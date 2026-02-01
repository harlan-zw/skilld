const WINDOWS_1252_EXTRA = {
    0x80: "€", 0x82: "‚", 0x83: "ƒ", 0x84: "„", 0x85: "…", 0x86: "†",
    0x87: "‡", 0x88: "ˆ", 0x89: "‰", 0x8a: "Š", 0x8b: "‹", 0x8c: "Œ",
    0x8e: "Ž", 0x91: "‘", 0x92: "’", 0x93: "“", 0x94: "”", 0x95: "•",
    0x96: "–", 0x97: "—", 0x98: "˜", 0x99: "™", 0x9a: "š", 0x9b: "›",
    0x9c: "œ", 0x9e: "ž", 0x9f: "Ÿ",
};
const WINDOWS_1252_REVERSE = {};
for (const [code, char] of Object.entries(WINDOWS_1252_EXTRA)) {
    WINDOWS_1252_REVERSE[char] = Number.parseInt(code, 10);
}
// ---------- Cached decoders/encoders ----------
let _utf8Decoder;
let _utf8Encoder;
function utf8Decoder() {
    if (typeof globalThis.TextDecoder === "undefined")
        return undefined;
    return (_utf8Decoder !== null && _utf8Decoder !== void 0 ? _utf8Decoder : (_utf8Decoder = new globalThis.TextDecoder("utf-8")));
}
function utf8Encoder() {
    if (typeof globalThis.TextEncoder === "undefined")
        return undefined;
    return (_utf8Encoder !== null && _utf8Encoder !== void 0 ? _utf8Encoder : (_utf8Encoder = new globalThis.TextEncoder()));
}
// Safe chunk size well under your measured ~105k cliff.
// 32k keeps memory reasonable and is plenty fast.
const CHUNK = 32 * 1024;
/**
 * Decode text from binary data
 * @param bytes Binary data
 * @param encoding Encoding
 */
export function textDecode(bytes, encoding = "utf-8") {
    switch (encoding.toLowerCase()) {
        case "utf-8":
        case "utf8": {
            const dec = utf8Decoder();
            return dec ? dec.decode(bytes) : decodeUTF8(bytes);
        }
        case "utf-16le":
            return decodeUTF16LE(bytes);
        case "us-ascii":
        case "ascii":
            return decodeASCII(bytes);
        case "latin1":
        case "iso-8859-1":
            return decodeLatin1(bytes);
        case "windows-1252":
            return decodeWindows1252(bytes);
        default:
            throw new RangeError(`Encoding '${encoding}' not supported`);
    }
}
export function textEncode(input = "", encoding = "utf-8") {
    switch (encoding.toLowerCase()) {
        case "utf-8":
        case "utf8": {
            const enc = utf8Encoder();
            return enc ? enc.encode(input) : encodeUTF8(input);
        }
        case "utf-16le":
            return encodeUTF16LE(input);
        case "us-ascii":
        case "ascii":
            return encodeASCII(input);
        case "latin1":
        case "iso-8859-1":
            return encodeLatin1(input);
        case "windows-1252":
            return encodeWindows1252(input);
        default:
            throw new RangeError(`Encoding '${encoding}' not supported`);
    }
}
// --- Internal helpers ---
function decodeUTF8(bytes) {
    const parts = [];
    let out = "";
    let i = 0;
    while (i < bytes.length) {
        const b1 = bytes[i++];
        if (b1 < 0x80) {
            out += String.fromCharCode(b1);
        }
        else if (b1 < 0xe0) {
            const b2 = bytes[i++] & 0x3f;
            out += String.fromCharCode(((b1 & 0x1f) << 6) | b2);
        }
        else if (b1 < 0xf0) {
            const b2 = bytes[i++] & 0x3f;
            const b3 = bytes[i++] & 0x3f;
            out += String.fromCharCode(((b1 & 0x0f) << 12) | (b2 << 6) | b3);
        }
        else {
            const b2 = bytes[i++] & 0x3f;
            const b3 = bytes[i++] & 0x3f;
            const b4 = bytes[i++] & 0x3f;
            let cp = ((b1 & 0x07) << 18) | (b2 << 12) | (b3 << 6) | b4;
            cp -= 0x10000;
            out += String.fromCharCode(0xd800 + ((cp >> 10) & 0x3ff), 0xdc00 + (cp & 0x3ff));
        }
        if (out.length >= CHUNK) {
            parts.push(out);
            out = "";
        }
    }
    if (out)
        parts.push(out);
    return parts.join("");
}
function decodeUTF16LE(bytes) {
    // Use chunked fromCharCode on 16-bit code units.
    // If odd length, ignore trailing byte (common behavior).
    const len = bytes.length & ~1;
    if (len === 0)
        return "";
    const parts = [];
    // Build a temporary code-unit array per chunk.
    const maxUnits = CHUNK; // CHUNK code units per chunk
    for (let i = 0; i < len;) {
        const unitsThis = Math.min(maxUnits, (len - i) >> 1);
        const units = new Array(unitsThis);
        for (let j = 0; j < unitsThis; j++, i += 2) {
            units[j] = bytes[i] | (bytes[i + 1] << 8);
        }
        parts.push(String.fromCharCode.apply(null, units));
    }
    return parts.join("");
}
function decodeASCII(bytes) {
    // 7-bit ASCII: mask high bit. (Kept to match your original semantics.)
    const parts = [];
    for (let i = 0; i < bytes.length; i += CHUNK) {
        const end = Math.min(bytes.length, i + CHUNK);
        const codes = new Array(end - i);
        for (let j = i, k = 0; j < end; j++, k++) {
            codes[k] = bytes[j] & 0x7f;
        }
        parts.push(String.fromCharCode.apply(null, codes));
    }
    return parts.join("");
}
function decodeLatin1(bytes) {
    // Latin-1 is 0x00..0xFF direct mapping; avoid spread.
    const parts = [];
    for (let i = 0; i < bytes.length; i += CHUNK) {
        const end = Math.min(bytes.length, i + CHUNK);
        const codes = new Array(end - i);
        for (let j = i, k = 0; j < end; j++, k++) {
            codes[k] = bytes[j];
        }
        parts.push(String.fromCharCode.apply(null, codes));
    }
    return parts.join("");
}
function decodeWindows1252(bytes) {
    // Only 0x80..0x9F need mapping; others are direct 1-byte codes.
    const parts = [];
    let out = "";
    for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i];
        const extra = b >= 0x80 && b <= 0x9f ? WINDOWS_1252_EXTRA[b] : undefined;
        out += extra !== null && extra !== void 0 ? extra : String.fromCharCode(b);
        if (out.length >= CHUNK) {
            parts.push(out);
            out = "";
        }
    }
    if (out)
        parts.push(out);
    return parts.join("");
}
function encodeUTF8(str) {
    const out = [];
    for (let i = 0; i < str.length; i++) {
        let cp = str.charCodeAt(i);
        // surrogate pair
        if (cp >= 0xd800 && cp <= 0xdbff && i + 1 < str.length) {
            const lo = str.charCodeAt(i + 1);
            if (lo >= 0xdc00 && lo <= 0xdfff) {
                cp = 0x10000 + ((cp - 0xd800) << 10) + (lo - 0xdc00);
                i++;
            }
        }
        if (cp < 0x80) {
            out.push(cp);
        }
        else if (cp < 0x800) {
            out.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
        }
        else if (cp < 0x10000) {
            out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
        }
        else {
            out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
        }
    }
    return new Uint8Array(out);
}
function encodeUTF16LE(str) {
    const out = new Uint8Array(str.length * 2);
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        const o = i * 2;
        out[o] = code & 0xff;
        out[o + 1] = code >>> 8;
    }
    return out;
}
function encodeASCII(str) {
    // 7-bit ASCII: mask high bit
    const out = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++)
        out[i] = str.charCodeAt(i) & 0x7f;
    return out;
}
function encodeLatin1(str) {
    const out = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++)
        out[i] = str.charCodeAt(i) & 0xff;
    return out;
}
function encodeWindows1252(str) {
    const out = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        const code = ch.charCodeAt(0);
        if (code <= 0xff) {
            out[i] = code;
            continue;
        }
        const mapped = WINDOWS_1252_REVERSE[ch];
        out[i] = mapped !== undefined ? mapped : 0x3f; // '?'
    }
    return out;
}
