"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const regex_syntax_1 = require("../utils/regex-syntax");
const REGEX_CHAR_CLASS_ESCAPES = new Set([
    utils_1.CP_BACK_SLASH,
    utils_1.CP_CLOSING_BRACKET,
    utils_1.CP_MINUS,
]);
const REGEX_CLASS_SET_CHAR_CLASS_ESCAPE = new Set([
    utils_1.CP_BACK_SLASH,
    utils_1.CP_SLASH,
    utils_1.CP_OPENING_BRACKET,
    utils_1.CP_CLOSING_BRACKET,
    utils_1.CP_OPENING_BRACE,
    utils_1.CP_CLOSING_BRACE,
    utils_1.CP_PIPE,
    utils_1.CP_OPENING_PAREN,
    utils_1.CP_CLOSING_PAREN,
    utils_1.CP_MINUS,
]);
const REGEX_ESCAPES = new Set([
    utils_1.CP_BACK_SLASH,
    utils_1.CP_SLASH,
    utils_1.CP_CARET,
    utils_1.CP_DOT,
    utils_1.CP_DOLLAR,
    utils_1.CP_STAR,
    utils_1.CP_PLUS,
    utils_1.CP_QUESTION,
    utils_1.CP_OPENING_BRACKET,
    utils_1.CP_CLOSING_BRACKET,
    utils_1.CP_OPENING_BRACE,
    utils_1.CP_CLOSING_BRACE,
    utils_1.CP_PIPE,
    utils_1.CP_OPENING_PAREN,
    utils_1.CP_CLOSING_PAREN,
]);
const POTENTIAL_ESCAPE_SEQUENCE = new Set("uxkpP");
const POTENTIAL_ESCAPE_SEQUENCE_FOR_CHAR_CLASS = new Set([
    ...POTENTIAL_ESCAPE_SEQUENCE,
    "q",
]);
exports.default = (0, utils_1.createRule)("no-useless-escape", {
    meta: {
        docs: {
            description: "disallow unnecessary escape characters in RegExp",
            category: "Stylistic Issues",
            recommended: true,
        },
        fixable: "code",
        schema: [],
        messages: {
            unnecessary: "Unnecessary escape character: \\{{character}}.",
        },
        type: "suggestion",
    },
    create(context) {
        function createVisitor({ node, flags, pattern, getRegexpLocation, fixReplaceNode, }) {
            function report(cNode, offset, character, fix) {
                context.report({
                    node,
                    loc: getRegexpLocation(cNode, [offset, offset + 1]),
                    messageId: "unnecessary",
                    data: {
                        character,
                    },
                    fix: fix ? fixReplaceNode(cNode, character) : null,
                });
            }
            const characterClassStack = [];
            return {
                onCharacterClassEnter: (characterClassNode) => characterClassStack.unshift(characterClassNode),
                onCharacterClassLeave: () => characterClassStack.shift(),
                onExpressionCharacterClassEnter: (characterClassNode) => characterClassStack.unshift(characterClassNode),
                onExpressionCharacterClassLeave: () => characterClassStack.shift(),
                onCharacterEnter(cNode) {
                    if (cNode.raw.startsWith("\\")) {
                        const char = cNode.raw.slice(1);
                        const escapedChar = String.fromCodePoint(cNode.value);
                        if (char === escapedChar) {
                            let allowedEscapes;
                            if (characterClassStack.length) {
                                allowedEscapes = flags.unicodeSets
                                    ? REGEX_CLASS_SET_CHAR_CLASS_ESCAPE
                                    : REGEX_CHAR_CLASS_ESCAPES;
                            }
                            else {
                                allowedEscapes = REGEX_ESCAPES;
                            }
                            if (allowedEscapes.has(cNode.value)) {
                                return;
                            }
                            if (characterClassStack.length) {
                                const characterClassNode = characterClassStack[0];
                                if (cNode.value === utils_1.CP_CARET) {
                                    if (characterClassNode.start + 1 ===
                                        cNode.start) {
                                        return;
                                    }
                                }
                                if (flags.unicodeSets) {
                                    if (regex_syntax_1.RESERVED_DOUBLE_PUNCTUATOR_CP.has(cNode.value)) {
                                        if (pattern[cNode.end] === escapedChar) {
                                            return;
                                        }
                                        const prevIndex = cNode.start - 1;
                                        if (pattern[prevIndex] === escapedChar) {
                                            if (escapedChar !== "^") {
                                                return;
                                            }
                                            const elementStartIndex = characterClassNode.start +
                                                1 +
                                                (characterClassNode.negate
                                                    ? 1
                                                    : 0);
                                            if (elementStartIndex <= prevIndex) {
                                                return;
                                            }
                                        }
                                    }
                                }
                            }
                            if (!(0, utils_1.canUnwrapped)(cNode, char)) {
                                return;
                            }
                            report(cNode, 0, char, !(characterClassStack.length
                                ? POTENTIAL_ESCAPE_SEQUENCE_FOR_CHAR_CLASS
                                : POTENTIAL_ESCAPE_SEQUENCE).has(char));
                        }
                    }
                },
            };
        }
        return (0, utils_1.defineRegexpVisitor)(context, {
            createVisitor,
        });
    },
});
