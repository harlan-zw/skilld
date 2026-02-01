"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseReplacementsForString = parseReplacementsForString;
exports.baseParseReplacements = baseParseReplacements;
function parseReplacementsForString(text) {
    return baseParseReplacements([...text].map((s) => ({ value: s })), () => ({}));
}
function baseParseReplacements(chars, getData) {
    const elements = [];
    let token;
    let index = 0;
    while ((token = chars[index++])) {
        if (token.value === "$") {
            const next = chars[index++];
            if (next) {
                if (next.value === "$" ||
                    next.value === "&" ||
                    next.value === "`" ||
                    next.value === "'") {
                    elements.push({
                        type: "DollarElement",
                        kind: next.value,
                        ...getData(token, next),
                    });
                    continue;
                }
                if (parseNumberRef(token, next)) {
                    continue;
                }
                if (parseNamedRef(token, next)) {
                    continue;
                }
                index--;
            }
        }
        elements.push({
            type: "CharacterElement",
            value: token.value,
            ...getData(token, token),
        });
    }
    return elements;
    function parseNumberRef(dollarToken, startToken) {
        if (!/^\d$/u.test(startToken.value)) {
            return false;
        }
        if (startToken.value === "0") {
            const next = chars[index++];
            if (next) {
                if (/^[1-9]$/u.test(next.value)) {
                    const ref = Number(next.value);
                    elements.push({
                        type: "ReferenceElement",
                        ref,
                        refText: startToken.value + next.value,
                        ...getData(dollarToken, next),
                    });
                    return true;
                }
                index--;
            }
            return false;
        }
        const ref = Number(startToken.value);
        elements.push({
            type: "ReferenceElement",
            ref,
            refText: startToken.value,
            ...getData(dollarToken, startToken),
        });
        return true;
    }
    function parseNamedRef(dollarToken, startToken) {
        if (startToken.value !== "<") {
            return false;
        }
        const startIndex = index;
        let t;
        while ((t = chars[index++])) {
            if (t.value === ">") {
                const refChars = chars.slice(startIndex, index - 1);
                const ref = refChars.map((c) => c.value).join("");
                elements.push({
                    type: "ReferenceElement",
                    ref,
                    refText: ref,
                    ...getData(dollarToken, t),
                });
                return true;
            }
        }
        index = startIndex;
        return false;
    }
}
