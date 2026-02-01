"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParser = void 0;
exports.getJSRegexppAst = getJSRegexppAst;
exports.assertValidFlags = assertValidFlags;
exports.toCharSetSource = toCharSetSource;
const refa_1 = require("refa");
const util_1 = require("./util");
function getJSRegexppAst(context, ignoreSticky = false) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const { flags, flagsString, patternAst } = context;
    return {
        pattern: patternAst,
        flags: {
            type: "Flags",
            raw: flagsString !== null && flagsString !== void 0 ? flagsString : "",
            parent: null,
            start: NaN,
            end: NaN,
            dotAll: (_a = flags.dotAll) !== null && _a !== void 0 ? _a : false,
            global: (_b = flags.global) !== null && _b !== void 0 ? _b : false,
            hasIndices: (_c = flags.hasIndices) !== null && _c !== void 0 ? _c : false,
            ignoreCase: (_d = flags.ignoreCase) !== null && _d !== void 0 ? _d : false,
            multiline: (_e = flags.multiline) !== null && _e !== void 0 ? _e : false,
            sticky: !ignoreSticky && ((_f = flags.sticky) !== null && _f !== void 0 ? _f : false),
            unicode: (_g = flags.unicode) !== null && _g !== void 0 ? _g : false,
            unicodeSets: (_h = flags.unicodeSets) !== null && _h !== void 0 ? _h : false,
        },
    };
}
exports.getParser = (0, util_1.cachedFn)((context) => refa_1.JS.Parser.fromAst(getJSRegexppAst(context)));
function assertValidFlags(flags) {
    if (!refa_1.JS.isFlags(flags)) {
        throw new Error(`Invalid flags: ${JSON.stringify(flags)}`);
    }
}
function toCharSetSource(charSetOrChar, flags) {
    assertValidFlags(flags);
    let charSet;
    if (typeof charSetOrChar === "number") {
        charSet = refa_1.JS.createCharSet([charSetOrChar], flags);
    }
    else {
        charSet = charSetOrChar;
    }
    return refa_1.JS.toLiteral({
        type: "Concatenation",
        elements: [{ type: "CharacterClass", characters: charSet }],
    }, { flags }).source;
}
