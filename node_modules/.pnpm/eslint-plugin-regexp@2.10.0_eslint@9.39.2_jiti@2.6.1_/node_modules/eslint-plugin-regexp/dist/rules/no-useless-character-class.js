"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const regex_syntax_1 = require("../utils/regex-syntax");
const ESCAPES_OUTSIDE_CHARACTER_CLASS = new Set("$()*+./?[{|");
const ESCAPES_OUTSIDE_CHARACTER_CLASS_WITH_U = new Set([
    ...ESCAPES_OUTSIDE_CHARACTER_CLASS,
    "}",
]);
exports.default = (0, utils_1.createRule)("no-useless-character-class", {
    meta: {
        docs: {
            description: "disallow character class with one character",
            category: "Best Practices",
            recommended: true,
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    ignores: {
                        type: "array",
                        items: {
                            type: "string",
                            minLength: 1,
                        },
                        uniqueItems: true,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unexpectedCharacterClassWith: "Unexpected character class with one {{type}}. Can remove brackets{{additional}}.",
            unexpectedUnnecessaryNestingCharacterClass: "Unexpected unnecessary nesting character class. Can remove brackets.",
        },
        type: "suggestion",
    },
    create(context) {
        var _a, _b;
        const ignores = (_b = (_a = context.options[0]) === null || _a === void 0 ? void 0 : _a.ignores) !== null && _b !== void 0 ? _b : ["="];
        function createVisitor({ node, pattern, flags, fixReplaceNode, getRegexpLocation, }) {
            const characterClassStack = [];
            return {
                onExpressionCharacterClassEnter(eccNode) {
                    characterClassStack.push(eccNode);
                },
                onExpressionCharacterClassLeave() {
                    characterClassStack.pop();
                },
                onCharacterClassEnter(ccNode) {
                    characterClassStack.push(ccNode);
                },
                onCharacterClassLeave(ccNode) {
                    var _a, _b;
                    characterClassStack.pop();
                    if (ccNode.negate) {
                        return;
                    }
                    let messageId, messageData;
                    const unwrapped = ccNode.elements.map((_e, index) => {
                        var _a, _b;
                        const element = ccNode.elements[index];
                        return ((_b = (_a = (index === 0
                            ? getEscapedFirstRawIfNeeded(element)
                            : null)) !== null && _a !== void 0 ? _a : (index === ccNode.elements.length - 1
                            ? getEscapedLastRawIfNeeded(element)
                            : null)) !== null && _b !== void 0 ? _b : element.raw);
                    });
                    if (ccNode.elements.length !== 1 &&
                        ccNode.parent.type === "CharacterClass") {
                        messageId = "unexpectedUnnecessaryNestingCharacterClass";
                        messageData = {
                            type: "unnecessary nesting character class",
                        };
                        if (!ccNode.elements.length) {
                            const nextElement = ccNode.parent.elements[ccNode.parent.elements.indexOf(ccNode) + 1];
                            if (nextElement &&
                                isNeedEscapedForFirstElement(nextElement)) {
                                unwrapped.push("\\");
                            }
                        }
                    }
                    else {
                        if (ccNode.elements.length !== 1) {
                            return;
                        }
                        const element = ccNode.elements[0];
                        if (ignores.length > 0 &&
                            ignores.includes(element.raw)) {
                            return;
                        }
                        if (element.type === "Character") {
                            if (element.raw === "\\b") {
                                return;
                            }
                            if (/^\\\d+$/u.test(element.raw) &&
                                !element.raw.startsWith("\\0")) {
                                return;
                            }
                            if (ignores.length > 0 &&
                                ignores.includes(String.fromCodePoint(element.value))) {
                                return;
                            }
                            if (!(0, utils_1.canUnwrapped)(ccNode, element.raw)) {
                                return;
                            }
                            messageData = { type: "character" };
                        }
                        else if (element.type === "CharacterClassRange") {
                            if (element.min.value !== element.max.value) {
                                return;
                            }
                            messageData = {
                                type: "character class range",
                                additional: " and range",
                            };
                            unwrapped[0] =
                                (_b = (_a = getEscapedFirstRawIfNeeded(element.min)) !== null && _a !== void 0 ? _a : getEscapedLastRawIfNeeded(element.min)) !== null && _b !== void 0 ? _b : element.min.raw;
                        }
                        else if (element.type === "ClassStringDisjunction") {
                            if (!characterClassStack.length) {
                                return;
                            }
                            messageData = { type: "string literal" };
                        }
                        else if (element.type === "CharacterSet") {
                            messageData = { type: "character class escape" };
                        }
                        else if (element.type === "CharacterClass" ||
                            element.type === "ExpressionCharacterClass") {
                            messageData = { type: "character class" };
                        }
                        else {
                            return;
                        }
                        messageId = "unexpectedCharacterClassWith";
                    }
                    context.report({
                        node,
                        loc: getRegexpLocation(ccNode),
                        messageId,
                        data: {
                            type: messageData.type,
                            additional: messageData.additional || "",
                        },
                        fix: fixReplaceNode(ccNode, unwrapped.join("")),
                    });
                    function isNeedEscapedForFirstElement(element) {
                        const char = element.type === "Character"
                            ? element.raw
                            : element.type === "CharacterClassRange"
                                ? element.min.raw
                                : null;
                        if (char == null) {
                            return false;
                        }
                        if (characterClassStack.length) {
                            if (regex_syntax_1.RESERVED_DOUBLE_PUNCTUATOR_CHARS.has(char) &&
                                pattern[ccNode.start - 1] === char) {
                                return true;
                            }
                            return (char === "^" &&
                                ccNode.parent.type === "CharacterClass" &&
                                ccNode.parent.elements[0] === ccNode);
                        }
                        return (flags.unicode
                            ? ESCAPES_OUTSIDE_CHARACTER_CLASS_WITH_U
                            : ESCAPES_OUTSIDE_CHARACTER_CLASS).has(char);
                    }
                    function needEscapedForLastElement(element) {
                        const char = element.type === "Character"
                            ? element.raw
                            : element.type === "CharacterClassRange"
                                ? element.max.raw
                                : null;
                        if (char == null) {
                            return false;
                        }
                        if (characterClassStack.length) {
                            return (regex_syntax_1.RESERVED_DOUBLE_PUNCTUATOR_CHARS.has(char) &&
                                pattern[ccNode.end] === char);
                        }
                        return false;
                    }
                    function getEscapedFirstRawIfNeeded(firstElement) {
                        if (isNeedEscapedForFirstElement(firstElement)) {
                            return `\\${firstElement.raw}`;
                        }
                        return null;
                    }
                    function getEscapedLastRawIfNeeded(lastElement) {
                        if (needEscapedForLastElement(lastElement)) {
                            const lastRaw = lastElement.type === "Character"
                                ? lastElement.raw
                                : lastElement.type === "CharacterClassRange"
                                    ? lastElement.max.raw
                                    : "";
                            const prefix = lastElement.raw.slice(0, -lastRaw.length);
                            return `${prefix}\\${lastRaw}`;
                        }
                        return null;
                    }
                },
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
